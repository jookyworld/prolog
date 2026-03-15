# PROLOG - 운동 기록 관리 서비스

**점진적 과부하 추적과 성장 분석을 통해 꾸준한 운동 습관 형성을 돕는 모바일 앱**

**앱 이름:** ProLog: 상급노하우 | **버전:** v1.0.0 | **최종 업데이트:** 2026-03-16

---

## 📖 문서

| 문서 | 대상 | 내용 |
|------|------|------|
| [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) | 개발자 | 파일 구조, 작업 패턴, 배포, 트러블슈팅 |
| [docs/REQUIREMENTS.md](./docs/REQUIREMENTS.md) | 개발자 | 비즈니스 로직, 데이터 모델 |
| [docs/USER_GUIDE.md](./docs/USER_GUIDE.md) | 앱 사용자 | 앱 사용 방법 |
| Swagger UI | 개발자 | API 명세 (https://api.prolog.jooky.site/swagger-ui/index.html) |

---

## 📂 구조

```
prolog/
├── backend/           # Spring Boot API Server
├── application/       # Expo React Native 사용자 앱 ("ProLog: 상급노하우")
├── web/               # Next.js 공식 웹페이지 (이용약관, 서비스 소개 등)
├── admin/             # 관리자 웹 (미개발, 추후 예정)
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

### Web (공식 페이지)
- Next.js / React 19 / TypeScript
- TailwindCSS

---

## 🌐 배포 현황

| 항목 | 상태 | 주소 / 비고 |
|------|------|-------------|
| **Backend API** | ✅ 운영 중 (중단 배포) | `https://api.prolog.jooky.site` |
| **Swagger UI** | ✅ 운영 중 | `https://api.prolog.jooky.site/swagger-ui/index.html` |
| **Mobile App** | ✅ v1.0.0 완성, TestFlight 정식 배포 준비 중 | Bundle ID: `com.jooky.prolog` |
| **공식 웹페이지** | 🚧 개발 중 | 이용약관, 서비스 소개 |
| **Admin Web** | 📋 미개발 | 추후 예정 |

> **배포 방식:** 현재 EC2 Docker Compose 기반 중단 배포. 추후 Blue-Green 무중단 배포로 전환 예정.

---

## 🚀 빠른 시작

```bash
# Backend
cd backend
docker-compose up -d
./gradlew bootRun

# App
cd application
npm install
npx expo start
```

자세한 설정 방법 → [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)

---

## 📊 진행 상황

| Phase | 내용 | 상태 | 비고 |
|-------|------|------|------|
| **Phase 1** | MVP Core (인증, 루틴, 운동 세션) | ✅ 완료 | v1.0.0 포함 |
| **Phase 2-1** | 홈 통계 (주간/월간 요약, 주간 활동, 종목 진행도) | ✅ 완료 | v1.0.0 포함 |
| **Phase 2-2** | 성장 통계 (볼륨 추이, 최고 중량, 루틴별 비교) | 📋 향후 추가 | 정식 배포 후 |
| **Phase 3-1** | 커뮤니티 기본 (공유, 가져오기, 댓글) | ✅ 완료 | v1.0.0 포함 |
| **Phase 3-2** | 커뮤니티 고급 (좋아요, 추천) | 📋 향후 추가 | 정식 배포 후 |
| **UI/UX 개선** | 애니메이션, 화면 구성 등 | ✅ v1.0.0 기준 완료 | |

> v1.0.0은 TestFlight 정식 배포 기준 완성 상태. 이후 기능은 정식 배포 후 순차 추가.
> 긴급 버그/수정은 예외적으로 우선 처리.
