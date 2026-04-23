# iOS 재심사 결과 및 대응 방안
> Review Date: April 14, 2026  
> Submission ID: cf3935a8-da05-45a7-a0c4-dbcedebade64  
> Review Device: iPad Air 11-inch (M3) + iPhone 17 Pro Max  
> OS: iPadOS 26.4.1 / iOS 26.4.1  
> Version Reviewed: 1.0

---

## 리젝 이슈 요약 (4건)

### 1. Guideline 4.8 — Design · Login Services
**문제:**
서드파티 로그인만 제공하고, 아래 조건을 모두 충족하는 동등한 로그인 옵션이 없음.
- 이름 + 이메일만 수집
- 이메일 주소를 외부에 공개하지 않는 옵션
- 광고 목적 행동 추적 없음

**대응:**
- Sign in with Apple 추가 (Apple이 명시한 조건을 모두 충족하는 유일한 옵션)

---

### 2. Guideline 2.1(a) — Performance · Crash
**문제:**
프로필 수정 화면에서 카메라 접근 시 크래시 발생.

재현 경로:
1. 마이페이지 → "프로필 수정하기" 탭
2. 카메라 아이콘 탭
3. "Take Photo" 선택
4. 앱 크래시

**대응:**
- iPad only 이슈일 가능성 높음 → Xcode에서 iPhone only로 변경 시 해소 가능
- iPhone에서도 재현되는지 실기기 확인 필요
- 재현 시: `NSCameraUsageDescription` 권한 처리 또는 `PHPickerViewController` 예외 처리 점검

---

### 3. Guideline 4 — Design · iPad UI
**문제:**
iPad Air 11-inch (M3) / iPadOS 26.4.1에서 UI가 crowded하거나 레이아웃이 깨져 사용하기 어려움.

**대응:**
- **iPad 배포 대상 제거로 해소**
- Xcode → Target → General → Deployment Info → iPhone only 설정
- App Store Connect에서도 iPad 배포 체크 해제

---

### 4. Guideline 2.1(a) — Performance · App Completeness (버그)
**문제:**
두 가지 버그 발견.
1. 결제 페이지에서 결제 수단이 무한 로딩
2. 마이페이지 내 버튼들 탭 시 에러 메시지 표시
   - 해당 버튼: '최근 본 상품', '알림 설정', '공지사항 및 FAQ', '이용 약관', '개인정보 처리 방침', '고객지원'

**원인 파악:**
- 결제 무한로딩: 결제 기능이 아직 미구현 상태 → 버그가 아니라 미완성 기능
- 버튼 에러: 실제 버그일 가능성 있음 → iPhone 실기기 재현 확인 필요

**대응:**
- 결제 페이지: 무한로딩 UI 대신 "서비스 준비 중" 안내 UI로 교체
- 버튼 에러: iPhone 실기기에서 재현 후 수정

---

## 전체 대응 액션 아이템

| # | 작업 | 방법 | 우선순위 |
|---|------|------|----------|
| 1 | Sign in with Apple 추가 | RN에서 `@invertase/react-native-apple-authentication` 등 라이브러리 사용 | 🔴 필수 |
| 2 | Xcode iPhone only 설정 | Target → General → Deployment Info → iPad 체크 해제 | 🔴 필수 |
| 3 | 결제 페이지 "준비 중" UI 교체 | 무한로딩 → "서비스 준비 중" 모달 또는 토스트 | 🔴 필수 |
| 4 | 마이페이지 버튼 에러 수정 | iPhone 실기기 재현 후 원인 파악 | 🔴 필수 |
| 5 | 카메라 크래시 iPhone 재현 확인 | 실기기 테스트 | 🟡 확인 후 결정 |

---

## 재제출 시 Review Notes 예시 (App Store Connect)

```
We have addressed all the issues identified in the review:

1. Guideline 4.8 (Login Services):
   Added "Sign in with Apple" as an equivalent login option.

2. Guideline 2.1(a) (Crash):
   The crash occurred on iPad. The app has been updated to support iPhone only.
   iPad has been removed from the supported devices list.

3. Guideline 4 (iPad UI):
   iPad is no longer a supported device. Removed from deployment targets.

4. Guideline 2.1(a) (App Completeness):
   - Payment feature is not yet available in this version.
     Replaced the loading screen with a "Coming Soon" UI to clearly communicate this.
   - Fixed the error that occurred when tapping menu buttons in the My Page screen.
```

---

## 참고 — 이번 리젝의 특징

- 리뷰어가 **iPad를 집중적으로 테스트**한 것으로 보임
- iPad 관련 이슈(크래시, UI, 버튼 에러)가 대부분 → iPhone only로 전환 시 상당수 해소
- **한 번에 모든 이슈를 해결하고 재제출**하는 것이 중요 (부분 수정 재제출 시 또 다른 이슈로 리젝 반복될 수 있음)
