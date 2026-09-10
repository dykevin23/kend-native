import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useRef, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import type { WebViewNavigation } from "react-native-webview";
import type { ShouldStartLoadRequest } from "react-native-webview/lib/WebViewTypes";
import { useFocusEffect } from "expo-router";

const WEB_APP_URL = "https://kend-seven.vercel.app";
const KEND_HOST = "kend-seven.vercel.app";

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

// Google OAuth가 WebView를 차단(403 disallowed_useragent)하지 않도록
// 일반 모바일 Safari User-Agent를 사용한다.
const CUSTOM_USER_AGENT = Platform.select({
  ios: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  android:
    "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
});

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

    // 결제 리다이렉트 구간(kend → Toss 결제창 → kend 콜백)의 http(s) 최상위 이동에서만
    // 문서 전환 사이의 흰 화면 깜빡임을 덮기 위해 debounce 없이 즉시 오버레이 표시.
    // - isTopFrame: 결제위젯 iframe 로드(같은 화면 내) 제외
    // - http(s)만: 카드앱 앱스킴 핸드오프(intent://, supertoss:// 등) 제외 (WebView는 현 페이지 유지)
    const isHttpTopNav =
      request.isTopFrame &&
      request.navigationType !== "backforward" &&
      /^https?:\/\//i.test(request.url ?? "");

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
      SplashScreen.hideAsync();
      setIsFirstLoad(false);
    }
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
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
        onHttpError={(syntheticEvent) => {
          const { statusCode } = syntheticEvent.nativeEvent;
          if (statusCode >= 500) setHasError(true);
        }}
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
      {isLoading && !isFirstLoad && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#163756" />
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
