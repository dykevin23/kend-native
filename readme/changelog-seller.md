# Changelog — KEND-SELLER

KEND-SELLER 판매자 관리자 웹의 주요 변경사항을 날짜별로 기록한다.

> - 이 파일은 모든 프로젝트에서 수동으로 동기화한다.
> - 최신 내용이 위로 오도록 역순(최신순)으로 작성한다.
> - 항목 제목 맨 앞에 `[KEND-SELLER]` prefix를 사용한다.

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

## 2026-02-04

### [KEND-SELLER] 판매자 대표이미지(로고) & 해시태그 기능 추가

- **해시태그 마스터 테이블 (`hashtags`)**: 플랫폼 공통 해시태그 테이블 추가. 상품/판매자 등 여러 도메인에서 공유하여 통합 검색에 활용.
- **판매자-해시태그 연결 테이블 (`seller_hashtags`)**: 판매자별 해시태그 연결. 복합 unique 제약조건 적용.
- **판매자 로고 업로드**: Supabase Storage `sellers` 버킷에 `{seller_code}/logo` 경로로 직접 업로드. DB에 URL을 저장하지 않고, 경로 규칙으로 URL을 도출.
- **판매자 정보 관리 화면 확장**: 기존 판매자 정보 입력 페이지를 확장하여, 판매자 등록 후에는 로고 업로드 + 해시태그 관리 화면으로 전환.
