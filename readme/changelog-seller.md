# Changelog — KEND-SELLER

KEND-SELLER 판매자 관리자 웹의 주요 변경사항을 날짜별로 기록한다.

> - 이 파일은 모든 프로젝트에서 수동으로 동기화한다.
> - 최신 내용이 위로 오도록 역순(최신순)으로 작성한다.
> - 항목 제목 맨 앞에 `[KEND-SELLER]` prefix를 사용한다.

---

## 2026-09-07

### [KEND-SELLER] Phase 3.5 정산 시스템 — 최종 완료 확인

- 정산 상세 화면(지급 계좌 노출 + 계좌 미등록 시 경고배너/지급버튼 비활성화)까지 실사용 테스트 통과 — SL0001의 8월 정산 건을 `pending`으로 되돌려 미등록 상태(경고배너+버튼 비활성화) 확인 후, 임의 계좌값(신한은행)을 채워 정상 표시까지 양쪽 케이스 모두 검증
- 이로써 **Phase 3.5(정산 시스템) 전체 완료** — P3.5-1(계좌등록)·P3.5-2(계산배치)·P3.5-3(조회화면, 계좌노출 포함) 전부 구현+테스트 통과. 남은 건 스코프 밖으로 뺀 엑셀 다운로드(백로그)와 Toss 지급대행(EXT-7 대기)뿐
- **다음: Phase 3(판매자 관리보완) 착수**

### [KEND-SELLER] 리뷰 관리 화면 실사용 테스트 통과 (Phase 3)

- 답변 등록/수정/삭제, 미답변·별점·기간 필터, 상단 통계 카드(평균 별점/분포/미답변수/저평점수) 전부 클릭 테스트 통과
- 기간검색 기본값을 "오늘~한달전"으로 설정(쿼리스트링 있으면 그 값 우선)
- Phase 3 항목 중 첫 번째로 완료 — 나머지(상품 일괄관리/재고조정 화면/상품수정/Seller대시보드/CS관리 운영기능)는 아직 미착수

## 2026-09-03

### [KEND-SELLER] 정산 계좌 등록 실사용 테스트 통과 (Phase 3.5-1)

- 신규 판매자 가입 플로우로 계좌 등록 폼(은행/계좌번호/예금주명) 입력·저장 확인 완료 — Phase 3.5-1 완료 확정
- 이로써 Phase 3.5(정산 시스템) P3.5-1/2/3 전부 구현+테스트 완료. 남은 건 엑셀 다운로드(백로그)와 Toss 지급대행 실연동(EXT-7 대기)뿐

## 2026-09-02

### [KEND-SELLER] 정산 계좌 — 승인 후 수정 기능 제거 + 정산 상세 화면에 계좌 노출

- 계좌 등록 직후 "승인된 판매자도 계좌를 수정할 수 있어야 테스트하기 편하다"는 이유로 관리화면에 계좌 수정 폼을 잠깐 추가했다가, 곧바로 되돌림 — 계좌 변경에 대한 감사 기록/관리자 가시성이 전혀 없는 상태로 자유 수정을 열어두면 판매자 계정 탈취 시 조용히 정산금 수취 계좌가 바뀔 수 있는 위험이 있다고 판단. **최종적으로 계좌는 최초 등록/재제출 시에만 입력 가능**하고 승인 후에는 다시 읽기전용
- **정산 상세 화면에 지급 계좌 정보 노출**: 기존엔 관리자가 실제 송금할 계좌를 정산 화면에서 확인할 방법이 없어 판매자 정보 화면을 따로 찾아봐야 했음. 계좌 미등록 시 빨간 경고 배너 표시 + "지급 완료 처리" 버튼 비활성화(계좌 없이 지급완료로 잘못 표시하는 사고 방지)
- (참고) Toss 지급대행이 붙어도 우리 DB 변경을 자동으로 안 가져간다 — API로 명시적으로 알려줘야 하고 계좌 변경 시 재인증(KYC)을 요구하는 게 업계 관행. EXT-7 착수 시 이 부분 설계 필요

### [KEND-SELLER] 정산 조회 화면 실사용 테스트 통과 (Phase 3.5-2/3)

- 9/1 새벽 실제 pg_cron 배치가 정상 실행되어 8월 구매확정분(19,000원×2건)을 정확히 집계한 실데이터(`settlement_items` 1건, 매출 38,000원/수수료 3,800원/정산액 34,200원)로 화면 테스트 진행
- 목록(`/system/settlements`) 조회, 상세 화면 주문별 명세, "지급 완료 처리" 버튼까지 클릭 테스트 통과 — 계산 배치(SQL)에 이어 화면까지 검증 완료로 Phase 3.5-2/3 완료 확정

### [KEND-SELLER] 정산 계좌 등록 (Phase 3.5-1, 구현됨·테스트 대기)

- **1원 인증(계좌 실명확인) 벤더 선택을 의도적으로 스킵**: 원래 로드맵에 "1원 인증"만 적혀있고 구체 벤더가 미정이었음. NICE 본인확인(EXT-6, 휴대폰 인증과 묶여 보류)과는 무관한 별개 사안임을 확인(용도가 다름 — 신원확인 vs 계좌 실명확인). 어차피 나중에 Toss 지급대행(EXT-7) 붙으면 그 셀러 KYC 온보딩에서 계좌 검증을 함께 처리하게 되므로, 지금 별도 벤더로 구현하면 이중 작업이 된다고 판단해 검증 없이 입력값만 저장하기로 결정
- `admin_sellers`에 `bank_name`/`account_number`/`account_holder_name` 컬럼 추가(nullable — 기존 판매자는 데이터 없음). 은행명은 자유입력 대신 드롭다운(`BANK_LIST`)으로 오탈자 방지(실제 송금에 쓰이는 값이라)
- 판매자 최초 등록(Step 1)·반려 후 재제출 폼에 필수 입력 추가, 승인 후 관리화면·승인대기 화면에도 읽기전용 노출
- **버그 발견 — `seller_information_view` 컬럼 추가 함정**: `CREATE OR REPLACE VIEW`가 `seller.*` 뒤에 `domain_name`을 고정 배치해둔 상태라 컬럼 추가 시 "cannot change name of view column" 에러 발생 — `DROP VIEW` 후 `CREATE VIEW`로 재생성해야 함을 확인, 소스 파일에 주석으로 남겨둠(다음에 admin_sellers 컬럼 추가할 때 또 겪을 함정)
- typecheck 통과. **실사용 등록 클릭 테스트는 아직 안 함**(신규 판매자 가입 플로우라 테스트 계정 필요) — 다음 확인 필요

## 2026-08-31

### [KEND-SELLER] 정산 시스템 — 계산 배치 + 조회 화면 (Phase 3.5, 구현됨·UI 테스트 대기)

- kend가 전달한 설계 스펙(2026-08-31) 그대로 구현. Toss 지급대행(EXT-7)이 아직 신청도 못 한 단계라 이번 라운드는 계산+조회까지만, 지급은 수동 송금 유지
- **`settlement_items` 테이블 신설**: `(seller_id, period_start)` unique로 재실행 안전. 주문별 명세는 별도 테이블 없이 `delivery_items`를 같은 기간·판매자 조건으로 재조회해서 구성(정규화)
- **`platform_settings.commission_rate` 컬럼 추가**: 임시 10%, `free_shipping_threshold`와 동일한 admin 설정 패턴. 계산 시점 값을 `settlement_items.commission_rate`에 스냅샷으로 남겨 이후 요율 변경이 과거 정산에 영향 안 주도록 함
- **`calculate_monthly_settlements()` SQL 함수 + pg_cron**(매월 1일 새벽 1시): `delivery_items.status='normal' AND purchase_confirmed_at`가 지난달 범위인 건을 `order_items → orders`로 크로스 스키마 조회해 판매자별 집계. `shipping_fee_bearer='PLATFORM'` 건은 `base_shipping_fee`만큼 배송비 보전 가산. **실제 DB에 배포 완료 + 검증 완료** — 8월 실데이터(2건, 19,000원×2)로 집계 로직 드라이런해 정확함 확인, 함수 자체도 직접 호출해 정상 동작(7월분 없어 0건 처리) 확인함
- **조회 화면** (`/system/settlements`, admin 전용): 기간·상태 필터 목록, 상세에 주문별 명세 + pending→paid 지급완료 처리 액션. 전환 로직을 `markSettlementPaid` 함수로 분리해둬서 나중에 Toss 지급대행 붙으면 이 함수만 API 콜백에서 호출하도록 교체 가능하게 설계(호출부는 안 바뀜)
- **이번 라운드 스코프 밖**: Toss 지급대행 API 연동, 세금/원천징수, 최소 정산액 임계치, 엑셀 다운로드(새 의존성 필요해 백로그 이관), "계좌 미등록 판매자" 표시(`admin_sellers`에 계좌 관련 컬럼 자체가 없어 이번엔 미구현 — 계산 대상 제외는 안 함)
- typecheck 통과 확인. **화면(목록/상세/지급완료 액션) 실사용 클릭 테스트는 아직 안 함** — 다음 세션 우선 확인 필요

## 2026-08-25

### [KEND-SELLER] 문의하기 처리 화면 (Phase 2.5-4)

- kend가 만든 `inquiries` 테이블(카테고리별 단일질문+단일답변 Q&A) + 구매자 접수 UI 위에, 답변 처리 화면 2종 구현
- **판매자용** (`/orders/inquiries`, `/orders/inquiries/:id`): `order_item_id → order_items.order_id → orders.seller_id` 체인으로 본인 상품에 달린 문의만 필터링(inner join이라 `order_item_id`가 null인 일반 문의는 자연히 목록에서 제외됨). 카테고리·상태(답변대기/답변완료) 필터, 답변 등록 시 `status='answered'`+`answer`+`answered_at` 갱신
- **admin용** (`/system/inquiries`, `admin-layout` 가드): `order_item_id`가 null인 일반 문의 전용 — 판매자 화면과 상호 배타적으로 나뉨. milestones에 명시된 "seller/admin 권한 둘 다" 요구사항 충족
- **버그 발견 — 공용 `Card` 컴포넌트 테두리 미표시**: `border-1`/`border-1-muted`가 실재하지 않는 Tailwind 클래스라 Card가 테두리 없이 렌더링되고 있었음. 텍스트만 있는 카드(문의 상세 상단 정보 카드 등)에서 경계가 아예 안 보이는 것으로 발견 → `border`/`border-muted`로 수정, 앱 전체 Card 사용처에 영향
- **UX 수정 사항 3건** (테스트 중 발견): 답변 등록 후 확인 안내 없이 페이지에 머무르던 것 → 성공 시 확인 알림 후 목록 이동(fetcher submitting→idle 전환 감지로 구현, 초기엔 `fetcher.data` 참조 변경만 감지해 안 뜨는 버그 있었음). 목록 테이블에 `Card` 래핑 — 기존 반품목록(`return-list-page`) 패턴을 그대로 따라갔다가, 실제로는 주문목록 등 다수 화면이 bare `<Table>`을 쓰는 게 우세 패턴임을 확인해 제거. 상세페이지 정보행 줄간격이 붙어있던 것 `py-2.5` 추가로 개선
- 실사용 테스트 완료(사용자 확인) — 판매자 답변 등록 → kend 구매자 화면에서 답변 노출까지 확인
- **kend-seller 쪽 Phase 2.5 담당 항목 전부 완료** — kend도 문의하기 접수 UI + 구매확정 개별화 완료로, Phase 2.5는 사실상 양쪽 다 종료

## 2026-08-24

### [KEND-SELLER] RTS·장기미수령 기간기반 플래깅 (Phase 2.5-6)

- **SweetTracker API 조사 결과 반송(RTS) 전용 상태 코드 없음 확인**: 공식 API 문서(v1.6)를 직접 확인한 결과 `level`은 1~6 순방향 진행단계(배송준비→집화→배송중→지점도착→배송출발→완료)만 표현하고, 반송/수취인부재/미배달 같은 예외 상태는 정의돼 있지 않음 — `trackingDetails[].kind` 자유 텍스트에 담길 수는 있으나 정확한 문자열이 공식 문서에 없어 텍스트 매칭은 오탐 위험(8/21 송장번호 검증 때의 SweetTracker 에러코드 104/106 케이스와 동일한 이유로 기각)
- **순수 기간기반 플래깅으로 결정**: `deliveries.status`를 자동으로 `returning`으로 전환하지 않고, `in_transit` 상태가 `shipped_at` 기준 7일을 넘기면 판매자에게 수동확인만 유도. 오탐 시 되돌리기 어려운 상태 전환 리스크를 피함
- **주문 상세 화면**: 기존 송장번호 사후알림 배너(24시간 미조회)와 동일한 패턴으로 "장기미수령·수취거절 반송 가능성" 경고 배너 추가
- **주문 목록 화면**: 상세를 열어보지 않아도 발견 가능하도록 상태 옆에 "정체" 배지 추가 — `getSellerOrders` 쿼리에 `deliveries(status, shipped_at)` 조인 추가 필요했음 (기존엔 목록에서 delivery 정보를 아예 안 봤음)
- **`sync-tracking` Edge Function**: 정체 건을 결과 로그에 `in_transit:stalled_7d+`로 표시(운영 가시성용, DB 상태는 안 건드림), `--use-api` 플래그로 Docker 없이 배포 완료
- 임계값(7일)·처리방식(상태유지+알림만)은 사용자 확인 거쳐 결정
- 실사용 테스트: 더미 주문의 `deliveries.status`/`shipped_at`을 DB에서 직접 조작해 상세 배너·목록 배지 노출 확인 완료(사용자 확인), 테스트 데이터는 원복함. sync-tracking 로그 마킹 자체는 실사용 조회로 검증하지 않음(로그 표시용 부가 기능이라 낮은 우선순위로 판단)
- 이 작업으로 kend-seller 쪽 Phase 2.5 담당 항목 완료 (kend 쪽은 구매확정 상품단위 개별화 완료, 문의하기(P2.5-4)는 kend 접수 UI 착수 전이라 대기)

### [KEND-SELLER] database.types.ts 갱신 — delivery_items.purchase_confirmed_at 반영

- kend가 구매확정 컬럼을 `orders.purchase_confirmed_at`(주문 단위)에서 `delivery_items.purchase_confirmed_at`(상품 단위)로 이전한 스키마 변경을 `db:typegen`으로 반영. kend-seller 앱 코드는 이 컬럼을 참조하는 곳이 없어 영향 없음(grep 확인)

---

## 2026-08-21

### [KEND-SELLER] 반품 처리 화면 UX 개선 + 송장번호 검증 (P2.5-3 후속)

- 사용자 리뷰로 발견된 반품 관리 화면(`/orders/returns`) 이슈 점검 — "1차승인" 명칭과 상세화면 부재는 보류/불필요로 결론, 아래 2건만 수정
- **액션 버튼 UI 분리**: 승인/회수확인/최종승인 등 주 액션 버튼과 "거절" 버튼이 나란히 있어 혼동 위험 — 거절 버튼을 `ghost` variant(톤 낮춘 텍스트 버튼)로 바꾸고 구분선으로 분리해 주 액션과 경쟁하지 않게 함
- **완료 내역 조회 탭 신설**: 최종승인(`status='returned'`) 건은 기존 목록(`status='return_requested'`만 조회)에서 조회 즉시 사라져 판매자가 다시 볼 방법이 없던 문제 — "승인 대기"/"완료 내역" 탭 추가, 완료 탭에서는 `refunded_at`(kend 전용 컬럼, 읽기만 함)을 기준으로 환불 완료/처리중 상태 노출
- **송장번호 검증**: 배송 처리 시 형식체크(숫자 8~20자리) 없이 바로 저장되던 문제 발견 — 클라이언트/서버 양쪽에 형식체크 추가. 실시간 스마트택배 API 검증은 기각(SweetTracker 에러코드 104/106이 "미스캔"과 "오입력"을 구분 안 해 정상 케이스까지 오탐 위험) 대신, 발송 24시간 후에도 `tracking_synced_at`이 안 채워지면 경고 배너를 띄우는 사후 알림 방식 채택 — 스키마 변경 없이 기존 `sync-tracking` 크론 데이터만으로 구현
- typecheck 통과, dev 서버에서 라우팅 SSR 정상 확인(크래시 없음)까지만 확인 — 실제 로그인 클릭 테스트는 사용자가 별도 확인함

### [KEND-SELLER] P2.5-3 반품 4단계 플로우 — kend E2E 테스트 통과로 완료 처리

- kend가 2026-08-21 반품신청→1차승인→회수확인→최종승인→환불크론까지 정상 플로우 14단계 + 예외 케이스 8종(기한초과, 거절→재진행, 회수확인 없이 최종승인 시도 차단 등) 전부 E2E 통과 확인(`changelog-kend.md` 2026-08-21 항목)
- 테스트 중 발견된 버그 6건은 전부 kend 단독 수정 사항(화면/쿼리, 스키마 변경 없음) — kend-seller 쪽 추가 액션 없었음
- 이로써 2026-08-14 "구현 완료, 실사용 테스트 대기"였던 항목이 테스트까지 통과해 완료 처리됨

---

## 2026-08-14

### [KEND-SELLER] 반품 신청 처리 화면 (P2.5-3) — 구현 완료, 실사용 테스트 대기

- kend가 반품 신청/환불 로직(구매자 반품 신청, 사유별 신청기한 검증, Toss 부분환불+재고복원 크론)을 완료해 인계, kend-seller는 그 위에서 판매자가 신청을 처리하는 화면만 구현
- **설계 재협의**: 처음엔 "승인/거절 2액션" 단순 모델로 시작했으나, 검토 중 "거절 후 재승인하면 이전 거절 사유가 사라진다"는 문제를 발견해 홀딩 후 kend와 재협의. 그 결과 kend가 `entity_status_history` 트리거 기반 이력 테이블과 `delivery_items.return_approved_at`/`return_received_at`/`reject_reason` 3개 컬럼을 추가해, 상태를 잃지 않고 승인/거절을 오갈 수 있는 4단계 플로우로 확정
- **4단계 승인 플로우** (`delivery_items.status`는 `return_requested` 그대로 유지, enum 변경 없음):
  1. 1차 승인 — `return_approved_at` 기록
  2. 거절 — `reject_reason`만 채움(status 안 건드림, 단계 무관하게 재사용 가능한 단일 액션)
  3. 회수 확인 — `return_received_at` 기록
  4. 최종 승인 — 이 순간에만 `status`를 `'returned'`로 변경, kend의 환불 크론(`status='returned' AND refunded_at IS NULL` 감지)이 여기서 트리거됨
  - 재승인(액션 1·4 재실행)은 그 시점에 `reject_reason`을 함께 NULL로 비워 "거절 취소하고 재진행"을 겸함
  - 회수확인→최종승인 순서는 DB 레벨 제약이 없어(CHECK 없음) 앱 코드(`finalizeReturnApproval`)에서 `return_received_at` 존재 여부를 직접 가드
- **구현**: `getSellerReturnRequests`(목록 조회, `order_items!inner(orders!inner(...))` dot-path 필터로 판매자 소유 반품 신청만 필터), `approveReturnStage1`/`rejectReturn`/`confirmReturnReceived`/`finalizeReturnApproval`(액션별 mutation, 공통 소유권 가드 재사용), `/orders/returns` 화면(컬럼 조합으로 진행 단계 배지 계산, 거절은 기존 판매자승인 반려화면의 `RejectDialog`(Dialog+Textarea) 패턴 재사용)
- kend 소유 영역(Toss 호출, 환불 계산, 재고복원, `refunded_at`)은 손대지 않음. 반품기간 재검증도 kend가 신청 시점에 이미 처리해 불필요
- `database.types.ts`를 최신 스키마로 재생성해 함께 반영(로컬이 8/7 시점에 정체돼 있던 걸 이번에 발견)
- **실사용 테스트는 아직 진행 안 함** — typecheck 통과, dev 서버에서 라우팅 정상 동작(인증 리다이렉트 확인)까지만 확인. 실제 판매자 계정으로 4단계 전체 플로우(1차승인→회수확인→최종승인, 거절→재진행 포함) 클릭 테스트가 **다음 작업 최우선 순위**

---

## 2026-08-07

### [KEND-SELLER] 플랫폼 조건부 무료배송 admin 설정 화면 (Phase 2.5-5)

- **`platform_settings` 테이블 추가** (싱글턴): `free_shipping_threshold`(기본값 0=off) — 장바구니 총액이 이 값 이상이면 판매자 배송비 정책과 무관하게 플랫폼이 배송비 부담
- **admin 설정 화면** (`/system/settings`, `administrator` 전용): 임계값 조회/수정 폼, 네비게이션 "System" 메뉴에 "Platform Settings" 추가
- kend이 이어서 `createOrder`에 실제 판정 로직 연동 완료: 상품금액 합계가 임계값 이상이면 판매자 자체조건 충족 여부와 무관하게 배송비 면제하되, **판매자 자체조건은 미달인데 플랫폼이 대신 면제한 경우만** `order_items.shipping_fee_bearer = 'PLATFORM'`으로 기록(Phase 3.5 정산 계산 입력값). 판매자 자체조건으로 원래 무료였던 건은 `SELLER` 유지. kend 측 DB 시뮬레이션 3케이스로 검증 완료
- 실사용 흐름 종단 테스트(admin이 실제 값 설정 → 실주문 생성 → PLATFORM 기록 확인)는 아직 진행 안 함 — 현재 `platform_settings`에 row가 없어 사실상 off 상태

---

## 2026-08-06

### [KEND-SELLER] Phase 2.5 착수 준비 — confirmed_at 기록 + return_window_days 스킵

- **`orders.confirmed_at` 기록** (`updateOrderStatus`): 접수확인(`confirmed`) 전이 시에만 기록, 이후 상태전이에서는 건드리지 않음. kend의 발송 SLA cron(확인 후 3일 내 미발송 시 자동취소)이 이 값을 기산점으로 사용
- **kend Phase 2.5 스키마 확장 반영** (`db:typegen`): `delivery_items.reason`(반품/교환 사유), `order_items.shipping_fee_bearer`(배송비 부담주체), `deliveries.status`에 `returning`(반송중) 추가 — 전부 kend 소유 스키마, seller는 타입만 반영
- **`product_returns.return_window_days` 필드 추가 요청 철회**: 상품별/판매자별 반품기간 차등 니즈가 아직 없어 kend이 법정기간(단순변심 7일/하자·오배송 30일)을 상수로 하드코딩하는 것으로 정리. 착수 전 확인 과정에서 불필요한 스키마 변경을 미리 걸러냄
- 다음: 플랫폼 조건부 배송비 admin 화면, RTS/장기미수령 기간기반 플래깅(`sync-tracking` 수정) — kend-seller 단독 진행 가능한 Phase 2.5 병렬 작업

---

## 2026-08-04

### [KEND-SELLER] 재고 배지(품절/재고부족) 추가 + 취소 주문 노출 버그 수정 (P2-4 착수)

- **품절/재고부족 배지** (`product-list-page.tsx`): 재고수량 컬럼에 `total_stock === 0`이면 품절, `0 < total_stock ≤ LOW_STOCK_THRESHOLD(10)`이면 재고부족 배지 표시. `status` 필드가 아닌 `total_stock` 값을 직접 계산해 판단 — 재고 0 도달 시 자동으로 상태를 갱신해주는 주체가 아직 없어, 별도 동기화 없이 항상 정확한 값을 보여주기 위함
- **버그 수정 — 취소된 주문이 판매자 목록/상세에서 사라짐**: kend에 새로 배포된 주문취소 트리거(`handle_order_cancelled`)가 `orders.status` 취소 시 `order_groups.status`도 함께 `cancelled`로 바꾸면서, "결제완료(paid/partially_refunded)만 노출"하던 화이트리스트 필터(`orders/queries.ts`)에 걸려 조회 자체가 안 되던 문제. "결제 미완료(payment_in_progress/payment_pending/failed)만 제외"하는 블랙리스트 방식으로 전환해 해결
  - kend 트리거 정의를 교차 확인한 결과, 다중 판매자 order_group(그룹 내 판매자 2인 이상 섞인 케이스, 실데이터 기준 11개 중 2개 존재)에서도 "그룹 내 모든 orders가 cancelled일 때만" 그룹 상태를 바꾸도록 이미 안전하게 처리돼 있음을 확인 — 별도 수정 불필요
- **dev 서버 포트 5174로 고정**: kend와 동일한 Vite 기본 포트(5173) 사용으로 동시 실행 시 충돌하던 문제 해결
- **재고관리 화면 스코프 확정**: `navigation.tsx`에 "Stocks Keeping"(`/products/stocks-keeping`) 메뉴가 기획 초기부터 있었으나 라우트·페이지 구현이 없던 죽은 링크였음을 확인. SKU별 재고 조회+수정 화면으로 정식 착수 예정(다음 작업). 차감/복구 트랜잭션(주문생성·취소 시)은 kend이 DB 트랜잭션으로 담당하기로 R&R 합의, kend-seller는 배지·조회/수정 화면만 담당
- (참고) 조사 중 상품 등록 후 **수정 기능 자체가 없음**(재고뿐 아니라 이름·가격 등 전체)을 확인 — 별도 이슈로 기록만 해둠

---

## 2026-07-24

### [KEND-SELLER] 배송 처리(스마트택배 연동) 추가 (P2-3)

- **배송 처리 UI** (`order-detail-page.tsx`): `배송준비중` 상태에서 배송사 선택 + 송장번호 입력 폼 노출. 제출 시 `markOrderShipped`(`orders/mutations.ts`)가 `deliveries`(courier/tracking_number/shipped_at)와 `orders.status`를 `shipped`로 갱신. 이 시점엔 스마트택배 API를 호출하지 않고 DB만 기록 — 이후 스케줄러가 처리
- **아키텍처 결정 — 실시간 조회 대신 스케줄러 폴링**: 스마트택배는 조회 건수가 아니라 **동일 운송장번호 최초 조회 기준**으로 과금(재조회는 하루 10~20건까지 무료)되는 구조라, 사용자가 화면에 들어올 때마다 온디맨드로 부르는 대신 백그라운드 스케줄러가 주기적으로 갱신하고 kend/kend-seller는 캐시된 DB 값만 읽는 방식으로 설계
- **스케줄러는 Vercel Cron이 아닌 Supabase(pg_cron)로 구현**: Vercel Hobby 플랜은 크론 실행이 하루 1회로 제한돼 있어, 플랜에 무관하게 원하는 주기로 스케줄링 가능한 Supabase `pg_cron`+`pg_net` 조합을 택함
- **`supabase/functions/sync-tracking`**: `deliveries.status`가 `shipped`/`in_transit`인 건을 스마트택배 API(`trackingInfo`)로 조회 → `complete: true`면 `delivered`로, 아니면 `in_transit`으로 갱신하고 `tracking_synced_at` 기록. 배송완료된 건은 다음 폴링 대상에서 자연히 제외되어 별도 중단 로직 불필요
- **`courier_company` enum ↔ 스마트택배 `t_code` 매핑 확정** (`orders/constrants.ts`): 공식 `companylist` API 응답으로 10개사 코드 실측 확인 후 반영 (추측 코드 사용 시 오조회 위험이 있어 실제 응답으로 검증)
- **`deliveries.tracking_synced_at` 컬럼**: 스키마 소유가 kend 레포라 kend 쪽에서 마이그레이션 진행, 이 레포는 `db:typegen`으로 반영만
- **pg_cron 스케줄은 하루 1회**: 배포 초기엔 실사용 트래픽이 없어 촘촘한 폴링이 불필요 — 개발 중 확인은 크론 주기를 바꾸는 대신 Edge Function을 수동 invoke하는 방식으로 진행
- **EXT-4(스마트택배 API)는 무료 등급으로 신청**: 무료 키는 1개월 유효, 만료 전 재신청하면 계속 무료 사용 가능(재신청마다 키 값 갱신) — 실제 운영 배포 시점에 유료로 전환 예정
- 실제 CJ대한통운 배송건 2건으로 화면 입력 → DB 저장(`shipped`) → 스케줄러 수동 실행 → 스마트택배 응답 반영(`delivered`, 동기화 시각 기록)까지 종단 테스트 완료

---

## 2026-07-22

### [KEND-SELLER] 판매자 주문 관리 화면 추가 (P2-2)

- **`orders/queries.ts`**: `getSellerOrders`(목록), `getSellerOrderDetail`(상세), `getNewOrderCount`(신규 배지). `orders.status`만 보면 결제 승인 전에 이미 `pending`으로 insert된 뒤 결제 실패해도 정리 안 되는 "유령 주문"이 섞여 보이는 문제가 있어, `order_groups.status`(`paid`/`partially_refunded`)를 반드시 조인 필터하도록 설계
- **`orders/mutations.ts`**: `updateOrderStatus` — 화이트리스트(`pending→confirmed/cancelled`, `confirmed→preparing/cancelled`, `preparing→cancelled`) 기반 상태 전이 검증. `shipped`/`delivered` 전환은 송장입력과 함께 배송 처리(P2-3)에서 다룰 예정이라 이번 스코프 제외. 취소는 `orders.status`만 변경, 실제 환불은 스코프 밖(관리자/CS 처리)
- **주문 목록 화면** (`/orders/list`): 상태필터 + 주문번호/수령인 검색, 신규주문 배지, 체크박스 다중선택 + 일괄 상태변경(혼합 상태 선택 시 경고), 페이지네이션
- **주문 상세 화면** (`/orders/:orderNumber`): 수령인/배송지/상품목록/결제정보 표시 + 화이트리스트 기준 다음 상태 버튼
- **버그 수정 — 키워드 검색 500 에러**: PostgREST가 부모 테이블(`orders`)과 조인 테이블(`order_groups`) 컬럼을 하나의 `.or()`에 섞는 걸 지원하지 않아 발생. 수령인명은 먼저 `order_groups`에서 `order_group_id` 목록을 조회한 뒤, `orders` 테이블 컬럼끼리만 `.or()`로 재구성하도록 수정
- 검색창에서 Enter 키 입력 시 검색 버튼과 동일하게 동작하도록 추가
- 실제 계정으로 목록/필터/검색/상세조회/상태전이/전이차단/취소/신규배지 시나리오 테스트 완료 (대량 일괄처리는 테스트 데이터 부족으로 보류)

---

## 2026-07-13

### [KEND-SELLER] 판매자 업체 등록 승인(approval) flow 추가 (P2-1)

- **`admin_sellers`에 상태 컬럼 추가**: `status`(PENDING/APPROVED/REJECTED, 기본값 PENDING) + `rejection_reason`. 기존엔 등록 즉시 정식 판매자로 취급되던 구조였음 (마이그레이션 0008, `seller_information_view` 재생성 포함)
- **승인 게이트**: `root.tsx` 루트 로더에서 seller role인데 미승인 상태(`status !== APPROVED`)면 `/seller/information/submit` 외 모든 경로를 서버에서 강제 리다이렉트. 기존의 "안내만 하고 막지 않던" alert 방식 제거
- **판매자 정보 화면 상태별 분기**: 미등록→등록폼 / 대기중→승인 대기 안내(제출 정보 읽기전용) / 반려→반려 사유 노출 + 재제출폼(재제출 시 상태 PENDING으로 리셋) / 승인완료→기존 관리 화면(로고/해시태그 등)
- **관리자 승인 화면 신규** (`/system/sellers`, 기존 `admin-layout` 재사용): 판매자 목록 + 승인/반려 액션. 승인은 앱 기존 `useAlert` 확인 팝업 재사용, 반려는 `Dialog`+`Textarea`로 사유 입력받아 처리
- **전역 로그아웃 버튼 추가**: `/auth/logout` 리소스 라우트(GET/POST 모두 처리) + `Navigation` 우측 상단 배치 — 기존엔 앱 전체에 로그아웃 수단이 없었음
- **부수 버그 수정**: `Seller` 타입의 `id`/`domain_id`가 실제로는 UUID인데 `number`로 잘못 선언돼있던 것 수정, `Alert` 컴포넌트의 `AlertDialogCancel`에 `onClick` 미연결로 취소 버튼이 동작 안 하던 버그 수정
- 로컬에서 가입→대기→승인, 가입→대기→반려→재제출→대기→승인 전체 플로우 실제 동작 확인 완료
- 후속 UX 항목(로그인 상태 영역, 대기화면 문의처, 반려 시나리오 보완)은 후순위로 [todo/seller-approval-ux-followups.md](todo/seller-approval-ux-followups.md)에 별도 기록

---

## 2026-03-03

### [KEND-SELLER] 판매자 스토어 배너 관리 기능 추가

- **`seller_banners` 테이블 추가**: 배너 제목(`title`, 관리자 식별용), 이미지 URL, 표시 순서(`display_order`), 활성 여부(`is_active`) 컬럼 구성
- **배너 이미지 Storage 연동**: 기존 `sellers` 버킷 재사용, `{seller_code}/banners/banner_{timestamp}.{ext}` 경로로 업로드
- **배너 등록 폼**: 이미지 선택 시 로컬 미리보기(7:3 비율) 표시 → 관리용 제목 입력 → 등록 버튼으로 저장 (최대 5개)
- **배너 목록 관리**: ↑↓ 버튼으로 인접 배너 순서 swap, 활성/비활성 토글, 삭제 기능
- **라우트 추가**: `/seller/banners` (목록/등록 페이지), `/seller/banners/post` (CRUD action)
- **네비게이션 메뉴 추가**: Seller Information 하위에 "Store Banners" 항목 추가

---

## 2026-02-04

### [KEND-SELLER] 판매자 대표이미지(로고) & 해시태그 기능 추가

- **해시태그 마스터 테이블 (`hashtags`)**: 플랫폼 공통 해시태그 테이블 추가. 상품/판매자 등 여러 도메인에서 공유하여 통합 검색에 활용.
- **판매자-해시태그 연결 테이블 (`seller_hashtags`)**: 판매자별 해시태그 연결. 복합 unique 제약조건 적용.
- **판매자 로고 업로드**: Supabase Storage `sellers` 버킷에 `{seller_code}/logo` 경로로 직접 업로드. DB에 URL을 저장하지 않고, 경로 규칙으로 URL을 도출.
- **판매자 정보 관리 화면 확장**: 기존 판매자 정보 입력 페이지를 확장하여, 판매자 등록 후에는 로고 업로드 + 해시태그 관리 화면으로 전환.
