# Changelog

프로젝트의 주요 변경사항을 날짜별로 기록한다.
시스템 구분을 위해 `[KEND]` 또는 `[KEND-SELLER]` prefix를 사용한다.

> - 이 파일은 Kend / Kend-Seller 양쪽에서 수동으로 동기화한다.
> - 최신 내용이 위로 오도록 역순(최신순)으로 작성한다.

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

## 2026-02-10

### [KEND] TossPayments Widget SDK 결제 연동

- **TossPayments Widget SDK v2 연동**: `@tosspayments/tosspayments-sdk` 패키지 도입, 결제 모달에 위젯 렌더링
- **결제 플로우 구현**: 주문 생성(payment_in_progress) → TossPayments 결제창 → Confirm API 호출 → 결제 완료(paid)
- **payments 테이블 추가**: TossPayments Confirm API 응답 데이터(카드 정보, 간편결제 정보, 영수증 URL, 원본 응답 JSONB) 저장
- **결제 성공/실패 처리**: 서버 사이드 redirect 방식으로 구현하여 브라우저 히스토리 오염 방지
- **장바구니 자동 정리**: 결제 성공 시 서버에서 주문된 SKU 기준으로 장바구니 아이템 삭제
- **결제 결과 배너**: 주문내역 페이지(성공), 장바구니 페이지(실패)에 5초 자동 숨김 배너 표시
- **결제수단 매핑**: TossPayments 결제수단 문자열을 DB enum(`payment_method_type`)으로 변환

### [KEND] 장바구니 아이콘 배지 기능 추가

- **CartIcon 컴포넌트**: 장바구니 아이콘에 현재 담긴 상품 개수를 배지로 표시 (`app/common/components/cart-icon.tsx`)
- **root loader 확장**: 로그인 사용자의 장바구니 개수를 조회하여 전역으로 제공
- **useRouteLoaderData 활용**: Context/Provider 없이 root loader 데이터에 접근하여 개수 표시
- **자동 갱신**: 장바구니 추가/삭제 시 React Router의 자동 revalidation으로 개수 업데이트

### [KEND] 결제 모달 배송 메시지 기능 추가

- **배송 메시지 선택**: DeliveryAddress 컴포넌트에 배송 메시지 Select 통합
- **옵션 제공**: 선택 안함, 문 앞에 놔주세요, 부재 시 연락주세요, 배송 전 미리 연락해 주세요, 직접 입력하기
- **DB 스키마**: `order_groups` 테이블에 `delivery_message` 컬럼 추가
- **주문 저장**: 주문 생성 시 선택한 배송 메시지를 DB에 저장

### [KEND] UI 스타일 개선

- **Select 컴포넌트**: 선택 항목 강조색 opacity 조정 (`focus:bg-accent` → `focus:bg-accent/30`)
- **안내 문구**: 결제 모달 안내 문구 스타일 피그마 디자인에 맞게 수정 (중앙 정렬, 별표 추가)

---

## 2026-02-06

### [KEND] 성장기록 기능 구현

- **성장도표 데이터 변환**: 질병관리청 성장도표 CSV를 TypeScript로 변환하는 스크립트 작성 (`scripts/convert-growth-csv.cjs`)
- **백분위수 계산**: LMS 방식(L=Box-Cox power, M=median, S=coefficient of variation)으로 Z-score 및 백분위수 계산 함수 구현 (`app/lib/growth-data/calculations.ts`)
- **성장 그래프 개선**: 기준 데이터(25~75% 백분위 영역)를 파란 그라데이션으로, 사용자 자녀 데이터를 꺾은선 그래프로 표시
- **그래프 X축 수정**: 0개월(0세)부터 시작하도록 변경
- **테마 색상 적용**: 그래프 및 슬라이더 색상을 앱 secondary 색상(#163756 계열)으로 통일
- **등수 표기**: 백분위수 기반 등수를 정수로 표시 (100명 중 N등)

### [KEND] 장바구니 담기 UX 개선

- **확인 다이얼로그**: 장바구니 담기 후 AlertDialog로 "장바구니로 이동" / "계속 쇼핑하기" 선택 제공
- **버그 수정**: 기존 잘못된 `alert()` 호출(문자열 전달) → 올바른 객체 형태로 수정

### [KEND] 상품 상세 가격 표시 수정

- **할인 표기 조건부 렌더링**: `discountRate > 0` 이고 `regularPrice !== salePrice`일 때만 할인율/정상가 표시
- **쿠폰할인가 섹션 제거**: 미구현 기능이므로 하드코딩된 쿠폰할인가 UI 삭제

---

## 2026-02-04

### [KEND-SELLER] 판매자 대표이미지(로고) & 해시태그 기능 추가

- **해시태그 마스터 테이블 (`hashtags`)**: 플랫폼 공통 해시태그 테이블 추가. 상품/판매자 등 여러 도메인에서 공유하여 통합 검색에 활용.
- **판매자-해시태그 연결 테이블 (`seller_hashtags`)**: 판매자별 해시태그 연결. 복합 unique 제약조건 적용.
- **판매자 로고 업로드**: Supabase Storage `sellers` 버킷에 `{seller_code}/logo` 경로로 직접 업로드. DB에 URL을 저장하지 않고, 경로 규칙으로 URL을 도출.
- **판매자 정보 관리 화면 확장**: 기존 판매자 정보 입력 페이지를 확장하여, 판매자 등록 후에는 로고 업로드 + 해시태그 관리 화면으로 전환.
