# application-architecture.md

## Notes for AI Assistants

- 이 문서는 Kend 플랫폼 전체 아키텍처를 설명하는 기준 문서(single source of truth)이다.
- 코드 생성, 수정, 리팩토링, 설계 제안 시 본 문서를 최우선 컨텍스트로 참고한다.
- 본 문서에 명시되지 않은 사항은 보수적으로 가정하고, 필요한 경우 질문한다.

---

## 1. Introduction

Kend는 육아용품 중고거래 플랫폼으로,  
사용자가 입력한 자녀 정보(연령, 성장 데이터 등)를 기반으로  
자녀의 현재 상황에 적합한 상품을 추천하는 것을 목표로 한다.

플랫폼 내 거래 방식은 두 가지로 구성된다.

- 사용자 간 중고거래 (C2C)
- 판매자가 제공하는 상품 거래 (B2C)

사용자는 직접 상품을 등록하여 중고거래를 할 수 있으며,  
오프라인 및 온라인 판매자는 플랫폼을 통해 상품을 등록·판매할 수 있다.

---

## 2. Goal & Product Scope

### Core Features

Kend의 기능은 크게 다음 두 영역으로 나뉜다.

1. 사용자 간 중고거래
2. 판매자 상품 거래

사용자 앱 기준 주요 메뉴는 다음과 같다.

- 스토어 (판매자 상품 거래)
- 중고거래 (사용자 간 거래)
- 자녀 데이터
- 프로필

---

### MVP Roadmap

#### MVP Phase 1 (1차 목표)

- 1차 MVP의 핵심 목표는 판매자 상품 거래(B2C) 기능이다.
- 이 단계에서 Kend는 일반적인 쇼핑몰 시스템과 유사한 형태를 가진다.
- 사용자 앱(Kend)에서는:
  - 판매자가 등록한 상품을 조회, 주문, 결제할 수 있다.
- 판매자 사이트(Kend-Seller)에서는:
  - 상품 등록 및 수정
  - 재고 관리
  - 주문 및 배송 관리

> 사용자 간 중고거래 기능은 2차 MVP 범위에 포함된다.

---

#### MVP Phase 2 (2차 목표)

- 사용자 간 중고거래(C2C) 기능 추가 (TBD)

---

#### Final Model (최종 목표)

- 사용자가 입력한 자녀 데이터를 기반으로
  - 자녀의 연령 및 성장 단계에 적합한 상품을 추천
- 추천 대상에는
  - 판매자 상품(B2C)
  - 사용자 중고 상품(C2C)
    모두 포함된다.

---

## 3. System Architecture Overview

- Kend 플랫폼은 2개의 애플리케이션과 1개의 공통 데이터베이스로 구성된다.
  - Kend: 사용자 앱
  - Kend-Seller: 판매자 사이트
  - Database: Supabase (단일 인스턴스)
- 두 애플리케이션은 동일한 기술 스택을 기반으로 한다.

---

## 4. Applications

### 4.1 Kend (User Application)

- Kend는 사용자용 애플리케이션이다.
- React Native 기반의 크로스 플랫폼 앱으로 개발되며,
  향후 Android / iOS 네이티브 앱으로 배포될 예정이다.
- 현재 구조는 다음과 같다.
  - 모바일 전용(Mobile Only)
  - React Router App(Remix-style)으로 구현된 Web App
  - React Native WebView 위에서 서비스된다.
- React Native의 네이티브 기능 활용 여부는 현재 미정이다(TBD).

#### Tech Stack

- Native App: React Native
- Web App: Remix-style React Router App (SSR + loader/action)
- Styling: Tailwind CSS + shadcn/ui
- Database: Supabase
- ORM: Drizzle
- Repository: Git
- Deployment: Vercel

---

### 4.2 Kend-Seller (Seller Application)

- Kend-Seller는 판매자를 위한 웹 애플리케이션이다.
- 사용자 앱에 제공될 데이터를 생산, 가공, 관리하는 역할을 한다.
- Web Only 애플리케이션으로 배포된다.
- 일반적인 쇼핑몰 판매자(어드민) 시스템과 유사한 기능을 제공한다.

#### Tech Stack

- Web App: Remix-style React Router App (SSR + loader/action)
- Styling: Tailwind CSS + shadcn/ui
- Database: Supabase
- ORM: Drizzle
- Repository: Git
- Deployment: Vercel

---

## 5. Technical Architecture Details

### Frontend & Server Logic

- 모든 애플리케이션은 TypeScript 기반으로 개발된다.
- shadcn/ui를 기반으로 공통 UI 컴포넌트를 구성하며,
  필요에 따라 wrapping 또는 custom 컴포넌트를 사용한다.
- React Router의 loader/action을 사용하여:
  - 서버 환경에서 Supabase와 직접 통신
  - 별도의 BFF 서버 없이 Backend 역할을 수행한다.
- SSR은 다음 목적을 위해 사용된다.
  - 초기 렌더링
  - 인증 상태 확보

---

### Database Access Strategy

- Supabase는 Postgres 기반 단일 데이터베이스로 사용된다.
- Drizzle ORM은 다음 목적을 위해 사용된다.
  - Supabase Postgres DB에 대한 타입 안정성 확보
  - 서버(loader/action) 환경에서의 쿼리 작성
- 다음 기능은 Supabase SDK를 직접 사용한다.
  - Authentication
  - Storage
  - Realtime

---

## 6. Authentication & Authorization

- 인증(Authentication)은 Supabase Auth를 사용한다.
- 로그인/회원가입 방식:
  - Email / Password
  - Social Login (총 4종)
    - Google
    - Kakao
    - Naver (Supabase 미지원으로 직접 구현)
    - 1종 TBD
- 사용자 앱(Kend)과 판매자 사이트(Kend-Seller)는
  동일한 인증 시스템을 사용한다.
- 사용자 역할(Role)에 따라 접근 권한을 구분한다.
  - customer: 일반 사용자
  - seller: 판매자
  - administrator: 관리자
- 권한 제어는 애플리케이션 레벨이 아닌
  DB 레벨의 RLS(Row Level Security)를 통해 수행한다.

---

## 7. Application Responsibility Boundary

### Kend (User Application)

- 상품 조회
- 주문 및 결제
- 자녀 데이터 입력 및 관리
- 추천 결과 소비

---

### Kend-Seller (Seller Application)

- 상품 등록 및 수정
- 재고 관리
- 주문 및 배송 관리
- 정산 및 판매 통계

---

## 8. Data Ownership & Access Policy

- 모든 데이터는 Supabase 단일 데이터베이스에 저장된다.
- 테이블은 도메인 기준으로 소유권을 가진다.
  - 상품 / 주문 데이터: 판매자 소유
  - 자녀 데이터: 사용자 소유
- 애플리케이션 레벨에서는 권한을 분기하지 않는다.
- 모든 접근 제어는 DB 레벨(RLS)을 통해 통제한다.

---

## 9. UI/Styling Guidelines

### Design Source

- Kend(사용자 앱)는 **피그마(Figma) 디자인**을 기준으로 UI를 구현한다.
- Kend-Seller(판매자 사이트)는 디자인 없이 기능 중심으로 개발한다.

### Rules for AI Assistants

- **스타일/CSS 수정 금지**: 기능 구현 시 기존 스타일(className, CSS)을 임의로 변경하지 않는다.
- **스타일 변경 필요 시**: 반드시 사용자에게 먼저 변경 내용을 알리고 확인을 받는다.
- **Placeholder 처리**: 데이터가 없는 경우(이미지 등)의 fallback UI는 기존 스타일을 최대한 유지한다.

### Styling Stack

- Tailwind CSS v4
- shadcn/ui 컴포넌트
- 커스텀 컴포넌트는 `/app/common/components`에 위치

### 주의사항

- 피그마 디자인과 현재 구현이 100% 일치하지 않을 수 있다.
- 스타일 관련 이슈 발견 시 수정하지 말고 사용자에게 보고한다.
