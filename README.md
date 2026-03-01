# PROLOG - 운동 기록 관리 서비스

**점진적 과부하 추적과 성장 분석을 통해 꾸준한 운동 습관 형성을 돕는 웹/앱 서비스**

**버전:** v1.0.0
**최종 업데이트:** 2026-02-26

---

## 📖 문서 구조

| 문서 | 내용 |
|------|------|
| **README.md** (현재 문서) | 프로젝트 개요, 기술 스택, 진행 상황 |
| **[DEVELOPMENT.md](./DEVELOPMENT.md)** | 개발 가이드 (작업 패턴, 파일 위치, 배포) |
| **[API.md](./API.md)** | API 명세서 (39개 엔드포인트) |
| **[REQUIREMENTS.md](./REQUIREMENTS.md)** | 비즈니스 로직, 핵심 가치, 데이터 모델 |
| **[backend/README.md](./backend/README.md)** | 백엔드 상세 가이드 |
| **[app/README.md](./app/README.md)** | 모바일 앱 상세 가이드 |

---

## 📂 Monorepo 구조

```
prolog/
├── backend/           # 🖥️ Spring Boot API Server
│   ├── src/
│   ├── build.gradle.kts
│   ├── docker-compose.yml
│   └── README.md
│
├── app/               # 📱 Expo React Native App
│   ├── app/           # 화면 (파일 기반 라우팅)
│   ├── components/    # UI 컴포넌트
│   ├── lib/           # API, 타입, 유틸
│   ├── package.json
│   └── README.md
│
├── admin/             # 👨‍💼 관리자 웹 (Phase 3 예정)
│   └── README.md
│
├── API.md             # API 명세서
├── REQUIREMENTS.md    # 비즈니스 로직 문서
├── DEVELOPMENT.md     # 개발 가이드 (작업 패턴, 파일 위치)
└── README.md          # 프로젝트 개요 (현재 문서)
```

---

## 🚀 빠른 시작

### 🖥️ 백엔드 실행

```bash
cd backend

# Docker로 MySQL + Redis 실행
docker-compose up -d

# 환경 변수 설정 (.env)
# JWT_SECRET, MYSQL_PASSWORD 등 설정 필요

# 애플리케이션 실행
./gradlew bootRun

# Swagger UI
open http://localhost:8080/swagger-ui/index.html
```

### 📱 모바일 앱 실행

```bash
cd app

# 환경 변수 설정 (.env)
# EXPO_PUBLIC_API_URL=http://localhost:8080

# 의존성 설치 및 실행
npm install
npx expo start
```


---

## 🛠️ 기술 스택

### Backend
- **Framework:** Spring Boot 4.0.1
- **Language:** Java 21
- **Database:** MySQL 8.0+
- **Cache:** Redis 7.0+
- **ORM:** Spring Data JPA (Hibernate)
- **Security:** Spring Security + JWT
- **API Docs:** Swagger (springdoc-openapi)
- **Container:** Docker, Docker Compose

### Mobile App
- **Framework:** Expo SDK + React Native
- **Language:** TypeScript 5.9.3
- **UI:** NativeWind (Tailwind for RN)
- **Routing:** Expo Router (파일 기반)
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React Native

### Admin (Phase 3 예정)
- **Framework:** Next.js (예정)
- **UI:** Tailwind CSS, shadcn/ui
- **Deploy:** Vercel

### Infrastructure
- **Container:** Docker
- **CI/CD:** GitHub Actions
- **Deploy:** AWS EC2 (Backend), App Store/Play Store (App)

---

## 🎯 시스템 아키텍처

```
┌──────────────────┐
│   Mobile App     │
│  (Expo / RN)     │
└────────┬─────────┘
         │ HTTP/REST API
         │
┌────────▼─────────┐
│ Spring Boot API  │
│   (JWT Auth)     │
└────────┬─────────┘
         │
┌────────┴─────────┐
│                  │
┌────▼─────┐  ┌───▼────┐
│  MySQL   │  │ Redis  │
│ (RDS)    │  │(Cache) │
└──────────┘  └────────┘
```

---

## 📊 진행 상황

### 전체 진행률

| Phase | 상태 | 진행률 | 완료일 |
|-------|------|--------|--------|
| **Phase 1: MVP Core** | ✅ 완료 | 100% (26/26 API) | 2026-02-26 |
| **Phase 2: 성장 통계** | 🚧 진행 중 | 20% (1/5 API) | 2026-03-31 (예정) |
| **Phase 3-1: 커뮤니티 기본** | ✅ 완료 | 100% (6/6 API) | 2026-03-01 |
| **Phase 3-2: 커뮤니티 고급** | 📋 계획 | 0% (0/2 API) | 2026-04-30 (예정) |

### API 개발 현황

**총 39개 API**

| 도메인 | 완료 | 진행 중 | 계획 |
|--------|------|---------|------|
| Auth (인증) | 6 | 0 | 0 |
| Users (사용자) | 1 | 0 | 0 |
| Exercises (운동 종목) | 2 | 0 | 0 |
| Routines (루틴) | 7 | 0 | 0 |
| Workout Sessions (운동 세션) | 8 | 0 | 0 |
| Stats (통계) | 1 | 4 | 0 |
| Community (커뮤니티) | 6 | 0 | 2 |
| Admin (관리자) | 2 | 0 | 0 |

---

## 💡 핵심 가치

### 1. 점진적 과부하 추적 (Progressive Overload)
- 동일 루틴 반복 시 회차별 성장 확인
- `GET /api/workouts/sessions/routines/{routineId}/last` - 직전 회차 조회

### 2. 실시간 피드백
- 루틴 수행 시 직전 기록 참고하여 목표 설정

### 3. 스냅샷 기반 영속성
- 과거 기록은 절대 변경되지 않음
- 루틴/종목 수정해도 기록 불변

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
- chore(gitignore): 보안 파일 필터 강화
```

### CI/CD 구조

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
```

---

## 📝 주요 기능 (Phase 1 완료)

### 인증/인가 (6개 API)
- 회원가입, 로그인, 내 정보 조회, 로그아웃, 토큰 갱신, 회원 탈퇴
- JWT 기반 인증, BCrypt 비밀번호 해싱

### 사용자 관리 (1개 API)
- 프로필 수정

### 운동 종목 (2개 API)
- 운동 종목 목록 조회, 커스텀 종목 추가
- BodyPart Enum 8가지

### 루틴 관리 (7개 API)
- 루틴 CRUD, 활성화/비활성화

### 운동 세션 (8개 API)
- 세션 CRUD, 진행 중인 세션 조회, 루틴의 최근 세션 조회
- 4가지 완료 액션 정책

### 통계 (1개 API)
- 홈 화면 통계 (이번 주/달, 주간 활동, 자주 하는 운동 TOP 5, 최근 기록)

### 관리자 (2개 API)
- 전체 운동 종목 조회, 기본 종목 추가

---

## 🔐 보안

- **인증:** JWT (Access Token 1시간, Refresh Token 7일)
- **비밀번호:** BCrypt 해싱 (strength 10)
- **입력 검증:** Bean Validation
- **SQL Injection 방지:** JPA 사용
- **CORS:** 환경변수로 허용 origin 관리
- **토큰 저장:** Expo Secure Store (암호화)

---

## 🚀 성능 최적화

### 데이터베이스 인덱스

```sql
-- 세션 조회 최적화
CREATE INDEX idx_session_user_completed ON workout_sessions (user_id, completed_at);

-- 세트 조회 최적화
CREATE INDEX idx_set_exercise_session ON workout_sets (exercise_id, workout_session_id);

-- 루틴 조회 최적화
CREATE INDEX idx_routine_user_active ON routines (user_id, active);
```

### 캐싱 전략 (Redis)

| 데이터 | TTL | 갱신 조건 |
|--------|-----|-----------|
| 홈 화면 통계 | 5분 | 세션 완료 시 |
| 운동 종목 목록 | 1시간 | 종목 추가/수정 시 |
| Refresh Token | 7일 | 로그아웃 시 삭제 |

---

## 📋 개발 로드맵

### 2026년 Q1 (1~3월)

| 주차 | 목표 | 상태 |
|------|------|------|
| Week 1-2 | 프로젝트 설정, 인증 시스템 | ✅ 완료 |
| Week 3-4 | 루틴 및 운동 기록 핵심 기능 | ✅ 완료 |
| Week 5-6 | 홈 통계 API, 도메인 리팩토링 | ✅ 완료 |
| Week 7-8 | 성장 통계 API 개발 | 🚧 진행 중 |
| Week 9-10 | 프론트엔드 통합 | 📋 예정 |
| Week 11-12 | 통합 테스트, 버그 수정 | 📋 예정 |

### 2026년 Q2 (4~6월)

| 주차 | 목표 |
|------|------|
| Week 1-2 | 커뮤니티 백엔드 개발 |
| Week 3-4 | 커뮤니티 프론트엔드 개발 |
| Week 5-6 | 베타 테스터 모집 (20~50명) |
| Week 7-8 | 사용자 피드백 수집 및 반영 |
| Week 9-10 | 성능 최적화 |
| Week 11-12 | UX 개선, 최종 QA |

### 2026년 Q3 (7~9월)
- 정식 서비스 오픈
- 마케팅 및 사용자 확보

---

## 🎓 코딩 컨벤션

### 백엔드 (Java)
- 레이어 분리: Controller → Service → Repository → Entity
- DTO 필수 사용 (Entity 직접 반환 금지)
- Lombok 활용: `@RequiredArgsConstructor`, `@Getter`, `@Builder`

### 프론트엔드 (TypeScript)
- `any` 사용 금지
- Custom Hook으로 API 호출 로직 분리
- React Query 사용 (웹)

---

## 📞 문의

- **GitHub**: [Repository Link]
- **Email**: [Contact Email]

---

**프로젝트 진행 중 | Phase 2 개발 중 🚧**
