# CLAUDE.md — KEND-NATIVE (앱)

> **KEND-NATIVE** — kend 웹앱을 WebView로 감싸는 React Native 앱(iOS/Android). 딥링크·제스처·네이티브↔웹 브리지·스토어 배포 담당. 단일 Supabase DB(kend/seller와 공유).
> 현재 현황은 `readme/overview.md`, 기반 문서는 `readme/core/`.

## 문서 운영 방식 (kend · native · seller 공통 규칙)

- **overview.md** = 이 프로젝트의 현재 상태 **단일 대시보드**. 전체 현황은 여기서 파악한다.
- **changelog** = 각 패키지 history(불변, git 기준 append). **이 프로젝트 작업은 `readme/changelog-native.md`에** 기록한다.
- **overview·changelog는 `/changelog` 명령어로만 갱신한다.** Claude는 **선제적으로 작성하지 않는다** (사용자가 직접 호출).
- **완료는 테스트로 동작 확인된 뒤에만** ✅로 기록. 아직이면 "진행 중"/"구현됨(테스트 대기)".
- overview 작성 표준(방식 vs 내용) → `readme/core/readme-structure-guide.md §8`.
- **타 패키지 진행상황**은 그 패키지 changelog(`changelog-kend.md`, `changelog-seller.md` — 이 repo에도 복사본 존재)로 참조한다. changelog 3종의 프로젝트 간 sync는 **kend의 `scripts/sync-changelogs.sh` 실행**으로 처리(각 패키지 원본을 3개 repo에 복사). 원본(canonical): changelog-kend←kend, native←kend-native, seller←kend-seller.
