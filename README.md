# PROLOG - 운동 기록 관리 서비스

점진적 과부하 추적과 성장 분석을 통해 꾸준한 운동 습관 형성을 돕는 웹/앱 서비스

**Monorepo Structure**

---

## 📂 디렉토리 구조

```
prolog/
├── docs/              # 📖 프로젝트 문서
│   ├── README.md      # 프로젝트 개요, 진행 상황
│   ├── REQUIREMENTS.md # 비즈니스 로직, 데이터 모델
│   └── API.md         # API 명세서 (39개)
│
├── backend/           # 🖥️ Spring Boot API Server
│   ├── src/
│   ├── build.gradle.kts
│   └── README.md
│
├── app/               # 📱 Next.js Web App (나중에 React Native)
│   ├── src/
│   ├── package.json
│   └── README.md
│
└── admin/             # 👨‍💼 관리자 웹 (Phase 3)
    └── README.md
```

---

## 🚀 빠른 시작

### 📖 문서 먼저 읽기
```bash
cd docs
cat README.md
```

### 🖥️ 백엔드 실행
```bash
cd backend

# Docker로 MySQL + Redis 실행
docker-compose up -d

# 애플리케이션 실행
./gradlew bootRun

# Swagger UI
open http://localhost:8080/swagger-ui.html
```

### 📱 프론트엔드 실행
```bash
cd app

# 환경 변수 설정
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8080/api

# 실행
npm install
npm run dev

# 브라우저
open http://localhost:3000
```

---

## 🛠️ 기술 스택

### Backend
- Spring Boot 4.0.1
- Java 21
- MySQL 8.0+
- Redis 7.0+
- JWT Authentication

### Frontend (Web)
- Next.js 16.1.6
- TypeScript 5.9.3
- React 19.2.0
- Tailwind CSS + shadcn/ui

### Admin (Phase 3)
- TBD

---

## 📊 현재 진행 상황

- **Phase 1 (MVP Core)**: ✅ 완료 (2026-02-26)
- **Phase 2 (성장 통계)**: 🚧 진행 중 (20%)
- **Phase 3 (커뮤니티)**: 📋 계획

**총 API: 39개** (완료 26개 / 개발 중 5개 / 계획 8개)

---

## 🎯 배포 구조

```
┌─────────────┐
│   Browser   │
│  (Next.js)  │
└──────┬──────┘
       │ HTTP/REST
       │
┌──────▼────────────┐
│  Spring Boot API  │
│  (EC2)            │
└──────┬────────────┘
       │
┌──────▼──────┐     ┌────────┐
│   MySQL     │     │ Redis  │
│  (RDS)      │     │        │
└─────────────┘     └────────┘
```

### 배포 환경
- **Backend**: AWS EC2 (예정)
- **Frontend (App)**: App Store / Play Store (예정)
- **Frontend (Web)**: Vercel or 자체 서버 (예정)
- **Admin**: Vercel (Phase 3)

---

## 📝 주요 문서

| 문서 | 설명 |
|------|------|
| [docs/README.md](./docs/README.md) | 프로젝트 개요, 기술 스택, 진행 상황 |
| [docs/REQUIREMENTS.md](./docs/REQUIREMENTS.md) | 비즈니스 로직, 데이터 모델 |
| [docs/API.md](./docs/API.md) | API 명세서 (39개 엔드포인트) |
| [backend/README.md](./backend/README.md) | 백엔드 개발 가이드 |
| [app/README.md](./app/README.md) | 프론트엔드 개발 가이드 |

---

## 🔧 개발 워크플로우

### Git 브랜치 전략
```
main
  └── develop
      ├── feature/backend-stats-api
      ├── feature/app-dashboard
      └── feature/admin-user-management
```

### 커밋 컨벤션
```
<type>(<scope>): <subject>

예시:
- feat(backend): 통계 API 추가
- fix(app): 로그인 버그 수정
- docs: API 명세 업데이트
```

### CI/CD (예정)
```yaml
# .github/workflows/backend-deploy.yml
on:
  push:
    paths:
      - 'backend/**'

# .github/workflows/app-deploy.yml
on:
  push:
    paths:
      - 'app/**'

# .github/workflows/admin-deploy.yml
on:
  push:
    paths:
      - 'admin/**'
```

---

## 📞 문의

- **GitHub**: [Repository Link]
- **Email**: [Contact Email]

---

**버전:** v1.0.0
**최종 업데이트:** 2026-02-26
