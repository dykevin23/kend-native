# KEND 프로젝트 현재 상황 (Overview)

> 최종 업데이트: 2026-04-22  
> 이 문서는 프로젝트의 현재 상태를 한눈에 파악하기 위한 대시보드다. 주요 분기마다 갱신한다.

---

## 🎯 프로젝트 한 줄 요약

**KEND** — 자녀 성장정보 기반 유아용품 추천/거래 플랫폼. React Native WebView(모바일) + React Router 웹앱(kend) + 판매자 관리자 웹(kend-seller), 단일 Supabase DB 구조. 현재 MVP Phase 1 (B2C 판매자-소비자) 단계.

---

## 🚦 지금 상황 (2026-04-22 기준)

- iOS App Store **심사 대응 중** (4/14 반려 → 수정 후 재심사)
- **1차 내부 테스트 피드백 반영 마무리 단계** (18건 중 15건 완료)
- 다음 큰 작업은 **휴대폰 인증 도입** (아이디/비번 찾기, 소셜 추가정보 flow 포함)

---

## ✅ 최근 완료 (2주 이내)

- 2026-04-17: 회원가입/약관/헤더/캐시 개선 6건 (iOS bfcache 대응 포함)
- 2026-04-16: 1차 내부 테스트 UI/UX 개선 10건 (dot indicator, 스크롤바 숨김, 팝업 등)
- 2026-04-15: Apple Sign In 연결, 이용약관 전문 교체, 결제 "준비 중" 처리 (iOS 심사 대응)
- 2026-04-14: 상품 검색 기능, 좋아요 실데이터 연결, Supabase OAuth 임시 처리
- 2026-04-10: 회원탈퇴, Link Prefetch, Google OAuth 딥링크
- 2026-04-01~03: 에러 핸들러, Toast, Auth 리스너, Validation Zod 확대 (에러 핸들링 로드맵 Week 1)

> 상세: [changelog-kend.md](./changelog-kend.md)

---

## 🔄 진행 중 (active)

| 항목 | 내용 | 비고 |
|------|------|------|
| [internal-test-1st](./active/internal-test-1st.md) | 1차 내부 테스트 개선 | 15/18 완료, 나머지는 휴대폰 인증 연계 |
| [ios-review-rejection-apr14](./active/ios-review-rejection-apr14.md) | iOS 심사 대응 | 재심사 대기 |
| [native-swipe-blacklist](./active/native-swipe-blacklist.md) | 네이티브 스와이프 차단 URL 목록 | 네이티브팀 구현 대기 |
| [environment-separation-plan](./active/environment-separation-plan.md) | Supabase dev/prod 분리 | 출시 전 필수, 착수 필요 |

---

## 📋 다음 작업 (todo)

| 항목 | 우선순위 | 예상 규모 |
|------|---------|----------|
| [phone-auth-plan](./todo/phone-auth-plan.md) | **최우선** | 8~12일 |
| [kend-error-handling-roadmap](./todo/kend-error-handling-roadmap.md) | 높음 (출시 전) | 3주 중 Week 2~3 남음 |
| [client-rendering-plan](./todo/client-rendering-plan.md) | 낮음 (출시 후 장기) | — |

**휴대폰 인증 도입 시 같이 해결되는 항목**:
- 아이디 찾기 / 비밀번호 찾기
- 소셜 회원가입 추가정보 flow
- 기존 회원 정보 보강

---

## 🏗️ 시스템 아키텍처 스냅샷

- **kend** (웹): React Router SSR, Remix-style loader/action, Tailwind + shadcn/ui
- **kend-native** (앱): React Native + WebView (iOS/Android)
- **kend-seller** (판매자 관리자): 웹 전용
- **단일 Supabase DB**: PostgreSQL + Drizzle ORM, RLS로 권한 제어
- **결제**: TossPayments 테스트 모드 (iOS 심사 중엔 "준비 중" 처리)
- **소셜 로그인**: Google, Kakao, Naver, Apple

> 상세: [core/application-architecture.md](./core/application-architecture.md)

---

## 📂 문서 구조

| 폴더 | 역할 |
|------|------|
| `core/` | 프로젝트 기반 reference (아키텍처, DB, 인증, UI, 결제 등) |
| `active/` | 현재 진행 중인 plan/todo |
| `todo/` | 아직 시작 전 plan |
| `archive/` | 완료/보류 |
| `changelog-{kend,seller,native}.md` | 시스템별 변경 이력 |

> 규칙: [core/readme-structure-guide.md](./core/readme-structure-guide.md)

---

## 🚧 출시 전 반드시 필요한 작업 (체크리스트)

- [ ] 휴대폰 인증 도입 (Phase 1: SMS OTP)
- [ ] 아이디/비밀번호 찾기
- [ ] 소셜 회원가입 추가정보 flow
- [ ] Supabase dev/prod 환경 분리
- [ ] 에러 핸들링 Week 2~3 (오프라인 감지, 결제 에러, PostHog, QA)
- [ ] iOS 심사 재통과
- [ ] 결제 기능 실운영 전환 (TossPayments 라이브 키, 본인확인 서비스)

---

## 🔮 장기 로드맵 (출시 후)

- React Query 기반 CSR 전환 (SSR 병목 완화) — [client-rendering-plan](./todo/client-rendering-plan.md)
- C2C 2차 시장 (MVP Phase 2) — [application-architecture §MVP Roadmap](./core/application-architecture.md)
- NICE 본인확인 서비스로 업그레이드 (결제/본인확인) — [phone-auth-plan §Phase 2](./todo/phone-auth-plan.md)
- 성장 데이터 더미 → 실데이터 점진 전환 — [growth-data-transition-plan](./todo/growth-data-transition-plan.md)
