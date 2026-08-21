# Link Gallery DB 테이블 명세

- 작성일: 2026-08-21
- DB: MariaDB (`link_gallery`)
- ORM: Prisma 7 (`backend/prisma/schema.prisma`)
- 문자셋: `utf8mb4` / `utf8mb4_unicode_ci`
- 적용 마이그레이션:
  - `20260803052452_init`
  - `20260803070000_add_google_auth`

> HeidiSQL에서는 환경에 따라 테이블명이 `user`, `folder`, `link`처럼 소문자로 보일 수 있습니다.  
> Prisma 모델명/마이그레이션 SQL 기준 표기는 `User`, `Folder`, `Link`입니다.

---

## 1. ER 개요

```
User 1 ──────── N Folder
  │                 │
  │                 │
  └──── 1 ──── N Link N ──── 1 Folder
```

- 한 유저가 여러 폴더를 가짐 (`Folder.userId → User.id`)
- 한 폴더에 여러 링크를 가짐 (`Link.folderId → Folder.id`)
- 링크에도 소유 유저를 저장 (`Link.userId → User.id`) — 조회/권한 검증용
- 유저 삭제 시 폴더·링크 연쇄 삭제 (`ON DELETE CASCADE`)
- 폴더 삭제 시 해당 폴더의 링크 연쇄 삭제 (`ON DELETE CASCADE`)

---

## 2. Enum 정의

### 2.1 `CoverType` (폴더 커버 유형)

| 값 | 설명 |
|----|------|
| `GRADIENT` | 그라데이션 프리셋 커버 |
| `IMAGE` | 업로드 이미지 커버 |

### 2.2 `AuthProvider` (가입/로그인 방식)

| 값 | 설명 |
|----|------|
| `LOCAL` | 이메일 + 비밀번호 |
| `GOOGLE` | Google (Firebase) 로그인 |

---

## 3. 테이블: `User`

회원 계정. 이메일 회원가입과 Google 로그인을 모두 지원한다.

### 3.1 컬럼

| 컬럼 | 타입 | NULL | 기본값 | 설명 |
|------|------|------|--------|------|
| `id` | `VARCHAR(191)` | NO | UUID (앱 생성) | PK |
| `email` | `VARCHAR(191)` | NO | — | 로그인 식별자, UNIQUE |
| `passwordHash` | `VARCHAR(191)` | YES | `NULL` | bcrypt 해시. Google 전용 계정은 `NULL` |
| `nickname` | `VARCHAR(191)` | NO | — | 표시 이름 (앱 검증: 2~20자) |
| `avatarUrl` | `VARCHAR(191)` | YES | `NULL` | 프로필 이미지 URL (Google picture 등) |
| `googleId` | `VARCHAR(191)` | YES | `NULL` | Firebase UID, UNIQUE |
| `provider` | `ENUM('LOCAL','GOOGLE')` | NO | `'LOCAL'` | 주 인증 방식 |
| `createdAt` | `DATETIME(3)` | NO | `CURRENT_TIMESTAMP(3)` | 생성 시각 |
| `updatedAt` | `DATETIME(3)` | NO | — | 수정 시각 (Prisma `@updatedAt`) |

### 3.2 키 / 인덱스

| 이름 | 종류 | 컬럼 |
|------|------|------|
| `PRIMARY` | PK | `id` |
| `User_email_key` | UNIQUE | `email` |
| `User_googleId_key` | UNIQUE | `googleId` |

### 3.3 외래키

없음 (루트 테이블)

### 3.4 비고

- 비밀번호 원문은 저장하지 않음. `passwordHash`만 저장.
- Google 로그인 시 동일 `email`이 있으면 `googleId`를 연결할 수 있음 (앱 로직).
- 친구 공유 기능용 테이블은 **아직 없음** (향후 확장).

---

## 4. 테이블: `Folder`

유저가 만든 카테고리/플레이리스트형 폴더 (예: 여행, 취준, AI툴).

### 4.1 컬럼

| 컬럼 | 타입 | NULL | 기본값 | 설명 |
|------|------|------|--------|------|
| `id` | `VARCHAR(191)` | NO | UUID (앱 생성) | PK |
| `userId` | `VARCHAR(191)` | NO | — | 소유 유저 FK → `User.id` |
| `name` | `VARCHAR(191)` | NO | — | 폴더 이름 (앱 검증: 1~50자) |
| `icon` | `VARCHAR(191)` | YES | `NULL` | 이모지 등 |
| `coverType` | `ENUM('GRADIENT','IMAGE')` | NO | `'GRADIENT'` | 커버 유형 |
| `coverValue` | `VARCHAR(191)` | NO | — | 그라데이션 키 또는 이미지 경로(`/uploads/...`) |
| `position` | `INT` | NO | `0` | 정렬 순서 |
| `createdAt` | `DATETIME(3)` | NO | `CURRENT_TIMESTAMP(3)` | 생성 시각 |
| `updatedAt` | `DATETIME(3)` | NO | — | 수정 시각 |

### 4.2 키 / 인덱스

| 이름 | 종류 | 컬럼 |
|------|------|------|
| `PRIMARY` | PK | `id` |
| `Folder_userId_idx` | INDEX | `userId` |

### 4.3 외래키

| 제약 이름 | 컬럼 | 참조 | ON DELETE | ON UPDATE |
|-----------|------|------|-----------|-----------|
| `Folder_userId_fkey` | `userId` | `User(id)` | `CASCADE` | `CASCADE` |

### 4.4 비고

- 폴더 공개/친구 공유 컬럼은 현재 없음. 현재는 **소유자만** 접근.

---

## 5. 테이블: `Link`

폴더 안에 저장된 북마크(URL).

### 5.1 컬럼

| 컬럼 | 타입 | NULL | 기본값 | 설명 |
|------|------|------|--------|------|
| `id` | `VARCHAR(191)` | NO | UUID (앱 생성) | PK |
| `userId` | `VARCHAR(191)` | NO | — | 소유 유저 FK → `User.id` |
| `folderId` | `VARCHAR(191)` | NO | — | 소속 폴더 FK → `Folder.id` |
| `title` | `VARCHAR(191)` | NO | — | 표시 제목 |
| `url` | `VARCHAR(191)` | NO | — | 정규화된 URL |
| `description` | `TEXT` | YES | `NULL` | 메모/설명 |
| `faviconUrl` | `VARCHAR(191)` | YES | `NULL` | 파비콘 URL |
| `position` | `INT` | NO | `0` | 정렬 순서 |
| `createdAt` | `DATETIME(3)` | NO | `CURRENT_TIMESTAMP(3)` | 생성 시각 |
| `updatedAt` | `DATETIME(3)` | NO | — | 수정 시각 |

### 5.2 키 / 인덱스

| 이름 | 종류 | 컬럼 |
|------|------|------|
| `PRIMARY` | PK | `id` |
| `Link_userId_idx` | INDEX | `userId` |
| `Link_folderId_idx` | INDEX | `folderId` |
| `Link_folderId_url_key` | UNIQUE | `(folderId, url)` |

### 5.3 외래키

| 제약 이름 | 컬럼 | 참조 | ON DELETE | ON UPDATE |
|-----------|------|------|-----------|----------|
| `Link_userId_fkey` | `userId` | `User(id)` | `CASCADE` | `CASCADE` |
| `Link_folderId_fkey` | `folderId` | `Folder(id)` | `CASCADE` | `CASCADE` |

### 5.4 비고

- **같은 폴더 안에서는 동일 URL 중복 저장 불가** (`folderId + url` UNIQUE).
- 다른 폴더에는 같은 URL을 각각 저장 가능.
- URL 정규화·검증은 백엔드 `link.util`에서 수행.

---

## 6. 시스템 테이블: `_prisma_migrations`

Prisma가 마이그레이션 적용 이력을 기록하는 내부 테이블. 비즈니스 데이터 아님.

---

## 7. 관계 요약 (외래키 한눈에)

| 자식 테이블 | FK 컬럼 | 부모 테이블 | 부모 컬럼 | 삭제 시 |
|-------------|---------|-------------|-----------|---------|
| `Folder` | `userId` | `User` | `id` | 유저 삭제 → 폴더 삭제 |
| `Link` | `userId` | `User` | `id` | 유저 삭제 → 링크 삭제 |
| `Link` | `folderId` | `Folder` | `id` | 폴더 삭제 → 링크 삭제 |

---

## 8. 서비스 기능 ↔ 테이블 매핑

| 기능 | 관련 테이블 | 상태 |
|------|-------------|------|
| 회원가입 / 로그인 / 로그아웃 | `User` | 구현됨 |
| Google 로그인 | `User.googleId`, `User.provider` | 구현됨 |
| 폴더 생성·수정·삭제·조회 | `Folder` | 구현됨 |
| 폴더 커버(그라데이션/이미지) | `Folder.coverType`, `coverValue` | 구현됨 |
| 링크 생성·수정·삭제·조회 | `Link` | 구현됨 |
| 폴더 내 URL 중복 방지 | `Link (folderId, url)` UNIQUE | 구현됨 |
| 친구와 폴더 공유 | — | **미구현** (추가 테이블 필요) |

---

## 9. 향후 공유 기능 시 참고 (미적용)

친구 공유를 넣게 되면 예시로 아래 같은 테이블이 추가로 필요할 수 있다.

| 후보 테이블 | 역할 |
|-------------|------|
| `FolderShare` | `folderId` + `sharedWithUserId` + `permission(READ/WRITE)` |
| 또는 `ShareLink` | 초대 토큰 / 만료일 / 공개 여부 |

현재 MVP 스키마에는 포함되지 않음.

---

## 10. 스키마 소스

- Prisma: `backend/prisma/schema.prisma`
- 초기 SQL: `backend/prisma/migrations/20260803052452_init/migration.sql`
- Google 인증 컬럼 추가: `backend/prisma/migrations/20260803070000_add_google_auth/migration.sql`
