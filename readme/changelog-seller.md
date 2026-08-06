# Changelog — KEND-SELLER

KEND-SELLER 판매자 관리자 웹의 주요 변경사항을 날짜별로 기록한다.

> - 이 파일은 모든 프로젝트에서 수동으로 동기화한다.
> - 최신 내용이 위로 오도록 역순(최신순)으로 작성한다.
> - 항목 제목 맨 앞에 `[KEND-SELLER]` prefix를 사용한다.

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
