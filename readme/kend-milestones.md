# Kend 출시 마일스톤 보드

> [kend-roadmap-to-launch.md](kend-roadmap-to-launch.md) 기반 실행 트래커.
> 로드맵 = 계획 문서 (안정적) / 본 문서 = 진행 트래킹 (live, 주간 업데이트)
>
> **상위 목표**: 2026년 안 출시
> **내부 타겟**: 2026-09-30 (버퍼를 앞에 두기 위한 tight 스케줄)
> 9월 미달성 시 10~12월로 자연스럽게 이연 가능. 외부 의존성(법인/Toss/NICE)만 지연 없도록 관리.

---

## 🔖 현재 상태

> near-term 현황 요약은 **[overview.md](overview.md)** (단일 대시보드)에서 본다. 본 문서는 **Phase별 전체 트래커** — 출시까지 남은 전 범위를 추적한다.
>
> **2026-08-04 핵심**: ✅ Phase 2 종료(재고차감/복원 포함) / 🆕 **Phase 2.5(주문 라이프사이클 완결) 신설** — 구매확정·반품환불교환·문의·SLA·배송예외·플랫폼배송비를 하나로 묶음, 구 P3-1과 P2-9(선택→필수)를 흡수 / 정산은 **Phase 3.5**로 이동(구 Phase 3) / Phase 2 선택 편의기능(구 P2-7·8·10)은 Phase 2.5·Phase 3(관리보완)로 재배치 / 🚨 iOS 심사 정체 지속
>
> ⚠️ **스케줄 슬립 — 재산정 필요**: 아래 Phase 종료일(5~7월)은 모두 지났음. Phase 2.5/3/3.5 각 항목 Due는 아직 미배정 — 착수 시 재산정 필요. 내부 타겟 2026-09-30 재조율 필요.

---

## 사용법

### Story / Sub-task 구조
- **Story**: 큰 단위 작업 (3~8일 분량). 사전 정의.
- **Sub-task**: 각 Story 착수 시점에 체크리스트로 추가. 현재 컨텍스트 기준으로 그때그때 쪼갬.

### 상태 표기
- 🟡 **Todo** — 착수 전
- 🟢 **In Progress** — 진행 중
- ⏸ **Holding** — 외부 의존성 대기 / 의사결정 대기
- ✅ **Done** — 완료
- ❌ **Dropped** — 출시 후로 이연 결정

### 운영 규칙
- 매주 금요일 진행 점검 → 지연 발생 시 다음 주 월요일 계획 조정
- Story 착수 직전: Sub-task 체크리스트 추가
- Phase 진입 게이트마다 선택 항목 포함/드롭 결정

---

## 주요 마일스톤

| Phase | 종료 목표일 | 주요 내용 |
|-------|-----------|----------|
| Phase 0 | **2026-05-01 (금)** | iOS 심사 통과, 잔여 마무리 |
| Phase 1 | **2026-05-29 (금)** | 휴대폰 인증, 결제+주문 도메인 |
| Phase 2 (필수) | **2026-07-01 (수)** | 주문/배송/재고/유저 화면/배송비 |
| Phase 3 | **2026-07-17 (금)** | 정산 시스템 |
| Phase 2 (선택) | **2026-08-07 (금)** | Seller 편의 기능 — Phase 4 진입 시 재평가 |
| Phase 4 | **2026-08-07 (금)** | 환경 분리, 통합 QA, 실운영 전환 |
| Phase 5 (개발) | **2026-09-04 (금)** | 디자인 수정 반영 + 회귀 테스트 |
| 스토어 제출 | **2026-09-07 (월)** | 심사 2~3주 버퍼 |
| 🚀 **출시** | **2026-09-28 ~ 09-30** | 내부 타겟. 지연 시 연내 출시 범위에서 조정 |

> ⚠️ **디자인 시안 수령 협의 필요**: 로드맵은 9월 초중순 수령 가정이지만, 9월 말 출시 타겟이면 **8월 초**까지 당겨져야 함. 대표와 일정 조율 필요.

---

## 외부 의존성 트랙 (병렬 진행)

> 내부 개발과 별개로 시간이 드는 항목. 조기에 걸어두지 않으면 막힘.

| ID | 항목 | 상태 | Due | 비고 |
|----|------|------|-----|------|
| EXT-1 | 법인 설립 (+ 통신판매업 신고) | ✅ **Done** (2026-07 초) | — | 완료 → 실키·정산계좌·NICE 언블록 |
| EXT-2 | SMS 벤더 선택 | ⏸ Holding (출시 후) | — | 휴대폰 인증 이연에 따라 보류 |
| EXT-3 | TossPayments 테스트 키 | 🟢 **대체 검증 완료** | — | docs 테스트 키로 E2E 검증 완료. 본인 테스트 키는 법인 상점 가입 시 발급 |
| EXT-4 | 스마트택배 API 신청 | 🟡 Todo (미신청) | Phase 2 전 | 영업일 단위 발급 → 배송(P2-3) 전 걸어둬야 함 |
| EXT-5 | TossPayments 실키 전환 | 🟢 **신청 완료 (심사 대기)** | ~2~4주 | 법인으로 신청(기본 결제 패키지). 승인 시 라이브 키 |
| EXT-6 | NICE 본인확인 | ⏸ **Holding (필요성 낮음)** | — | 본인확인 불필요 방향(휴대폰 인증도 이연). 먼 미래 재검토, 안 할 수도 있음 |

> 📌 Toss 심사 대비 체크리스트: [tosspayments-review-checklist.md](tosspayments-review-checklist.md)

---

## 보드

### Phase 0 — 잔여 마무리 (2026-04-27 ~ 2026-05-01)

#### 🚨 P0-1. iOS 심사 — **3달+ 정체 (블로커, 진행 중)**
- **Due**: 2026-05-01 → **미해결**
- **우선순위**: 🔴 블로커
- **상황**: 결제 "서비스 준비 중" 처리 후 재제출했으나 **3개월 넘게 심사 정체**. 문의에도 "곧 처리" 답변만 받고 진척 없음
- **대응 트랙**:
  - [ ] App Store Connect 상태 확인 — 진짜 "심사 중"인지 / Resolution Center에 미확인 메시지(우리 회신 대기) 있는지
  - [ ] Apple Developer Support **전화 콜백 예약** + 기존 케이스 escalate (expedite 약속 미이행 명시)
  - [ ] 막판 카드: 제출 취소 후 **새 빌드 재제출**로 큐 리셋 (단, 위 회신 대기 여부 먼저 확인)
- **참고**: [ios-review-rejection-apr14.md](active/ios-review-rejection-apr14.md)
- **note**: 심사 정체는 **출시(release)만 막고 개발은 막지 않음** → 개발 병렬 진행

#### 🟢 P0-2. 1차 내부 테스트 잔여 처리 (대부분 완료, swipe rollout 잔여)
- **Due**: 2026-05-01 (일부 잔여 진행 중)
- **참고**: [internal-test-1st.md](active/internal-test-1st.md)
- **포함**: 스와이프 뒤로가기 UX 개선, 네이티브 스와이프 차단 URL blacklist 적용
- **제외**: 휴대폰 인증 연계 2건 (→ Phase 1에서 통합)
- **Sub-task**:
  - [x] Cache-Control 정책 조정 — [app/entry.server.tsx](../app/entry.server.tsx) (`/auth`, `/payments`, `/children` 민감 경로 `no-store` / 그 외 `private, max-age=60`)
  - [x] iOS 실기기 swipe back 진단 (가설: bfcache 미작동 → 결과: **bfcache가 아닌 React Router single fetch의 loader 재실행**이 원인)
  - [x] `clientLoader` 캐시 헬퍼 도입 + `/stores`, `/stores/:storeId` 2개 라우트 적용 → swipe back 시 loader 단계 없이 즉시 복귀 확인
  - [ ] **나머지 라우트로 펼치기** (저위험 일괄 + 고위험 invalidation 인프라) → [client-loader-cache-rollout](todo/client-loader-cache-rollout.md)
  - [ ] 네이티브 스와이프 차단 URL blacklist 최종 적용

#### 🟢 P0-3. 에러 핸들링 — Week 1 완료, Week 2-3 일부 잔여
- **Due**: 2026-05-01 (잔여 진행 중)
- **참고**: [kend-error-handling-roadmap.md](todo/kend-error-handling-roadmap.md)
- **✅ 구현됨**: 공통 에러 핸들러 `app/lib/error-handler.ts`(`parseSupabaseError` 10개 파일 적용) · Auth 만료 `useAuthListener.ts` · Toast(`<Toaster/>` 마운트) · 이미지 검증 `validate-image.ts`
- **잔여 Sub-task**:
  - [x] **오프라인 감지** — `useNetworkStatus` 훅 + `offline-banner` (실기기 비행기모드 확인, 2026-07-09)
  - [x] console.log 정리 (디버그 로그 8건 제거, 2026-07-09)
  - [ ] PostHog 에러 추적 (패키지 미설치) — QA(Phase 4) 전까지면 됨
  - [ ] Edge Function 응답 표준화 `_shared/response.ts`
  - [ ] WebView 에러 브리지 (N-2, kend-native 연동 필요)
  - [ ] 폼 validation 표준화 → [form-validation-standard.md](todo/form-validation-standard.md)로 분리

---

### Phase 1 — 핵심 기반 (2026-05-04 ~ 2026-05-29)

#### ❌ P1-1. 휴대폰 인증 SMS OTP 연동 — **출시 후로 이연 (2026-06-17 결정)**
- **결정 배경**: SMS OTP는 본인인증(NICE)이 아니라 번호 점유 확인일 뿐 → MVP 블로커 아님. 계정 복구는 이메일 재설정으로 대체
- **코드 보존**: 전체 구현(게이트/OTP Edge Function/추가정보/아이디·비번 찾기/번호 중복방지/트리거)을 `feature/phone-auth` 브랜치(commit d6ec2b0)에 보존. kend-newbuild 미반영
- **재개 시**: 브랜치 병합 → 마이그레이션(0016/0017) + Edge Function 배포 + SMS 벤더 확정 + RLS
- **참고**: [phone-auth-plan.md](todo/phone-auth-plan.md) (상단 보류 배너)

#### ✅ P1-2. 계정 복구 flow — **이메일 재설정으로 대체 완료 (2026-06-17)**
- **완료**: 이메일 기반 비밀번호 재설정(`/auth/find-password` → `/auth/reset-password`, token_hash 방식 포함), 계정 열거 방지, 로그인/재설정 UX 수정
- **제거**: 아이디 찾기 (본인 인증 수단 없이 이메일 반환 불가 → 기능 제외, 404 링크 정리)
- **이연**: 소셜 추가정보 입력 flow, 기존 회원 휴대폰 번호 보강 → 휴대폰 인증(P1-1)과 함께 출시 후로
- **잔여 todo**: 폼 validation 표준화 [form-validation-standard.md](todo/form-validation-standard.md)

> 📌 **P1-3~P1-5는 코드 확인 결과 대부분 구현됨 (2026-06-18 정정).** 4/24 보드의 "미착수"는 오류. 남은 핵심은 **결제 플래그 해제 + Toss 키(EXT-3) + 실테스트**, 그리고 환불/취소 실행 로직.

#### 🟡 P1-3. 주문 도메인 DB 설계 — **테이블 ✅ / RLS·인덱스·배치 ❌ (정정 2026-06-18)**
- **✅ 완료**: [orders/schema.ts](../app/features/orders/schema.ts)에 order_groups · payments · orders · order_items · deliveries · delivery_items + 상태 enum 전체. 마이그레이션 적용됨. 상태 머신(enum) 정의 포함
- **🔒 누락 — RLS 정책 → 출시 전 하드닝(P4-3)으로 이연 (6/18 결정)**: 로드맵 P1-3 "RLS 정책 설계" + [database.md](../core/database.md) §64/§105가 명시했으나 미구현. **범위는 주문 도메인이 아니라 DB 전체 ~33개 테이블**(profiles·children·carts·product_*·seller_* 등 kend/seller 공유). 실데이터 없어 긴급도 낮음 → 출시 전 적용. 정책 작성·테스트는 개발단계에서 선행(막판 금지)
- **🟡 누락 — 인덱스**: 설계 문서 §11이 명시한 인덱스(user_id/status/created_at/tracking 등)가 schema.ts에 미정의 → 마이그레이션에도 없음. 주문 조회 성능
- **🟡 누락 — 배치**: 설계 §9.2/§10의 `payment_in_progress` → `failed` 미응답 정리 배치(cron) 미구현 → 미완료 주문 적체 위험
- **연계**: RLS는 P0-3의 "RLS 전수 점검"과 묶어서 처리

#### ✅ P1-4. TossPayments 결제창 + 주문-결제 트랜잭션 — **E2E 검증 완료 (실키 전환만 남음)**
- **Due**: 2026-05-22 → 검증 2026-07-09
- **✅ 완료**: 주문 생성 · TossPayments Confirm API · 결제 success/fail · 결제 위젯. **docs 테스트 키로 주문→결제→confirm→`paid` 전 흐름 E2E 검증 완료** (payments 저장·장바구니 정리·주문내역 노출, 실패 시 `payment_in_progress` 비노출 확인). console.log 정리·타입 오류 수정 완료
- **❌ 남은 일**:
  - [ ] **실키 전환** — EXT-5 승인 후 `.env`를 라이브 키로 교체 + `PAYMENT_COMING_SOON` 해제 (출시 시)
  - [ ] 웹훅 처리 확인 (구현 여부 미검증)
  - [ ] 미완료결제(`payment_in_progress`) → `failed` 정리 cron (P1-3 배치 항목)

#### 🟡 P1-5. 결제 환불/취소 + 조회 UI + 차단 플래그 — **부분 구현 (← 다음 착수)**
- **Due**: 2026-05-29
- **선행**: P1-4
- **✅ 구현됨**: 주문 내역 조회 UI([orders-page.tsx](../app/features/orders/pages/orders-page.tsx) 상태탭 포함) · 차단 플래그(`PAYMENT_COMING_SOON`)
- **❌ 미구현**: 결제 취소/환불 실행 로직(Toss cancel API·mutation 없음) · 구매확정 · 이중결제 방지 확인
- **Sub-task**: (착수 시 추가)

---

### Phase 2 — 주문/배송/재고 ✅ 종료 (2026-06-01 ~ 2026-08-04)

> **2026-08-04 종료 처리**. 필수 항목 대부분 완료 확인, 잔여 2건(배송추적 상세·구매확정)은
> **Phase 2.5로 이관**. "선택" 편의기능(구 P2-7~10)은 주제별로 Phase 2.5/Phase 3로 재배치했다
> (아래 각 항목 "→ 이관" 참고). 상세 배경: [order-lifecycle-master-plan.md](todo/order-lifecycle-master-plan.md)

#### ✅ P2-1. Kend-Seller 판매자 기반 — 완료
- **포함**: 판매자 로그인/인증, 업체 등록+승인 flow, 프로필/사업자 정보 관리

#### ✅ P2-2. Kend-Seller 주문 관리 화면 — 완료
- **포함**: 주문 목록/상세, 상태 변경 액션

#### ✅ P2-3. 배송 처리 — 완료
- **포함**: 스마트택배 연동, 배송사+송장번호 UI, 배송 추적 폴링(pg_cron)

#### ✅ P2-4. 재고 차감 연동 — 완료 (2026-07-27)
- **완료**: 자동 차감(`decrement_stock`), 취소 시 복구(`handle_order_cancelled` 트리거), 결제이탈 정리(`expire_pending_orders`), 품절/재고부족 배지(kend-seller)
- **→ 관리보완으로 이관**: 판매자 수동 재고 조정 화면("Stocks Keeping", 죽은 링크였음 확인) — **Phase 3(관리보완)**

#### 🟡 P2-5. Kend 유저 앱 주문 관련 화면 — 부분완료
- **완료**: 주문 내역 목록, 주문 취소(+환불)
- **→ Phase 2.5로 이관**: 주문상세(배송추적), 구매확정 버튼

#### ✅ P2-6. 배송비 설정 — 완료
- **포함**: 무료/유료/조건부 무료 설정 (kend-seller 상품등록 화면)

#### 구 "Phase 2 선택" 항목 재배치 (P2-7~10, 드롭 게이트 대신 주제별로 흡수)
- **P2-7 (상품관리보완)**: 옵션관리·이미지다중업로드는 이미 구현 확인됨. 카테고리/태그 필터(kend 검색화면), 일괄관리 → **Phase 3(관리보완)**
- **P2-8 (대시보드+알림센터)**: 알림센터는 SLA 알림에 실제로 필요해 → **Phase 2.5**. 대시보드(통계)는 → **Phase 3(관리보완)**
- **P2-9 (반품/환불 처리 UI)**: 선택→**필수 승격**, → **Phase 2.5** (전자상거래법 대응 필수 기능으로 재평가)
- **P2-10 (CS관리+리뷰관리)**: CS관리는 "문의하기" 시스템의 운영 레이어로 → **Phase 2.5(코어) + Phase 3(운영기능)**. 리뷰관리 → **Phase 3(관리보완)**

---

### Phase 2.5 — 주문 라이프사이클 완결 (신설, 2026-08-04 계획)

> **왜 필요한가**: P2-4 작업 중 "판매자 취소가 결제취소로 안 이어짐" 등 버그 3건을 발견하면서,
> 취소 이후의 흐름(반품/교환/AS/구매확정)이 통째로 미정의 상태였음이 드러났다. 업계표준
> 대비 갭 분석 결과 이 영역을 필수로 승격. 상세 정책/근거: [order-cancel-refund-exchange-flow.md](todo/order-cancel-refund-exchange-flow.md),
> 작업순서: [order-lifecycle-master-plan.md](todo/order-lifecycle-master-plan.md)

#### 🟡 P2.5-1. 판매자확인/발송 SLA + 자동취소
- **포함**: 주문확인 미이행 3일 → 자동취소(스케줄러, `expire_pending_orders` 패턴 재사용), 발송 SLA(일수 미정) 초과 시 자동취소, 알림(구 P2-8 알림센터 흡수 — 없으면 이메일/SMS 대체)
- **담당**: kend(cron) / kend-seller(알림 연동)

#### 🟡 P2.5-2. 구매확정 로직 (구 P3-1 흡수)
- **포함**: 수동 확정 버튼, 배송완료 후 N일 자동 확정(cron), 확정 후 반품/교환 채널 잠금(→ AS/문의로 유도)
- **담당**: kend

#### 🟡 P2.5-3. 반품/교환/AS 처리 시스템 (구 P2-9 흡수, 필수 승격)
- **포함**: 반품/교환은 **주문 상태 액션**(기존 `delivery_items.status`의 `return_requested`→`returned`, `exchange_requested`→`exchanged` 재사용, 신규 테이블 불필요) — 주문목록에서 신청, 단계별 처리는 상세화면. 사유 enum 확장(단순변심/하자/오배송/파손/분실), 반품기간 필드(법정최소 7일/30일 + 판매자 확장 가능), Toss 부분환불 연동(→ 판매자 취소 시 환불 자동화 안 되던 기존 버그도 함께 해결)
- **선행**: P2.5-2 (구매확정 시점이 반품채널 마감 기준)
- **담당**: kend(스키마+Toss연동), kend-seller(승인/검수 화면)

#### 🟡 P2.5-4. 문의하기 (Q&A) 코어 시스템 (신규)
- **포함**: 카테고리별 문의(배송/상품/기타 등), `order_id` 선택적 연결. 구매확정 후 AS 문의도 여기로. 반품/교환처럼 상태전이 액션이 아니라 순수 메시지형 — **CS관리 운영기능(Phase 3)의 기반**
- **담당**: kend(접수 UI) + kend-seller(처리 화면, seller/admin 권한 둘 다)

#### 🟡 P2.5-5. 플랫폼 조건부 무료배송 (신규)
- **포함**: 판매자별 조건과 별개로 장바구니 총액 기준 플랫폼 임계값(admin 설정, 초기 0=off), `shipping_fee_bearer`(SELLER/PLATFORM) 필드 — Phase 3.5 정산 계산의 입력값
- **담당**: kend-seller(admin 전용 화면, 이미 있는 `administrator` role 메뉴에 추가)

#### 🟡 P2.5-6. 배송 예외 처리 (신규)
- **포함**: 오배송/파손/분실(반품 사유코드로 흡수, 책임소재 안 따지고 구매자 우선 처리 원칙) / 장기미수령·수취거절 반송(RTS) — 스마트택배 sync-tracking에 기간기반 플래깅 추가(`in_transit` N일 정체 시 수동확인 알림), `deliveries.status`에 반송 상태 추가
- **담당**: kend-seller (`sync-tracking` Edge Function 수정, 아직 미출시라 안전하게 변경 가능)

---

### Phase 3 — 판매자 관리보완 (신설, 정산과 무관한 잔여 편의기능)

> 구 P2-7/8/10 중 주문 라이프사이클과 무관한 항목 + kend-seller에서 새로 발견된 항목.
> 정산(Phase 3.5)과 무관, 우선순위 낮음 — 드롭 가능.

- **상품 카테고리/태그 필터 (kend 검색화면)**, 상품 일괄관리 (구 P2-7 잔여)
- **판매자 수동 재고 조정 화면** ("Stocks Keeping" — kend-seller에 죽은 메뉴로만 있던 것 확인, SKU별 재고 조회+수정)
- **상품 수정 기능** — 등록 후 수정 기능 자체가 없음을 확인 (재고뿐 아니라 이름/가격 등 전체)
- **Seller 대시보드(판매 통계)** (구 P2-8 잔여)
- **CS관리 운영기능** (필터링/담당자배정/통계 — P2.5-4 문의 코어 위에 얹는 레이어)
- **리뷰 관리** (구 P2-10 잔여)

---

### Phase 3.5 — 정산 시스템 (구 Phase 3, P3-1 구매확정은 P2.5-2로 이관)

#### 🟡 P3.5-1. 정산 계좌 등록 (구 P3-2)
- **선행**: EXT-1 (법인 완료) ✅ → 착수 가능
- **포함**: 정산 계좌 등록 UI, 1원 인증

#### 🟡 P3.5-2. 정산 계산 배치 (구 P3-3)
- **선행**: P2.5-2(구매확정), P2.5-3(반품/환불 반영), P2.5-5(`shipping_fee_bearer`) — 이 셋의 데이터가 정산 계산의 입력값
- **포함**: settlement_items 테이블, 정산 항목 생성 cron, 수수료 차감, 주기 설정

#### 🟡 P3.5-3. 정산 내역 조회 (구 P3-4)
- **포함**: 내역 목록(기간 필터), 주문별 명세, 엑셀 다운로드

---

### Phase 4 — 환경 분리 + 통합 QA (2026-07-20 ~ 2026-08-07)

#### 🟡 P4-0. 선택 항목 포함/드롭 결정 게이트
- **Due**: 재산정 필요
- **액션**: Phase 3(관리보완) 진행 상태 판단, 미완은 출시 후 이연 결정 (2026-08-04 Phase 2.5 신설로 구 P2-7~10은 Phase 2.5/Phase 3로 재배치됨 — 위 Phase 3 섹션 참고)

#### 🟡 P4-1. Supabase dev/prod 환경 분리
- **Due**: 2026-07-24
- **참고**: [environment-separation-plan.md](active/environment-separation-plan.md)
- **Sub-task**: (착수 시 추가)

#### 🟡 P4-2. 통합 QA
- **Due**: 2026-08-05
- **포함**: B2C 전체 루프, 엣지 케이스, iOS/Android 디바이스 QA, Seller 플로우
- **Sub-task**: (착수 시 추가)

#### 🟡 P4-3. 실운영 전환 체크리스트
- **Due**: 2026-08-07
- **선행**: EXT-5(실키) 완료  *(EXT-6 NICE는 Holding — 본인확인 불필요 방향)*
- **포함**: 실키 전환, ~~NICE 실서비스~~(Holding), Supabase prod 확인, 도메인/SSL, PostHog 프로덕션, 1호 판매자 온보딩, 차단 플래그 테스트, 무결성 쿼리, 약관 최신화
  - **🔒 전체 테이블 RLS 적용·검증** (~33개, kend/seller 공유 DB라 seller 조율 필요). 전수점검 쿼리는 [error-handling-roadmap](todo/kend-error-handling-roadmap.md) 1-5. **정책 작성은 이 단계 전 개발기간에 선행**(켜면 createOrder 등 깨지므로 테스트 버퍼 필수)
- **참고**: [tosspayments-review-checklist.md](tosspayments-review-checklist.md)
- **Sub-task**: (착수 시 추가)

---

### Phase 5 — 디자인 대응 + 출시 (2026-08-10 ~ 2026-09-30)

#### ⏸ P5-1. 디자인 시안 검토 및 수정 반영
- **Due**: 2026-08-28
- **상태**: Holding (디자인 시안 수령 대기)
- **⚠️ 전제**: 시안 수령이 **8월 초**까지여야 9월 말 출시 가능. 대표와 일정 조율 필수.
- **Sub-task**: (시안 수령 후 추가)

#### 🟡 P5-2. 회귀 테스트
- **Due**: 2026-09-04
- **선행**: P5-1

#### 🟡 P5-3. 스토어 제출 및 심사 대응
- **Due**: 2026-09-07 (제출), ~09-21 (승인 예상)
- **선행**: P5-2

#### 🟡 P5-4. 🚀 출시
- **Due**: 2026-09-28 ~ 2026-09-30
- **선행**: 심사 승인
- **지연 시**: 10월로 이연, 연내 출시 범위에서 조정

---

## 주간 체크포인트 로그

> 매주 금요일 진행 점검 결과 기록.

### 2026-04-24 (금) — 계획 수립
- 로드맵 확정, 마일스톤 보드 생성
- Toss 심사 대비 체크리스트 별도 작성
- 다음 주(4/27)부터 Phase 0 본격 착수
- **P0-2 착수**: `app/entry.server.tsx` Cache-Control 정책 조정 완료 → 프리뷰 배포 + iOS 실기기 검증 남음

### 2026-06-18 (목) — 보드 현실화 + 코드 실측 정정
- **계정/인증 트랙 정리 반영**: 휴대폰 인증(P1-1) 출시 후 이연 결정(6/17), 이메일 비밀번호 재설정으로 P1-2 대체 완료, 아이디 찾기 제거. EXT-2(SMS 벤더)도 함께 보류
- **🔧 코드 실측으로 보드 대폭 정정**:
  - **P1-3 주문 DB 설계 → 🟡 테이블만 완료**: 스키마/마이그레이션은 있으나 **RLS 정책(🔴 보안 블로커)·인덱스·결제 미응답 배치 누락** 발견. RLS는 대시보드 적용 여부 우선 확인 필요
  - **P1-4 결제 → 🟢 거의 완료** (주문생성+Toss Confirm API+success/fail+위젯). 남은 건 플래그 해제·**EXT-3 Toss 키**·E2E 테스트
  - **P1-5 → 🟡 부분** (조회 UI 있음, 환불/취소 실행·구매확정 미구현)
  - **P0-3 → 🟢 Week 1 완료** (error-handler·useAuthListener·Toast·이미지검증). 잔여: 오프라인 감지·PostHog·WebView 브리지·console.log 정리
  - Phase 2 배송/재고 **DB 레이어 이미 존재** (deliveries/delivery_items 등)
- **🚨 P0-1 iOS 심사 2달+ 정체 확인** (사용자 제보): 1달 전 문의에도 "곧 처리"만. 확인→escalate→재제출 트랙으로 대응, 개발은 병렬 진행
- **오늘 작업 결정**: 외부 의존성 없는 **P0-3 오프라인 감지**부터 착수 (결제는 Toss 키 대기라 오늘 단독 완결 불가)
- **EXT-3 Toss 테스트 키**: 결제 완성의 실질 블로커로 부상 → 발급 우선순위 ↑

### 2026-07-09 (목) — 법인 완료 + 결제 E2E 검증
- **🎉 법인 설립·법인 계좌 완료** → EXT-1 완료. 결제 실키·정산 계좌·NICE 언블록
- **✅ 결제 루프 E2E 검증 완료**: docs 테스트 키로 주문→결제→confirm→`paid` 전 흐름 동작 확인. `payment-success` 타입 오류 수정, 로컬 소셜로그인 리다이렉트 수정(Supabase `/*`→`/**`). 코드는 `PAYMENT_COMING_SOON=true`로 재차단(실키+출시 때 켬)
- **✅ P0-3 진행**: 오프라인 감지(실기기 확인) + console.log 정리 완료
- **외부 신청**: TossPayments 실키(EXT-5) 신청 완료(심사 대기). **NICE(EXT-6)는 Holding** — 본인확인 불필요 방향으로 결정(휴대폰 인증도 이연), 먼 미래 재검토
- **문서 체계 정비**: overview 대시보드 운영 + `/changelog` 명령어 + CLAUDE.md(3개 프로젝트 자동 로드) + changelog sync 스크립트
- **다음**: P1-5 환불/취소·구매확정 (테스트 키로 환불까지 검증 가능)
- **⚠️ 스케줄**: Phase 1 마무리 단계인데 계획상 이미 Phase 3 시기 → 일정 재산정 필요

---

*최종 업데이트: 2026-07-09*
