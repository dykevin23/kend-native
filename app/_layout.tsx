import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

// 앱 준비될 때까지 스플래시 화면 유지
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // 레이아웃 마운트 후 스플래시 숨기기
    SplashScreen.hideAsync();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false, // WebView가 전체 화면을 차지하도록 네비게이션 헤더 숨김
      }}
    />
  );
}
