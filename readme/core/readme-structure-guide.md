# Readme 폴더 구조 & 문서 관리 가이드

KEND 플랫폼(`kend`, `kend-seller`, `kend-native`)의 모든 프로젝트는 동일한 `readme/` 폴더 구조와 문서 관리 규칙을 따른다. 다른 프로젝트를 정리하거나 신규 프로젝트를 시작할 때 이 문서를 기준으로 한다.

---

## 1. 폴더 구조

```
readme/
├── core/                       # 시스템 기반 reference (프로젝트 변경 최소)
├── active/                     # 현재 진행 중인 plan / todo
├── todo/                       # 아직 시작 전 plan
├── archive/                    # 완료 또는 보류된 문서
├── changelog-kend.md           # KEND 웹앱 변경 이력
├── changelog-seller.md         # KEND-SELLER 변경 이력
└── changelog-native.md         # KEND-NATIVE 변경 이력
```

---

## 2. 각 폴더의 목적

### `core/` — 시스템 기반 reference

프로젝트의 본질적 구조/규칙을 정의하는 문서. 코드와 무관하게 거의 변하지 않는 문서.

**예시**:
- `application-architecture.md` — 플랫폼 전체 아키텍처
- `auth-model.md` — 인증/인가 모델
- `database.md` — DB 구조, 소유권, 접근 규칙
- `claudeReadme.md` — AI 작업 가이드
- `ui-components.md` — 공용 UI 컴포넌트 가이드
- `toss-payments.md` — 결제 연동 가이드
- `growth-chart-guide.md` — 성장도표 이용지침
- `order_delivery_design_draft_for_claude_code.md` — 주문/배송 설계

**판단 기준**: "프로젝트의 뼈대", "언제든 참조해야 하는 기준 문서" → core

### `active/` — 진행 중인 plan / todo

현재 진행 중이거나, 가까운 시일 내 완료 예정인 작업 계획/기록.

**예시**:
- `internal-test-1st.md` — 1차 내부 테스트 개선사항
- `ios-review-rejection-apr14.md` — iOS 심사 대응
- `environment-separation-plan.md` — Supabase 환경 분리
- `native-swipe-blacklist.md` — 네이티브 협업 항목

**판단 기준**: "지금 내가 일하고 있는/곧 할 일" → active

### `todo/` — 아직 시작 전 plan

필요성은 인지했으나 아직 착수하지 않은 작업 계획.

**예시**:
- `phone-auth-plan.md` — 휴대폰 인증 도입 계획
- `client-rendering-plan.md` — SSR → CSR 전환 계획 (장기)
- `kend-error-handling-roadmap.md` — 에러 핸들링 강화 로드맵

**판단 기준**: "문서는 있는데 아직 손 안 댔음" → todo

### `archive/` — 완료 또는 보류된 문서

- **완료**: 해당 계획이 끝나고 더 이상 현재 시점 작업이 아닌 경우
- **보류**: 당분간 진행할 계획이 없는 경우

**판단 기준**: "이미 끝난 이야기" 또는 "한동안 볼 일 없음" → archive

---

## 3. 문서 생명 주기 (이동 규칙)

```
[신규 작성]
   ↓
todo/  ──(작업 시작)──▶  active/  ──(완료)──▶  archive/
                           ↓
                      (보류 / 장기 미진행)
                           ↓
                        archive/
```

- 문서를 새로 만들 때는 먼저 `todo/`에 둔다.
- 실제 작업이 시작되면 `active/`로 이동.
- 완료 또는 장기 보류 시 `archive/`로 이동.
- 파일 이름 자체는 바꾸지 않는다 (git history 추적 용이성).

---

## 4. Changelog 컨벤션

### 파일 분리

시스템별로 별도 파일에서 관리한다:

| 파일 | 대상 시스템 |
|------|-------------|
| `changelog-kend.md` | KEND 웹앱 (React Router SSR + WebView) |
| `changelog-seller.md` | KEND-SELLER 판매자 관리자 웹 |
| `changelog-native.md` | KEND-NATIVE React Native WebView 앱 |

3개 파일은 **모든 프로젝트에 동일하게 존재**하며, 각 저장소에서 수동으로 동기화한다. 이를 통해 어느 프로젝트에서 작업 중이더라도 다른 프로젝트의 진행 상황을 파악할 수 있다.

### 항목 형식

```markdown
## YYYY-MM-DD

### [KEND] 기능/변경사항 제목

- 상세 설명 1
- 상세 설명 2
```

- **prefix**: 항목 제목 맨 앞에 `[KEND]`, `[KEND-SELLER]`, `[KEND-NATIVE]` 중 하나를 명시
- **날짜**: ISO 형식(YYYY-MM-DD), 최신이 위로 오도록 역순
- **같은 날짜**: 여러 항목이 있으면 같은 날짜 섹션 아래에 `###` 로 구분
- **구분선**: 날짜 섹션 사이에는 `---` 구분선

### 기록 대상

- **기록**: 기능 추가, DB 스키마 변경, 아키텍처 변경, 주요 버그 수정, 문서화
- **제외**: 버튼 스타일 조정, 투명도 변경 등 UI 미세 조정, 중요도 낮은 사소한 작업

---

## 5. 기존 `core/` 문서 업데이트 시점

작업 중 해당 도메인이 근본적으로 변경되면 core 문서도 함께 업데이트한다.

| 문서 | 업데이트 시점 |
|------|---------------|
| `database.md` | 테이블 추가/삭제, 소유권 변경 시 Table Ownership Matrix 업데이트 |
| `application-architecture.md` | 라우팅 구조, 디렉토리 구조, 기술 스택 변경 시 |
| `auth-model.md` | 인증/인가 정책 변경 시 |
| `ui-components.md` | 공용 UI 컴포넌트 규격/사용법 변경 시 |

---

## 6. 새 문서 작성 기준

- **규모가 크고 독립적인 도메인 설계**(예: 결제, 주문/배송) → `core/`에 별도 md 파일
- **출시 전 완성도 강화, 장기 전환 계획** → `todo/` 또는 `active/`
- **내부 테스트 / 외부 리뷰 대응** → `active/`
- **완료된 리뷰 / 역사적 기록** → `archive/`

---

## 7. 다른 프로젝트에 적용할 때

1. 해당 프로젝트의 `readme/` 폴더를 본 가이드의 구조대로 정리
2. 기존 md 파일들을 위 기준에 따라 `core/active/todo/archive`로 분류
3. `changelog-kend.md / changelog-seller.md / changelog-native.md` 3개 파일을 모두 두고, 각 시스템의 이력을 수동으로 sync
4. 이 가이드 문서(`readme-structure-guide.md`)도 `core/`에 함께 두어 기준을 공유
