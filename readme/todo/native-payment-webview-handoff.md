# 작업지시 — 결제 WebView 수정 빌드/배포

> 2026-09-10 · 담당: kend-native
> 코드 변경 **이미 적용 완료** (kend + kend-native 양쪽, typecheck 통과).
> 할 일 = ① kend 재배포 ② kend-native EAS 빌드 ③ 아래 체크리스트 테스트.

---

## 무엇을 고쳤나 (요약)

앱 결제 테스트에서 나온 3가지:

1. 결제하기 → "문제가 발생했어요"가 깜빡이고 카드사 화면 등장
2. 결제 취소 → 뒤로가기 누르면 "이미 종료된 세션입니다" (Toss URL로 돌아감)
3. 결제 리다이렉트 중 흰 화면 깜빡임

원인·상세: [../active/native-swipe-blacklist.md](../active/native-swipe-blacklist.md)

---

## 변경된 파일 (전부 커밋/배포 대상)

### kend (웹 — 재배포)
- `app/root.tsx`
- `app/features/products/components/product-purchase-modal.tsx`
- `app/features/products/pages/product-page.tsx`
- `app/features/payments/pages/payment-fail-page.tsx`
- `app/features/carts/pages/shopping-cart-page.tsx`

### kend-native (EAS 빌드)
- `app/index.tsx` **한 파일만**

---

## 배포 순서

1. **kend 먼저 재배포** (Vercel). ①번 버그(문제발생 깜빡임)와 위젯 안정화는 웹만으로도 개선됨.
   - 사전조건: Vercel 환경변수 `VITE_TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY` 등록 확인 (아직이면 먼저)
2. **kend-native EAS 빌드 → TestFlight/내부배포**
3. 새 앱으로 아래 체크리스트

> kend 재배포 없이 앱만 빌드하면 ②③은 확인되지만 ①과 "시작 지점 복귀"는 확인 안 됨.

---

## 테스트 체크리스트 (iOS + Android 각각)

### 결제 진입
- [ ] 장바구니 결제하기 → **kend 에러화면 없이** Toss 결제창까지
- [ ] 상품상세 바로구매 → 동일
- [ ] kend↔Toss 전환 시 흰 화면 대신 크림색 로딩 오버레이
- [ ] 카드사 인증 화면 정상 진입

### 취소 → 복귀 (핵심)
- [ ] **장바구니**에서 시작 → 취소 → **장바구니** 복귀 + 회색 "결제가 취소되었습니다"
- [ ] **상품상세**에서 시작 → 취소 → **상품상세** 복귀 (안내 없음)
- [ ] 복귀 후 Android 하드웨어 back → 아무 일 없음 (Toss 안 감)
- [ ] 복귀 후 iOS 스와이프 back → 안 먹음 (Toss 안 감)
- [ ] 복귀 후 다른 탭 이동 → 그 다음부터 back 정상

### 실패 → 복귀
- [ ] (가능하면) 결제 실패 유도 → 시작 지점 복귀 + 에러 표시

### 성공
- [ ] 결제 완료 → 주문내역, back 눌러도 Toss 안 감

### 회귀 (안 깨졌는지)
- [ ] 소셜 로그인(구글/네이버) 정상
- [ ] `/auth/*`, `/children/submit`에서 Android back → 기존 확인 Alert 그대로
- [ ] 일반 화면 이동/뒤로가기 정상

---

## 실측 필요 (테스트 중 확인)

- Toss가 `failUrl`의 기존 `?returnTo=...` 뒤에 자기 파라미터를 `&`로 붙이는지.
  잘못되면 취소 시 상품상세가 아니라 장바구니로 감 (안전 폴백, 치명적 아님).
- iOS에서 스와이프 시작하다 스냅백하는 어색함 있는지.

---

## 이번 범위 아님 (별도)

- 앱스킴(`intent://`, `supertoss://`) → `Linking.openURL` 처리. 현재 iOS 카드사 인증은 뜨므로 보류.
  Android + 실제 앱카드 인증에서 문제되면 그때.
