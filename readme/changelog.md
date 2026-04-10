# Changelog

프로젝트의 주요 변경사항을 날짜별로 기록한다.
시스템 구분을 위해 `[KEND]` 또는 `[KEND-SELLER]` prefix를 사용한다.

> - 이 파일은 Kend / Kend-Seller 양쪽에서 수동으로 동기화한다.
> - 최신 내용이 위로 오도록 역순(최신순)으로 작성한다.

---

## 2026-04-10

### [KEND-NATIVE] 소셜 로그인 OAuth redirect 처리

- **Google OAuth 인앱 브라우저 전환**: `Linking.openURL()` → `expo-web-browser`의 `openAuthSessionAsync()`로 변경하여 SFSafariViewController(iOS) / Chrome Custom Tabs(Android)에서 로그인 처리
- **딥링크 수신 처리**: `kend://` 스킴 URL 수신 시 WebView를 해당 경로로 이동하는 리스너 추가 (warm start + cold start 모두 대응)
- **세션 토큰 주입**: 외부 브라우저 ↔ WebView 간 쿠키 미공유 문제 해결을 위해, 딥링크로 전달받은 `access_token`/`refresh_token`을 WebView에 JavaScript로 주입하여 `supabase.auth.setSession()` 호출
- **Naver/Kakao OAuth**: WebView 내부에서 정상 동작 확인, 별도 처리 불필요

### [KEND-NATIVE] Splash 이미지 전체 화면 적용

- **스플래시 이미지 교체**: 기본 템플릿 `splash-icon.png` → 커스텀 `kend-splash-1080x1920.png`로 변경
- **전체 화면 표시**: `resizeMode: "contain"` + `imageWidth: 200` → `resizeMode: "cover"`로 변경하여 전체 화면에 꽉 차게 표시

---

## 2026-04-09

### [KEND-NATIVE] Google OAuth 외부 브라우저 처리

- **WebView 내 Google 로그인 차단 대응**: Google의 `disallowed_useragent` 정책으로 인해 WebView 내부에서 Google OAuth가 403 에러 발생
- **외부 브라우저 리다이렉트**: `accounts.google.com` URL 감지 시 `expo-linking`으로 시스템 브라우저(Chrome/Safari)에서 열도록 처리
- **`onShouldStartLoadWithRequest` 활용**: WebView의 URL 요청을 가로채서 외부 브라우저 패턴 매칭 후 분기 처리

### [KEND-NATIVE] Splash 화면 및 로딩 UX 개선

- **Splash 유지 시간 연장**: 레이아웃 마운트 즉시 숨기던 방식에서 → WebView 첫 로드 완료 시까지 Splash 유지
- **로딩 오버레이 반투명 처리**: 흰 배경(`#ffffff`) → 반투명 배경(`rgba(255,255,255,0.5)`)으로 변경하여 뒷 화면이 비치도록 개선
- **첫 로드 시 로더 미표시**: Splash가 표시되는 동안에는 로딩 인디케이터를 숨기고, 이후 페이지 이동 시에만 반투명 로더 표시

### [KEND-NATIVE] iOS 빌드 및 App Store 제출

- **iOS 빌드 환경 구축**: Apple Distribution Certificate, Provisioning Profile 자동 생성 (EAS 관리)
- **App Store Connect 연동**: `eas.json`에 `ascAppId`, `appleTeamId` 설정, App Store Connect API Key 생성
- **iOS production 빌드 및 제출**: `eas build` → `eas submit`으로 App Store Connect에 빌드 업로드 완료

---

## 2026-03-13

### [KEND-NATIVE] 앱 초기 설정 및 Android/iOS 빌드 환경 구축

- **프로젝트 초기 구성**: Expo + WebView 기반 사용자 앱(kend) 래핑 구조 구축
- **WebView 구현**: 뒤로가기(Android 하드웨어 버튼 + iOS 스와이프), 로딩 인디케이터, 에러 화면(다시 시도) 구현
- **앱 설정 완료**: 패키지명(`com.kend.app`), 딥링크 스킴(`kend://`), 아이콘/스플래시 경로 설정
- **EAS Build 환경 구축**: preview(APK), production(AAB) 빌드 프로필 설정, Android Keystore 생성
- **빌드 완료**: Android preview APK 빌드 성공, production AAB 빌드 준비 완료
- **불필요한 의존성 제거**: Expo 템플릿 기본 패키지 중 미사용 패키지 정리
- **문서화**: `readme/kend-native.md` 작성 (기술 스택, 프로젝트 구조, 빌드 방법, 버전 관리 규칙)

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
