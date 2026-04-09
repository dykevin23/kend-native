import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

// 앱 준비될 때까지 스플래시 화면 유지 (WebView 로드 완료 시 숨김)
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // WebView가 전체 화면을 차지하도록 네비게이션 헤더 숨김
      }}
    />
  );
}
