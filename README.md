# PROLOG - 운동 기록 관리 서비스

**점진적 과부하 추적과 성장 분석을 통해 꾸준한 운동 습관 형성을 돕는 모바일 앱**

**버전:** v1.0.0 | **최종 업데이트:** 2026-03-08

---

## 📖 문서

| 문서 | 대상 | 내용 |
|------|------|------|
| [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) | 개발자 | 파일 구조, 작업 패턴, 배포, 트러블슈팅 |
| [docs/REQUIREMENTS.md](./docs/REQUIREMENTS.md) | 개발자 | 비즈니스 로직, 데이터 모델 |
| [docs/USER_GUIDE.md](./docs/USER_GUIDE.md) | 앱 사용자 | 앱 사용 방법 |
| Swagger UI (로컬) | 개발자 | API 명세 (http://localhost:8080/swagger-ui) |

---

## 📂 구조

```
prolog/
├── backend/           # Spring Boot API Server
├── app/               # Expo React Native App
├── admin/             # Next.js 관리자 웹 (예정)
└── docs/              # 프로젝트 문서
```

---

## 🛠️ 기술 스택

### Backend
- Spring Boot 4.0.1 / Java 21
- MySQL 8.0 + Redis 7.0
- Spring Security + JWT
- Docker, GitHub Actions → AWS EC2

### Mobile App
- Expo SDK 54 / React Native 0.81.5 / TypeScript
- NativeWind 4.2.1 / Expo Router 6 (파일 기반 라우팅)
- React Hook Form + Zod

---

## 🚀 빠른 시작

```bash
# Backend
cd backend
docker-compose up -d
./gradlew bootRun

# App
cd app
npm install
npx expo start
```

자세한 설정 방법 → [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)

---

## 📊 진행 상황

| Phase | 내용 | 상태 | 진행률 |
|-------|------|------|--------|
| **Phase 1** | MVP Core (인증, 루틴, 운동 세션, 기본 통계) | ✅ 완료 | 100% |
| **Phase 2** | 성장 통계 (볼륨 추이, 최고 중량, 회차 비교) | 🚧 진행 중 | 20% |
| **Phase 3-1** | 커뮤니티 기본 (공유, 가져오기, 댓글) | ✅ 완료 | 100% |
| **Phase 3-2** | 커뮤니티 고급 (좋아요, 추천) | 📋 계획 | 0% |
| **UI/UX 개선** | 운동 화면 개편, 모달 네비게이션 | 🚧 진행 중 | - |
