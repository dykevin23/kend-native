# auth-model.md

## Notes for AI Assistants

- 이 문서는 Kend 플랫폼의 인증(Authentication) 및 인가(Authorization) 모델을 설명하는 기준 문서이다.
- 사용자 앱(Kend)과 판매자 사이트(Kend-Seller)는 본 문서를 동일하게 따른다.
- 코드 생성 및 수정 시 본 문서를 기준으로 Auth 흐름, Role 처리, 권한 분기를 설계한다.

---

## 1. Authentication Overview

Kend 플랫폼은 **Supabase Auth**를 기반으로 단일 인증 시스템을 사용한다.

- 사용자 앱(Kend)과 판매자 사이트(Kend-Seller)는 동일한 Auth 프로젝트를 공유한다.
- 인증 방식은 Email/Password 및 Social Login(OAuth)을 지원한다.
- 인증 이후의 권한 제어는 DB 레벨의 RLS 정책을 통해 수행한다.
- 사용자 앱(Kend)는 2가지 방식(email/password와 social login)을 모두 사용하지만, 판매자 사이트(Kend-Seller)는 email/password만으로 로그인한다.

---

## 2. Supported Login Methods

### 2.1 Email / Password

- Supabase Auth 기본 기능을 사용한다.
- 회원가입 시 이메일 인증(Email Confirmation)을 사용한다.
- 비밀번호 재설정은 Supabase 제공 플로우를 따른다.

---

### 2.2 Social Login (OAuth)

지원하는 Social Login 방식은 다음과 같다.

- Google (Supabase Auth 제공)
- Kakao (Supabase Auth 제공)
- Naver (Supabase 미지원 → Custom OAuth 구현)
- Social Login 1종 추가 예정 (TBD)

#### Naver OAuth 처리 방식

- Naver OAuth 인증 플로우는 Custom OAuth 방식으로 직접 구현한다.
- 인증 성공 후:
  - Supabase Admin API를 사용해 사용자 계정을 생성하거나
  - 기존 계정과 연결한다.
- 이후 Supabase 세션(JWT)을 발급받아 동일한 인증 흐름으로 처리한다.

---

## 3. User Identity Model

Supabase Auth의 `auth.users` 테이블을 기준으로 사용자 식별을 수행한다.

- `auth.users.id` (UUID)는 모든 사용자 관련 테이블의 기준 키로 사용된다.
- 사용자 확장 정보는 별도의 `profiles` 테이블에서 관리한다.

---

## 4. Role Model

Kend 플랫폼은 다음 3가지 Role을 정의한다.

| Role          | Description |
| ------------- | ----------- |
| customer      | 일반 사용자 |
| seller        | 판매자      |
| administrator | 관리자      |

- Role 정보는 DB에 저장되며, 클라이언트에서 신뢰하지 않는다.
- Role 기반 접근 제어는 DB 레벨(RLS)에서 강제한다.
- Kend(사용자 앱)과 Kend-Seller(판매자 사이트)는 동일한 Supabase Auth 시스템을 사용한다.
- 로그인 시 이메일/비밀번호 인증 자체는 공통으로 처리된다.
- 인증 이후, profile 테이블의 role 값을 기준으로 앱 접근을 제한한다.
  - Kend(사용자 앱): role = customer 인 사용자만 접근 가능
  - Kend-Seller(판매자 사이트): role = seller 인 사용자만 접근 가능

- 동일한 email/password를 사용하더라도,
  role이 다를 경우 각 앱에서는 서로 다른 사용자로 취급되며
  상대 앱에는 접근할 수 없다.

---

## 5. Authorization Strategy

### 5.1 Application Level

- 애플리케이션 레벨에서는 UI 접근 제어만 수행한다.
- 실제 데이터 접근 권한은 DB에서 결정된다.
- 클라이언트에서 전달된 role 값은 신뢰하지 않는다.

---

### 5.2 Database Level (RLS)

- 모든 주요 테이블은 RLS(Row Level Security)를 활성화한다.
- RLS 정책을 통해 다음을 제어한다.
  - 본인 소유 데이터 접근
  - 판매자 소유 데이터 접근
  - 관리자 전체 접근

> RLS 정책의 상세 내용은 `rls-policy.md` 문서를 따른다.

---

## 6. Session & Token Handling

- 인증 성공 시 Supabase는 JWT 기반 세션을 발급한다.
- 세션 정보는 다음과 같이 사용된다.
  - Server(loader/action): Supabase Server Client를 통해 검증
  - Client: Supabase JS Client를 통해 상태 유지
- Access Token 만료 시 Refresh Token을 통해 자동 갱신된다.

---

## 7. Server-side Authentication Flow (Remix / React Router)

- 모든 loader/action은 서버 환경에서 실행된다.
- 요청 시 Supabase Server Client를 통해 현재 사용자 세션을 확인한다.

### Example Flow

1. 요청 수신
2. Supabase Server Client로 세션 확인
3. 사용자 미인증 시 redirect 처리
4. 인증 성공 시 비즈니스 로직 수행

---

## 8. Multi-Application Considerations

- Kend와 Kend-Seller는 동일한 Auth 시스템을 사용하지만,
  접근 가능한 기능과 데이터는 Role 및 RLS에 의해 구분된다.
- 동일 사용자가 customer와 seller 역할을 동시에 가질 수는 없다.

---

## 9. Security Principles

- 모든 권한 검사는 서버 또는 DB 레벨에서 수행한다.
- 클라이언트는 신뢰하지 않는다.
- 최소 권한 원칙(Principle of Least Privilege)을 따른다.
- 인증/인가 관련 로직은 중앙화하여 관리한다.

---

## 10. Related Documents

- application-architecture.md
- database-schema.md
- rls-policy.md
