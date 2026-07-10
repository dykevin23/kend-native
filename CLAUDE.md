# CLAUDE.md — KEND-NATIVE (앱)

> **KEND-NATIVE** — kend 웹앱을 WebView로 감싸는 React Native 앱(iOS/Android). 딥링크·제스처·네이티브↔웹 브리지·스토어 배포 담당. 단일 Supabase DB(kend/seller와 공유).
> 현재 현황은 `readme/overview.md`, 기반 문서는 `readme/core/`.

## 문서 운영 방식 (kend · native · seller 공통 규칙)

- **overview.md** = 이 프로젝트의 현재 상태 **단일 대시보드**. 전체 현황은 여기서 파악한다.
- **changelog** = 각 패키지 history(불변, git 기준 append). **이 프로젝트 작업은 `readme/changelog-native.md`에** 기록한다.
- **overview·changelog는 `/changelog` 명령어로만 갱신한다.** Claude는 **선제적으로 작성하지 않는다** (사용자가 직접 호출).
- **완료는 테스트로 동작 확인된 뒤에만** ✅로 기록. 아직이면 "진행 중"/"구현됨(테스트 대기)".
- overview 작성 표준(방식 vs 내용) → `readme/core/readme-structure-guide.md §8`.
- **출시까지 전체 Phase 진행상황**은 `readme/kend-milestones.md`(플랫폼 전체 트래커, 3개 프로젝트 공유). 큰 계획은 `readme/kend-roadmap-to-launch.md`.
- **타 패키지 진행상황**은 그 패키지 changelog(`changelog-kend.md`, `changelog-seller.md` — 이 repo에도 복사본 존재)로 참조한다.
- **공유 문서 sync**: kend에서 `bash scripts/sync-docs.sh` 실행. 대상 = milestones · roadmap · core 공통문서 · changelog 3종. **overview는 로컬이라 sync 안 함.**
- ⚠️ **공유 문서(milestones/roadmap/core)는 kend에서만 수정한다.** 여기서 고치면 sync 시 덮어써진다. 이 프로젝트에서 수정할 것은 `changelog-native.md`와 `overview.md`.
