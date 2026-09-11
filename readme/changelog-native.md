# Changelog (KEND-NATIVE)

KEND-NATIVE React Native WebView 앱의 주요 변경사항을 날짜별로 기록한다.

> - 이 파일은 kend / kend-seller / kend-native 저장소에서 수동으로 동기화한다.
> - 최신 내용이 위로 오도록 역순(최신순)으로 작성한다.

---

## 2026-09-11

### [KEND-NATIVE] iOS 카드앱(페이북/ISP) 결제 딥링크·팝업 핸드오프 수정

- **증상**: BC카드/페이북 결제 테스트 중, 페이북 웹 결제창에서 "결제하기"를 눌러도 카드사 인증(ISP) 화면으로 못 넘어가고 "결제 후 결제완료를 눌러주세요" 대기 화면에서 멈춤. 페이북 앱이 설치돼 있어도 열리지 않음
- **원인 1 — 앱스킴 미핸드오프**: `onShouldStartLoadWithRequest`가 `paybooc://` 같은 비-http(s) 요청을 로딩 오버레이 로직에서 제외만 시키고 `return true`로 끝나, iOS WKWebView가 커스텀 스킴을 OS로 위임하지 않아 네비게이션이 조용히 무시됨
- **원인 2 — `LSApplicationQueriesSchemes` 미등록**: 등록이 없으면 `Linking.canOpenURL()`이 앱 설치 여부와 무관하게 항상 `false` 반환
- **원인 3 — 팝업 미지원**: BC카드/페이북 ISP 인증창은 `window.open()`으로 팝업을 띄우는데, `react-native-webview`는 멀티윈도우를 지원하지 않아 호출 자체가 무시됨(팝업이 아예 뜨지 않음)
- **수정** (`app/index.tsx`):
  - `handleShouldStartLoad`: http(s)가 아닌 요청은 `Linking.canOpenURL()` 확인 후 `Linking.openURL()`로 OS에 위임, WebView 자체 네비게이션은 `return false`로 차단
  - `injectedJavaScriptBeforeContentLoaded`(`POPUP_REDIRECT_SCRIPT`)로 `window.open`을 `window.location.href` 이동으로 치환 → 위 앱스킴 핸드오프로 자연스럽게 이어짐
- **수정** (`app.json`): `ios.infoPlist.LSApplicationQueriesSchemes`에 국내 PG/카드사 앱 스킴 등록 (`supertoss`, `kakaotalk`, `ispmobile`, `kb-acp`, `paybooc`, `kftc-bankpay`, `lotteappcard`, `mpocket.online.ansimclick`, `samsungpay` 등)
- Android는 `intent://` 스킴을 `react-native-webview`가 자체 처리하는 경우가 많아 기존에도 동작했을 가능성 있음 — iOS 수정 후 동일 시나리오로 재테스트 필요

### [KEND-NATIVE] iOS buildNumber 22 / Android versionCode 20 빌드·배포

- 위 결제 딥링크·팝업 수정 포함해 EAS production 빌드(iOS·Android 둘 다 `autoIncrement`로 각각 22/20 부여)
- iOS: App Store Connect 업로드 성공(TestFlight, Apple 처리 대기)
- Android: AAB를 Play Console에 수동 업로드해 배포 확인
- **미확인**: 실기기에서 BC카드/페이북 결제 흐름 재테스트는 아직 수행 안 함

---

## 2026-09-10

### [KEND-NATIVE] 결제 리다이렉트 구간 뒤로가기 차단 — 소진된 Toss 세션 복귀 방지

- **증상**: 앱 결제 테스트 중 발견 — Toss 결제창(전체 페이지 이동)에서 취소 후 뒤로가기를 누르면 이미 소진된 Toss 세션 URL로 돌아가 "이미 종료된 세션입니다" 에러 페이지가 뜸. 기존 차단(`BACK_BLOCKED_REGEX`)은 kend 경로(`/payments/*`)만 커버, 외부 도메인(pay.toss.im 등)과 결제 종료 랜딩 URL은 미커버
- **뒤로가기 차단을 2종류로 분리** (`app/index.tsx`):
  - `isPaymentFlowUrl` — kend 아닌 모든 외부 도메인 + `/payments/*` + `payment_success`/`payment_error`/`payment_cancelled` 쿼리 랜딩. Android 하드웨어 back도 확인 Alert 없이 조용히 무시 (외부 페이지엔 자체 취소 UI 존재)
  - `isFormFlowUrl` — `/auth/*`, `/children/(submit|:id/edit|:id/growth)`. 기존대로 확인 Alert
- **결제 직후 복귀 화면 가드** (`justReturnedFromPaymentRef`): kend가 URL 쿼리를 클라이언트에서 제거한 뒤에도 "외부→kend 복귀 직후"임을 추적해 뒤로가기 계속 차단, 다른 pathname 이동 시 해제
- **iOS back/forward 원천 차단**: `onShouldStartLoadWithRequest`에서 `navigationType === "backforward"`이고 현재 kend에 있는데 대상이 결제 리다이렉트 URL이면 `return false`
- **흰 화면 깜빡임 완화**: kend↔외부(결제창) http(s) 최상위 전환 시 debounce 없이 즉시 로딩 오버레이 + 8초 안전 타임아웃
- 상세: [active/native-swipe-blacklist.md](./active/native-swipe-blacklist.md), 배포/테스트 체크리스트: [todo/native-payment-webview-handoff.md](./todo/native-payment-webview-handoff.md)

### [KEND-NATIVE] iOS·Android 재빌드 및 테스트 트랙 배포

- iOS buildNumber 20 — EAS 빌드 성공, App Store Connect 업로드 완료 (TestFlight)
- Android versionCode 18 — EAS 빌드(AAB) 성공, Play Console 수동 업로드 후 **내부 테스트 트랙 출시**
- 둘 다 SDK 57 + 위 결제 뒤로가기 수정 포함. Android는 SDK 57로 targetSdkVersion 36(Android 16) 충족 — Google Play의 2026-08-31 대상 API 정책은 프로덕션 승격 시 해제됨
- **Android 개발자 인증**(2026-09-30 기한): 패키지 이름·서명 키가 Play Console에서 자동 등록되어 요구사항 충족 완료
- **미확인**: 결제 취소→복귀, 소셜 로그인 회귀 등 실기기 테스트 체크리스트(위 handoff 문서)는 아직 수행 안 함

---

## 2026-08-25

### [KEND-NATIVE] Expo SDK 53→57 업그레이드 — Apple iOS 26 SDK(Xcode 26) 필수 정책 대응

- **발단**: TestFlight 빌드가 90일 경과로 만료되어 재배포 시도 → 기존 빌드(13번, SDK 53/Xcode 구버전)로 App Store Connect 제출 시 `90725: SDK version issue` 거부. Apple이 모든 iOS/iPadOS 앱에 iOS 26 SDK(Xcode 26 이상) 빌드를 요구하기 시작함
- **부수 이슈 1**: 재배포 과정에서 App Store Connect API 키가 403으로 거부됨 → 원인은 Apple Developer Program License Agreement 갱신 미동의. Apple Developer 계정에서 재동의 후 해결
- **부수 이슈 2**: `eas.json` production 프로필에 `ios.image: "latest"`(Xcode 26 이미지) 지정 후 빌드하니, 기존 Expo SDK 53(React Native 0.79) 코드가 Xcode 26의 강화된 C++20 `consteval` 검사에서 컴파일 실패(`fmt` 라이브러리 관련) → SDK 자체를 올려야 하는 것으로 결론
- **SDK 업그레이드**: `expo@53` → `expo@57`(React Native 0.79.4 → 0.86.2, React 19.0.0 → 19.2.8)로 전체 의존성 정렬. 부수적으로 `react-native-reanimated`/`react-native-worklets`가 expo-router의 트랜지티브 의존성으로 인해 SDK 57과 비매칭인 최신 버전(4.6.0/0.12.x)을 물어오던 문제 발견 → SDK 공식 매칭 버전(4.5.1/0.10.1)으로 명시적 고정
- **코드 수정**: SDK 56부터 `expo-router`가 `@react-navigation/native`와 비호환이 되어, `app/index.tsx`의 `useFocusEffect` import를 `expo-router`로 변경(미사용된 `@react-navigation/native` 의존성 제거). `StyleSheet.absoluteFillObject` → `absoluteFill`(RN 0.86 타입 변경). `app.json`에서 더 이상 유효하지 않은 `newArchEnabled`/`android.edgeToEdgeEnabled` 필드 제거
- **결과**: buildNumber 19로 iOS production 빌드 성공, App Store Connect 업로드 및 처리 완료 확인. TestFlight 테스트 그룹 배정은 다음 작업
- **미확인**: Android는 이번에 재빌드하지 않음 — 다음 Android 빌드 시 동일 SDK 57 기준 적용 예정

---

## 2026-05-07

### [KEND-NATIVE] swipe back 시 로딩 오버레이 차단

- `onShouldStartLoadWithRequest` 핸들러 추가, `navigationType === "backforward"` 시 `isBackForwardRef`에 기록
- `handleLoadStart`에서 backforward 네비게이션이면 로딩 오버레이 setTimeout 자체 스킵
- 효과: swipe back 또는 헤더 백 버튼 시 주황색 로딩 오버레이가 더 이상 깜빡이지 않음 (단, "이전 화면 잠깐 보임" 현상 자체는 웹쪽 `clientLoader` 캐시로 해결됨)
- 참고: [changelog-kend.md 2026-05-07](./changelog-kend.md)

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
- **참고**: "이전 화면이 잠깐 보였다가 재로드되는" 현상의 근본 원인은 **2026-05-07 진단으로 정정** — bfcache가 아니라 React Router v7 single fetch가 popstate 시 loader를 재실행하는 것이 원인. 해결책은 웹앱 쪽 `clientLoader` 캐시. 자세한 내용은 [changelog-kend.md 2026-05-07](./changelog-kend.md) 참고

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
