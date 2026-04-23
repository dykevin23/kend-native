# Kend Native (React Native App)

## 1. 개요

Kend Native는 사용자 앱(Kend)을 모바일 네이티브 앱으로 제공하기 위한 **React Native + Expo** 프로젝트이다.

현재는 Vercel에 배포된 웹 앱(`https://kend-seven.vercel.app`)을 **WebView로 래핑**하는 구조이며,
추후 필요에 따라 네이티브 기능(푸시 알림, 카메라, 딥링크 등)을 추가할 수 있다.

---

## 2. 기술 스택

| 항목 | 기술 | 버전 |
|------|------|------|
| Framework | Expo | SDK 53 |
| Runtime | React Native | 0.79.4 |
| Language | TypeScript | 5.8 |
| Navigation | expo-router | 5.1 |
| WebView | react-native-webview | 13.13.5 |
| Build | EAS Build | - |

---

## 3. 프로젝트 구조

```
kend-native/
├── app/
│   ├── _layout.tsx          # Root 레이아웃 (Stack, 스플래시 제어)
│   └── index.tsx            # 홈 화면 (WebView + 뒤로가기/로딩/에러 처리)
├── assets/
│   └── images/
│       ├── icon.png             # 앱 아이콘 (1024x1024)
│       ├── adaptive-icon.png    # 안드로이드 Adaptive 아이콘
│       └── splash-icon.png      # 스플래시 이미지
├── readme/                  # 프로젝트 문서 (Kend/Kend-Seller와 공유)
├── app.json                 # Expo 설정 (앱 이름, 패키지명, 아이콘 등)
├── eas.json                 # EAS Build 프로필 설정
├── package.json
└── tsconfig.json
```

---

## 4. 핵심 코드 설명

### 4.1 WebView (`app/index.tsx`)

웹 앱을 네이티브 앱 안에서 보여주는 핵심 컴포넌트이다.

**주요 기능:**
- **안드로이드 뒤로가기 버튼**: `BackHandler`로 하드웨어 뒤로가기 버튼 이벤트를 가로채서, WebView 내부에서 뒤로 갈 수 있으면 WebView 뒤로가기를 실행하고, 없으면 앱을 종료한다.
- **iOS 스와이프 뒤로가기**: `allowsBackForwardNavigationGestures` 옵션으로 iOS에서 가장자리 스와이프로 뒤로가기를 지원한다.
- **로딩 인디케이터**: 웹 페이지 로드 중 흰 화면 대신 로딩 스피너를 표시한다.
- **에러 화면**: 네트워크 오류 또는 서버 에러(5xx) 발생 시 "다시 시도" 버튼이 있는 에러 화면을 표시한다.
- **상태바**: `expo-status-bar`로 상태바 스타일을 제어한다.

### 4.2 Layout (`app/_layout.tsx`)

- Expo Router의 `Stack` 네비게이션을 사용하며, **헤더를 숨겨서** WebView가 전체 화면을 차지한다.
- `expo-splash-screen`으로 앱 시작 시 스플래시 화면을 표시하고, 레이아웃 마운트 후 숨긴다.

---

## 5. 앱 설정 (`app.json`)

| 설정 | 값 | 설명 |
|------|------|------|
| `name` | Kend | 사용자에게 표시되는 앱 이름 |
| `slug` | kend-native | Expo 프로젝트 식별자 |
| `version` | 1.0.0 | 앱 버전 (사용자 노출) |
| `scheme` | kend | 딥링크 스킴 (`kend://`) |
| `android.package` | com.kend.app | 안드로이드 패키지명 (Google Play 식별자) |
| `android.versionCode` | 1 | 안드로이드 빌드 번호 (배포 시 증가) |
| `ios.bundleIdentifier` | com.kend.app | iOS 번들 ID (App Store 식별자) |

---

## 6. EAS Build (`eas.json`)

EAS(Expo Application Services)를 사용하여 클라우드에서 앱을 빌드한다.

### 빌드 프로필

| 프로필 | 용도 | 출력 |
|--------|------|------|
| `development` | 개발용 (development client) | 내부 배포 |
| `preview` | 테스트 배포용 | APK (안드로이드) |
| `production` | 스토어 배포용 | AAB (안드로이드), IPA (iOS) |

### 빌드 명령어

```bash
# EAS CLI 설치 (최초 1회)
npm install -g eas-cli

# Expo 계정 로그인
eas login

# 안드로이드 테스트 APK 빌드
eas build --platform android --profile preview

# 안드로이드 프로덕션 빌드 (AAB, Google Play 업로드용)
eas build --platform android --profile production

# iOS 빌드
eas build --platform ios --profile production
```

### Google Play 제출

```bash
# Google Play에 제출 (Internal Testing 트랙)
eas submit --platform android --profile production
```

> `google-service-account.json` 파일이 필요하다. Google Play Console에서 서비스 계정 키를 발급받아 프로젝트 루트에 배치한다. (`.gitignore`에 등록되어 있음)

---

## 7. 로컬 개발

```bash
# 의존성 설치
npm install

# Expo 개발 서버 시작
npm start

# 안드로이드 에뮬레이터에서 실행
npm run android

# iOS 시뮬레이터에서 실행
npm run ios
```

---

## 8. 버전 관리 규칙

### version (사용자 노출)
- `app.json`의 `expo.version`
- 형식: `MAJOR.MINOR.PATCH` (Semantic Versioning)
- 사용자에게 표시되는 버전 (예: 1.0.0, 1.1.0, 2.0.0)

### versionCode (안드로이드 내부)
- `app.json`의 `expo.android.versionCode`
- 정수값, 배포할 때마다 1씩 증가
- Google Play에서 업데이트 판단 기준
- `eas.json`의 `production.autoIncrement: true`로 EAS Build 시 자동 증가

---

## 9. 앱 아이콘 & 스플래시 교체 방법

### 앱 아이콘
1. `assets/images/icon.png` 교체 (1024x1024px, PNG)
2. `assets/images/adaptive-icon.png` 교체 (안드로이드 Adaptive Icon용, 1024x1024px)
   - 안드로이드 Adaptive Icon은 원형/사각형 등 다양한 모양으로 잘리므로, 중요한 내용은 중앙 66% 영역 안에 배치

### 스플래시 화면
1. `assets/images/splash-icon.png` 교체
2. `app.json`에서 `backgroundColor` 색상 조정 가능

---

## 10. 향후 네이티브 기능 확장 시

현재는 WebView 래핑 앱이지만, 필요 시 네이티브 기능을 추가할 수 있다.

| 기능 | Expo 패키지 | 용도 |
|------|------------|------|
| 푸시 알림 | `expo-notifications` | 주문 상태 변경 알림 등 |
| 카메라 | `expo-camera` | 중고 상품 촬영 (C2C) |
| 이미지 피커 | `expo-image-picker` | 갤러리에서 사진 선택 |
| 딥링크 | `expo-linking` (이미 설치) | 외부 URL → 앱 내 특정 화면 |
| 생체인증 | `expo-local-authentication` | 결제 시 지문/얼굴 인증 |

네이티브 기능 추가 시 해당 패키지를 설치하고, WebView와의 통신은 `postMessage` / `onMessage`를 통해 처리한다.

---

## 11. 주의사항

- **WebView URL 변경 시**: `app/index.tsx`의 `WEB_APP_URL` 상수를 수정한다.
- **패키지명(`com.kend.app`)은 Google Play에 한 번 등록하면 변경 불가**하다. 최초 배포 전에 확정할 것.
- `eas.json`의 `submit.production.android.serviceAccountKeyPath`에 지정된 파일(`google-service-account.json`)은 절대 Git에 커밋하지 않는다.
