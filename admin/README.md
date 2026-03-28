# PROLOG Admin

ProLog 관리자 전용 웹 대시보드

## 기술 스택

- **Framework:** Next.js 15.1 + React 19 + TypeScript 5
- **UI:** shadcn/ui + Tailwind CSS
- **Auth:** JWT (기존 백엔드 `/api/auth/login` 동일 사용, role=ADMIN 검증)
- **Deploy:** Vercel (`admin.prolog.jooky.site`)

## 로컬 실행

```bash
cd admin
npm install
npm run dev   # http://localhost:3001
```

> 백엔드가 먼저 실행되어 있어야 함 (`http://localhost:8080`)

## 환경 변수

`admin/.env.local` (로컬 개발용):
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

프로덕션은 Vercel 환경 변수에서 관리:
```
NEXT_PUBLIC_API_URL=https://api.prolog.jooky.site
```

## 프로젝트 구조

```
admin/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                        # → /dashboard 리다이렉트
│   ├── login/page.tsx                  # 로그인 페이지
│   └── (dashboard)/                   # 인증 필요 영역
│       ├── layout.tsx                  # 사이드바 + AuthProvider
│       ├── dashboard/page.tsx          # 대시보드 홈
│       ├── users/page.tsx              # 유저 관리
│       ├── exercises/page.tsx          # 운동 종목 관리
│       ├── reports/page.tsx            # 신고 관리
│       └── sessions/page.tsx          # 세션 조회
├── components/
│   ├── ui/                             # shadcn/ui 기반 컴포넌트
│   ├── layout/Sidebar.tsx
│   ├── users/
│   │   ├── UserTable.tsx
│   │   └── UserDetailModal.tsx
│   ├── exercises/
│   │   ├── ExerciseTable.tsx
│   │   └── ExerciseFormModal.tsx
│   ├── reports/
│   │   ├── ReportTable.tsx
│   │   └── ReportDetailModal.tsx
│   └── sessions/
│       └── SessionTable.tsx
├── contexts/auth-context.tsx
├── lib/
│   ├── api.ts                          # 백엔드 API 호출
│   ├── auth.ts                         # 토큰/유저 쿠키·스토리지 관리
│   ├── types.ts                        # 공통 타입 정의
│   └── utils.ts
└── middleware.ts                       # 미인증 시 /login 리다이렉트
```

## 인증 방식

- 로그인 성공 시 `admin_token` 쿠키 + `admin_user` localStorage 저장
- `middleware.ts`가 모든 페이지 진입 시 쿠키 확인 → 없으면 `/login` 리다이렉트
- role이 `ADMIN`이 아닌 계정으로 로그인 시도 시 프론트에서 차단

---

## API 명세

> 모든 API는 `Authorization: Bearer {token}` 헤더 필수 (ADMIN 역할)
> URL 레벨 `hasRole('ADMIN')` + 메서드 레벨 `@PreAuthorize` 이중 보안 적용

### 대시보드

| Method | URL | 설명 |
|--------|-----|------|
| `GET` | `/api/admin/dashboard/stats` | 전체 유저 수, 공식 종목 수, 미처리 신고 수, 이번 달 세션 수 |

### 유저 관리

| Method | URL | 설명 |
|--------|-----|------|
| `GET` | `/api/admin/users` | 유저 목록 |
| `GET` | `/api/admin/users/{id}` | 유저 상세 조회 |

**Query Parameters (GET /users)**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `keyword` | string | 닉네임 / 아이디 / 이메일 검색 |
| `role` | `USER` \| `ADMIN` | 역할 필터 (생략 시 전체) |
| `page` | number | 0부터 시작 (default: 0) |
| `size` | number | 페이지 크기 (default: 20) |

### 운동 종목 관리

| Method | URL | 설명 |
|--------|-----|------|
| `GET` | `/api/admin/exercises` | 전체 종목 목록 |
| `POST` | `/api/admin/exercises` | 공식 종목 추가 |
| `PUT` | `/api/admin/exercises/{id}` | 공식 종목 수정 (커스텀 종목 수정 불가) |

**Request Body (POST / PUT)**
```json
{
  "name": "벤치프레스",
  "bodyPart": "가슴",
  "partDetail": "중부"
}
```

> `bodyPart`는 한국어 레이블 사용: `가슴` `어깨` `등` `팔` `하체` `코어` `유산소` `기타`

### 신고 관리

| Method | URL | 설명 |
|--------|-----|------|
| `GET` | `/api/admin/reports` | 신고 목록 |
| `PATCH` | `/api/admin/reports/{id}/status` | 신고 상태 변경 |
| `DELETE` | `/api/admin/community/routines/{id}` | 공유 루틴 삭제 → 해당 대상의 모든 신고 자동 RESOLVED |
| `DELETE` | `/api/admin/community/comments/{id}` | 댓글 삭제 → 해당 대상의 모든 신고 자동 RESOLVED |

**Query Parameters (GET /reports)**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `status` | `PENDING` \| `RESOLVED` \| `DISMISSED` | 상태 필터 (생략 시 전체) |
| `page` | number | default: 0 |
| `size` | number | default: 20 |

**Request Body (PATCH /reports/{id}/status)**
```json
{ "status": "DISMISSED" }
```

**신고 상태 흐름**

```
PENDING → DISMISSED       (기각)
PENDING → RESOLVED        (콘텐츠 삭제 시 자동)
DISMISSED → PENDING       (되돌리기)
DISMISSED → RESOLVED      (콘텐츠 삭제 시 자동)
RESOLVED → 변경 불가       (콘텐츠 이미 삭제됨)
```

### 세션 조회

| Method | URL | 설명 |
|--------|-----|------|
| `GET` | `/api/admin/sessions` | 완료된 워크아웃 세션 목록 |

**Query Parameters**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `keyword` | string | 닉네임 / 아이디 검색 |
| `from` | date (YYYY-MM-DD) | 조회 시작일 |
| `to` | date (YYYY-MM-DD) | 조회 종료일 |
| `page` | number | default: 0 |
| `size` | number | default: 20 |

---

## 구현 현황

| 단계 | 기능 | 상태 |
|------|------|------|
| 1 | 프로젝트 세팅 + 로그인 | ✅ 완료 |
| 2 | 운동 종목 관리 | ✅ 완료 |
| 3 | 유저 관리 | ✅ 완료 |
| 4 | 신고 관리 | ✅ 완료 |
| 5 | 대시보드 통계 | ✅ 완료 |
| - | 세션 조회 | ✅ 완료 |
