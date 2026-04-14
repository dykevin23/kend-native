import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useRef, useState, useCallback } from "react";
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
import { useFocusEffect } from "@react-navigation/native";

const WEB_APP_URL = "https://kend-seven.vercel.app";

// Google OAuth가 WebView를 차단(403 disallowed_useragent)하지 않도록
// 일반 모바일 Safari User-Agent를 사용한다.
const CUSTOM_USER_AGENT = Platform.select({
  ios: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  android:
    "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
});

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
    ...StyleSheet.absoluteFillObject,
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
