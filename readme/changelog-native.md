# Changelog (Kend Native)

Kend Native 앱의 주요 변경사항을 날짜별로 기록한다.

> 최신 내용이 위로 오도록 역순(최신순)으로 작성한다.

---

## 2026-03-10

### 안드로이드 배포 준비 - 프로젝트 기반 정비

- **불필요한 의존성 제거**: Expo 템플릿 기본 패키지 중 미사용 항목 정리 (`bottom-tabs`, `blur`, `haptics`, `image`, `symbols`, `web-browser`, `gesture-handler`, `reanimated`, `react-native-web`, `react-dom` 등)
- **app.json 배포 설정**: 앱 이름(`Kend`), 안드로이드 패키지명(`com.kend.app`), iOS 번들 ID, `versionCode`, URL 스킴(`kend://`) 설정
- **WebView 개선**: 안드로이드 하드웨어 뒤로가기 버튼 처리, iOS 스와이프 뒤로가기, 로딩 인디케이터, 네트워크 에러 화면(다시 시도 버튼), 상태바 설정
- **_layout.tsx 정리**: Stack 네비게이션 헤더 숨김, 스플래시 화면 제어(`expo-splash-screen`)
- **eas.json 생성**: EAS Build 프로필 설정 (`development`, `preview`, `production`), Google Play 제출 설정
- **kend-native.md 문서 작성**: 프로젝트 구조, 빌드/배포 방법, 버전 관리 규칙, 아이콘 교체 방법, 향후 네이티브 기능 확장 가이드
