# 개발 가이드

**Claude Code / AI 에이전트 / 개발자를 위한 실용 가이드**

---

## 📁 프로젝트 구조

```
prolog/
├── backend/           # Spring Boot API Server (배포 완료)
├── app/               # React Native 사용자 앱 (UI/UX 개선 중)
├── admin/             # Next.js 관리자 웹 (Phase 3-2 예정)
├── README.md
└── docs/
    ├── API.md
    ├── REQUIREMENTS.md
    ├── DEVELOPMENT.md  ← 현재 문서
    └── USER_GUIDE.md
```

### 각 프로젝트 역할

| 프로젝트 | 기술 | 역할 | 상태 | 포트 |
|---------|------|------|------|------|
| **backend** | Spring Boot 4.0.1 + MySQL + Redis | REST API 서버 | ✅ 배포 완료 | 8080 |
| **app** | Expo 54 + React Native 0.81.5 | 사용자 모바일 앱 | 🚧 UI/UX 개선 중 | Expo 앱 |
| **admin** | Next.js (예정) | 관리자 웹 대시보드 | 📋 Phase 3-2 계획 | 3001 |

---

## 🚀 빠른 시작

```bash
# 1. Backend (터미널 1)
cd backend
docker-compose up -d        # MySQL + Redis
./gradlew bootRun

# 2. App (터미널 2)
cd app
npm install
npx expo start
```

### 환경 변수 설정

**backend/.env**
```env
JWT_SECRET=your_secret_key
MYSQL_PASSWORD=your_password
```

**app/.env**
```env
EXPO_PUBLIC_API_URL=http://YOUR_MAC_IP:8080
# iOS 시뮬레이터는 localhost 사용 불가 → Mac IP 직접 입력
# Mac IP 확인: ifconfig | grep "inet " | grep -v 127.0.0.1
```

---

## 📍 핵심 파일 위치

### Backend

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
│   ├── community/         ← 커뮤니티 (Phase 3-1 ✅)
│   │   ├── sharedRoutine/ ← 공유 루틴, 가져오기, ImportHistory
│   │   └── comment/       ← 댓글 CRUD
│   ├── stats/             ← 통계 (Phase 2)
│   └── home/              ← 홈 화면 통계
└── global/
    ├── security/          ← JWT 필터, SecurityConfig
    ├── exception/         ← 예외 처리
    ├── converter/         ← JSON 컨버터
    └── config/            ← Swagger 등 설정
```

**주요 설정 파일:**
- `application.yml` / `application-local.yml` / `application-prod.yml`
- `docker-compose.yml` — MySQL 8.0 + Redis 7

### App

```
app/
├── app/                   ← 화면 (파일 기반 라우팅)
│   ├── _layout.tsx        ← Root Stack (Modal 지원 위해 Stack 필수)
│   ├── (auth)/            ← 로그인, 회원가입
│   ├── (tabs)/            ← 메인 앱 (5개 탭)
│   │   ├── index.tsx      ← 홈 (통계 대시보드)
│   │   ├── routine/       ← 루틴 관리
│   │   ├── workout/       ← 운동 세션
│   │   ├── community/     ← 커뮤니티
│   │   └── profile/       ← 프로필, 기록, 설정
│   └── (modal)/           ← 모달 화면
│       └── select-exercises.tsx
├── components/
│   ├── AuthGuard.tsx
│   ├── CustomTabBar.tsx
│   └── ui/
├── lib/
│   ├── api/               ← API 호출 함수 (auth, routine, workout, community, home, exercise, user)
│   ├── types/             ← TypeScript 타입
│   ├── validations/       ← Zod 스키마
│   ├── constants.ts
│   ├── format.ts
│   └── utils.ts
└── contexts/
    └── auth-context.tsx   ← 전역 인증 상태
```

---

## 🔄 작업 패턴

### 새 API 엔드포인트 추가

**Backend:**
```
1. entity 정의 (JPA)
2. repository 인터페이스
3. dto 요청/응답 타입
4. service 비즈니스 로직
5. controller REST API
→ Swagger 자동 생성: http://localhost:8080/swagger-ui/index.html
```

**App 연동:**
```
1. lib/types/{domain}.ts  ← 타입 정의
2. lib/api/{domain}.ts    ← API 함수
3. app/(tabs)/{screen}.tsx ← 화면에서 호출
```

### 새 화면 추가 (App)

```bash
# 파일만 생성하면 자동 라우팅 등록 (Expo Router)
app/app/(tabs)/{탭이름}/{화면이름}.tsx

# 동적 라우트
app/app/(tabs)/routine/[id].tsx  →  /routine/123
```

### API 변경 시 동기화 체크리스트

```
1. backend API 수정
2. Swagger 확인 (localhost:8080/swagger-ui)
3. docs/API.md 업데이트
4. app/lib/types/ 업데이트
5. app/lib/api/ 업데이트
6. 화면 코드 수정
```

---

## 📦 배포

### Backend

**플랫폼:** AWS EC2
**CI/CD:** GitHub Actions — `main` 브랜치 push 시 자동 배포

```bash
# 로컬 Docker 빌드 확인
docker build -t prolog-backend .

# 배포는 git push origin main 으로 자동 처리
```

**EC2 환경 변수:** `JWT_SECRET`, `MYSQL_PASSWORD`, `CORS_ALLOWED_ORIGINS`

### App

**플랫폼:** App Store / Google Play
**빌드:** Expo EAS

```bash
npx eas build --platform ios
npx eas build --platform android
npx eas submit --platform ios
npx eas submit --platform android
```

---

## 🎯 코딩 컨벤션

### Backend (Java)
- 레이어 분리 엄수: Controller → Service → Repository → Entity
- DTO 필수 사용 (Entity 직접 반환 금지)
- 예외 처리: `@ControllerAdvice` 통합 관리
- 트랜잭션: `@Transactional` 적극 활용

### App (TypeScript)
- `any` 사용 금지
- API 호출: `lib/api/` 함수만 사용 (직접 fetch 금지)
- 상태 관리: Context API (Zustand 미사용)
- 폼 검증: react-hook-form + Zod

### Git 커밋 메시지
```
<type>(<scope>): <subject>

feat(backend): 통계 API 추가
fix(app): 로그인 버그 수정
docs: API 명세 업데이트
chore(gitignore): 보안 파일 필터 강화
```

**scope:** `backend`, `app`, `admin` 또는 도메인명 (`auth`, `routine`, `workout`)

---

## 🐛 트러블슈팅

### Expo 실행 안 될 때

**원인:** node_modules 손상 (peer dependency 충돌 등)
**해결:**
```bash
rm -rf node_modules package-lock.json
npm install
npx expo start --clear
```

---

### iOS 시뮬레이터 API 연결 안 될 때

**원인:** 시뮬레이터에서 `localhost`는 Mac이 아닌 시뮬레이터 자체를 가리킴
**해결:** `.env`에 Mac의 실제 IP 입력
```bash
# Mac IP 확인
ifconfig | grep "inet " | grep -v 127.0.0.1

# app/.env
EXPO_PUBLIC_API_URL=http://192.168.x.x:8080
```

---

### Modal 네비게이션 안 될 때 (select-exercises 등)

**원인:** Root Layout이 `Slot`이면 Modal 스택 관리 불가
**해결:** `app/_layout.tsx`를 `Stack`으로, `(modal)` 그룹에 `presentation: "modal"` 설정
```tsx
// app/_layout.tsx
<Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="(tabs)" />
  <Stack.Screen name="(auth)" />
  <Stack.Screen name="(modal)" options={{ presentation: "modal" }} />
</Stack>
```

---

### Backend 포트 충돌 (8080 already in use)

```bash
lsof -ti:8080 | xargs kill -9
```

---

### MySQL / Redis 연결 실패

```bash
docker-compose down && docker-compose up -d
```

---

## 📚 관련 문서

| 문서 | 용도 |
|------|------|
| [REQUIREMENTS.md](./REQUIREMENTS.md) | 비즈니스 로직, 데이터 모델 |
| [USER_GUIDE.md](./USER_GUIDE.md) | 앱 사용자 가이드 |
| Swagger UI | API 명세 (http://localhost:8080/swagger-ui) |
