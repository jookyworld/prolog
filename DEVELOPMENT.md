# 개발 가이드 (DEVELOPMENT.md)

**Claude Code / AI 에이전트 / 개발자를 위한 실용 가이드**

---

## 📁 프로젝트 구조 (3개 프로젝트)

```
prolog/
├── backend/           # Spring Boot API Server (배포 완료)
├── app/               # React Native 사용자 앱 (출시 예정)
└── admin/             # Next.js 관리자 웹 (Phase 3 개발 예정)
```

### 각 프로젝트 역할

| 프로젝트 | 기술 | 역할 | 상태 | 포트 |
|---------|------|------|------|------|
| **backend** | Spring Boot + MySQL + Redis | REST API 서버 | ✅ 배포 완료 | 8080 |
| **app** | Expo + React Native + TypeScript | 사용자 모바일 앱 | 🚀 출시 준비 중 | Expo 앱 |
| **admin** | Next.js (예정) | 관리자 웹 대시보드 | 📋 Phase 3 계획 | 3001 |

---

## 🚀 빠른 시작

### 전체 프로젝트 실행 (로컬 개발)

```bash
# 1. Backend (터미널 1)
cd backend
docker-compose up -d  # MySQL + Redis
./gradlew bootRun

# 2. App (터미널 2)
cd app
npm install
npx expo start

# 3. Admin (Phase 3 이후)
cd admin
npm run dev
```

### 환경 변수 필수 설정

**backend/.env**
```env
JWT_SECRET=your_secret_key
MYSQL_PASSWORD=your_password
```

**app/.env**
```env
EXPO_PUBLIC_API_URL=http://localhost:8080
```

---

## 📍 핵심 파일 위치 맵

### Backend (Spring Boot)

```
backend/src/main/java/com/back/
├── domain/
│   ├── user/
│   │   ├── auth/          ← 로그인, 회원가입, JWT
│   │   └── user/          ← 프로필 조회/수정
│   ├── exercise/          ← 운동 종목 관리
│   ├── routine/           ← 루틴 CRUD
│   │   ├── routine/
│   │   └── routineItem/
│   ├── workout/           ← 운동 세션 & 세트
│   │   ├── session/
│   │   └── set/
│   └── stats/             ← 통계 (Phase 2)
└── global/
    ├── security/          ← JWT 필터, SecurityConfig
    ├── exception/         ← 예외 처리
    └── config/            ← Swagger 등 설정
```

**주요 설정 파일:**
- `application.yml` - 공통 설정
- `application-local.yml` - 로컬 환경
- `application-prod.yml` - 운영 환경
- `docker-compose.yml` - MySQL + Redis

### App (React Native)

```
app/
├── app/                   ← 화면 (파일 기반 라우팅)
│   ├── (auth)/            ← 로그인, 회원가입
│   └── (tabs)/            ← 메인 앱 (5개 탭)
│       ├── index.tsx      ← 홈 (통계 대시보드)
│       ├── routine/       ← 루틴 관리
│       ├── workout/       ← 운동 세션
│       ├── community/     ← 커뮤니티 (Phase 3)
│       └── profile/       ← 프로필, 기록 보관함
├── components/
│   ├── AuthGuard.tsx      ← 인증 라우팅 보호
│   └── ui/                ← 재사용 UI 컴포넌트
├── lib/
│   ├── api/               ← API 호출 함수
│   │   ├── auth.ts
│   │   ├── exercise.ts
│   │   ├── routine.ts
│   │   └── workout.ts
│   ├── types/             ← TypeScript 타입
│   └── validations/       ← Zod 스키마
└── contexts/
    └── auth-context.tsx   ← 전역 인증 상태
```

**주요 설정 파일:**
- `app.json` - Expo 앱 설정
- `tailwind.config.js` - 디자인 토큰
- `.env` - API URL 등 환경 변수

---

## 🔄 일반적인 작업 패턴

### 1. 새 API 엔드포인트 추가

**Backend:**
```bash
# 1. DTO 정의
backend/src/main/java/com/back/domain/{domain}/dto/

# 2. Service 로직 작성
backend/src/main/java/com/back/domain/{domain}/service/

# 3. Controller 엔드포인트 추가
backend/src/main/java/com/back/domain/{domain}/controller/

# 4. Swagger 문서 자동 생성됨
http://localhost:8080/swagger-ui/index.html
```

**App (API 연동):**
```bash
# 1. 타입 정의
app/lib/types/{domain}.ts

# 2. API 함수 작성
app/lib/api/{domain}.ts

# 3. 화면에서 호출
app/app/(tabs)/{screen}.tsx
```

### 2. 새 화면 추가 (App)

```bash
# 파일만 만들면 자동 라우팅 등록
app/app/(tabs)/{탭이름}/{화면이름}.tsx

# 동적 라우트
app/app/(tabs)/routine/[id].tsx  → /routine/123
```

### 3. 새 도메인 추가 (Backend)

```bash
backend/src/main/java/com/back/domain/{새도메인}/
├── controller/
├── service/
├── repository/
├── entity/
└── dto/
```

패키지 구조: `controller` → `service` → `repository` → `entity`

### 4. 데이터베이스 스키마 변경

```bash
# 1. Entity 수정
backend/src/main/java/com/back/domain/{domain}/entity/

# 2. 로컬에서 자동 DDL (spring.jpa.hibernate.ddl-auto=update)
# 3. 운영은 validate 모드 → 수동 마이그레이션 필요
```

---

## 📦 배포 정보

### Backend (이미 배포됨)

**플랫폼:** AWS EC2
**CI/CD:** GitHub Actions (`.github/workflows/deploy.yml`)

```bash
# Docker 이미지 빌드 & 푸시
docker build -t jookyworld/prolog-backend:latest .
docker push jookyworld/prolog-backend:latest

# EC2에서 자동 배포 (GitHub Actions)
git push origin main
```

**환경 변수 (EC2):**
- `JWT_SECRET`
- `MYSQL_PASSWORD`
- `CORS_ALLOWED_ORIGINS`

### App (출시 예정)

**플랫폼:** App Store / Google Play

```bash
# EAS Build 설정 필요
npx eas build --platform ios
npx eas build --platform android

# Submit
npx eas submit --platform ios
npx eas submit --platform android
```

### Admin (Phase 3 이후)

**예정 플랫폼:** Vercel

---

## 🎯 Monorepo 작업 규칙

### Git 워크플로우

```bash
# 브랜치 전략
main                    # 운영 배포
  └── develop           # 개발 통합
      ├── feature/backend-{기능명}
      ├── feature/app-{기능명}
      └── feature/admin-{기능명}
```

### 커밋 메시지

```
<type>(<scope>): <subject>

예시:
feat(backend): 통계 API 추가
fix(app): 로그인 버그 수정
chore(gitignore): 보안 파일 필터 강화
docs: API 명세 업데이트
```

**Type:**
- `feat`: 새 기능
- `fix`: 버그 수정
- `refactor`: 리팩토링
- `docs`: 문서 변경
- `chore`: 설정, 빌드 등
- `test`: 테스트 추가/수정

**Scope:**
- `backend`, `app`, `admin`
- 또는 도메인명: `auth`, `routine`, `workout`

### 작업 시작 전 체크리스트

1. **어느 프로젝트에서 작업하나?**
   - Backend → API, 비즈니스 로직
   - App → 사용자 UI/UX
   - Admin → 관리 기능

2. **관련 문서 확인**
   - API.md - API 명세
   - REQUIREMENTS.md - 비즈니스 로직
   - backend/README.md - 백엔드 상세
   - app/README.md - 앱 상세

3. **환경 변수 설정 확인**
   - `.env` 파일 존재 여부
   - 필수 변수 설정 확인

---

## 🔍 자주 하는 작업

### Backend: 새 도메인 추가

```bash
# 예: Community 도메인 추가
1. entity 정의 (JPA)
2. repository 인터페이스
3. service 비즈니스 로직
4. dto 요청/응답 타입
5. controller REST API
```

### App: 새 화면 추가

```bash
# 예: 커뮤니티 상세 화면
1. app/app/(tabs)/community/[id].tsx 생성
2. lib/types/community.ts 타입 정의
3. lib/api/community.ts API 함수
4. 화면에서 API 호출
```

### 공통: API 변경 시 동기화

```bash
# Backend API 변경 시
1. backend에서 API 수정
2. Swagger 확인 (http://localhost:8080/swagger-ui)
3. app/lib/types/ 타입 업데이트
4. app/lib/api/ 함수 업데이트
5. 화면 코드 수정
```

---

## 🐛 문제 해결 (Troubleshooting)

### Backend

**포트 충돌 (8080 already in use)**
```bash
lsof -ti:8080 | xargs kill -9
```

**MySQL 연결 실패**
```bash
docker-compose down
docker-compose up -d
```

**Redis 연결 실패**
```bash
docker-compose restart redis
```

### App

**Metro 번들러 오류**
```bash
npx expo start -c  # 캐시 클리어
```

**iOS/Android 빌드 실패**
```bash
cd ios && pod install  # iOS
cd android && ./gradlew clean  # Android
```

**API 연결 안 됨**
```bash
# .env 파일 확인
EXPO_PUBLIC_API_URL=http://localhost:8080

# iOS 시뮬레이터는 localhost 사용
# Android 에뮬레이터는 10.0.2.2:8080 사용
```

---

## 📊 현재 진행 상황 (2026-02-26)

### Phase 1: MVP Core ✅ (완료)
- 인증/인가 (6 API)
- 루틴 관리 (7 API)
- 운동 세션 (8 API)
- 기본 통계 (1 API)

### Phase 2: 성장 통계 🚧 (20% 완료)
- [ ] 종목별 볼륨 추이 API
- [ ] 종목별 최고 중량 추이 API
- [ ] 루틴별 회차 비교 API
- [ ] 운동 요약 대시보드 API

### Phase 3: 커뮤니티 📋 (계획)
- 루틴 공유 (8 API)
- Admin 웹 개발

---

## 💡 개발 팁

### Backend

1. **레이어 분리 엄수**: Controller → Service → Repository → Entity
2. **DTO 필수**: Entity 직접 반환 금지
3. **예외 처리**: `@ControllerAdvice`로 통합 관리 중
4. **트랜잭션**: `@Transactional` 적극 활용

### App

1. **타입 안정성**: `any` 사용 금지
2. **API 호출**: lib/api 함수 사용, 직접 fetch 금지
3. **상태 관리**: Context API 사용 (Zustand 미사용)
4. **폼 검증**: react-hook-form + zod

### 공통

1. **환경 변수**: 민감 정보는 반드시 .env
2. **Git**: 작은 단위로 자주 커밋
3. **문서화**: API 변경 시 API.md 업데이트

---

## 📚 추가 참고 문서

| 문서 | 용도 |
|------|------|
| [README.md](./README.md) | 프로젝트 개요 |
| [API.md](./API.md) | API 명세서 (39개) |
| [REQUIREMENTS.md](./REQUIREMENTS.md) | 비즈니스 로직 |
| [backend/README.md](./backend/README.md) | 백엔드 상세 가이드 |
| [app/README.md](./app/README.md) | 앱 상세 가이드 |

---

**작업 시작 전 이 문서를 먼저 확인하세요!** 🚀
