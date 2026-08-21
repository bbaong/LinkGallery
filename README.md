# Link Gallery

자주 방문하는 웹사이트 URL을 폴더별로 저장·관리하는 비주얼 북마크 서비스 MVP입니다.

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, TanStack Query, Zustand, React Router, Zod, Sonner, Firebase Auth |
| Backend | Node.js, Express 5, TypeScript, Prisma 7, JWT(HttpOnly Cookie), Firebase Admin, Multer, Zod |
| Database | MariaDB (Prisma `mysql` provider) |

## 주요 기능

- 회원가입 / 로그인 / 로그아웃
- Google 로그인 (Firebase Auth → 서버 JWT Cookie)
- JWT + HttpOnly Cookie 인증
- 폴더 CRUD (그라데이션 커버, 이미지 업로드)
- 링크 CRUD (URL 정규화·검증, 폴더 내 중복 방지, 파비콘)
- 사용자별 데이터 접근 제한
- 대시보드, 폴더 상세, Loading / Empty / Toast / 오류 처리
- 반응형 UI

## 프로젝트 구조

```
my-project/
├── frontend/          # Vite + React 앱
├── backend/           # Express API 서버
├── docs/              # 구현 계획 문서
├── package.json       # 루트 개발 스크립트
└── README.md
```

## 사전 준비

1. Node.js 20+ 설치
2. MariaDB 설치 및 실행
3. 데이터베이스 생성

```sql
CREATE DATABASE link_gallery CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 환경변수 설정

### Backend (`backend/.env`)

`backend/.env.example`을 복사한 뒤 값을 채웁니다.

```bash
cp backend/.env.example backend/.env
```

| 변수 | 설명 | 예시 |
|------|------|------|
| `NODE_ENV` | 실행 환경 | `development` |
| `PORT` | API 포트 | `3000` |
| `DATABASE_URL` | MariaDB 연결 문자열 | `mysql://USER:PASSWORD@localhost:3306/link_gallery` |
| `JWT_SECRET` | JWT 서명 비밀키 | 충분히 긴 임의 문자열 |
| `JWT_EXPIRES_IN` | 토큰 만료 | `7d` |
| `FRONTEND_URL` | CORS 허용 프론트 Origin | `http://localhost:5174` |
| `UPLOAD_DIR` | 업로드 저장 디렉터리 | `uploads` |
| `FIREBASE_PROJECT_ID` | Firebase 프로젝트 ID (Google 로그인) | 콘솔 Project settings |
| `FIREBASE_CLIENT_EMAIL` | 서비스 계정 이메일 | `...@....iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | 서비스 계정 private key | JSON의 `private_key` (줄바꿈은 `\n`) |

### Frontend (`frontend/.env`)

```bash
cp frontend/.env.example frontend/.env
```

| 변수 | 설명 | 예시 |
|------|------|------|
| `VITE_API_BASE_URL` | API base URL | `http://localhost:3000/api` |
| `VITE_ASSET_BASE_URL` | 정적 파일(업로드) base URL | `http://localhost:3000` |
| `VITE_FIREBASE_API_KEY` | Firebase Web API Key | 콘솔 웹 앱 설정 |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth Domain | `your-app.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Project ID | `your-app` |
| `VITE_FIREBASE_APP_ID` | App ID | `1:...:web:...` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging Sender ID | 숫자 |

### Google 로그인 Firebase 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 프로젝트 생성
2. Authentication → Sign-in method → **Google** 사용 설정
3. Project settings → Your apps → Web 앱 추가 → `VITE_FIREBASE_*` 값 복사
4. Project settings → Service accounts → **Generate new private key**
5. JSON에서 `project_id`, `client_email`, `private_key`를 `backend/.env`의 `FIREBASE_*`에 입력  
   - `FIREBASE_PRIVATE_KEY`는 한 줄로 넣고, 실제 줄바꿈 대신 `\n` 유지
6. Authentication → Settings → Authorized domains에 `localhost` 포함 확인

## 설치 및 DB 마이그레이션

```bash
# 루트 / frontend / backend 의존성
npm install
npm --prefix frontend install
npm --prefix backend install

# Prisma Client 생성
npm --prefix backend run prisma:generate

# DB 스키마 적용 (MariaDB가 준비된 후)
cd backend
npx prisma migrate dev --name init
```

> MariaDB 접속 정보가 올바르지 않으면 migration이 실패합니다. `DATABASE_URL`을 먼저 확인하세요.

## 실행

```bash
# 프론트 + 백엔드 동시 실행 (권장)
npm run dev

# 개별 실행
npm run dev:frontend   # http://localhost:5174
npm run dev:backend    # http://localhost:3000
```

## 검증 명령

```bash
# Frontend
npm --prefix frontend run build
npm --prefix frontend run lint

# Backend
npm --prefix backend run typecheck
npm --prefix backend run build
npm --prefix backend run lint

# Prisma
cd backend
npx prisma validate
npx prisma generate
```

## API 개요

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/auth/google` | Google 로그인 (Firebase idToken) |
| POST | `/api/auth/logout` | 로그아웃 |
| GET | `/api/auth/me` | 현재 사용자 |
| GET/POST | `/api/folders` | 폴더 목록 / 생성 |
| GET/PATCH/DELETE | `/api/folders/:folderId` | 폴더 조회 / 수정 / 삭제 |
| GET | `/api/folders/:folderId/links` | 폴더 내 링크 목록 |
| POST/PATCH/DELETE | `/api/links` · `/api/links/:linkId` | 링크 생성 / 수정 / 삭제 |
| GET | `/api/links/recent` | 최근 링크 |
| POST/DELETE | `/api/uploads/folder-cover` | 폴더 커버 업로드 / 삭제 |

## MVP 제외 범위

- OG 메타데이터 자동 추출
- 드래그 앤 드롭 정렬
- 이메일 인증
