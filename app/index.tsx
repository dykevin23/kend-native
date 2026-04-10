import { StatusBar } from "expo-status-bar";
import * as Linking from "expo-linking";
import * as SplashScreen from "expo-splash-screen";
import * as WebBrowser from "expo-web-browser";
import { useRef, useState, useCallback, useEffect } from "react";
import {
  ActivityIndicator,
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
import { useFocusEffect } from "@react-navigation/native";

// Google OAuth는 WebView 내 로그인을 차단(403 disallowed_useragent)하므로
// SFSafariViewController / Chrome Custom Tabs로 열어야 한다.
const GOOGLE_AUTH_PATTERN = "accounts.google.com";

const WEB_APP_URL = "https://kend-seven.vercel.app";

export default function Home() {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // 안드로이드 하드웨어 뒤로가기 버튼: WebView 내 뒤로가기 처리
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== "android") return;

      const onBackPress = () => {
        if (canGoBack && webViewRef.current) {
          webViewRef.current.goBack();
          return true; // 기본 동작(앱 종료) 방지
        }
        return false; // 기본 동작 허용 (앱 종료)
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
  };

  // 딥링크(kend://) 수신 시 WebView를 해당 경로로 이동
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      navigateWebViewFromDeepLink(event.url);
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    // 앱이 딥링크로 cold start된 경우
    Linking.getInitialURL().then((url) => {
      if (url) navigateWebViewFromDeepLink(url);
    });

    return () => subscription.remove();
  }, []);

  const navigateWebViewFromDeepLink = (url: string) => {
    const parsed = Linking.parse(url);
    if (!parsed.path) return;

    const params = parsed.queryParams ?? {};

    // Google OAuth 콜백: 토큰을 WebView에 주입하여 세션 설정
    if (
      parsed.path === "auth/callback" &&
      params.access_token &&
      params.refresh_token
    ) {
      const js = `
        (async function() {
          try {
            const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
            // 웹앱의 기존 Supabase 인스턴스에 접근
            if (window.__supabase) {
              await window.__supabase.auth.setSession({
                access_token: ${JSON.stringify(params.access_token)},
                refresh_token: ${JSON.stringify(params.refresh_token)},
              });
              window.location.href = '/';
            } else {
              // fallback: localStorage에 직접 저장 후 새로고침
              const storageKey = Object.keys(localStorage).find(k => k.includes('supabase') && k.includes('auth'));
              if (storageKey) {
                const session = JSON.parse(localStorage.getItem(storageKey) || '{}');
                session.access_token = ${JSON.stringify(params.access_token)};
                session.refresh_token = ${JSON.stringify(params.refresh_token)};
                localStorage.setItem(storageKey, JSON.stringify(session));
              }
              window.location.href = '/';
            }
          } catch(e) {
            console.error('OAuth session injection failed:', e);
            window.location.href = '/';
          }
        })();
        true;
      `;
      webViewRef.current?.injectJavaScript(js);
      return;
    }

    // 일반 딥링크: 해당 경로로 이동
    const queryString = Object.keys(params).length
      ? "?" +
        Object.entries(params)
          .map(
            ([k, v]) =>
              `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
          )
          .join("&")
      : "";
    const webUrl = `${WEB_APP_URL}/${parsed.path}${queryString}`;
    webViewRef.current?.injectJavaScript(
      `window.location.href = ${JSON.stringify(webUrl)}; true;`
    );
  };

  // Google OAuth → SFSafariViewController / Chrome Custom Tabs로 열기
  const handleGoogleAuth = async (url: string) => {
    try {
      const redirectUrl = Linking.createURL("auth/callback");
      const result = await WebBrowser.openAuthSessionAsync(url, redirectUrl);
      if (result.type === "success" && result.url) {
        navigateWebViewFromDeepLink(result.url);
      }
    } catch {
      // fallback: 외부 브라우저
      Linking.openURL(url);
    }
  };

  // OAuth URL 라우팅 처리
  const handleShouldStartLoad = (request: ShouldStartLoadRequest) => {
    if (request.url.includes(GOOGLE_AUTH_PATTERN)) {
      handleGoogleAuth(request.url);
      return false;
    }
    return true;
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
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => {
          setIsLoading(false);
          if (isFirstLoad) {
            SplashScreen.hideAsync();
            setIsFirstLoad(false);
          }
        }}
        onError={() => setHasError(true)}
        onHttpError={(syntheticEvent) => {
          const { statusCode } = syntheticEvent.nativeEvent;
          if (statusCode >= 500) setHasError(true);
        }}
        // WebView 기본 설정
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        allowsBackForwardNavigationGestures={true} // iOS 스와이프 뒤로가기
        onShouldStartLoadWithRequest={handleShouldStartLoad}
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
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
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
