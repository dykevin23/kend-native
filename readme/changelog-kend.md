# Changelog (KEND)

KEND 웹앱(React Router SSR + WebView)의 주요 변경사항을 날짜별로 기록한다.

> - 최신 내용이 위로 오도록 역순(최신순)으로 작성한다.
> - 다른 시스템 변경 이력: [changelog-seller.md](./changelog-seller.md), [changelog-native.md](./changelog-native.md)

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
