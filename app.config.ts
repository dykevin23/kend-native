import type { ConfigContext, ExpoConfig } from "expo/config";

/**
 * 운영 앱 / 개발 앱 분리 — app.json을 기본값으로, APP_VARIANT에 따라 달라지는 값만 덮어쓴다.
 * APP_VARIANT는 eas.json 빌드 프로필이 정한다 (production = 운영, preview·development = 개발).
 * 번들 ID가 달라 두 앱을 한 기기에 같이 설치할 수 있다.
 */
const IS_DEV = process.env.APP_VARIANT === "development";

const VARIANT = IS_DEV
  ? {
      name: "Kend Dev",
      bundleId: "com.kend.app.dev",
      scheme: "kend-dev",
      // kend development 브랜치 개발 서버 (Vercel Preview, dev Supabase)
      webAppUrl: "https://kend-git-development-dykevin23s-projects.vercel.app",
    }
  : {
      name: "Kend",
      bundleId: "com.kend.app",
      scheme: "kend",
      webAppUrl: "https://kend.co.kr",
    };

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: VARIANT.name,
  slug: config.slug ?? "kend-native",
  scheme: VARIANT.scheme,
  ios: { ...config.ios, bundleIdentifier: VARIANT.bundleId },
  android: { ...config.android, package: VARIANT.bundleId },
  extra: { ...config.extra, webAppUrl: VARIANT.webAppUrl },
});
