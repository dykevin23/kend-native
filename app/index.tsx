import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";
import * as SplashScreen from "expo-splash-screen";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { getPushState, notificationPath } from "@/lib/push";
import { useRef, useState, useCallback, useEffect } from "react";
import {
  Alert,
  BackHandler,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import type { WebViewNavigation, WebViewMessageEvent } from "react-native-webview";
import type { ShouldStartLoadRequest } from "react-native-webview/lib/WebViewTypes";
import { useFocusEffect } from "expo-router";

// 운영/개발 앱마다 다른 웹 주소 — app.config.ts가 빌드 프로필(APP_VARIANT)에 따라 넣는다
const WEB_APP_URL: string =
  Constants.expoConfig?.extra?.webAppUrl ?? "https://kend.co.kr";
// 이 호스트면 앱 안(WebView)에서 열고, 아니면 외부 도메인(결제·소셜로그인 등)으로 본다
const KEND_HOST = new URL(WEB_APP_URL).hostname;

const isKendUrl = (url: string): boolean => {
  try {
    return new URL(url).hostname === KEND_HOST;
  } catch {
    return false;
  }
};

const pathnameOf = (url: string): string => {
  try {
    return new URL(url).pathname;
  } catch {
    return "";
  }
};

// react-native-webview는 멀티윈도우(팝업)를 지원하지 않아 window.open() 호출이
// 무시된다. BC카드/페이북 등 ISP 인증창이 window.open()으로 뜨는 경우를 대비해
// 팝업 대신 현재 프레임에서 바로 이동하도록 재정의한다. 이렇게 이동하면
// onShouldStartLoadWithRequest의 앱스킴 핸드오프 로직으로 자연스럽게 이어진다.
const POPUP_REDIRECT_SCRIPT = `
  window.open = function (url) {
    if (url) { window.location.href = url; }
    return null;
  };
  true;
`;

// Google OAuth가 WebView를 차단(403 disallowed_useragent)하지 않도록
// 일반 모바일 Safari User-Agent를 사용한다.
const CUSTOM_USER_AGENT = Platform.select({
  ios: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  android:
    "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
});

// --- 웹(kend) <-> 네이티브 브릿지 ---
// 웹 -> 네이티브: window.ReactNativeWebView.postMessage(...) (onMessage로 균일하게 수신됨)
// 네이티브 -> 웹: injectJavaScript로 웹이 설치해둔 전역 콜백을 직접 호출한다.
// (WebView.postMessage로 응답하면 iOS는 window, Android는 document에 이벤트가
// 떨어지는 플랫폼 차이가 있어, 이를 아예 피하기 위해 injectJavaScript를 사용)
type BridgeRequest = {
  type: string;
  requestId: string;
};

const postBridgeResponse = (
  webViewRef: React.RefObject<WebView | null>,
  payload: Record<string, unknown>
) => {
  const script = `
    window.__kendNativeBridge && window.__kendNativeBridge.receive(${JSON.stringify(
      JSON.stringify(payload)
    )});
    true;
  `;
  webViewRef.current?.injectJavaScript(script);
};

// 뒤로가기 차단 URL 패턴 (readme/native-swipe-blacklist.md 참고)
// 로그인/가입 플로우, 자녀 정보 입력 화면 — 뒤로가면 입력 유실
const FORM_FLOW_REGEX =
  /^\/(auth)(\/|$)|^\/children\/(submit|\d+\/(edit|growth))$/;

// 리다이렉트 구간(결제·소셜로그인) — 뒤로가면 소진된 세션("이미 종료된 세션입니다")
// 이나 결제창/OAuth URL로 돌아간다. 확인 Alert 없이 조용히 무시해야 하는 케이스.
// (외부 도메인 페이지에는 대개 자체 취소/뒤로 UI가 있음)
const isPaymentFlowUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);

    // 외부 도메인(Toss 결제창, 카드사 인증, 소셜로그인 제공자 등).
    // kend는 단일 도메인 앱이므로 외부 도메인 = 항상 리다이렉트 중간 단계.
    if (parsed.hostname !== KEND_HOST) return true;

    // 결제 콜백/종료 랜딩 URL: 뒤로가면 Toss 결제창 URL로 돌아간다.
    // (랜딩은 시작 지점에 따라 /carts, /products/:id, /orders 등 다양)
    if (parsed.pathname.startsWith("/payments/")) return true;
    if (
      parsed.searchParams.has("payment_success") ||
      parsed.searchParams.has("payment_error") ||
      parsed.searchParams.has("payment_cancelled")
    )
      return true;

    return false;
  } catch {
    return false;
  }
};

// 입력 유실 방지용 확인 Alert를 띄워야 하는 화면
const isFormFlowUrl = (url: string): boolean => {
  try {
    return FORM_FLOW_REGEX.test(new URL(url).pathname);
  } catch {
    return false;
  }
};

// iOS 스와이프 뒤로가기 비활성화 대상 (두 경우 모두)
const isBackBlocked = (url: string): boolean =>
  isPaymentFlowUrl(url) || isFormFlowUrl(url);

// 로딩 오버레이 — 점 3개가 번갈아 튀어오르는 인디케이터 (오렌지 포인트 컬러)
function LoadingDot({ delay }: { delay: number }) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-6, { duration: 300, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 300, easing: Easing.in(Easing.quad) })
        ),
        -1
      )
    );
  }, [delay, translateY]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[styles.dot, dotStyle]} />;
}

function LoadingDots() {
  return (
    <View style={styles.dotsRow}>
      <LoadingDot delay={0} />
      <LoadingDot delay={120} />
      <LoadingDot delay={240} />
    </View>
  );
}

// 첫 실행 로딩 오버레이 — 네이티브 스플래시(정적 이미지)가 숨겨진 직후
// WebView 첫 로드가 끝날 때까지 보여주는 브랜드 로딩 화면.
// 스플래시와 같은 배경색(#FFEED0)이라 전환이 끊기지 않고, 로고가 살짝
// 커지며 나타난 뒤 점 로딩 인디케이터가 돈다.
function FirstLoadOverlay() {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.92);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 450,
      easing: Easing.out(Easing.cubic),
    });
    scale.value = withTiming(1, {
      duration: 450,
      easing: Easing.out(Easing.cubic),
    });
  }, [opacity, scale]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <>
      <Animated.View style={[styles.brandLogoBlock, logoStyle]}>
        <Text style={styles.brandWordmark}>KEND</Text>
        <View style={styles.brandUnderline} />
        <Text style={styles.brandTagline}>Kids are an ENDuser</Text>
      </Animated.View>
      <View style={styles.brandDotsWrap}>
        <LoadingDots />
      </View>
    </>
  );
}

export default function Home() {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [backBlocked, setBackBlocked] = useState(false);
  // 현재 최상위 URL — Android 백 핸들러에서 결제구간/폼구간 구분에 사용
  const currentUrlRef = useRef(WEB_APP_URL);
  // 직전에 외부 도메인(Toss/카드사)에 있었는지 — 결제 리다이렉트 체인이 kend로
  // 돌아올 때 오버레이로 덮기 위한 플래그
  const wasExternalRef = useRef(false);
  // 결제창에서 kend로 막 돌아온 상태인지 — 이 화면에서 뒤로가기를 누르면
  // 히스토리상 소진된 Toss URL로 가므로 막아야 한다. kend가 쿼리파라미터
  // (?payment_cancelled 등)를 제거한 뒤에도 유지되어야 해서 별도 ref로 추적.
  const justReturnedFromPaymentRef = useRef(false);
  const paymentReturnPathRef = useRef("");

  // 푸시 알림 탭 → 알림의 data.url(앱 내 경로)을 WebView에서 연다.
  // 앱이 꺼져 있다가 알림으로 켜진 경우 첫 로드가 끝난 뒤에 이동해야 해서 대기 경로를 둔다.
  const lastNotificationResponse = Notifications.useLastNotificationResponse();
  const pendingPushPathRef = useRef<string | null>(null);
  const handledResponseIdRef = useRef<string | null>(null);

  const openWebPath = useCallback((path: string) => {
    webViewRef.current?.injectJavaScript(
      `window.location.assign(${JSON.stringify(WEB_APP_URL + path)}); true;`
    );
  }, []);

  useEffect(() => {
    if (!lastNotificationResponse) return;
    const id = lastNotificationResponse.notification.request.identifier;
    if (handledResponseIdRef.current === id) return;
    handledResponseIdRef.current = id;
    Notifications.clearLastNotificationResponse();

    const path = notificationPath(lastNotificationResponse);
    if (!path) return;
    if (isFirstLoad) {
      pendingPushPathRef.current = path;
    } else {
      openWebPath(path);
    }
  }, [lastNotificationResponse, isFirstLoad, openWebPath]);

  // 네이티브 스플래시(정적 이미지)는 마운트 직후 바로 내린다 — 이 시점부터는
  // 같은 배경색의 브랜드 로딩 오버레이(FirstLoadOverlay)가 이어받아 WebView
  // 첫 로드가 끝날 때까지 "로딩 중" 인터랙션을 보여준다.
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  // 안드로이드 하드웨어 뒤로가기 버튼 처리
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== "android") return;

      const onBackPress = () => {
        // 결제 리다이렉트 구간, 또는 결제에서 막 돌아온 직후(쿼리파라미터가
        // 클라이언트에서 제거된 뒤에도): 뒤로가면 소진된 Toss 세션/결제창으로 →
        // 조용히 무시. (Toss 결제창에는 자체 취소 버튼이 있음)
        if (
          isPaymentFlowUrl(currentUrlRef.current) ||
          justReturnedFromPaymentRef.current
        ) {
          return true;
        }
        // 입력 폼 구간: 확인 Alert 표시
        if (isFormFlowUrl(currentUrlRef.current)) {
          Alert.alert(
            "화면을 나가시겠습니까?",
            "입력 중인 내용이 사라질 수 있어요.",
            [
              { text: "취소", style: "cancel" },
              {
                text: "나가기",
                style: "destructive",
                onPress: () => {
                  if (canGoBack && webViewRef.current) {
                    webViewRef.current.goBack();
                  } else {
                    BackHandler.exitApp();
                  }
                },
              },
            ]
          );
          return true;
        }
        if (canGoBack && webViewRef.current) {
          webViewRef.current.goBack();
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => subscription.remove();
    }, [canGoBack])
  );

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
    currentUrlRef.current = navState.url;

    if (!isKendUrl(navState.url)) {
      wasExternalRef.current = true;
    } else if (!navState.loading) {
      if (wasExternalRef.current) {
        // 외부(Toss) → kend 복귀 완료
        wasExternalRef.current = false;
        justReturnedFromPaymentRef.current = true;
        paymentReturnPathRef.current = pathnameOf(navState.url);
      } else if (
        justReturnedFromPaymentRef.current &&
        pathnameOf(navState.url) !== paymentReturnPathRef.current
      ) {
        // 결제 복귀 화면에서 사용자가 다른 화면으로 이동함 → 가드 해제
        justReturnedFromPaymentRef.current = false;
      }
    }

    // iOS 스와이프 뒤로가기 비활성화: 결제/폼 구간 + 결제 직후 복귀 화면
    setBackBlocked(
      isBackBlocked(navState.url) || justReturnedFromPaymentRef.current
    );
  };

  // 로딩 오버레이 debounce: 300ms 이내 완료되는 네비게이션에서는
  // 오버레이를 표시하지 않아 스와이프 뒤로가기 시 번쩍임 방지
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 뒤로/앞으로 네비게이션(스와이프 백 포함)에서는 로딩 오버레이를 띄우지 않는다
  const isBackForwardRef = useRef(false);

  // 강제로 띄운 오버레이가 onLoadEnd 없이 방치되는 것 방지 (앱스킴 이탈 등)
  const overlaySafetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const handleShouldStartLoad = (request: ShouldStartLoadRequest) => {
    isBackForwardRef.current = request.navigationType === "backforward";

    // kend 화면에서 back/forward 네비게이션(iOS 스와이프 포함)으로 결제 리다이렉트
    // URL(외부 도메인 or /payments/* or 결제 종료 랜딩)로 되돌아가려 하면 취소한다.
    // → 소진된 Toss 세션("이미 종료된 세션입니다")로 가는 것을 원천 차단.
    // "kend에 있을 때"로 한정해 Toss/카드사 화면 내부의 뒤로가기는 방해하지 않는다.
    // (Android는 navigationType이 항상 'other'라 하드웨어 백 핸들러에서 처리)
    if (
      request.navigationType === "backforward" &&
      request.isTopFrame &&
      isKendUrl(currentUrlRef.current) &&
      isPaymentFlowUrl(request.url ?? "")
    ) {
      return false;
    }

    // 카드앱 등 커스텀 URL 스킴(paybooc://, ispmobile:// 등) 핸드오프.
    // iOS WKWebView는 http(s)가 아닌 스킴을 OS로 자동 위임하지 않으므로,
    // 직접 Linking으로 열고 WebView 자체 네비게이션은 막는다.
    // canOpenURL은 LSApplicationQueriesSchemes에 없는 스킴(미등록 카드앱,
    // 미설치 시 폴백인 itms-apps:// 등)을 false로 막으므로 거치지 않고 바로 연다.
    // 실패(앱 미설치)는 조용히 무시 — 토스/카드사 페이지가 자체 폴백을 처리한다.
    const isHttpUrl = /^https?:\/\//i.test(request.url ?? "");
    if (!isHttpUrl && request.url) {
      Linking.openURL(request.url).catch(() => {});
      return false;
    }

    // 결제 리다이렉트 구간(kend → Toss 결제창 → kend 콜백)의 http(s) 최상위 이동에서만
    // 문서 전환 사이의 흰 화면 깜빡임을 덮기 위해 debounce 없이 즉시 오버레이 표시.
    // - isTopFrame: 결제위젯 iframe 로드(같은 화면 내) 제외
    const isHttpTopNav =
      request.isTopFrame && request.navigationType !== "backforward";

    if (isHttpTopNav) {
      const leavingKend = !isKendUrl(request.url);
      const returningFromPayment =
        isKendUrl(request.url) && wasExternalRef.current;
      if (leavingKend || returningFromPayment) {
        if (loadingTimerRef.current) {
          clearTimeout(loadingTimerRef.current);
          loadingTimerRef.current = null;
        }
        setIsLoading(true);
        if (overlaySafetyTimerRef.current)
          clearTimeout(overlaySafetyTimerRef.current);
        overlaySafetyTimerRef.current = setTimeout(
          () => setIsLoading(false),
          8000
        );
      }
    }

    return true;
  };

  const handleLoadStart = () => {
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    if (isBackForwardRef.current) return;
    loadingTimerRef.current = setTimeout(() => setIsLoading(true), 300);
  };

  const handleLoadEnd = () => {
    isBackForwardRef.current = false;
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    if (overlaySafetyTimerRef.current) {
      clearTimeout(overlaySafetyTimerRef.current);
      overlaySafetyTimerRef.current = null;
    }
    setIsLoading(false);
    if (isFirstLoad) {
      setIsFirstLoad(false);
      // 알림으로 앱이 켜진 경우: 첫 화면 로드 후 알림 화면으로 이동
      if (pendingPushPathRef.current) {
        openWebPath(pendingPushPathRef.current);
        pendingPushPathRef.current = null;
      }
    }
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  // 현재 위치 요청 — 권한 요청 후 좌표를 웹으로 응답한다.
  // 메시지 타입이 늘어날 것을 대비해 handleWebViewMessage에서 타입별로 분기한다.
  const handleLocationRequest = async (requestId: string) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        postBridgeResponse(webViewRef, {
          type: "LOCATION_RESULT",
          requestId,
          error: "PERMISSION_DENIED",
        });
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      postBridgeResponse(webViewRef, {
        type: "LOCATION_RESULT",
        requestId,
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    } catch {
      postBridgeResponse(webViewRef, {
        type: "LOCATION_RESULT",
        requestId,
        error: "LOCATION_UNAVAILABLE",
      });
    }
  };

  // 푸시 권한 상태 / 권한 요청 — 결과(status·token·platform)를 웹으로 응답한다.
  // 토큰 저장은 웹이 사용자 세션으로 한다 (kend app/features/notifications/push.ts)
  const handlePushRequest = async (requestId: string, request: boolean) => {
    try {
      const state = await getPushState(request);
      postBridgeResponse(webViewRef, { type: "PUSH_STATE", requestId, ...state });
    } catch {
      postBridgeResponse(webViewRef, {
        type: "PUSH_STATE",
        requestId,
        error: "PUSH_UNAVAILABLE",
      });
    }
  };

  const handleOpenSettings = async (requestId: string) => {
    try {
      await Linking.openSettings();
      postBridgeResponse(webViewRef, { type: "OPEN_APP_SETTINGS", requestId, ok: true });
    } catch {
      postBridgeResponse(webViewRef, {
        type: "OPEN_APP_SETTINGS",
        requestId,
        error: "SETTINGS_UNAVAILABLE",
      });
    }
  };

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    let message: BridgeRequest;
    try {
      message = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }
    switch (message.type) {
      case "REQUEST_LOCATION":
        handleLocationRequest(message.requestId);
        break;
      case "GET_PUSH_STATUS":
        handlePushRequest(message.requestId, false);
        break;
      case "REQUEST_PUSH_PERMISSION":
        handlePushRequest(message.requestId, true);
        break;
      case "OPEN_APP_SETTINGS":
        handleOpenSettings(message.requestId);
        break;
      default:
        break;
    }
  };

  if (hasError) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>연결할 수 없습니다</Text>
          <Text style={styles.errorMessage}>
            네트워크 연결을 확인하고 다시 시도해 주세요.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />
      <WebView
        ref={webViewRef}
        source={{ uri: WEB_APP_URL }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={() => setHasError(true)}
        onMessage={handleWebViewMessage}
        onHttpError={(syntheticEvent) => {
          const { statusCode } = syntheticEvent.nativeEvent;
          if (statusCode >= 500) setHasError(true);
        }}
        injectedJavaScriptBeforeContentLoaded={POPUP_REDIRECT_SCRIPT}
        // WebView 기본 설정
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        allowsBackForwardNavigationGestures={!backBlocked} // iOS: blacklist에서는 스와이프 비활성화
        bounces={false} // iOS: 세로 스크롤 bounce 제거
        overScrollMode="never" // Android: 세로 스크롤 over-scroll 제거
        userAgent={CUSTOM_USER_AGENT}
        // 쿠키 설정
        sharedCookiesEnabled={true} // iOS: 시스템 쿠키 저장소 공유
        thirdPartyCookiesEnabled={true} // Android: 서드파티 쿠키 허용
        // 캐시 및 성능
        cacheEnabled={true}
        // 보안
        originWhitelist={["https://*"]}
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          {isFirstLoad ? <FirstLoadOverlay /> : <LoadingDots />}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFEED0",
  },
  brandLogoBlock: {
    alignItems: "center",
  },
  brandWordmark: {
    fontSize: 56,
    fontWeight: "800",
    fontStyle: "italic",
    color: "#1A3F66",
    letterSpacing: -1,
  },
  brandUnderline: {
    width: 130,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#FF8A1F",
    marginTop: 10,
  },
  brandTagline: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 1.2,
    color: "#454B56",
    textTransform: "uppercase",
    marginTop: 10,
  },
  brandDotsWrap: {
    marginTop: 32,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF8A1F",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#163756",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
});
