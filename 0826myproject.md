# 0826 Link Gallery 작업 보고

- **날짜:** 2026-08-26
- **제품:** Link Gallery (자주 찾는 인터넷 공간을 폴더로 모아 두는 개인 시작 페이지)
- **브랜치:** `develop` (MVP 스냅샷 `feat/mvp`는 그대로 두고, 협업 이후 작업만 분리)
- **커밋:** `feat: 폴더 공동작업 기능 추가 및 언어 설정 추가`

이 문서는 “오늘 무엇을 만들었는지”뿐 아니라, **왜 그렇게 만들었고 어떤 개념을 썼는지**를 나중에 포트폴리오·복기용으로 다시 볼 수 있게 정리한 기록이다.

---

## 1. 한눈에 보기

| 주제 | 사용자가 실제로 하는 일 | 핵심 개념 |
| --- | --- | --- |
| 랜딩 마퀴 | 랜딩에서 태그가 가로로 흘러간다 | CSS 무한 캐러셀, `prefers-reduced-motion`, 접근성 |
| 폴더 공동작업 | 초대 코드로 친구 폴더에 들어가 링크를 같이 채운다 | 멤버십 테이블, OWNER/EDITOR 권한, 초대 코드 |
| 언어 설정 | 한국어 ↔ English로 화면 문구가 바뀐다 | i18n, 메시지 키, Zustand + localStorage |
| (함께 한 작업) 프로필·커버 | 배너/아바타를 폴더 커버처럼 꾸민다 | 다형 커버(단색/그라데이션/사진) |
| (함께 한 작업) 링크 미리보기 | 카드 대신 OG 대표 이미지를 보여 준다 | Open Graph, SSRF 가드 |
| (함께 한 작업) 테마·설정 | 라이트/다크, 계정 비밀번호·초기화·탈퇴 | CSS 토큰, 확인용 아이디 입력 |

---

## 2. 제품 맥락

Link Gallery는 북마크 바가 아니라 **내 취향의 폴더**로 사이트를 모으는 앱이다.

오늘 작업의 큰 방향은 세 가지였다.

1. **랜딩이 “서비스처럼” 보이게** — 마퀴 태그로 “이런 걸 모아 둔다”는 느낌을 준다.
2. **혼자만의 폴더에서 같이 채우는 폴더로** — 초대 코드로 친구와 같은 공간을 쓴다.
3. **언어를 실제로 바꿀 수 있게** — 설정만 영어가 아니라, 랜딩·로그인·홈·폴더까지 같이 바뀐다.

---

## 3. 랜딩 마퀴 (Marquee)

### 무엇이 보이는가

랜딩 히어로 아래, “사람들이 이런 링크를 모으고 있어요” 문구와 함께  
영상 / 요리 메모 / 맛집 리스트 / 사이드 프로젝트 같은 **태그 칩이 가로로 천천히 흘러간다.**

파일:

- `frontend/src/app/pages/landing/MarqueeTags.tsx`
- `frontend/src/app/pages/landing/TagChip.tsx`
- `frontend/src/index.css` (`landing-marquee` 애니메이션)

### 어떻게 무한으로 도는가

핵심은 **같은 태그 줄을 두 번 붙여 놓고, 절반만큼만 이동하는 것**이다.

1. 태그 배열을 `[0, 1]` 두 벌로 렌더한다.
2. CSS `@keyframes landing-marquee`가 `translateX(0)` → `translateX(-50%)`로 움직인다.
3. 전체 너비의 절반이 첫 번째 줄이므로, 끝나 보이는 순간 두 번째 줄이 첫 줄과 같은 그림이 된다. **점프가 안 보이는 무한 루프**가 된다.
4. 애니메이션은 `linear` + `infinite`라서 속도가 일정하다. 모바일은 `72s`로 조금 더 느리게 둔다.

이 패턴을 흔히 **infinite CSS marquee / duplicated track carousel**이라고 부른다. JS로 위치를 계산하지 않고, 레이아웃과 애니메이션만으로 처리한다.

### 가장자리 페이드

컨테이너에 `mask-image: linear-gradient(...)`를 써서 좌우가 투명하게 사라진다.  
태그가 화면 끝에서 뚝 잘리지 않고, 안개처럼 들어왔다가 나가게 하려는 장치다.

### 호버하면 멈춘다

```css
.group/marquee:hover .animate-landing-marquee {
  animation-play-state: paused;
}
```

Tailwind v4의 **named group** (`group/marquee`)을 쓴다. 마퀴 영역 위에 마우스를 올리면 읽기 쉽게 멈춘다. 키보드 포커스가 안에 있을 때도 (`:focus-within`) 멈춘다.

### 접근성: 움직임 줄이기

`prefers-reduced-motion: reduce`를 쓰는 사용자는 어지럼·멀미를 피하려고 OS에서 애니메이션을 끈다.

- 훅 `usePrefersReducedMotion()`이 `window.matchMedia`를 구독한다.
- 움직임 감소가 켜져 있으면 **흘러가는 대신 가로 스크롤 목록**으로 바꾼다.
- CSS 쪽에서도 마퀴 애니메이션을 `animation: none`으로 죽인다.

기능 데모와 접근성을 같이 챙긴 부분이다.

### 제품 의도

실서비스 브랜드명을 랜딩에 쓰지 않고, **카테고리 예시만** 흘린다.  
“북마크 앱”이 아니라 “내 인터넷 공간을 플레이리스트처럼 모은다”는 톤을 태그가 대신 설명해 준다.

---

## 4. 폴더 공동작업

### 무엇이 되는가

기존에는 폴더가 **만든 사람 것**이었다. 오늘은 **초대 코드로 다른 사람이 들어와 같이 링크를 넣을 수 있게** 바꿨다.

사용자 흐름:

1. 폴더 주인(OWNER)이 **같이 채우기**를 누른다.
2. 6자리 초대 코드가 생긴다. 복사하거나 새로 만들 수 있다.
3. 친구가 홈에서 **초대 코드로 참여**에 코드를 넣는다.
4. 그 폴더는 친구 홈의 **함께 채우는 폴더**에도 보인다.
5. 친구는 링크를 추가·수정할 수 있지만, 폴더 삭제·초대 재발급은 주인만 한다.

관련 파일:

- 백엔드: `backend/src/domains/folders/inviteCode.ts`, `folder.service.ts`, Prisma `FolderMember`
- 프론트: `InviteFolderModal.tsx`, `JoinFolderModal.tsx`, `DashboardPage.tsx`, `FolderDetailPage.tsx`

### 데이터 모델 (멤버십)

핵심 테이블은 `FolderMember`다.

| 필드 | 의미 |
| --- | --- |
| `folderId` + `userId` | 한 폴더에 같은 사람이 두 번 들어가지 못하게 unique |
| `role` | `OWNER` 또는 `EDITOR` |
| `joinedAt` | 언제 들어왔는지 |

기존 `Folder.userId`(만든 사람)는 그대로 두고, **접근 권한은 멤버 테이블로 본다.**  
마이그레이션 때 이미 있던 폴더는 주인을 `OWNER` 멤버로 한 줄씩 넣어 준다. 기존 데이터가 깨지지 않게 하는 **백필(backfill)**이다.

`Folder.inviteCode`는 6자리, unique. 코드가 없는 폴더는 아직 초대를 안 연 상태다.

### 권한 모델 (RBAC를 작게)

큰 권한 시스템이 아니라 **폴더 단위 역할 두 개**다.

- **OWNER:** 폴더 수정/삭제, 초대 코드 발급·재발급, 링크 CRUD
- **EDITOR:** 링크 추가·수정·삭제, 폴더 내용은 읽기. 폴더 자체 삭제·초대 관리는 불가

백엔드에서 `requireFolderMember` / `requireFolderOwner`로 API마다 막는다.  
프론트는 버튼만 숨기는 게 아니라, **서버가 한 번 더 검사**한다. UI 숨김은 편의, 서버 검사는 보안이다.

### 초대 코드 설계

코드 생성 (`inviteCode.ts`):

- 알파벳에서 `I`, `O`, `0`, `1`처럼 헷갈리는 글자를 뺀다. (`ABCDEFGHJKLMNPQRSTUVWXYZ23456789`)
- `crypto.randomInt`로 고른다. `Math.random()`보다 **예측이 어려운 난수**다.
- 6자리라서 사람이 말로 전달하기 쉽다.

발급 시 충돌이 나면(우연히 같은 코드) 최대 12번까지 다시 뽑는다. Prisma unique 에러 `P2002`를 그 신호로 쓴다.

**재발급:** 새 코드를 쓰면 이전 코드는 무효. 카톡에 퍼진 옛 코드를 막을 수 있다.

**참여:** 앞뒤 공백·소문자를 정규화해서 `A7K3P9`처럼 맞춘다. 프론트도 6글자만 남기고 입력을 제한한다.

### 화면에서의 공동작업

- 홈: 내 폴더 그리드 + 아래쪽에 **함께 채우는 폴더** 섹션
- 폴더 카드: 멤버가 2명 이상이면 사람 수 배지
- 폴더 상세: 아바타 스택, “함께 채우는 사람 N명”, 공유 폴더 배지
- 링크 카드: 공유 폴더면 **누가 추가했는지** 작게 표시 (`createdBy`)

링크를 누가 넣었는지 남기려면 `Link.userId`가 작성자고, 폴더 멤버면 그 폴더에 쓸 수 있다.

### 이 기능이 쓰는 개념 요약

- **Resource membership:** 리소스(폴더)에 사용자를 붙이는 중간 테이블
- **Least privilege:** 편집은 되되 소유권은 넘기지 않음
- **Capability via code:** 링크 초대가 아니라 **짧은 공유 코드** (Discord/Notion 초대와 비슷한 UX)
- **Idempotent join:** 이미 멤버면 다시 들어가도 깨지지 않게 처리

---

## 5. 언어 설정 (i18n)

### 무엇이 되는가

설정(`/settings`)에서 **한국어 / English**를 고르면, 랜딩·로그인·회원가입·홈·폴더·프로필·모달 문구가 같이 바뀐다.  
로그인 전에는 헤더의 **EN / 한** 토글로도 바로 시험할 수 있다.

파일:

- `frontend/src/shared/i18n/messages.ts` — 한·영 문구 사전
- `frontend/src/shared/i18n/useT.ts` — `t("landing.login")` 같은 번역 함수
- `frontend/src/shared/i18n/localeStore.ts` — Zustand로 현재 언어 보관
- `frontend/src/shared/i18n/LocaleToggle.tsx`
- 화면 곳곳의 `t("...")`

### 직접 만든 작은 i18n

react-i18next 같은 라이브러리 대신 **키-값 사전 + 훅**으로 만들었다.

1. 모든 문구는 `"dash.myFolders"` 같은 **키**로만 코드에 적는다. 한국어 문장을 JSX에 직접 박지 않는다.
2. `messages.ko`와 `messages.en`이 **같은 키를 반드시 갖게** 타입으로 막는다. (`MessageKey`, `_enHasAllKeys`)
3. `t(key, { name: "디자인" })`은 `'{name}'`을 실제 값으로 치환한다.
4. 언어는 `localStorage` 키 `link-gallery-locale`에 저장된다. 새로고침해도 유지.
5. `document.documentElement.lang`을 `ko`/`en`으로 바꿔 브라우저·스크린리더가 언어를 알게 한다. (`applyLocale`)

### 왜 화면이 바로 바뀌는가

Zustand 스토어의 `locale`을 구독하는 `useT()` 때문이다. 언어를 바꾸면 그 훅을 쓰는 컴포넌트가 다시 렌더되고, `t()`가 영어 사전을 읽는다.

폼 검증(Zod)도 `tErr("validation.usernameMin")`처럼 **검사 순간에 현재 언어를 읽게** 해 두었다. 스키마를 만들 때 한국어로 고정되지 않는다.

### 아직 한국어로 남을 수 있는 것

- 백엔드 API 에러 문자열 (서버가 한국어로 내려 주는 경우)
- 이모지 검색 키워드 (`emojiCatalog.ts`는 한국어 검색어 중심)
- 사용자가 직접 만든 폴더 이름·링크 제목 (데이터이므로 번역하지 않음)

설정 힌트에도 “화면 문구는 바로 바뀌고, 서버 안내는 한국어일 수 있다”고 적어 두었다.

### 이 기능이 쓰는 개념 요약

- **i18n (internationalization):** 문구를 코드와 분리
- **Locale:** `ko` | `en` 같은 언어 코드
- **Message catalog:** 키 → 문장 사전
- **Source of truth:** 한국어 카피를 기준으로 영어를 짧게 맞춤 (기계번역 덤프가 아님)
- **Persistence:** localStorage
- **`html.lang`:** 문서 언어 메타

---

## 6. 같은 날에 같이 넣은 기능

공동작업·언어만 한 게 아니라, 폴더를 “내 공간”처럼 보이게 하는 주변 기능도 같이 올라갔다.

### 6-1. 프로필을 폴더처럼 꾸미기

- `/profile` = 나를 보여 주는 페이지 (배너, 아바타, 폴더 목록)
- `/settings` = 계정·테마·언어 (SoundCloud식으로 프로필과 설정을 나눔)

배너/아바타는 폴더 커버와 같은 **단색 / 그라데이션 / 사진** 피커를 쓴다.  
`CoverStylePicker`를 폴더와 프로필이 공유한다. UI 패턴을 한 번 만들고 두 곳에 쓴 **컴포넌트 재사용**이다.

DB: `User.avatarType`, `avatarValue`, `bannerType`, `bannerValue`

### 6-2. 링크 보기: 카드 vs 미리보기

폴더 안에서 보기 모드를 고를 수 있다.

- **카드:** 파비콘 + 이름 + 주소
- **미리보기:** 사이트가 공개한 대표 이미지 (`og:image`)

처음엔 외부 스크린샷(mshots)을 썼는데 “Generating Preview…”가 너무 느렸다.  
그래서 **백엔드가 HTML을 짧게 받아 Open Graph 이미지를 저장**하는 방식으로 바꿨다.

- `Link.previewImageUrl` 컬럼
- `link.preview.ts`: 2.5초 타임아웃, 비공개 IP·localhost 차단 (**SSRF 가드**)
- 이미지가 아직 없으면 파비콘으로 즉시 보여 주고, 나중에 OG를 채움

### 6-3. 테마 (라이트 / 다크 / 시스템)

- CSS 변수 토큰: `canvas`, `surface`, `ink`, `brand`
- `html`에 `.dark` 클래스를 토글
- Tailwind v4 `@custom-variant dark (&:where(.dark, .dark *))`
- 선호는 localStorage, **시스템**은 `prefers-color-scheme`

### 6-4. 계정 설정

- 비밀번호 변경: **아이디를 먼저 확인**한 뒤에 새 비밀번호 (구글 전용 계정은 비밀번호 없음)
- 데이터 초기화: 폴더·링크만 지우고 계정은 남김
- 탈퇴: 아이디(+ 로컬 계정이면 비밀번호) 확인

위험한 동작은 “확인” 문장을 읽게 하는 게 아니라 **본인 아이디를 다시 치게** 한다.

### 6-5. 헤더 메뉴

아바타 + 닉네임 드롭다운: 프로필 / 설정 / 로그아웃.  
테마 토글은 헤더에 작게 상주.

---

## 7. 기술 스택과 패턴 (복기용)

| 층 | 무엇 |
| --- | --- |
| 프론트 | React, Vite, React Router, Zustand, TanStack Query, Zod, Tailwind v4 |
| 백엔드 | Express, Prisma, MariaDB |
| 상태 | 서버 데이터는 Query, UI 선호(언어·테마·보기모드)는 Zustand + localStorage |
| 권한 | 폴더 멤버십 + OWNER/EDITOR |
| 보안 포인트 | 초대 코드 난수, 미리보기 SSRF 차단, 탈퇴/초기화 시 아이디 재확인 |

프론트 구조는 **도메인 폴더**(`domains/folders`, `domains/links`, `domains/auth`)와 **공유 UI/i18n**으로 나뉜다.  
페이지가 커져도 “폴더 기능은 folders에 있다”고 찾기 쉽게 하려는 선택이다.

---

## 8. 나중에 열어보면 좋은 파일

**마퀴**

- `frontend/src/app/pages/landing/MarqueeTags.tsx`
- `frontend/src/index.css`

**공동작업**

- `backend/prisma/migrations/20260826060000_folder_members/migration.sql`
- `backend/src/domains/folders/inviteCode.ts`
- `backend/src/domains/folders/folder.service.ts`
- `frontend/src/domains/folders/components/InviteFolderModal.tsx`
- `frontend/src/domains/folders/components/JoinFolderModal.tsx`

**언어**

- `frontend/src/shared/i18n/messages.ts`
- `frontend/src/shared/i18n/useT.ts`
- `frontend/src/shared/i18n/localeStore.ts`

**미리보기 / 프로필**

- `backend/src/domains/links/link.preview.ts`
- `frontend/src/domains/links/components/LinkCard.tsx`
- `frontend/src/domains/auth/pages/SettingsPage.tsx` (프로필)
- `frontend/src/domains/auth/pages/AccountSettingsPage.tsx` (설정)

---

## 9. 아직 남는 한계 (정직하게)

- API가 내려 주는 일부 에러 문구는 아직 한국어일 수 있다.
- 이모지 검색은 한국어 키워드 위주라, 영어 UI에서도 “pizza”보다 “피자”가 더 잘 맞을 수 있다.
- 공동작업은 **초대 코드 한 종류(편집 가능)** 만 있다. 읽기 전용 링크, 멤버 강퇴 UI는 없다.
- GitHub `develop`에 올린 커밋 메시지가 로컬과 다를 수 있다. 로컬은 `feat: 폴더 공동작업 기능 추가 및 언어 설정 추가`로 맞춰 둔 상태다.

이 세 줄은 “못 만든 것”이 아니라, **다음 스프린트 후보**로 보면 된다.
