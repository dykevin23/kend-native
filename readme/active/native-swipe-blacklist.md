# kend-native 뒤로가기(스와이프/하드웨어) 제어

> 2026-04-17 최초 작성 · 2026-09-10 전면 개정 (결제 리다이렉트 구간 반영)
> 구현: [app/index.tsx](../../app/index.tsx)
> 배포/테스트 체크리스트: [todo/native-payment-webview-handoff.md](../todo/native-payment-webview-handoff.md)

---

## 배경

특정 화면에서 의도치 않은 뒤로가기가 나면:

- 입력 폼 → 작성 중 내용 유실
- 결제/로그인 리다이렉트 URL → 소진된 세션("이미 종료된 세션입니다") 에러 페이지

모달/바텀시트가 열린 화면은 Radix 오버레이가 전체를 덮어 스와이프가 자연 차단되므로 별도 처리 불필요.
**URL 자체에 진입한 상태**에서 막아야 하는 경우만 아래로 관리한다.

---

## 두 가지 분류

`app/index.tsx` 상단 헬퍼: `isPaymentFlowUrl(url)`, `isFormFlowUrl(url)`.

### A. 리다이렉트 구간 — `isPaymentFlowUrl`

뒤로가면 소진된 세션/결제창으로 돌아간다. **외부 페이지엔 자체 취소·뒤로 UI가 있으므로 Alert 없이 조용히 무시.**

| 대상 | 매칭 |
| --- | --- |
| kend 아닌 **모든 외부 도메인** (pay.toss.im, 카드사 인증, 소셜로그인 제공자 등) | `hostname !== "kend-seven.vercel.app"` |
| 결제 콜백 페이지 | `pathname`이 `/payments/`로 시작 |
| 결제 종료 랜딩 (시작 지점에 따라 `/carts`·`/products/:id`·`/orders` 등 다양) | 쿼리에 `payment_success` / `payment_error` / `payment_cancelled` |

### B. 입력 폼 구간 — `isFormFlowUrl`

뒤로가면 입력 유실. **Android는 확인 Alert, iOS는 스와이프 비활성화.**

| 대상 | 매칭 |
| --- | --- |
| 로그인/가입/소셜 콜백 | `^/auth(/\|$)` |
| 자녀 등록·수정·성장데이터 입력 | `^/children/(submit\|\d+/(edit\|growth))$` |

정규식:

```
FORM_FLOW_REGEX = /^\/(auth)(\/|$)|^\/children\/(submit|\d+\/(edit|growth))$/
```

> 휴대폰 인증·비밀번호 재설정·소셜 추가정보 입력 페이지가 생기면 `FORM_FLOW_REGEX`에 추가.

---

## 플랫폼별 동작

| 상황 | iOS (스와이프) | Android (하드웨어 back) |
| --- | --- | --- |
| 리다이렉트 구간 (A) | 제스처 비활성화 (`allowsBackForwardNavigationGestures={!backBlocked}`) + back/forward 네비게이션이 결제 URL로 향하면 `onShouldStartLoadWithRequest`에서 `return false` | `onBackPress`에서 조용히 무시 (`return true`) |
| 입력 폼 구간 (B) | 제스처 비활성화 | 확인 Alert ("화면을 나가시겠습니까? 입력 중인 내용이 사라질 수 있어요") |
| 결제 직후 복귀 화면 | 제스처 비활성화 (`justReturnedFromPaymentRef`) | 조용히 무시 |
| 그 외 | 정상 | WebView back → 없으면 앱 종료 |

### 결제 직후 복귀 가드 (`justReturnedFromPaymentRef`)

kend가 착지 후 URL 쿼리(`?payment_cancelled` 등)를 클라이언트에서 제거하면 URL 기반 판정이 풀린다.
→ `handleNavigationStateChange`가 **외부→kend 복귀**를 감지해 ref를 세우고 착지 pathname을 기록.
→ 사용자가 **다른 pathname으로 이동**하면 해제.

### iOS back/forward 원천 차단

```
navigationType === "backforward" && isTopFrame
  && isKendUrl(현재URL) && isPaymentFlowUrl(대상URL)
  → return false
```

"현재 kend일 때"로 한정 → Toss/카드사 화면 **내부**의 뒤로가기는 방해 안 함.
Android는 `navigationType`이 항상 `'other'`라 여기서 못 걸러 → 하드웨어 back 핸들러가 담당.

---

## 흰 화면 깜빡임 완화

`handleShouldStartLoad`에서 **http(s) 최상위 이동**이 kend↔외부(결제창) 전환이면
debounce 없이 즉시 로딩 오버레이(크림색 + 스피너) 표시. 8초 안전 타임아웃.

- `isTopFrame` → 결제위젯 iframe 로드 제외
- `/^https?:\/\//` → 앱스킴 핸드오프(`intent://`, `supertoss://` 등) 제외

---

## 미해결

- **앱스킴 자체 처리** (`intent://` 등 → `Linking.openURL`) 미구현. iOS 테스트에선 카드사 인증이 뜨므로 당장 문제 없으나 Android + 실제 앱카드에서 필요할 수 있음. 별도 이슈.

---

## 관련 파일

- 구현: [app/index.tsx](../../app/index.tsx) (kend-native는 expo-router 파일 기반 라우팅 — 이 파일이 유일한 라우트)
- 결제 흐름 (kend 레포): `app/features/payments/pages/`, `app/features/products/components/product-purchase-modal.tsx`, `app/root.tsx`의 `shouldRevalidate`
- 배포/테스트 체크리스트: [todo/native-payment-webview-handoff.md](../todo/native-payment-webview-handoff.md)
