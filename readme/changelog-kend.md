# Changelog (KEND)

KEND 웹앱(React Router SSR + WebView)의 주요 변경사항을 날짜별로 기록한다.

> - 최신 내용이 위로 오도록 역순(최신순)으로 작성한다.
> - 다른 시스템 변경 이력: [changelog-seller.md](./changelog-seller.md), [changelog-native.md](./changelog-native.md)

---

## 2026-08-04

### [KEND] 재고 hold 유지시간 30분 → 15분 단축

- `expire_pending_orders()`(`app/sql/functions/expire_pending_orders.sql`)의 `payment_in_progress` 정리 임계치를 30분에서 15분으로 단축, cron 주기도 10분 → 5분으로 맞춤
- 업계 표준(주문 생성 시 재고 hold 후 10~15분 내 결제 미완료 시 자동 정리) 참고해 결정

---

## 2026-07-27

### [KEND] 재고 차감/복원 연동 (P2-4)

- **`decrement_stock`**(`app/sql/functions/decrement_stock.sql`): 주문 생성 시(`orders/mutations.ts` `createOrder`) SKU 재고를 원자적으로 차감. 재고 부족 시 예외를 던져 주문 생성을 막음 (B안: 결제 시도 전 재고 hold)
- **`handle_order_cancelled` 트리거**(`app/sql/triggers/on_order_cancelled.sql`): `orders.status`가 `cancelled`로 전이되면 해당 주문의 SKU 재고를 복원하고, 같은 `order_group` 내 전 주문이 취소됐으면 `order_groups.status`도 `cancelled`로 승격
  - 최초엔 `order_groups.status` 기준으로 만들었으나, kend-seller의 판매자 취소(`updateOrderStatus`)가 `orders.status`만 바꾸고 `order_groups.status`는 안 건드려 트리거가 걸리지 않는 버그를 실사용 중 발견 → `orders.status` 기준으로 재설계. 다중 판매자 주문에서 한쪽만 취소해도 나머지가 안전한지까지 실사례로 검증
- **`expire_pending_orders`**(`app/sql/functions/expire_pending_orders.sql`) 함수 + pg_cron: `payment_in_progress` 상태로 일정시간 경과한 주문을 `failed` 처리, 하위 `orders.status`도 `cancelled`로 맞춰 위 트리거가 연쇄로 재고를 복원하도록 연결
- **`order-group-card.tsx`**: "주문취소" 버튼이 이미 취소된 주문에도 계속 노출되던 버그 수정 (`canCancel` 판정에 `cancelled` 상태 추가)
- 실사용 테스트 중 발견한 버그 3건(재고 미복원, 취소버튼 잔존, "취소/환불" 탭 미표시)은 전부 "판매자 취소가 `orders`만 건드리고 `order_groups`는 안 건드린다"는 하나의 근본원인에서 파생된 것으로 확인, 트리거 재설계로 일괄 해결

### [KEND] deliveries 테이블에 tracking_synced_at 컬럼 추가

- kend-seller의 스마트택배 연동(P2-3) 배송상태 폴링이 갱신 시각을 기록할 수 있도록 컬럼 추가. 스키마 소유가 kend 레포라 마이그레이션은 kend에서 진행, kend-seller는 `db:typegen`으로 반영

---

## 2026-07-22

### [KEND] 판매자 계정 kend 로그인 차단 + 주문취소 팝업 개선

- **`root.tsx`**: 전역 loader에서 로그인 후 `profiles.role`을 조회, `seller`면 즉시 `signOut()` + `/auth/login`으로 리다이렉트. 일반 로그인 실패와 동일한 문구·에러코드(`invalid_credentials`)를 사용해 판매자 계정 존재 여부가 드러나지 않게 처리
  - 계기: 결제 테스트 데이터 점검 중 판매자(NBA KIDS) 계정이 kend에 로그인해 실제로 구매까지 할 수 있었던 것을 발견 — `profiles.role`이 스키마에만 정의돼 있고 어디서도 체크되지 않던 상태였음
- **`login-page.tsx`**: 위 리다이렉트의 에러 메시지 표시 로직 추가. 기존에 죽어있던 `naver_*` 에러 쿼리 파라미터 처리도 함께 살림
- **`order-group-card.tsx`**: 주문취소 확인 팝업에 확인 버튼만 있고 되돌릴 방법이 없던 문제 수정 — `secondaryButton`(취소) 추가 (다른 화면의 기존 confirm 패턴과 동일)
- (참고) 점검 과정에서 발견된 테스트용 주문/결제 데이터(order_groups 5건 등, 전부 테스트 키)는 DB에서 삭제 완료

### [KEND] 스토어 목록에서 상품 없는 판매자 제외

- `getStoresWithProducts`(`stores/queries.ts`)가 `admin_sellers`를 조건 없이 조회해, 판매 가능한 상품이 하나도 없는 판매자도 No-Image 카드로 노출되던 문제 수정
- 대표 이미지(`productImages`)가 빈 판매자는 매핑 후 `.filter()`로 결과에서 제외
- 타입체크만 통과 확인, **브라우저 동작 확인은 아직**(테스트 대기)

---

## 2026-07-10

### [KEND] 공유 문서 운영 체계 확장 (milestones·roadmap·core sync)

- `scripts/sync-docs.sh` 신설(`sync-changelogs.sh` 대체): sync 대상을 changelog 3종에서 **milestones·roadmap·core 공통문서 8종까지 확장**. milestones/roadmap/core는 kend가 canonical, changelog는 각 프로젝트가 canonical
- CLAUDE.md에 "공유 문서는 kend에서만 수정, 다른 repo에서 고치면 sync 시 덮어써짐" 규칙 명시
- 배경: kend-milestones가 kend에만 있고 roadmap이 native/seller에서 stale해서, 다른 프로젝트 세션에서 전체 진행상황을 파악할 수 없던 문제 해결

### [KEND] 마일스톤 보드 Phase 2 상태 미검증 경고 추가

- P2-1~P2-6 상태·Due가 2026-04 계획 시점 그대로 갱신 안 된 상태임을 명시, 착수 전 kend-seller 코드 실측 후 정정하도록 경고 추가
- Phase 1에서도 "미착수" 표기가 실제로는 대부분 구현돼 있었던 전례 기록

### [KEND] /prep 명령어 개편

- `overview.md`·`kend-milestones.md`·`kend-roadmap-to-launch.md` 등 진행상황 파악에 필수인 문서가 누락돼 있던 문제 수정
- "읽고 요약만, 작업은 시작하지 않음" 명시(작업 지시는 별도로 받음). 문서 상태가 실제 코드와 다를 수 있으니 착수 전 실측하라는 경고 추가

### [KEND] 주문 취소 + 전액 환불 (P1-5)

- **`cancelPayment()`** (`payments/mutations.server.ts`): TossPayments 결제 취소 API 연동. `Idempotency-Key` 헤더로 재시도 시 **이중 환불 방지**
- **`cancelOrderGroup()`** (`orders/mutations.server.ts` 신규): ①본인 주문·`paid`·배송 전 검증 → ②Toss 전액 취소 → ③DB 상태 전환. ③은 `applyCancellationToDb()`로 분리해 **추후 Postgres RPC(트랜잭션)로 교체 가능**하게 설계
- **상태 전환**: `order_groups`/`orders`/`delivery_items` → `cancelled`, `payments` → `CANCELED`. 배송 전 구매자 취소는 **`cancelled`** 를 쓰고 반품 환불용 `refunded`는 예약(정산·통계 구분 목적)
- `/orders/action` 에 `intent=cancel` 분기 추가. 주문내역 카드에 **"주문 취소" 버튼**(취소 가능할 때만) + 확인 팝업 + 실패 사유 알림
- **취소 단위 = order_group(결제 단위) 전체.** 부분 취소(상품·판매자 단위)와 구매확정은 배송(Phase 2) 도입 이후
- 로컬 테스트 키로 취소 → 환불 → 상태 전환 **동작 확인 완료**
- ⚠️ 한계: Toss 취소 성공 후 DB 반영 중 실패 시 불일치 가능(트랜잭션 없음) → 결제-주문 무결성 체크(P4-3) 전제

---

## 2026-07-09

### [KEND] 문서 운영 체계 3개 프로젝트 정렬

- **CLAUDE.md 신규**(kend/native/seller, 자동 로드): overview=단일 대시보드, changelog=각 패키지 history, **`/changelog`로만 갱신·선제 작성 금지**, 완료는 테스트 후 기록, 타 패키지는 changelog로 참조
- `readme-structure-guide.md` **§8 유지규칙 정정** — "작업 시작/완료마다 갱신" → `/changelog` 호출 시 · 작업 단위 완료 시점
- **`scripts/sync-changelogs.sh` 추가** — changelog 3종을 3개 repo에 원커맨드 동기화 (canonical: 각 이름의 프로젝트가 원본)

### [KEND] 계획 문서 갱신

- **마일스톤 보드 현실화**: 법인 완료·결제 E2E 검증·실키 신청 반영, 현재상태 블록은 overview 포인터로 축소(중복 제거), 스케줄 슬립 경고 추가
- **NICE 본인확인(EXT-6) → Holding**: 본인확인 불필요 방향(휴대폰 인증도 이연). 카드 결제 본인인증은 Toss/카드사가 처리하고, 유아용품이라 성인인증 대상도 아님

### [KEND] 결제 루프 E2E 검증 완료 (테스트 키)

- 주문 생성 → TossPayments 결제(docs 테스트 키) → confirm → `order_groups.status=paid` + payments 저장 + 장바구니 정리 + 주문내역 노출까지 **전 흐름 로컬 동작 검증**
- 실패/중단 결제는 `payment_in_progress`로 남고 주문내역 UI에서 비노출됨(설계대로) 확인. (미완료 → `failed` 정리 cron은 여전히 미구현)
- `payment-success-page`의 `raw_response`를 `Json`으로 캐스팅해 tsc 오류 해소
- (참고) 법인 설립·법인 계좌 완료로 결제/정산 외부 의존성 해소. TossPayments 실키(기본 결제 패키지)·NICE 본인확인 신청 → 심사 2~4주 대기

### [KEND] 로컬 소셜 로그인 리다이렉트 수정

- 로컬 dev에서 소셜 로그인 시 Vercel로 튕기던 문제 해결. 원인: Supabase Auth Redirect URLs의 localhost 항목이 `http://localhost:5173/*`(단일 `*`)라 다단계 콜백 경로(`/auth/social/kakao/complete`)를 매칭 못 해 Site URL(Vercel)로 폴백 → `/*`를 `/**`로 수정

---

## 2026-06-24

### [KEND] 디버그 console.log 정리 (P0-3 에러 핸들링)

- 결제/주문 플로우 디버그 로그(`product-purchase-modal` 3건, `order-action` 3건) + `select-accordion`·`address-manage-modal` 디버그 로그 제거 (총 8건)
- `console.error`(에러 로깅 17건)와 `create-naver-user` Edge Function 서버 로그는 유지 — PostHog 전환은 별도 작업
- 동작 영향 없는 로그 삭제 (타입체크 통과로 검증)

### [KEND] 오프라인 감지 추가 (P0-3 에러 핸들링)

- **`useNetworkStatus` 훅** (`app/hooks/useNetworkStatus.ts`): `useSyncExternalStore` 기반 online/offline 감지. SSR 안전을 위해 `getServerSnapshot`(서버에선 항상 online 가정) 포함 → hydration mismatch 방지
- **`OfflineBanner`** (`app/common/components/offline-banner.tsx`): 오프라인 시 화면 상단 고정 배너("인터넷 연결을 확인해주세요"), iOS safe-area(`--safe-area-inset-top`) 반영. `root.tsx` Layout에 연동
- 실기기 비행기모드 테스트로 WebView 동작 확인 완료 → 네이티브 netinfo 브리지(에러 핸들링 로드맵 N-3) 보강 불필요

### [KEND] 문서 체계 정비 (overview/changelog 운영 방식)

- **overview.md를 단일 대시보드로 복구**(stale 4월본 → 현재 상태) + 작성 표준을 `core/readme-structure-guide.md §8`(방식 vs 내용 구분)로 명문화 — 3개 프로젝트 공통
- **`/changelog` 명령어 개편**: changelog(git 기준 누락분 append) + overview(현황 CRUD)를 함께 갱신하도록. kend/native/seller 동일 적용

---

## 2026-06-23

### [KEND] 계획 문서 현실화 (milestones / roadmap)

- 코드 실측으로 보드 정정: **주문/결제 도메인 거의 구현됨**(주문 스키마 전체·주문 생성·TossPayments Confirm API·결제 success/fail 페이지·결제 위젯). 남은 건 `PAYMENT_COMING_SOON` 해제 + Toss 테스트 키(EXT-3) + E2E 테스트
- **휴대폰 인증(SMS OTP) 출시 후로 이연** 반영(이메일 비밀번호 재설정으로 대체, 아이디 찾기 제거). **RLS 전무(DB 전체 ~33개 테이블) → 출시 전 하드닝(P4-3)으로 일정화**
- iOS 심사 2달+ 정체 대응 트랙(ASC 상태/Resolution Center 확인 → escalate → 빌드 리셋 재제출) 명시

---

## 2026-06-17

### [KEND] 로그인/비밀번호 재설정 UX 수정

- **문구 통일**: 로그인 화면의 "비밀번호 찾기" → "비밀번호 재설정" (find-password 페이지 제목도 동일하게 변경)
- **로그인 실패 메시지 수정**: 비밀번호 오류 시 "알 수 없는 오류"로 표시되던 문제 해결. `error-handler` 가 Supabase `AuthError`(Error 인스턴스이면서 `code` 보유)를 `instanceof Error` 로 먼저 처리해 `code`(invalid_credentials) 매핑을 건너뛰던 순서 버그 → code 우선 확인하도록 수정 + 메시지 fallback 추가 → "이메일 또는 비밀번호가 올바르지 않아요" 정상 표시
- **token_hash 재설정 검증**: 메일 링크의 화면 미입력 검증은 브라우저 네이티브(`required`) 사용 중 — 폼 validation 표준화는 별도 todo 로 분리 ([form-validation-standard.md](./todo/form-validation-standard.md))

### [KEND] 이메일 기반 비밀번호 재설정 추가 + 아이디 찾기 제거

- **비밀번호 찾기** (`/auth/find-password`): 이메일 입력 → Supabase `resetPasswordForEmail` 로 재설정 링크 발송(redirectTo = `REDIRECT_LOGIN_URL/auth/reset-password`). 이메일 존재 여부/계정 유형은 노출하지 않고 항상 동일 응답(열거 방지)
- **비밀번호 재설정** (`/auth/reset-password`): 메일 링크 도착지. loader 가 `code` 를 세션으로 교환(소셜 콜백과 동일 패턴) 후 깨끗한 URL 로 redirect, 새 비밀번호 입력 → `updateUser` → 로그아웃 후 로그인 이동. 무효/만료 링크 안내 포함
- **아이디 찾기 제거**: 본인 인증 수단(휴대폰 등) 없이는 이메일을 안전하게 되돌려줄 방법이 없어 기능 제외. 로그인 페이지에서 "아이디 찾기" 링크 삭제(404 나던 링크 정리)
- 소셜 가입자가 자기 소셜 이메일로 재설정하면 비밀번호가 추가되어 이메일 로그인도 가능해짐(허용)
- 참고: 로그인 시도제한/캡차 등 하드닝은 별도 항목으로 보류

### [KEND] 휴대폰 인증(SMS OTP) 출시 후로 보류 결정

- **결정**: 휴대폰 SMS 인증을 MVP에서 제외하고 출시 후로 이연. SMS OTP는 본인인증(NICE)이 아니라 번호 점유 확인일 뿐이고, 비밀번호 찾기는 Supabase 이메일 재설정으로 대체 가능하며 출시 블로커가 아님
- **코드 보존**: 휴대폰 인증 전체 구현(가입 게이트/OTP Edge Function/추가정보/아이디·비번 찾기/번호 중복방지/트리거 정비)은 **`feature/phone-auth` 브랜치(commit d6ec2b0)** 에 커밋해 보존. kend-newbuild 에는 미반영(원복)
- **대체**: 출시 전 계정 복구는 이메일 기반 비밀번호 재설정으로 처리
- 상세: [readme/todo/phone-auth-plan.md](./todo/phone-auth-plan.md) 상단 보류 배너 참조

---

## 2026-05-07

### [KEND] iOS swipe back UX 개선 — clientLoader 캐시 도입 (부분 적용)

- **증상**: iOS WebView에서 화면 B에서 swipe back 시, A 미리보기가 잠시 보였다가 B로 다시 돌아와 GlobalLoadingBar가 뜬 뒤 A로 이동. 모든 화면에서 재현
- **원인 진단**: 임시 진단 오버레이로 데이터 수집한 결과, swipe back은 풀 리로드가 아닌 **순수 SPA popstate 네비게이션**임을 확인. React Router v7의 single fetch가 매 navigation마다 loader를 재실행 → loader 도는 동안 from-route(B)가 계속 표시되며 GlobalLoadingBar가 노출. `shouldRevalidate`로는 single fetch를 막지 못함
- **해결**: `clientLoader`로 URL 단위 클라이언트 캐시. 헬퍼 `app/lib/with-client-cache.ts`의 `makeCachedClientLoader<T>()` 신규 작성. 동일 URL 재진입 시 서버 fetch 생략 → loader 단계 없이 즉시 idle 상태로 복귀
- **적용 라우트 (이번 작업)**: `/stores`(stores-page), `/stores/:storeId`(store-page) 두 개. 두 라우트가 도착지인 swipe back 흐름은 부드럽게 작동 확인
- **미적용**: 그 외 모든 라우트는 그대로. 작업 항목은 [readme/todo/client-loader-cache-rollout.md](./todo/client-loader-cache-rollout.md) 참고
- **참고 변경**:
  - `entry.server.tsx`의 NO_STORE 경로/캐시 헤더는 이번 분석 결과 swipe back UX와 무관함이 밝혀졌으나, 보안/캐시 정책상 그대로 유지
  - `kend-native`측 `onShouldStartLoadWithRequest`로 backforward 시 로딩 오버레이 차단 변경은 별도 진행 (changelog-native 참고)

---

## 2026-04-17

### [KEND] 1차 내부 테스트 피드백 반영 (회원가입/약관/헤더/캐시)

- **이메일 가입 페이지 하단 짤림 수정**: `join-page.tsx`에서 `min-h-screen` → `h-screen`으로 변경하고 `overflow-y-auto` 추가. 부모 레이아웃(`h-screen overflow-hidden`)에서 스크롤 불가하던 문제 해결. 약관 영역 `mt-auto` 제거
- **이용약관/개인정보 404 해결**: 비로그인 상태에서 로그인 페이지의 `/terms`, `/privacy` 링크 클릭 시 404 발생하던 문제. `common/pages/terms-page.tsx`, `privacy-page.tsx`를 신규 생성해 최상위 라우트 등록, `root.tsx`의 `publicPaths`에 추가
- **약관/개인정보 콘텐츠 공통 컴포넌트화**: `common/components/terms-content.tsx`, `privacy-content.tsx`로 데이터+렌더링 분리. `features/users/pages/terms-page.tsx`, `privacy-page.tsx`와 `common/pages/`의 두 공개 페이지가 동일 컴포넌트를 렌더링하도록 통합 (마이페이지 진입 경로와 비로그인 공개 경로 모두 지원)
- **로그인/가입 링크 텍스트 간격**: 로그인 페이지의 "아직 회원이 아니신가요? 가입하기"와 가입 페이지의 "이미 회원이신가요? 로그인하기"에 `gap-2` 적용
- **헤더 홈버튼 UX 재설계**: 하위 페이지 헤더의 우측 검색 돋보기를 홈 아이콘으로 대체. 1depth(bottom nav 노출 페이지)는 검색+장바구니, 하위 페이지는 홈+장바구니 구조로 통일
- **SSR Cache-Control 헤더 설정 (bfcache 대응)**: `app/entry.server.tsx` 신규 생성. iOS WKWebView 스와이프 뒤로가기 시 이전 화면이 잠깐 보였다가 재로드되는 현상(bfcache 미작동)을 개선하기 위해 `/auth/*`는 `no-store`, 그 외 경로는 `private, max-age=0, must-revalidate`로 Cache-Control 자동 설정

---

## 2026-04-16

### [KEND] 1차 내부 테스트 기반 UI/UX 개선 (10건)

- **입력필드 줌 방지**: `root.tsx` viewport meta에 `maximum-scale=1, user-scalable=no` 추가. iOS에서 input focus 시 화면 확대 후 복귀되지 않던 문제 해결
- **가로 스크롤바 숨김**: `app.css`에 `overflow-x-auto/scroll` 요소의 scrollbar 숨김 CSS 추가 (스토어 상품 목록, 추천 상품 등)
- **상품 이미지 dot indicator**: `product-page.tsx`에 Embla Carousel API 연동으로 이미지 하단에 현재 슬라이드 dot 표시
- **검색 UI 개선 4건**: 검색어 clear(X) 버튼 추가, 검색필드 내부 input 라인 제거 및 크기 조정, 급상승 검색어 클릭 시 검색 연결(`Link`), 검색결과 하단 추천상품 width 중첩(`px-4`) 제거
- **성장기록 차트 개선**: 마지막 차트(머리둘레) 하단 `border-b` 및 과도한 `pb-8` 제거 (`isLast` prop 추가)
- **자녀 삭제 확인 팝업**: `edit-child-page.tsx`에서 인라인 확인란 → `useAlert`의 `confirm()` 팝업으로 교체
- **상품상세 floating top 버튼**: 스크롤 300px 초과 시 우하단에 맨 위로 이동 버튼 표시
- **하위 페이지 홈버튼**: `header.tsx`의 뒤로가기 버튼 옆에 홈(스토어) 아이콘 추가
- **테스트 결과 문서화**: `readme/internal-test-1st.md` 작성 (18건 항목, 수정 대상/상태 표)

### [KEND] 1차 내부 테스트 피드백 반영

- **머리둘레 차트 하단 여백 추가 조정**: `isLast`일 때 `pb-2`로 변경하여 카드 간 간격과 동일한 수준으로 축소
- **floating top 버튼 미노출 수정**: `content.tsx`에 `data-slot="content-main"` 추가, `product-page.tsx`에서 해당 selector로 스크롤 컨테이너 정확히 타겟팅. 기존에는 `root.tsx`의 `<main>`이 먼저 잡혀 scrollTop이 항상 0이라 버튼이 표시되지 않던 문제 해결

---

## 2026-04-15

### [KEND] Apple 가입자 profiles row 자동 생성 트리거 추가

- **`user_to_profile_trigger.sql`**: `handle_new_user` 트리거에 `apple` provider 분기 추가. Apple은 메타데이터가 빈약해 `username`은 `name` → email 앞부분 → `'Anonymous'` 순으로, `nickname`은 `name` → `mr.XXXXXXXX` 랜덤 생성 순으로 fallback 처리
- **원인**: 기존 트리거가 `email`/`kakao`/`google`만 처리하고 `apple`은 무시해서, Apple 가입 시 `auth.users`에는 row가 생성되지만 `public.profiles`에는 row가 만들어지지 않음. 이로 인해 프로필 수정 페이지 loader(`getUserProfile`)가 throw → UI에 "로그인이 필요합니다" 오메시지 노출
- **적용 방법**: Drizzle schema가 아닌 raw SQL 파일이라 Supabase SQL Editor에서 수동 적용 필요

### [KEND] 이용약관 전문 교체

- **`terms-page.tsx` 약관 내용 전면 교체**: 기존 9개 간이 조항 → KEND 서비스 이용약관 전문(제1장 총칙 / 제2장 KEND 플랫폼 서비스 / 제3장 기타 사항, 제1~36조 + 부칙)으로 교체
- **장(章) 구조 렌더링**: `TermsEntry` 타입을 `chapter | article` 판별 유니언으로 도입해 장 헤더와 조문을 구분 표시

### [KEND] 결제 기능 "서비스 준비 중" 처리 (iOS 심사 대응)

- **`product-purchase-modal.tsx`**: `PAYMENT_COMING_SOON` 플래그 추가. true인 동안 TossPayments 위젯 초기화(`useEffect`)를 스킵하고, 결제 수단 영역에 "서비스 준비 중입니다" 안내 박스 표시, 결제 버튼은 비활성화 + "서비스 준비 중" 라벨 노출
- **배경**: 4/14 iOS 심사 반려(`readme/ios-review-rejection-apr14.md`) 대응 — 결제 미구현 상태로 노출되는 것을 회피

### [KEND] Apple 소셜 로그인 연결

- **`social-buttons.tsx`**: Apple 버튼을 기존 "준비중" 알림 → `/auth/social/apple/start` 링크로 전환. `useAlert` 의존 제거
- **`social-start-page.tsx` / `social-complete-page.tsx`**: provider zod enum 및 분기 조건에 `"apple"` 추가 (Supabase `signInWithOAuth` + `exchangeCodeForSession` 경로 그대로 재사용)
- **`scripts/generate-apple-secret.cjs` 추가**: Apple Sign In client secret JWT 생성 스크립트(`jsonwebtoken` 사용)
- **`package.json`**: `jsonwebtoken ^9.0.3` devDependency 추가
- **`.gitignore`**: Apple `*.p8` / `AuthKey_*.p8` 키 파일 커밋 방지 규칙 추가

### [KEND] 마이페이지 하위 페이지 신설 및 라우팅 정리

- **신규 페이지 6종 추가** (`app/features/users/pages/`):
  - `recent-products-page.tsx` — 최근 본 상품 (placeholder)
  - `notifications-page.tsx` — 알림 설정
  - `notices-page.tsx` — 공지사항 및 FAQ
  - `support-page.tsx` — 고객지원
  - `terms-page.tsx` — 이용약관
  - `privacy-page.tsx` — 개인정보 처리방침
- **`routes.ts`**: `myPage` prefix 하위에 위 6개 라우트 등록
- **`my-page.tsx`**: 메뉴 링크를 전부 `/myPage/*` 경로로 이전 (`/recent-products`, `/settings/notifications`, `/notices`, `/support`, `/terms`, `/privacy` → `/myPage/...`)

### [KEND] iOS 심사 반려 문서화

- **`readme/ios-review-rejection-apr14.md` 작성**: 4/14 Apple iOS 심사 반려 사유 및 대응 기록

---

## 2026-04-14

### [KEND] 상품 검색 기능 추가 + 추천 상품 안정화 + Apple 로그인 준비중 처리

- **상품명 LIKE 검색 추가**: `features/search/queries.ts`에 `searchProductsByName()` 추가(`.ilike("name", "%q%")`, 최대 50건, 판매 가능 상품만). `search-page.tsx` loader가 `?q=` 쿼리를 읽어 결과 반환, Form GET으로 제출. 검색 결과는 2열 그리드로 표시하고 결과 없음/빈 상태 처리
- **추천 상품 라우팅 시 재섞임 방지**: `recommend-products.tsx`를 모듈 스코프 캐시 기반 클라이언트 페치로 재작성(`browserClient` + `getRandomProducts(20)` 1회 로드). 페이지 이동/리페치 시 추천 목록이 먼저 업데이트되어 흔들리던 문제 해결
- **추천 상품 현재 화면 상품 제외**: `RecommendProducts`에 `excludeIds` prop 추가. 상품 상세(`product-page`)는 현재 상품 ID, 장바구니(`shopping-cart-page`)는 담긴 상품 ID, 검색(`search-page`)은 검색 결과 상품 ID를 전달해 중복 노출 제거. 각 페이지 loader에서 `getRandomProducts` 호출 제거
- **Apple 소셜 로그인 준비중 팝업**: `social-buttons.tsx`의 Apple 버튼을 `useAlert`로 "준비중입니다" 안내 팝업 표시하도록 변경(나머지 소셜 provider는 그대로 유지)

### [KEND] 좋아요 페이지 실데이터 연결 + 추천 상품 랜덤 표시

- **좋아요 페이지 실데이터 연결**: `likes-page.tsx`에 loader 추가, `getLikedProducts` 쿼리로 실제 좋아요 상품 표시. `like-product-card.tsx`를 `LikedProduct` 타입 기반으로 재작성 (상품명, 이미지, 가격, 할인율, 판매자)
- **추천 상품 랜덤 표시**: `products/queries.ts`에 `getRandomProducts()` 쿼리 추가, `recommend-products.tsx`를 props 기반으로 재작성. 검색(`search-page`), 장바구니(`shopping-cart-page`), 상품 상세(`product-page`) 3곳 적용
- **검색 페이지 레이아웃 개선**: 검색 입력 고정 폭(`w-56`) → `flex-1`, 급상승 검색어 고정 폭(`w-40`) → `grid grid-cols-2`로 화면 너비에 맞춤 처리

### [KEND] 소셜 로그인(Google/Kakao) OAuth 콜백 임시 처리

- **`home-page.tsx` 수정**: Supabase PKCE flow가 Site URL(`/`)로 `?code=xxx`를 보내는 문제 대응 — `/?code=`가 있으면 `exchangeCodeForSession`으로 세션 교환 후 `/stores`로 redirect
- **원인**: Supabase는 프로젝트당 Site URL이 하나라서, 프로덕션(`vercel.app`)으로 설정하면 `redirectTo` 파라미터가 무시되고 Site URL 기준으로 콜백이 옴
- **Supabase 프로젝트 dev/prod 분리 시 제거 예정**

### [KEND] 환경 분리 계획 문서 작성

- **`readme/environment-separation-plan.md` 작성**: Supabase dev/prod 프로젝트 분리 계획, 현재 임시 처리 내용, 운영 규칙 정리

### [KEND] 소셜 로그인 디버그 로그 정리

- `social-start-page.tsx`, `social-complete-page.tsx`, `naver-callback-page.tsx`에서 디버그용 `console.log` 제거

---

## 2026-04-13

### [KEND] BottomNavigation `/children` 인덱스 페이지 미표시 수정

- **`root.tsx` BottomNavigation 표시 조건 재작성**: 기존 `naviMenus.includes()` + 복잡한 children 분기 → 명시적 경로 매칭(`/stores`, `/children`, `/children/숫자`, `/likes`, `/myPage`)으로 단순화
- **원인**: `/children` 인덱스 경로가 조건에서 빠져있어 성장기록 첫 페이지에서 하단 네비게이션 미노출

### [KEND] Google OAuth 302 redirect → JS redirect 변경

- **`social-complete-page.tsx` 수정**: 서버 302 redirect(`redirect("kend://...")`) → 클라이언트 페이지 렌더 후 `window.location.href`로 딥링크 전달 방식 변경
- **배경**: Vercel/외부 브라우저에서 `kend://` 커스텀 스킴에 대한 302 redirect가 차단되어 앱으로 돌아오지 못하는 문제 해결

---

## 2026-04-10

### [KEND] Google OAuth 딥링크 토큰 전달 방식 구현

- **`social-complete-page.tsx` 수정**: Google OAuth 콜백에서 세션 교환 후 `kend://auth/callback?access_token=...&refresh_token=...`으로 딥링크 redirect
- **배경**: 외부 브라우저(WebBrowser.openAuthSessionAsync) ↔ WebView 간 쿠키 미공유 → 토큰을 딥링크로 전달, RN에서 `setSession()`으로 세션 설정
- **카카오**: WebView 내부에서 동작하므로 기존 방식(`/` redirect) 유지

### [KEND] 네이버 로그인 Edge Function redirect URL 환경변수화

- **`create-naver-user.ts` 수정**: `redirectTo` 하드코딩(`http://localhost:5173`) → `Deno.env.get("SITE_URL")` 환경변수로 변경
- **Supabase Edge Function Secrets에 `SITE_URL` 추가**: `https://kend-seven.vercel.app` 설정 후 재배포
- **Vercel CLI 연동**: `vercel link`로 프로젝트 연결, 환경변수 확인 체계 구축

### [KEND] 회원탈퇴 기능 추가

- **`my-page.tsx`에 action 추가**: `service_role` 키로 `auth.admin.deleteUser()` 호출, CASCADE로 하위 데이터(profiles, children, addresses, carts, likes, orders 등) 자동 삭제
- **`.env`에 `SUPABASE_SERVICE_ROLE_KEY` 추가**: 서버 사이드 Admin API 호출용
- **UI**: 로그아웃 버튼 하단에 "회원탈퇴" 텍스트 링크, `useAlert(confirm)`으로 2단계 확인 후 처리
- **탈퇴 완료 후**: 클라이언트 signOut + 로그인 페이지로 redirect

### [KEND] Link Prefetch 적용 및 클라이언트 렌더링 전환 계획 수립

- **주요 네비게이션에 `prefetch="intent"` 적용**: 사용자가 터치하는 순간 loader를 미리 호출하여 페이지 전환 체감 속도 개선
  - BottomNavigation (스토어, 성장기록, 좋아요, 마이페이지)
  - CartIcon (장바구니)
  - StoreCard (스토어 상세), ProductCard (상품 상세), LikeProductCard (좋아요 상품), ChildCard (자녀 편집)
- **`readme/client-rendering-plan.md` 작성**: SSR loader → React Query + clientLoader 전환 장기 계획 정리 (Phase 0: Prefetch, Phase 1: React Query 도입)

---

## 2026-04-09

### [KEND] 글로벌 페이지 전환 로딩 인디케이터 추가

- **`root.tsx`에 `GlobalLoadingBar` 컴포넌트 추가**: `useNavigation()` 상태 감지, 페이지 이동 시 상단에 secondary 색상 프로그레스 바 표시
- **`app.css`에 `animate-progress` 애니메이션 추가**: 0%→95% ease-out 2초, 로딩 완료 시 자동 해제
- **배경**: React Router SSR 특성상 loader 실행 중 시각적 피드백이 없어 "눌렸는지 모르겠다" UX 문제 해결

---

## 2026-04-03

### [KEND] 이미지 업로드 사전 검증 추가

- **`app/lib/validate-image.ts` 신규 생성**: `validateImageFile()` — 5MB 이하, JPG/PNG/WebP만 허용
- **프로필 수정(`edit-profile-page.tsx`)**: 클라이언트 이미지 선택 시점에 검증, 실패 시 alert 표시
- **자녀 등록/수정(`submit-child-page.tsx`, `edit-child-page.tsx`)**: 서버 action에서 업로드 전 검증, 실패 시 에러 반환

### [KEND] 폼 Validation Zod 스키마 확대 적용

- **자녀 등록/수정**: `childSchema` — 닉네임(필수, 20자), 생년월일(필수), 이름(20자), 성별. `submit-child-page.tsx`, `edit-child-page.tsx`에 적용
- **프로필 수정**: `profileSchema` — 닉네임(필수, 20자), 한줄소개(100자), 기타메세지(500자). `edit-profile-page.tsx`에 적용
- **로그인**: `loginSchema` — 이메일(형식검증), 비밀번호(필수). `login-page.tsx`에 적용 + `actionErrorResponse` 연동
- **회원가입**: `signupSchema` — 이메일(형식), 비밀번호(6자+), 비밀번호확인(일치 refine), 닉네임(20자). `join-page.tsx`에 적용 + `actionErrorResponse` 연동
- **방침**: 별도 validation 파일 분리 없이 각 action 파일 내에 스키마 정의

### [KEND] ErrorBoundary Fallback UI 개선

- **`root.tsx` ErrorBoundary 재작성**: 영문 기본 메시지 → 한국어 안내 ("문제가 발생했어요", "페이지를 찾을 수 없어요")
- **복구 버튼 추가**: "홈으로" (a 태그) + "다시 시도" (window.location.reload) 버튼 제공
- **프로덕션 스택트레이스 비노출**: DEV 환경에서만 에러 스택 표시

### [KEND] Toast(sonner) 연동

- **`root.tsx`에 `<Toaster />` 마운트**: `position="top-center"`, `richColors`, `duration={3000}` 설정
- **`address-add-modal.tsx` 적용**: 기존 TODO 주석(`console.error`) → `toast.error()`로 교체
- **사용 기준 정립**: 가벼운 에러 피드백은 toast, 사용자 확인/선택이 필요한 경우는 기존 `useAlert` 유지

### [KEND] Auth 토큰 만료 자동 감지 및 로그인 리다이렉트

- **`app/hooks/useAuthListener.ts` 신규 생성**: Supabase `onAuthStateChange`로 `SIGNED_OUT` 이벤트 구독, 세션 만료 시 자동으로 `/auth/login`으로 이동
- **`app/root.tsx` 적용**: `App` 컴포넌트에서 `useAuthListener()` 호출하여 앱 전역에서 인증 상태 감지
- **인증 에러 판별 유틸 추가**: `error-handler.ts`에 `isAuthError()`, `isSessionExpiredError()` 함수 추가

---

## 2026-04-01

### [KEND] 공통 에러 핸들러 구현 및 전체 action 적용

- **`app/lib/error-handler.ts` 신규 생성**: `AppError` 타입, `parseSupabaseError()`, `actionErrorResponse()` 구현
- **PostgreSQL 에러코드 자동 매핑**: `23505`(중복), `23503`(참조), `23502`(NOT NULL), `23514`(CHECK), `42501`(RLS 위반), `PGRST116`(not found) 등을 한국어 사용자 메시지로 변환
- **Auth/Storage/네트워크 에러 파싱**: JWT 만료, 인증 실패, 파일 크기 초과, 네트워크 오류 등 에러 유형별 메시지 자동 분기
- **기존 action 8개 파일에 적용**: address-action, order-action, edit-profile-page, submit-child-page, edit-child-page, children-page, growth-detail-page에서 하드코딩 에러 메시지를 `actionErrorResponse()`로 교체
- **미보호 action에 try-catch 추가**: shopping-cart-page, product-page의 action에 에러 핸들링 래핑 추가 (기존에는 mutation throw 시 ErrorBoundary에 의존)

### [KEND] 출시 전 완성도 강화 로드맵 작성

- **`readme/kend-error-handling-roadmap.md` 작성**: 코드베이스 분석 기반 에러 처리 로드맵 v2.0
- **Part 1 (웹앱)**: 3주 계획 — 1주차(에러 구조화, Auth, Toast, ErrorBoundary, RLS), 2주차(오프라인 감지, Validation, 이미지 검증, 결제, Edge Function), 3주차(PostHog, console.log 정리, QA)
- **Part 2 (RN 네이티브)**: WebView 에러 처리, 네이티브 브리지, 네트워크 감지, 크래시 리포팅, 권한 처리

---

## 2026-03-24

### [KEND] 네이버 소셜 로그인 버그 수정

- **원인**: `create-naver-user` Edge Function에서 `listUsers()`로 기존 유저를 검색할 때, 다른 provider로 가입한 동일 이메일 유저를 찾지 못해 `createUser` 중복 에러 발생 → `link`가 `undefined`로 반환되어 `/auth/naver/complete/undefined`로 리다이렉트
- **수정**: `listUsers()` 기반 검색 제거, `createUser`를 먼저 시도하고 이미 존재하는 유저면 에러를 무시한 뒤 `generateLink`로 magic link만 발급하는 방식으로 변경
- **에러 핸들링 추가**: `naver-complete-page.tsx`에서 토큰 교환 실패, 프로필 조회 실패, Edge Function 응답 실패 시 `/auth/login`으로 에러 파라미터와 함께 리다이렉트
- **Edge Function 로컬 관리**: `app/sql/functions/create-naver-user.ts`에 Edge Function 코드 추가

---

## 2026-03-05

### [KEND] 성장 그래프 DB 기반 백분위 비교 기능 개선

- **Supabase RPC 추가**: `get_growth_percentile_history` 함수로 동일 성별·월령의 Kend 전체 사용자 데이터와 비교하여 백분위 이력 반환
- **백분위 계산 방식 변경**: 기존 LMS(질병관리청 기준) → 실제 DB 사용자 데이터 기반 상대 백분위 (`내 아이보다 낮은 값의 수 / 전체 수 × 100`)
- **더미 데이터 추가**: `is_dummy` 컬럼을 `children` 테이블에 추가, 백분위 비교 표본용 더미 아이 100명 + 성장 기록 3,674건 삽입
- **차트 개선**: 백분위 추이(0~100%) 차트로 변경, Y축 25/50/75% 기준선 표시, 최신 포인트 마커 표시
- **X축 동적 간격**: 데이터 수에 따라 tick 간격 자동 조절 (≤6개: 전부, 7~12개: 2개마다, 13~24개: 3개마다, 25개+: 6개마다)
- **UI 미세 조정**: 라인 점(dot) 제거, 최신 포인트 마커 크기 축소 (`r=6` → `r=4`)
- **타입 갱신**: `db:typegen` 실행 후 RPC 타입 적용, `as any` 제거

---

## 2026-03-03

### [KEND] 판매자 배너 노출 기능 추가

- **스토어 목록 배너**: 전체 판매자의 활성 배너 중 무작위 최대 5개를 스토어 목록 상단에 노출 (`getRandomBanners`)
- **스토어 상세 배너**: 해당 판매자가 등록한 활성 배너를 `display_order` 순으로 최대 5개 노출 (`getSellerBanners`)
- **Banner 컴포넌트 개선**: 기존 빈 플레이스홀더에서 embla-carousel 기반 이미지 슬라이더로 교체, dot indicator 추가 (현재 슬라이드 강조 + 클릭 이동), `loop: true` 옵션 적용
- **배너 없을 시**: 기존 빈 플레이스홀더 UI 유지

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
