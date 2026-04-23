# TossPayments 결제 연동 가이드

## 현재 상태: 테스트 모드

현재 TossPayments **공용 테스트 키**로 개발되어 있다. 실제 결제가 발생하지 않으며, 테스트 환경에서만 동작한다.

```
VITE_TOSS_CLIENT_KEY="test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm"
TOSS_SECRET_KEY="test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6"
```

---

## 아키텍처 개요

### SDK 버전

- **프론트엔드**: TossPayments Widget SDK v2 (`@tosspayments/tosspayments-sdk`)
- **백엔드**: TossPayments REST API v1 (`https://api.tosspayments.com/v1/payments/confirm`)

> Widget SDK v2는 프론트엔드 전용이며, 백엔드 Confirm API는 v1을 사용한다. 이는 TossPayments 공식 구조이다.

### 결제 플로우

```
[사용자] 결제하기 클릭
    ↓
[클라이언트] 주문 생성 API 호출 (fetcher.submit → /orders/action)
    ↓
[서버] order_group(payment_in_progress) + orders + order_items + deliveries + delivery_items 생성
    ↓
[클라이언트] paymentWidget.requestPayment() 호출 → TossPayments 결제창 진입
    ↓
[TossPayments] 사용자가 결제 수단 선택 및 인증
    ↓ (성공)                                    ↓ (실패/취소)
/payments/success?paymentKey=...&orderId=...    /payments/fail?message=...&orderId=...
    ↓                                               ↓
[서버 loader]                                   [서버 loader]
  1. order_group 조회 및 금액 검증                  1. order_group 상태 → failed
  2. TossPayments Confirm API 호출                 2. redirect → /carts?payment_error=...
  3. order_group 상태 → paid
  4. payments 테이블에 상세 정보 저장
  5. 장바구니 정리 (SKU 매칭 삭제)
  6. redirect → /orders?payment_success=true
```

### 핵심 설계 결정: 서버 사이드 redirect

결제 성공/실패 페이지는 **UI를 렌더링하지 않고** loader에서 모든 처리 후 `redirect()`한다.

- **이유**: 브라우저 히스토리에 `/payments/success`, `/payments/fail` 페이지가 남지 않아, 모바일 스와이프 뒤로가기 시 TossPayments 중간 페이지로 돌아가는 문제를 방지한다.
- **결과 전달**: URL 쿼리 파라미터로 결과를 전달하고, 도착 페이지(orders, carts)에서 배너로 표시 후 파라미터를 제거한다.

---

## 파일 구조

```
app/features/payments/
├── mutations.server.ts              # TossPayments Confirm API 호출 + 결제수단 매핑
└── pages/
    ├── payment-success-page.tsx     # 결제 성공 콜백 (loader only, redirect)
    └── payment-fail-page.tsx        # 결제 실패 콜백 (loader only, redirect)

app/features/products/components/
└── product-purchase-modal.tsx       # 결제 모달 (TossPayments 위젯 렌더링)

app/features/orders/
├── schema.ts                        # DB 스키마 (order_groups, payments, orders 등)
├── mutations.ts                     # 주문 생성 로직
├── types.ts                         # OrderItem, SellerOrderGroup 타입
└── pages/
    ├── order-action.ts              # 주문 생성 action handler
    └── orders-page.tsx              # 주문내역 (결제 성공 배너)

app/features/carts/pages/
└── shopping-cart-page.tsx           # 장바구니 (결제 실패 배너)
```

### 라우트 설정 (`app/routes.ts`)

```typescript
...prefix("payments", [
  route("/success", "features/payments/pages/payment-success-page.tsx"),
  route("/fail", "features/payments/pages/payment-fail-page.tsx"),
]),
```

---

## DB 테이블

### payments (결제 상세 정보)

`order_groups`와 1:1 관계. TossPayments Confirm API 응답 데이터를 구조화하여 저장한다.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid (PK) | 결제 ID |
| `order_group_id` | uuid (FK) | 주문 그룹 ID |
| `payment_key` | text (unique) | TossPayments paymentKey |
| `order_id` | text | TossPayments orderId (= order_number) |
| `method` | text | 결제 수단 (카드, 간편결제, 계좌이체 등) |
| `status` | text | 결제 상태 (DONE, CANCELED 등) |
| `total_amount` | integer | 결제 금액 |
| `requested_at` | timestamptz | 결제 요청 시각 |
| `approved_at` | timestamptz | 결제 승인 시각 |
| `card_issuer_code` | text | 카드 발급사 코드 |
| `card_acquirer_code` | text | 카드 매입사 코드 |
| `card_number` | text | 마스킹된 카드번호 |
| `card_installment_plan_months` | integer | 할부 개월수 (0=일시불) |
| `card_approve_no` | text | 승인번호 |
| `card_type` | text | 신용, 체크, 기프트 |
| `card_owner_type` | text | 개인, 법인 |
| `easy_pay_provider` | text | 간편결제 제공자 (TOSSPAY, KAKAOPAY 등) |
| `easy_pay_amount` | integer | 간편결제 금액 |
| `easy_pay_discount_amount` | integer | 간편결제 할인 금액 |
| `receipt_url` | text | 영수증 URL |
| `raw_response` | jsonb | TossPayments 원본 응답 전체 |
| `created_at` | timestamptz | 생성일시 |

### order_groups 결제 관련 컬럼

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `status` | enum | `payment_in_progress` → `paid` / `failed` |
| `payment_method` | enum | 결제수단 대분류 (credit_card, easy_pay 등) |
| `payment_key` | text | TossPayments paymentKey (환불/취소용) |
| `paid_at` | timestamptz | 결제 완료 시각 |

### 결제수단 매핑 (`mapTossMethodToEnum`)

| TossPayments 값 | DB enum 값 |
|-----------------|------------|
| 카드 | `credit_card` |
| 가상계좌 | `virtual_account` |
| 계좌이체 | `bank_transfer` |
| 휴대폰 | `mobile_payment` |
| 간편결제 | `easy_pay` |
| 토스페이 | `easy_pay` |

---

## 주요 코드 설명

### 1. 결제 위젯 초기화 (product-purchase-modal.tsx)

```typescript
// TossPayments SDK 로드 → 위젯 인스턴스 생성
const tossPayments = await loadTossPayments(import.meta.env.VITE_TOSS_CLIENT_KEY);
const widget = tossPayments.widgets({ customerKey: "anonymous" });
await widget.setAmount({ currency: "KRW", value: totalAmount });

// DOM에 결제수단 선택 UI + 약관 동의 UI 렌더링
await paymentWidget.renderPaymentMethods({ selector: "#toss-payment-method" });
await paymentWidget.renderAgreement({ selector: "#toss-agreement" });
```

> `customerKey: "anonymous"`는 비회원(게스트) 결제 모드이다. 회원 결제 시 고유 키를 사용해야 한다.

### 2. 결제 요청 (product-purchase-modal.tsx)

주문 생성(서버) 성공 후 `requestPayment()` 호출:

```typescript
paymentWidget.requestPayment({
  orderId: orderNumber,          // 주문번호 (ORD-YYYYMMDD-XXXXX)
  orderName,                     // "상품명 외 N건"
  successUrl: `${window.location.origin}/payments/success`,
  failUrl: `${window.location.origin}/payments/fail`,
});
```

### 3. 결제 확인 (mutations.server.ts)

```typescript
// Basic 인증 (시크릿키:빈값)
const authorization = `Basic ${Buffer.from(secretKey + ":").toString("base64")}`;

const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
  method: "POST",
  headers: { Authorization: authorization, "Content-Type": "application/json" },
  body: JSON.stringify({ paymentKey, orderId, amount }),
});
```

### 4. 결제 성공 처리 (payment-success-page.tsx)

loader에서 순서대로 처리:

1. **파라미터 검증**: `paymentKey`, `orderId`, `amount` 필수 확인
2. **인증 확인**: 로그인 사용자 확인
3. **금액 검증**: `order_group.total_amount === amount` 대조
4. **중복 방지**: 이미 `paid` 상태면 바로 redirect
5. **Confirm API 호출**: TossPayments에 결제 확인 요청
6. **DB 업데이트**: `order_groups` 상태 → `paid`, `payment_method`, `payment_key`, `paid_at` 저장
7. **payments insert**: 결제 상세 정보 저장
8. **장바구니 정리**: 주문된 SKU와 매칭되는 장바구니 아이템 삭제
9. **redirect**: `/orders?payment_success=true&orderNumber=...&amount=...`

---

## 환경 변수

| 변수 | 위치 | 설명 |
|------|------|------|
| `VITE_TOSS_CLIENT_KEY` | `.env` (클라이언트 노출) | TossPayments 클라이언트 키 |
| `TOSS_SECRET_KEY` | `.env` (서버 전용) | TossPayments 시크릿 키 |

> `VITE_` prefix가 있는 키만 클라이언트 번들에 포함된다. 시크릿 키는 `.server.ts` 파일에서만 사용하여 보호한다.

---

## 라이브 전환 시 처리해야 할 사항

### 필수 (결제 동작)

1. **TossPayments 키 교체**
   - 테스트 키(`test_gck_...`, `test_gsk_...`) → 라이브 키로 교체
   - TossPayments 가맹점 심사 완료 후 발급받은 키 사용
   - `.env` 파일에서 `VITE_TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY` 변경

2. **customerKey 회원 연동**
   - 현재 `customerKey: "anonymous"` (비회원 모드)
   - 회원 결제 시 사용자 고유 식별자로 변경 필요 (예: user.id)
   - 자동 결제수단 저장, 빌링키 발급 등에 필요

3. **금액 검증 강화**
   - 현재: 클라이언트에서 계산된 금액을 그대로 사용
   - 개선: 서버에서 SKU 가격 재조회 후 금액 재계산하여 위변조 방지

4. **결제 취소/환불 API 구현**
   - TossPayments 결제 취소 API (`POST /v1/payments/{paymentKey}/cancel`) 연동
   - `order_groups` 상태: `cancelled`, `refunded`, `partially_refunded` 처리
   - `payments` 테이블의 status 업데이트

### 중요 (안정성)

5. **Webhook 수신 설정**
   - TossPayments 웹훅 URL 등록 (예: `/api/payments/webhook`)
   - 결제 상태 변경을 서버에서 수신하여 DB 동기화
   - redirect 콜백이 실패했을 경우의 안전장치

6. **failed 주문 정리 배치**
   - `payment_in_progress` 상태로 일정 시간(예: 30분) 경과된 주문을 `failed`로 처리
   - 사용자가 결제 중 이탈하거나, redirect 콜백이 실패한 경우 대응

7. **재고 관리 연동**
   - 현재: 주문 생성 시 재고 차감 없음
   - 개선: 주문 생성 시 재고 임시 확보 → 결제 완료 시 확정 차감 → 실패/취소 시 복원

8. **동시성 제어**
   - 동일 주문에 대한 중복 Confirm API 호출 방지 (이미 `paid` 체크는 있음)
   - 동일 상품 동시 주문 시 재고 경합 처리

### 개선 (UX/운영)

9. **가상계좌 입금 대기 처리**
   - 현재: 모든 결제를 즉시 완료로 처리
   - 가상계좌 선택 시 `payment_pending` 상태로 유지
   - 입금 확인 웹훅 수신 후 `paid`로 전환

10. **주문 상세/영수증 페이지**
    - `payments.receipt_url`을 활용한 영수증 확인 기능
    - 결제 수단별 상세 정보 표시 (카드 번호, 승인번호, 간편결제 제공자 등)

11. **주문 확인 이메일/알림**
    - 결제 완료 시 사용자에게 주문 확인 알림 발송

12. **console.log 정리**
    - 현재 디버그용 `console.log`가 남아 있음
    - 파일: `product-purchase-modal.tsx`, `order-action.ts`
    - 라이브 전환 전 제거하거나 로깅 레벨 조정 필요

13. **배송비 계산 고도화**
    - 현재: 판매자별 배송비 정책 기반 단순 계산
    - 도서산간 추가 배송비, 묶음 배송 할인 등 고려

14. **쿠폰/포인트 적용**
    - 주문 금액에서 쿠폰/포인트 차감 로직
    - `order_groups.total_discount_amount` 활용

---

## 테스트 데이터 초기화

개발 중 생성된 테스트 주문/결제 데이터를 정리하려면:

```sql
-- order_groups 삭제 시 하위 테이블 모두 cascade 삭제됨
-- (payments, orders, order_items, deliveries, delivery_items)
DELETE FROM order_groups;
```

---

## 참고 문서

- [TossPayments 개발자 센터](https://docs.tosspayments.com/)
- [Widget SDK v2 가이드](https://docs.tosspayments.com/sdk/v2/js)
- [Confirm API 레퍼런스](https://docs.tosspayments.com/reference#결제-승인)
- [Payment 객체](https://docs.tosspayments.com/reference#payment-객체)
