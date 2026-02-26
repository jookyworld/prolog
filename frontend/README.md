# PROLOG Frontend (Web)

Next.js 기반 웹 프론트엔드

## 기술 스택

- **Framework:** Next.js 16.1.6
- **Language:** TypeScript 5.9.3
- **UI:** React 19.2.0, Tailwind CSS, shadcn/ui
- **State:** Zustand, React Query
- **Charts:** Recharts 2.15.4

## 개발 서버 실행

```bash
# 환경 변수 설정
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8080/api

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 브라우저
open http://localhost:3000
```

## 현재 상태

🚧 개발 중

백엔드 API와 연동하여 웹 버전 UI를 개발 중입니다.
모바일 앱(app/)과 동일한 기능을 제공할 예정입니다.

## 관련 문서

- [프로젝트 개요](../README.md)
- [API 명세](../API.md)
- [비즈니스 로직](../REQUIREMENTS.md)
