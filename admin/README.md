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
│   ├── layout.tsx                  # 루트 레이아웃
│   ├── page.tsx                    # → /dashboard 리다이렉트
│   ├── login/
│   │   └── page.tsx                # 로그인 페이지
│   └── (dashboard)/                # 인증 필요 영역
│       ├── layout.tsx              # 사이드바 + AuthProvider
│       └── dashboard/
│           └── page.tsx            # 대시보드 홈
├── components/
│   ├── ui/                         # shadcn/ui 기반 컴포넌트
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── label.tsx
│   └── layout/
│       └── Sidebar.tsx             # 좌측 네비게이션
├── contexts/
│   └── auth-context.tsx            # 로그인 유저 상태 관리
├── lib/
│   ├── api.ts                      # 백엔드 API 호출
│   ├── auth.ts                     # 토큰/유저 쿠키·스토리지 관리
│   ├── types.ts                    # 공통 타입 정의
│   └── utils.ts                    # cn() 유틸
└── middleware.ts                   # 미인증 시 /login 리다이렉트
```

## 인증 방식

- 로그인 성공 시 `admin_token` 쿠키 + `admin_user` localStorage 저장
- `middleware.ts`가 모든 페이지 진입 시 쿠키 확인 → 없으면 `/login` 리다이렉트
- role이 `ADMIN`이 아닌 계정으로 로그인 시도 시 프론트에서 차단

## 구현 현황

| 단계 | 기능 | 상태 |
|------|------|------|
| 1 | 프로젝트 세팅 + 로그인 | ✅ 완료 |
| 2 | 운동 종목 관리 | 📋 예정 |
| 3 | 유저 관리 | 📋 예정 |
| 4 | 신고 관리 | 📋 예정 |
| 5 | 대시보드 통계 | 📋 예정 |
