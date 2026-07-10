새 세션에서 프로젝트 컨텍스트를 파악한다.
**읽고 요약만 한다 — 작업은 시작하지 않는다.** (작업 지시는 이 명령어 이후 별도로 받는다.)

## 1. 진행상황 (먼저 읽을 것)
- `readme/overview.md` — **이 프로젝트(kend-native)의 현재 상태 단일 대시보드** (최우선)
- `readme/kend-milestones.md` — 출시까지 **전체 Phase 진행 트래커** (플랫폼 공통, canonical: kend)
- `readme/changelog-native.md` — **이 프로젝트**의 변경 이력
- `readme/changelog-kend.md`, `readme/changelog-seller.md` — **타 패키지 진행상황**

## 2. 기반 문서 (reference)
- `readme/core/claudeReadme.md` — AI 작업 가이드
- `readme/core/readme-structure-guide.md` — 문서 구조/운영 규칙 (§8 overview 표준)
- `readme/core/application-architecture.md` — 아키텍처
- `readme/core/kend-native.md` — 네이티브 레이어 문서
- `readme/core/auth-model.md` — 인증/인가 모델
- `readme/core/` 하위 나머지 도메인 문서

## 3. 계획 / 작업 문서
- `readme/kend-roadmap-to-launch.md` — 출시 로드맵 (안정적 계획)
- `readme/active/`, `readme/todo/` — 진행 중 / 예정 작업 계획 (있으면)

---

읽은 뒤 **현재 상황을 간략히 요약**한다: 지금 어디까지 왔는지 / 다음 작업 후보 / 막혀 있는 것(외부 의존성 등).

> ⚠️ 문서의 상태 표기가 실제 코드와 다를 수 있다. 착수 전 코드로 실측해 확인할 것 (특히 "미착수"로 적힌 항목).
