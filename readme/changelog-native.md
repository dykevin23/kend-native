# Changelog (KEND-NATIVE)

KEND-NATIVE React Native WebView 앱의 주요 변경사항을 날짜별로 기록한다.

> - 이 파일은 kend / kend-seller / kend-native 저장소에서 수동으로 동기화한다.
> - 최신 내용이 위로 오도록 역순(최신순)으로 작성한다.

---

## 2026-04-20

### [KEND-NATIVE] 뒤로가기 UX 개선 — URL Blacklist 기반 스와이프/백버튼 차단

- **URL Blacklist 정의**: 로그인/가입(`/auth/*`), 결제 콜백(`/payments/*`), 자녀 정보 입력(`/children/submit`, `/children/{id}/edit`, `/children/{id}/growth`)에서 뒤로가기 차단 — 입력 중 데이터 유실, 결제 흐름 중단 등 UX 사고 방지 ([상세 스펙](./active/native-swipe-blacklist.md))
- **iOS 스와이프 동적 비활성화**: `onNavigationStateChange`로 현재 URL 추적 → blacklist 매칭 시 `allowsBackForwardNavigationGestures={false}` 전환
- **Android 뒤로가기 확인 Alert**: blacklist URL에서 하드웨어 back 버튼 누르면 "화면을 나가시겠습니까? 입력 중인 내용이 사라질 수 있어요." 확인 표시
- **모달/바텀시트는 Radix UI가 자체 처리**: Radix가 history entry를 push하는 구조라 뒤로가기 시 자동으로 닫힘 → 네이티브에서 별도 처리 불필요

### [KEND-NATIVE] 스와이프 뒤로가기 번쩍임 & 스크롤 bounce 개선

- **로딩 오버레이 debounce(300ms)**: 캐시된 back/forward 네비게이션에서 로딩 오버레이가 번쩍이는 현상 완화 — 300ms 이내 완료되는 네비게이션은 오버레이 미표시
- **WebView bounce 제거**: iOS `bounces={false}`, Android `overScrollMode="never"` 설정 — 스크롤 없는 화면에서 세로 over-scroll 방지
- **참고**: "이전 화면이 잠깐 보였다가 재로드되는" 현상은 WKWebView의 back-forward cache(bfcache)가 SSR 응답 헤더(`Cache-Control: no-store` 등)로 인해 비활성화되어 발생 → 웹앱 쪽 헤더 조정이 근본 해결책

### [KEND-NATIVE] 빌드/배포 스크립트 추가

- `package.json`에 `build:ios`, `build:android`, `build:all`, `deploy:ios`, `deploy:android`, `deploy:all` 스크립트 추가

---

## 2026-04-15

### [KEND-NATIVE] iOS 심사 리젝 대응 — 카메라 크래시 수정

- **카메라 권한 추가**: `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`을 `app.json` infoPlist에 추가 — 프로필 사진 촬영 시 권한 없어 크래시 발생하던 문제 해결
- **Apple Vision Pro 지원 해제**: App Store Connect에서 Vision Pro 호환 체크 해제

---

## 2026-04-14

### [KEND-NATIVE] 소셜 로그인(네이버/카카오/구글) 앱 내 정상 동작

- **Google OAuth WebView 차단 우회**: WebView의 `userAgent`를 일반 모바일 Safari/Chrome으로 설정하여 Google의 `disallowed_useragent` 403 차단 회피 → OAuth 전체 흐름이 WebView 안에서 완결
- **쿠키 설정 추가**: `sharedCookiesEnabled={true}`(iOS), `thirdPartyCookiesEnabled={true}`(Android)로 Google OAuth redirect 체인에서 세션 쿠키 유실 방지
- **Google Cloud Console Client Secret 재발급**: 기존 secret이 Supabase에 저장된 값과 불일치(`invalid_client` 에러) → 새 secret 발급 후 Supabase Provider 설정 업데이트
- **불필요한 코드 제거**: 인앱 브라우저(`expo-web-browser`), 딥링크(`expo-linking`), 토큰 주입 로직 전부 제거. WebView + User-Agent 변경만으로 처리
- **네이버/카카오/구글 로그인 & 회원가입**: 앱, 웹 모두 테스트 완료

---

## 2026-04-10

### [KEND-NATIVE] Splash 이미지 전체 화면 적용

- **스플래시 이미지 교체**: 기본 템플릿 `splash-icon.png` → 커스텀 `kend-splash-1080x1920.png`로 변경
- **전체 화면 표시**: `resizeMode: "contain"` + `imageWidth: 200` → `resizeMode: "cover"`로 변경하여 전체 화면에 꽉 차게 표시

---

## 2026-04-09

### [KEND-NATIVE] Google OAuth 외부 브라우저 처리

- **WebView 내 Google 로그인 차단 대응**: Google의 `disallowed_useragent` 정책으로 인해 WebView 내부에서 Google OAuth가 403 에러 발생
- **외부 브라우저 리다이렉트**: `accounts.google.com` URL 감지 시 `expo-linking`으로 시스템 브라우저(Chrome/Safari)에서 열도록 처리
- **`onShouldStartLoadWithRequest` 활용**: WebView의 URL 요청을 가로채서 외부 브라우저 패턴 매칭 후 분기 처리

### [KEND-NATIVE] Splash 화면 및 로딩 UX 개선

- **Splash 유지 시간 연장**: 레이아웃 마운트 즉시 숨기던 방식에서 → WebView 첫 로드 완료 시까지 Splash 유지
- **로딩 오버레이 반투명 처리**: 흰 배경(`#ffffff`) → 반투명 배경(`rgba(255,255,255,0.5)`)으로 변경하여 뒷 화면이 비치도록 개선
- **첫 로드 시 로더 미표시**: Splash가 표시되는 동안에는 로딩 인디케이터를 숨기고, 이후 페이지 이동 시에만 반투명 로더 표시

### [KEND-NATIVE] iOS 빌드 및 App Store 제출

- **iOS 빌드 환경 구축**: Apple Distribution Certificate, Provisioning Profile 자동 생성 (EAS 관리)
- **App Store Connect 연동**: `eas.json`에 `ascAppId`, `appleTeamId` 설정, App Store Connect API Key 생성
- **iOS production 빌드 및 제출**: `eas build` → `eas submit`으로 App Store Connect에 빌드 업로드 완료

---

## 2026-03-13

### [KEND-NATIVE] 앱 초기 설정 및 Android/iOS 빌드 환경 구축

- **프로젝트 초기 구성**: Expo + WebView 기반 사용자 앱(kend) 래핑 구조 구축
- **WebView 구현**: 뒤로가기(Android 하드웨어 버튼 + iOS 스와이프), 로딩 인디케이터, 에러 화면(다시 시도) 구현
- **앱 설정 완료**: 패키지명(`com.kend.app`), 딥링크 스킴(`kend://`), 아이콘/스플래시 경로 설정
- **EAS Build 환경 구축**: preview(APK), production(AAB) 빌드 프로필 설정, Android Keystore 생성
- **빌드 완료**: Android preview APK 빌드 성공, production AAB 빌드 준비 완료
- **불필요한 의존성 제거**: Expo 템플릿 기본 패키지 중 미사용 패키지 정리
- **문서화**: `readme/core/kend-native.md` 작성 (기술 스택, 프로젝트 구조, 빌드 방법, 버전 관리 규칙)

---

## 2026-03-10

### [KEND-NATIVE] 안드로이드 배포 준비 - 프로젝트 기반 정비

- **불필요한 의존성 제거**: Expo 템플릿 기본 패키지 중 미사용 항목 정리 (`bottom-tabs`, `blur`, `haptics`, `image`, `symbols`, `web-browser`, `gesture-handler`, `reanimated`, `react-native-web`, `react-dom` 등)
- **app.json 배포 설정**: 앱 이름(`Kend`), 안드로이드 패키지명(`com.kend.app`), iOS 번들 ID, `versionCode`, URL 스킴(`kend://`) 설정
- **WebView 개선**: 안드로이드 하드웨어 뒤로가기 버튼 처리, iOS 스와이프 뒤로가기, 로딩 인디케이터, 네트워크 에러 화면(다시 시도 버튼), 상태바 설정
- **_layout.tsx 정리**: Stack 네비게이션 헤더 숨김, 스플래시 화면 제어(`expo-splash-screen`)
- **eas.json 생성**: EAS Build 프로필 설정 (`development`, `preview`, `production`), Google Play 제출 설정
- **kend-native.md 문서 작성**: 프로젝트 구조, 빌드/배포 방법, 버전 관리 규칙, 아이콘 교체 방법, 향후 네이티브 기능 확장 가이드
