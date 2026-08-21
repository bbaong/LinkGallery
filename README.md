# Link Gallery

자주 찾는 링크를 **폴더(플레이리스트)처럼** 모아 두는 비주얼 북마크 웹 서비스입니다.

현재 저장소 `feat/mvp` 브랜치 기준 **개발된 상태 전체를 MVP**로 봅니다.

- 저장소: https://github.com/bbaong/LinkGallery
- 브랜치: `feat/mvp`

---

## MVP에 포함된 기능

### 인증
- 아이디(`username`) + 비밀번호 회원가입 / 로그인 / 로그아웃
- 비밀번호 규칙: 8자 이상, 영문 + 숫자 + 특수문자
- 닉네임 2~20자
- Google 로그인 (Firebase Auth → 서버에서 JWT HttpOnly Cookie 발급)
- 설정 페이지에서 이메일 연결/수정 (`/settings`)
- 아이디 중복 확인 API

### 폴더
- 폴더 생성 / 조회 / 수정 / 삭제
- 커버: `SOLID` / `GRADIENT` / `GLASS` / `IMAGE`
- 이모지 아이콘, 커버 색·그라데이션·이미지 업로드
- 사용자별 소유권 제한

### 링크
- 폴더 안 링크 생성 / 조회 / 수정 / 삭제
- URL 정규화·형식 검증, 폴더 내 중복 방지 (`urlHash`)
- 파비콘 자동 생성
- 링크 카테고리 태그 + 폴더 상세에서 카테고리 필터
- 드래그 앤 드롭 정렬 (`/api/links/reorder`)
- 방문 기록 (`lastVisitedAt`)
- 대시보드 Quick Launch (자주 여는 링크 핀, localStorage)

### 화면 / UX
- 랜딩, 로그인, 회원가입
- 대시보드 (폴더 갤러리, 최근 링크, Quick Launch)
- 폴더 상세
- 설정
- Loading / Empty / Toast / 오류 처리
- 반응형 UI

### 다음 스텝 (MVP 이후)
- 친구와 폴더 공유
- 추천 기능
- OG 메타 자동 추출
- 이메일 인증

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, TanStack Query, Zustand, React Router, Zod, Sonner, Firebase Auth |
| Backend | Node.js, Express 5, TypeScript, Prisma 7, JWT(HttpOnly Cookie), Firebase Admin, Multer, Zod |
| Database | MariaDB (Prisma `mysql` provider) |

---

## 프로젝트 구조

```
LinkGallery/
├── frontend/                 # Vite + React
├── backend/                  # Express API + Prisma
│   ├── prisma/               # schema + migrations
│   └── docs/dbtable_0821.md  # DB 테이블 명세
├── package.json              # 루트 개발 스크립트
└── README.md
```

---

## 화면 라우트

| 경로 | 설명 | 접근 |
|------|------|------|
| `/` | 랜딩 | 비로그인 |
| `/login` | 로그인 | 비로그인 |
| `/signup` | 회원가입 | 비로그인 |
| `/dashboard` | 내 폴더 / Quick Launch | 로그인 |
| `/folders/:folderId` | 폴더 상세 (링크 관리) | 로그인 |
| `/settings` | 프로필/이메일 설정 | 로그인 |

프론트 개발 서버 기본 포트: **5174**  
백엔드 API: **3000**

---

## 사전 준비

1. Node.js 20+
2. MariaDB 실행
3. DB 생성

```sql
CREATE DATABASE link_gallery CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 환경변수

### Backend — `backend/.env`

```bash
cp backend/.env.example backend/.env
```

| 변수 | 설명 |
|------|------|
| `NODE_ENV` | `development` / `production` |
| `PORT` | API 포트 (기본 `3000`) |
| `DATABASE_URL` | `mysql://USER:PASSWORD@localhost:3306/link_gallery` |
| `JWT_SECRET` | JWT 서명 비밀키 |
| `JWT_EXPIRES_IN` | 예: `7d` |
| `FRONTEND_URL` | CORS Origin — **`http://localhost:5174`** |
| `UPLOAD_DIR` | 업로드 디렉터리 (기본 `uploads`) |
| `FIREBASE_PROJECT_ID` | Google 로그인용 (선택) |
| `FIREBASE_CLIENT_EMAIL` | 서비스 계정 이메일 (선택) |
| `FIREBASE_PRIVATE_KEY` | 서비스 계정 private key, `\n` 유지 (선택) |

Firebase Admin 값이 없으면 이메일/아이디 로그인은 동작하고, Google 로그인만 비활성에 가깝게 실패합니다.

### Frontend — `frontend/.env`

```bash
cp frontend/.env.example frontend/.env
```

| 변수 | 설명 |
|------|------|
| `VITE_API_BASE_URL` | `http://localhost:3000/api` |
| `VITE_ASSET_BASE_URL` | `http://localhost:3000` |
| `VITE_FIREBASE_API_KEY` | Firebase Web 설정 |
| `VITE_FIREBASE_AUTH_DOMAIN` | |
| `VITE_FIREBASE_PROJECT_ID` | |
| `VITE_FIREBASE_APP_ID` | |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | |

### Google 로그인 설정 요약

1. Firebase Console → Authentication → Google 사용 설정
2. Web 앱 설정 → `VITE_FIREBASE_*`
3. Service account JSON → `FIREBASE_*` (backend)
4. Authorized domains에 `localhost` 확인
5. `.env` 수정 후 **프론트/백엔드 모두 재시작**

---

## 설치 / DB / 실행

```bash
npm install
npm --prefix frontend install
npm --prefix backend install

npm --prefix backend run prisma:generate

cd backend
npx prisma migrate deploy
# 개발 중 스키마 변경 시: npx prisma migrate dev
```

```bash
# 루트에서 프론트(5174) + 백엔드(3000) 동시 실행
npm run dev
```

- 프론트: http://localhost:5174  
- API 헬스: http://localhost:3000/api/health  

> `FRONTEND_URL`과 실제 프론트 주소(포트)가 다르면 CORS로 회원가입/로그인이 막힙니다.

---

## 데이터 모델 (요약)

| 테이블 | 역할 |
|--------|------|
| `User` | `username`, optional `email`, `passwordHash`, Google (`googleId`/`provider`) |
| `Folder` | 유저 소유 폴더 + 커버(`SOLID`/`GRADIENT`/`GLASS`/`IMAGE`) |
| `Link` | 폴더 안 URL, `urlHash` 중복 방지, `category`, `lastVisitedAt`, `position` |

상세 명세: `backend/docs/dbtable_0821.md`  
(최신 스키마는 `backend/prisma/schema.prisma`가 우선입니다.)

---

## API 개요

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/health` | 헬스체크 |
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/auth/google` | Google 로그인 |
| POST | `/api/auth/logout` | 로그아웃 |
| GET | `/api/auth/username-available` | 아이디 중복 확인 |
| GET | `/api/auth/me` | 현재 사용자 |
| PATCH | `/api/auth/me` | 프로필/이메일 수정 |
| GET/POST | `/api/folders` | 폴더 목록 / 생성 |
| GET/PATCH/DELETE | `/api/folders/:folderId` | 폴더 상세 / 수정 / 삭제 |
| GET | `/api/folders/:folderId/links` | 폴더 내 링크 |
| GET | `/api/links` | 내 링크 전체(Quick Launch 등) |
| GET | `/api/links/recent` | 최근 링크 |
| POST | `/api/links` | 링크 생성 |
| PATCH | `/api/links/reorder` | 링크 순서 변경 |
| POST | `/api/links/:linkId/visit` | 방문 기록 |
| PATCH/DELETE | `/api/links/:linkId` | 링크 수정 / 삭제 |
| POST/DELETE | `/api/uploads/folder-cover` | 폴더 커버 업로드 / 삭제 |

---

## 검증 명령

```bash
npm run typecheck
npm run lint
npm run build

cd backend
npx prisma validate
npx prisma generate
```

---

## 로컬 개발 체크리스트

1. MariaDB `link_gallery` 존재 + migrate 적용
2. `backend/.env` / `frontend/.env` 설정
3. `FRONTEND_URL=http://localhost:5174`
4. `npm run dev`
5. 회원가입 → 폴더 생성 → 링크 추가 → 대시보드/상세 확인
