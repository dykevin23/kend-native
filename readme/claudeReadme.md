This project has an established architecture.

Before starting, carefully read and fully understand:

- application-architecture.md
- auth-model.md
- database.md
- kend-native.md (React Native 앱 구조 및 빌드/배포)

These documents define non-negotiable constraints.
Do NOT propose changes or alternatives unless explicitly asked.
All outputs must comply with these documents.

- 이 문서는 프로젝트의 공식 기준 문서이다.
- 작업을 시작하기 전에 반드시 이 문서를 읽고 이해해야 한다.
- **이 문서를 읽은 이후의 모든 대화와 설명은 한국어로 진행한다.**
- 코드, 식별자, 라이브러리명 등은 필요 시 영어를 사용한다.

---

## 문서 작성 규칙

작업 완료 후, 변경사항을 적절한 문서에 기록한다.

### changelog.md

- **대상**: 기능 추가, DB 스키마 변경, 아키텍처 변경 등 시스템의 큰 틀에서 의미 있는 변경사항
- **제외**: 버튼 스타일 조정, 투명도 변경 등 UI 미세 조정이나 중요도가 낮은 작은 작업
- **형식**: 날짜별 역순(최신순), `[KEND]` 또는 `[KEND-SELLER]` prefix로 시스템 구분
- **동기화**: Kend / Kend-Seller 양쪽에서 수동으로 동기화

### 기존 문서 업데이트

변경사항이 기존 문서의 성격에 해당하면, 해당 문서를 직접 업데이트한다.

| 문서                          | 업데이트 시점                                                    |
| ----------------------------- | ---------------------------------------------------------------- |
| `database.md`                 | 테이블 추가/삭제, 소유권 변경 시 Table Ownership Matrix 업데이트 |
| `application-architecture.md` | 라우팅 구조, 디렉토리 구조, 기술 스택 변경 시                    |
| `auth-model.md`               | 인증/인가 정책 변경 시                                           |
| `kend-native.md`              | 앱 설정, 빌드 프로필, 네이티브 기능 추가 시                      |

### 별도 문서 생성

특정 도메인의 설계가 복잡하여 별도 설명이 필요한 경우, 새 md 파일을 생성한다.
(예: `order_delivery_design_draft_for_claude_code.md`)
