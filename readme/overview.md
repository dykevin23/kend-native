# KEND-NATIVE 현재 상황 (Overview)

> 최종 업데이트: 2026-11-26
> KEND-NATIVE의 현재 상태 단일 대시보드. 개발 진행마다 갱신한다.
> 작성 표준 → [core/readme-structure-guide.md](./core/readme-structure-guide.md) §8 (방식 vs 내용)
> 완료 상세 → [changelog-native.md](./changelog-native.md) / 큰 계획 → [kend-roadmap-to-launch.md](./kend-roadmap-to-launch.md)

---

## 🎯 프로젝트 한 줄 요약

**KEND-NATIVE** — kend 웹앱을 WebView로 감싸는 React Native 앱(iOS/Android). 딥링크, 뒤로가기/스와이프 제스처, 네이티브↔웹 브리지, 스토어 배포를 담당.

---

## 🚦 지금 상황 (2026-11-26)

- **iOS buildNumber 28** — 푸시 알림(expo-notifications) + 백그라운드 복귀 흰 화면 수정 포함 배포. **TestFlight 푸시 수신 확인** ✅, 흰 화면 수정은 테스트 체크리스트 미수행
- **Android versionCode 23**은 2026-10-28(카드앱 스킴 수정) 빌드에 머물러 있음 — ⚠️ **그 이후의 운영/개발 앱 분리, 빌드 이미지 수정, 푸시 알림, 백그라운드 흰 화면 수정이 Android에 전혀 반영되지 않음.** 다음 Android 빌드 필요
- 운영 앱이 바라보는 주소를 Vercel 프리뷰 → 정식 도메인 `kend.co.kr`로 전환(2026-11-13), buildNumber 27에서 **정상 접속 실기기 확인** ✅ (빌드 26은 EAS 빌드 이미지 이슈로 실행 직후 크래시 — 27에서 해소)
- 스플래시 리뉴얼(Direction A) + 로딩 인터랙션(buildNumber 24), 카드앱 스킴 핸드오프 수정(buildNumber 25/versionCode 23)은 **배포 후 실기기 확인 결과가 기록에 없음** — 확인 필요
- 위치정보 기능(2026-09-15 추가)은 iOS만 확인됐고 **Android 실기기 테스트가 계속 이월 중**
- BC카드/페이북 결제 딥링크·팝업 핸드오프, Toss 결제 뒤로가기 수정도 여전히 **실기기 결제 플로우 테스트 미수행** → [todo/native-payment-webview-handoff.md](./todo/native-payment-webview-handoff.md)
- iOS 심사 정체 등 플랫폼 공통 현황은 kend overview 참조

---

## ✅ 최근 완료

- 운영 앱 정식 도메인(`kend.co.kr`) 전환 및 정상 접속 확인 — iOS buildNumber 27
- 앱 푸시 알림(expo-notifications) 추가 — iOS TestFlight 수신 확인, buildNumber 28
- 위치정보 네이티브 기능(expo-location 브릿지) 추가 — iOS 23 빌드로 실기기 테스트, 정상 동작 확인

> 상세 → [changelog-native.md](./changelog-native.md)

---

## 🔄 진행 중 / 대기 (active)

| 항목 | 상태 |
|------|------|
| [android-tester](./active/android-tester.md) | _상태 채울 것_ |
| [internal-test-1st](./active/internal-test-1st.md) | _상태 채울 것_ |
| [ios-review-rejection-apr14](./active/ios-review-rejection-apr14.md) | _상태 채울 것_ (2026-04-14 리뷰 기준 — 이후 Guideline 5.1.1 건 등 별도 리젝 이력 있음, 문서 현행화 필요) |
| [native-swipe-blacklist](./active/native-swipe-blacklist.md) | 결제 리다이렉트 구간 반영해 코드 적용 완료, 실기기 테스트 대기 |
| [todo/native-payment-webview-handoff](./todo/native-payment-webview-handoff.md) | 결제 WebView 수정 배포·테스트 체크리스트 — 빌드/배포 완료, 체크리스트 미수행 |
| Android 재빌드 밀림 ([changelog](./changelog-native.md#2026-11-13)) | 운영/개발 분리·빌드 이미지 수정·푸시 알림·백그라운드 흰 화면 수정이 쌓여있음, versionCode 23(10/28)에서 정지 |
| 백그라운드 흰 화면 수정 테스트 ([changelog](./changelog-native.md#2026-11-25)) | iOS buildNumber 28에 배포, 장시간 백그라운드 재현 테스트 대기 |
| 스플래시 리뉴얼·카드앱 스킴 수정 실기기 확인 ([changelog](./changelog-native.md#2026-10-27)) | buildNumber 24/25 배포, 실기기 확인 결과 미기재 |
| 위치정보 기능 Android 테스트 ([changelog](./changelog-native.md#2026-09-15)) | iOS는 확인 완료, Android는 계속 이월 중 |

---

## 📋 다음 작업

- [ ] Android 재빌드 — 운영/개발 분리, kend.co.kr 전환, 푸시 알림, 백그라운드 흰 화면 수정 반영
- [ ] Android에서 푸시 알림 수신 테스트
- [ ] 백그라운드 장시간 후 복귀 흰 화면 수정 실기기 테스트 (iOS/Android)
- [ ] 스플래시 리뉴얼·로딩 인터랙션, 카드앱 스킴 핸드오프 수정 실기기 확인
- [ ] 위치정보 기능 Android 실기기 테스트
- [ ] BC카드/페이북 결제 플로우 + Toss 결제 뒤로가기 수정 실기기 테스트 ([todo/native-payment-webview-handoff.md](./todo/native-payment-webview-handoff.md) 체크리스트)
- [ ] 테스트 통과 항목부터 Android를 프로덕션 트랙으로 승격

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
- [x] 카메라/갤러리 권한 처리 — 권한 문구에 실제 사용처 명시(Guideline 5.1.1 대응) 완료
- [ ] iOS 심사 통과 (kend와 공통 블로커)

---

## 🔮 장기 로드맵 (출시 후)

- 푸시 알림(2026-11-20 추가, iOS 확인됨)은 기본 수신까지만 — 세그먼트별 발송, 딥링크 고도화 등은 kend 측 계획 참고
- UIScene 생명주기 적용 (2026-11-18 빌드 이미지 이슈로 임시 우회, 과제로 남김)
