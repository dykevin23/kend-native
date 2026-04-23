# iOS 스와이프 뒤로가기 URL Blacklist

> 2026-04-17 작성  
> kend-native에서 iOS 좌→우 스와이프 뒤로가기 제스처를 비활성화하고,  
> Android에서는 하드웨어 back 버튼 시 확인 Alert를 띄울 URL 패턴 정리

---

## 배경

- 특정 화면에서 의도치 않게 뒤로가기가 발생하면 입력 중인 데이터 유실, 결제 흐름 중단 등 UX 사고 가능
- 모달/바텀시트가 열린 화면은 Radix UI 오버레이가 전체 화면을 덮어 자연스럽게 스와이프가 차단되므로 별도 처리 불필요
- 따라서 **"해당 화면 URL 자체"**에 진입한 상태에서 스와이프를 막아야 하는 경우만 아래 리스트로 관리

---

## Blacklist URL 패턴

### 1. 인증 관련 (로그인/가입 플로우)

| URL 패턴                          | 설명                                  | 차단 사유                |
| --------------------------------- | ------------------------------------- | ------------------------ |
| `/auth/login`                     | 이메일 로그인                         | 입력 중 유실 방지        |
| `/auth/join`                      | 이메일 회원가입                       | 입력 중 유실 방지        |
| `/auth/social/:provider/start`    | 소셜 로그인 시작 (Google/Kakao/Apple) | OAuth 리다이렉트 진행 중 |
| `/auth/social/:provider/complete` | 소셜 로그인 완료 콜백                 | 세션 수립 중             |
| `/auth/naver/start`               | 네이버 로그인 시작                    | OAuth 리다이렉트 진행 중 |
| `/auth/naver/complete`            | 네이버 로그인 완료                    | 세션 수립 중             |
| `/auth/naver/callback`            | 네이버 콜백                           | 세션 수립 중             |

**추천 매칭**: `^/auth(/|$)` (전체 하위 경로)

---

### 2. 결제 콜백 (TossPayments 리턴 URL)

| URL 패턴            | 설명           | 차단 사유    |
| ------------------- | -------------- | ------------ |
| `/payments/success` | 결제 성공 콜백 | 승인 처리 중 |
| `/payments/fail`    | 결제 실패 콜백 | 실패 처리 중 |

**추천 매칭**: `^/payments(/|$)`

> 참고: 현재는 loader에서 즉시 redirect하는 구조라 URL에 머무르는 시간이 짧지만, 실 결제 오픈 시 사용자 대기 상태 방지

---

### 3. 자녀 정보 입력

| URL 패턴                    | 설명             | 차단 사유          |
| --------------------------- | ---------------- | ------------------ |
| `/children/submit`          | 자녀 등록        | 입력 폼, 유실 방지 |
| `/children/:childId/edit`   | 자녀 정보 수정   | 입력 폼, 유실 방지 |
| `/children/:childId/growth` | 성장 데이터 입력 | 입력 폼, 유실 방지 |

**추천 매칭**: `^/children/(submit|\d+/edit|\d+/growth)$`

---

## 최종 Blacklist 정규표현식

```regex
^/(auth|payments)(/|$)|^/children/(submit|\d+/(edit|growth))$
```

---

## Android 동작 권고

- 하드웨어 back 버튼 시 blacklist 경로라면 **확인 Alert** 표시
  - 예: "화면을 나가시겠습니까? 입력 중인 내용이 사라질 수 있어요."
  - 확인 → 앱 종료 또는 이전 화면 이동
  - 취소 → 현재 화면 유지
- 그 외 경로는 기존 동작 유지 (WebView back → 없으면 앱 종료)

---

## 확장 시 고려

- 향후 **휴대폰 인증 페이지**, **비밀번호 재설정 페이지** 추가 시 blacklist에 포함 필요
- **소셜 회원가입 추가정보 입력 페이지**(예정) 추가 시 포함 필요

---

## 관련 파일

- 라우트 정의: [app/routes.ts](../../app/routes.ts)
- 인증 페이지: `app/features/auth/pages/`
- 결제 페이지: `app/features/payments/pages/`
- 자녀 페이지: `app/features/children/pages/`
