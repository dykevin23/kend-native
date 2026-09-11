# KEND-NATIVE 현재 상황 (Overview)

> 최종 업데이트: 2026-09-11
> KEND-NATIVE의 현재 상태 단일 대시보드. 개발 진행마다 갱신한다.
> 작성 표준 → [core/readme-structure-guide.md](./core/readme-structure-guide.md) §8 (방식 vs 내용)
> 완료 상세 → [changelog-native.md](./changelog-native.md) / 큰 계획 → [kend-roadmap-to-launch.md](./kend-roadmap-to-launch.md)

---

## 🎯 프로젝트 한 줄 요약

**KEND-NATIVE** — kend 웹앱을 WebView로 감싸는 React Native 앱(iOS/Android). 딥링크, 뒤로가기/스와이프 제스처, 네이티브↔웹 브리지, 스토어 배포를 담당.

---

## 🚦 지금 상황 (2026-09-11)

- BC카드/페이북 앱카드 결제 시 ISP 인증 화면으로 못 넘어가는 버그 수정: iOS 앱스킴 딥링크 핸드오프(`Linking.openURL`) + `window.open` 팝업 리다이렉트 처리 + `LSApplicationQueriesSchemes` 등록
- **iOS buildNumber 22** — App Store Connect 업로드 완료 (TestFlight, Apple 처리 대기). **Android versionCode 20** — Play Console 수동 업로드로 배포 확인
- 위 수정은 **아직 실기기 결제 테스트 미수행** — 구현만 완료, 다음 작업에서 검증 필요
- 직전 이슈(Toss 결제 취소 후 뒤로가기 → "이미 종료된 세션입니다")는 iOS 20/Android 18에 반영해 배포했으나, 이 역시 **실기기 테스트 체크리스트 미수행** → [todo/native-payment-webview-handoff.md](./todo/native-payment-webview-handoff.md)
- iOS 심사 정체 등 플랫폼 공통 현황은 kend overview 참조

---

## ✅ 최근 완료

- 결제 리다이렉트 구간 뒤로가기 차단 — Toss 세션 소진("이미 종료된 세션입니다") 방지. iOS 20 / Android 18 빌드에 반영, 각 스토어 테스트 트랙 배포
- Expo SDK 53→57 업그레이드 (Apple iOS 26 SDK/Xcode 26 필수 정책 대응)
- App Store Connect API 키 403 이슈 해결 (Apple Developer Program License Agreement 재동의 필요했음)

> 상세 → [changelog-native.md](./changelog-native.md)

---

## 🔄 진행 중 / 대기 (active)

| 항목 | 상태 |
|------|------|
| [android-tester](./active/android-tester.md) | _상태 채울 것_ |
| [internal-test-1st](./active/internal-test-1st.md) | _상태 채울 것_ |
| [ios-review-rejection-apr14](./active/ios-review-rejection-apr14.md) | _상태 채울 것_ |
| [native-swipe-blacklist](./active/native-swipe-blacklist.md) | 결제 리다이렉트 구간 반영해 코드 적용 완료, 실기기 테스트 대기 |
| [todo/native-payment-webview-handoff](./todo/native-payment-webview-handoff.md) | 결제 WebView 수정 배포·테스트 체크리스트 — 빌드/배포 완료, 체크리스트 미수행 |
| 카드앱 딥링크·팝업 핸드오프 ([changelog](./changelog-native.md#2026-09-11)) | 앱스킴 핸드오프 + `window.open` 팝업 리다이렉트 구현·빌드 22/20 배포 완료, BC카드/페이북 실기기 테스트 대기 |

---

## 📋 다음 작업

- [ ] BC카드/페이북 등 앱카드 결제 실기기 재테스트 (buildNumber 22 / versionCode 20) — ISP 인증 화면 정상 전환, 팝업 리다이렉트 동작 확인
- [ ] iOS TestFlight 그룹에 빌드 22 배정, 테스터 재초대 확인
- [ ] 결제 뒤로가기 수정 실기기 테스트 ([todo/native-payment-webview-handoff.md](./todo/native-payment-webview-handoff.md) 체크리스트 — 결제 취소→복귀, 소셜 로그인 회귀 등)
- [ ] 테스트 통과 후 Android versionCode 20을 프로덕션으로 승격 (Target API 36 정책 알림 해제)

---

## 🏗️ 시스템 아키텍처 스냅샷

- **kend** (웹): React Router SSR — WebView로 로드되는 본체
- **kend-native** (앱, 본 프로젝트): React Native + WebView (iOS/Android). 제스처/딥링크/브리지/스토어 배포
- **kend-seller** (판매자 관리자): 웹 전용
- **단일 Supabase DB**: PostgreSQL + Drizzle ORM
- **결제**: TossPayments (현재 차단, 테스트 키 대기 — kend 측)

> 상세: [core/application-architecture.md](./core/application-architecture.md)

---

## 📂 문서 구조

| 폴더 | 역할 |
|------|------|
| `core/` | 프로젝트 기반 reference (3개 프로젝트 공유) |
| `active/` | 현재 진행 중인 plan/todo |
| `todo/` | 아직 시작 전 plan |
| `archive/` | 완료/보류 |
| `changelog-{kend,seller,native}.md` | 시스템별 변경 이력 (수동 sync) |

> 규칙: [core/readme-structure-guide.md](./core/readme-structure-guide.md)

---

## 🚧 출시 전 반드시 필요한 작업 (체크리스트)

- [ ] WebView 로드 에러 처리 / 네트워크 상태 감지(native)
- [ ] WebView ↔ 네이티브 에러 브리지
- [ ] 네이티브 뒤로가기/스와이프 차단 (결제·폼 구간) — 코드 적용됨, 실기기 테스트 대기
- [ ] 앱 크래시 리포팅 (Sentry/Crashlytics 검토)
- [ ] 카메라/갤러리 권한 처리
- [ ] iOS 심사 통과 (kend와 공통 블로커)

---

## 🔮 장기 로드맵 (출시 후)

> ← _native 작업 시 채울 것_ (푸시 알림 등)
