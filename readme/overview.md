# KEND-NATIVE 현재 상황 (Overview)

> 최종 업데이트: 2026-06-24 (골격 적용 — 동적 현황은 native 작업 시 갱신)
> KEND-NATIVE의 현재 상태 단일 대시보드. 개발 진행마다 갱신한다.
> 작성 표준 → [core/readme-structure-guide.md](./core/readme-structure-guide.md) §8 (방식 vs 내용)
> 완료 상세 → [changelog-native.md](./changelog-native.md) / 큰 계획 → [kend-roadmap-to-launch.md](./kend-roadmap-to-launch.md)

---

## 🎯 프로젝트 한 줄 요약

**KEND-NATIVE** — kend 웹앱을 WebView로 감싸는 React Native 앱(iOS/Android). 딥링크, 뒤로가기/스와이프 제스처, 네이티브↔웹 브리지, 스토어 배포를 담당.

---

## 🚦 지금 상황

> ← _native에서 작업 시 갱신_ (아래는 참고 포인터)

- iOS 심사 정체 등 플랫폼 공통 현황은 kend overview 참조
- 네이티브 고유 현황(스와이프 제스처, WebView 브리지 등)을 여기에 기록

---

## ✅ 최근 완료

> ← _[changelog-native.md](./changelog-native.md)에서 핵심 항목 요약_

---

## 🔄 진행 중 / 대기 (active)

| 항목 | 상태 |
|------|------|
| [android-tester](./active/android-tester.md) | _상태 채울 것_ |
| [internal-test-1st](./active/internal-test-1st.md) | _상태 채울 것_ |
| [ios-review-rejection-apr14](./active/ios-review-rejection-apr14.md) | _상태 채울 것_ |
| [native-swipe-blacklist](./active/native-swipe-blacklist.md) | _상태 채울 것_ |

---

## 📋 다음 작업

> ← _native 작업 시 채울 것_

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
- [ ] 네이티브 스와이프 차단 URL blacklist 최종 적용
- [ ] 앱 크래시 리포팅 (Sentry/Crashlytics 검토)
- [ ] 카메라/갤러리 권한 처리
- [ ] iOS 심사 통과 (kend와 공통 블로커)

---

## 🔮 장기 로드맵 (출시 후)

> ← _native 작업 시 채울 것_ (푸시 알림 등)
