import { SafeAreaView } from "react-native";
import { WebView } from "react-native-webview";

export default function Home() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WebView
        source={{ uri: "https://kend-seven.vercel.app" }}
        style={{ flex: 1 }}
      />
    </SafeAreaView>
  );
}
