# 개발 가이드

**Claude Code / AI 에이전트 / 개발자를 위한 실용 가이드**

---

## 📁 프로젝트 구조

```
prolog/
├── backend/           # Spring Boot API Server (배포 완료)
├── application/       # React Native 사용자 앱 "ProLog: 상급노하우"
├── web/               # Next.js 공식 웹페이지 (이용약관, 서비스 소개 등)
├── admin/             # 관리자 웹 (미개발, 추후 예정)
├── README.md
└── docs/
    ├── ERD.png
    ├── REQUIREMENTS.md
    ├── DEVELOPMENT.md  ← 현재 문서
    └── USER_GUIDE.md
```

### 각 프로젝트 역할

| 프로젝트 | 기술 | 역할 | 상태 | 포트 |
|---------|------|------|------|------|
| **backend** | Spring Boot 4.0.1 + MySQL + Redis | REST API 서버 | ✅ 배포 완료 (중단 배포) | 8080 |
| **application** | Expo 54 + React Native 0.81.5 | 사용자 모바일 앱 | ✅ v1.0.0 완성, TestFlight 정식 배포 준비 | Expo 앱 |
| **web** | Next.js + React 19 + TailwindCSS | 공식 웹페이지 | 🚧 개발 중 | - |
| **admin** | 미정 | 관리자 대시보드 | 📋 미개발, 추후 예정 | - |

---

## 🚀 빠른 시작

```bash
# 1. Backend (터미널 1)
cd backend
docker-compose up -d        # MySQL + Redis
./gradlew bootRun

# 2. App (터미널 2)
cd application
npm install
npx expo start
```

### 환경 변수 설정

**backend/.env**
```env
JWT_SECRET=your_secret_key
MYSQL_PASSWORD=your_password
MAIL_USERNAME=your_gmail@gmail.com
MAIL_PASSWORD=your_app_password   # Gmail 앱 비밀번호
MAIL_FROM=your_gmail@gmail.com
```

**application/.env**
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
│   │   ├── auth/          ← 로그인, 회원가입, JWT, 이메일 인증, 비밀번호 재설정
│   │   └── user/          ← 프로필 조회/수정, 마케팅 동의
│   ├── exercise/          ← 운동 종목 관리 (기본 종목 + 사용자 커스텀)
│   ├── routine/           ← 루틴 CRUD, 활성/보관
│   │   ├── routine/
│   │   └── routineItem/
│   ├── workout/           ← 운동 세션 & 세트
│   │   ├── session/
│   │   ├── sessionexercise/  ← 세션 내 종목 (스냅샷)
│   │   └── set/
│   ├── community/         ← 커뮤니티 (Phase 3-1 ✅)
│   │   ├── sharedRoutine/ ← 공유 루틴, 가져오기
│   │   └── comment/       ← 댓글 CRUD
│   ├── stats/             ← 홈 통계 (Phase 2-1 ✅)
│   └── home/              ← 홈 화면 (서버 상태 페이지)
└── global/
    ├── security/          ← JWT 필터, SecurityConfig
    │   └── token/         ← RefreshTokenService, PasswordResetTokenService (Redis)
    ├── mail/              ← EmailService (메일 발송), EmailVerificationService (가입 인증, Redis)
    ├── exception/         ← 예외 처리
    ├── converter/         ← JSON 컨버터
    └── config/            ← Swagger 등 설정
```

**주요 설정 파일:**
- `application.yml` / `application-local.yml` / `application-prod.yml`
- `docker-compose.yml` — MySQL 8.0 + Redis 7 (로컬)
- `docker-compose.prod.yml` — 프로덕션용

**프로덕션 엔드포인트:**
- API: `https://api.prolog.jooky.site`
- Swagger: `https://api.prolog.jooky.site/swagger-ui/index.html`

### App

```
application/
├── app/                   ← 화면 (파일 기반 라우팅)
│   ├── _layout.tsx        ← Root Stack (Modal 지원 위해 Stack 필수)
│   ├── (auth)/            ← 로그인, 회원가입, 비밀번호 재설정, 이메일 인증
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   ├── forgot-password.tsx
│   │   └── reset-password.tsx
│   ├── (tabs)/            ← 메인 앱 (5개 탭)
│   │   ├── index.tsx      ← 홈 (통계 대시보드)
│   │   ├── workout/
│   │   │   ├── index.tsx  ← 운동 탭 (FAB 역할, WorkoutStartSheet 트리거)
│   │   │   └── session.tsx ← 운동 세션 진행 화면
│   │   ├── routine/
│   │   │   ├── index.tsx  ← 루틴 목록
│   │   │   ├── new.tsx    ← 루틴 생성
│   │   │   └── [id].tsx   ← 루틴 상세/수정
│   │   ├── community/
│   │   │   ├── index.tsx  ← 커뮤니티 목록 + 공유하기 시트
│   │   │   └── [id].tsx   ← 공유 루틴 상세
│   │   └── profile/
│   │       ├── index.tsx  ← 프로필 메인
│   │       ├── edit.tsx   ← 프로필 수정 (닉네임, 신체정보 등)
│   │       ├── settings.tsx ← 설정 (알림, 이용약관 링크, 앱 버전)
│   │       ├── account.tsx  ← 계정 관리 (로그아웃, 탈퇴)
│   │       ├── exercises/ ← 커스텀 종목 관리
│   │       ├── history/   ← 운동 기록 목록/상세
│   │       └── shared/    ← 내가 공유한 루틴 목록/상세
│   └── (modal)/           ← 모달 화면
│       └── select-exercises.tsx ← 종목 선택 모달
├── components/
│   ├── AuthGuard.tsx               ← 인증 필요 화면 보호
│   ├── CustomTabBar.tsx            ← 하단 탭 바 (운동 버튼 포함)
│   ├── WorkoutStartSheet.tsx       ← 운동 시작 바텀시트 (루틴 선택 / 자유 운동)
│   ├── SharedRoutineDetailScreen.tsx ← 공유 루틴 상세 (community/[id], profile/shared/[id] 공용)
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       └── Label.tsx
├── lib/
│   ├── api/               ← API 호출 함수
│   │   ├── auth.ts        ← 로그인, 회원가입, 이메일 인증, 비밀번호 재설정
│   │   ├── user.ts        ← 프로필 수정, 마케팅 동의
│   │   ├── exercise.ts    ← 종목 조회, 커스텀 종목 CRUD
│   │   ├── routine.ts     ← 루틴 CRUD, 활성/보관
│   │   ├── workout.ts     ← 세션 시작/완료/취소, 기록 조회
│   │   ├── community.ts   ← 공유 루틴 목록/상세/가져오기, 댓글
│   │   └── home.ts        ← 홈 통계
│   ├── types/             ← TypeScript 타입 (도메인별)
│   ├── store/             ← 간단한 상태 브릿지 (exercise-selection.ts)
│   ├── validations/       ← Zod 스키마 (auth.ts)
│   ├── constants.ts       ← 앱 상수
│   ├── constants/terms.ts ← 이용약관 텍스트
│   ├── format.ts          ← 날짜/숫자 포맷 유틸
│   └── utils.ts
└── contexts/
    ├── auth-context.tsx   ← 전역 인증 상태
    └── workout-context.tsx ← 진행 중인 운동 세션 상태 (앱 재시작 시 서버에서 복원)
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
application/app/(tabs)/{탭이름}/{화면이름}.tsx

# 동적 라우트
application/app/(tabs)/routine/[id].tsx  →  /routine/123
```

### API 변경 시 동기화 체크리스트

```
1. backend API 수정
2. Swagger 확인 (localhost:8080/swagger-ui)
3. app/lib/types/ 업데이트
4. app/lib/api/ 업데이트
5. 화면 코드 수정
```

---

## 📦 배포

### Backend

**플랫폼:** AWS EC2
**CI/CD:** GitHub Actions — `main` 브랜치에서 `backend/**` 파일 변경 시 자동 배포

**배포 흐름:**
1. Gradle 빌드 (`bootJar -x test`) — 의존성 캐시 적용
2. Docker 이미지 빌드 & Docker Hub 푸시 (`jookyworld/prolog-backend:latest`)
3. EC2에 `docker-compose.prod.yml` SCP 전송
4. EC2 SSH 접속 → `docker-compose up -d --pull always`로 컨테이너 교체

**현재 방식:** 중단 배포 (컨테이너 교체 시 짧은 다운타임 발생)
**전환 예정:** Blue-Green 무중단 배포

**EC2 필수 파일:**
- `~/app/docker-compose.prod.yml` — 배포 시 자동 동기화
- `~/app/.env` — 수동 관리 (배포 시 건드리지 않음)

```bash
# 배포는 git push origin main 으로 자동 처리
# EC2에서 수동 재시작이 필요한 경우 (.env 변경 등)
cd ~/app
sudo docker-compose -f docker-compose.prod.yml up -d
```

**EC2 환경 변수 (~/app/.env):** `JWT_SECRET`, `MYSQL_PASSWORD`, `CORS_ALLOWED_ORIGINS`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM`

---

## 🔴 Redis 키 현황

| 키 패턴 | 용도 | TTL |
|---------|------|-----|
| `refresh:{userId}` | 리프레시 토큰 | 7일 |
| `pwd-reset:{email}` | 비밀번호 재설정 코드 | 10분 |
| `pwd-reset-attempt:{email}` | 비밀번호 재설정 코드 입력 실패 횟수 | 10분 |
| `pwd-reset-rate:{email}` | 비밀번호 재설정 발송 횟수 (최대 3회/10분) | 10분 |
| `email-verify:{email}` | 회원가입 이메일 인증 코드 | 10분 |
| `email-verify-verified:{email}` | 이메일 인증 완료 상태 | 30분 |
| `email-verify-attempts:{email}` | 인증 코드 입력 실패 횟수 (최대 5회) | 10분 |
| `email-verify-rate:{email}` | 인증 코드 발송 횟수 (최대 3회/10분) | 10분 |

### App

**플랫폼:** App Store (TestFlight → 정식 출시)
**Bundle ID:** `com.jooky.prolog`
**빌드:** Expo EAS

```bash
npx eas build --platform ios
npx eas build --platform android
npx eas submit --platform ios
npx eas submit --platform android
```

---

## 🔐 인증 / 보안

### HTTP 상태 코드 구분

| 코드 | 의미 | 발생 상황 |
|------|------|----------|
| **401** | 인증 실패 | 토큰 없음, 만료, 유효하지 않음 |
| **403** | 권한 없음 | 일반 유저가 `/api/admin/**` 접근 |

- 401 수신 시 앱에서 자동으로 refresh 토큰으로 재발급 후 원래 요청 재시도
- `SecurityConfig`에 `AuthenticationEntryPoint`를 명시적으로 설정해 인증 실패 시 401 반환 (Spring Security 기본값은 403)

### 토큰 갱신 흐름

```
앱 API 요청
  → 401 응답
  → POST /api/auth/refresh (Authorization: Bearer {refreshToken})
  → 새 accessToken + refreshToken 발급 (토큰 로테이션)
  → 원래 요청 재시도
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

**scope:** `backend`, `app`, `admin`, `web` 또는 도메인명 (`auth`, `routine`, `workout`)

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
**해결:** `application/app/_layout.tsx`를 `Stack`으로, `(modal)` 그룹에 `presentation: "modal"` 설정
```tsx
// application/app/_layout.tsx
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

### EC2 배포 후 API 응답에서 한글 깨짐

**원인:** MySQL 컨테이너의 `character_set_client/connection/results`가 `latin1`으로 설정된 상태에서 seed SQL을 실행하면, UTF-8 한글이 latin1으로 잘못 변환되어 저장됨. MySQL CLI에서는 latin1로 읽어 우연히 정상으로 보이지만, JDBC(Spring Boot)는 UTF-8로 읽어 깨져 보임.

**해결:**

`docker-compose.prod.yml`의 MySQL `command`로 charset이 이미 강제 설정되어 있음. 잘못 삽입된 데이터만 재삽입하면 됨.

```bash
# MySQL charset 확인
docker exec prolog-mysql mysql -uroot -p비밀번호 prolog -e "SHOW VARIABLES LIKE 'character%';"
# character_set_client/connection/results 가 모두 utf8mb4여야 함

# 데이터 재삽입
docker exec prolog-mysql mysql -uroot -p비밀번호 prolog -e "DELETE FROM exercises;"
docker exec -i prolog-mysql mysql -uroot -p비밀번호 prolog < ~/app/exercises_seed.sql
```

**핵심 원칙:** seed SQL 실행 전 반드시 MySQL charset이 utf8mb4인지 확인할 것.

---

### 앱 재시작 후 Context 상태가 사라지는 문제

**원인:** React Context는 메모리 상태이므로 앱을 완전히 종료 후 재시작하면 초기화됨.
서버에는 상태가 남아있어도 앱은 인식 못 함.

**대표 사례:** 운동 세션 진행 중 앱 재시작 → `activeSession = null` → FAB이 세션으로 이동하지 않고 시작 시트를 띄움

**원칙: Context의 단독 저장 금지 — 서버가 진실의 원천(Source of Truth)**

앱 시작 시 서버에서 상태를 복원해야 하는 데이터는 Context에만 저장하지 않는다.

```
❌ 잘못된 방식
앱 시작 → Context = null → 서버 상태 무시

✅ 올바른 방식
앱 시작 → 서버 API 호출 → Context 복원 → 이후 로직 실행
```

**구현 패턴:**

```tsx
// Context Provider 내부에서 mount 시 서버 상태 복원
export function WorkoutProvider({ children }) {
  const [activeSession, setActiveSession] = useState(null);
  const [isRestoring, setIsRestoring] = useState(true); // 복원 완료 전 플래그

  useEffect(() => {
    workoutApi.getActiveSession()
      .then((session) => {
        if (session) setActiveSession({ sessionId: session.id, routineId: session.routineId });
      })
      .finally(() => setIsRestoring(false));
  }, []);
  // ...
}
```

```tsx
// 복원 완료 전에는 해당 기능 비활성화
const handlePressFAB = () => {
  if (isRestoring) return; // 복원 중이면 동작 차단
  // ...
};
```

**새로운 서버 상태를 Context에 담을 때 체크리스트:**
- [ ] 앱 재시작 후 이 상태가 유실되면 UX가 깨지는가?
- [ ] 깨진다면: 서버에서 복원하는 API가 있는가? → Provider mount 시 호출
- [ ] `isRestoring` 플래그로 복원 완료 전 동작을 막았는가?

---

### 바텀시트 열릴 때/닫힐 때 애니메이션이 어색한 문제 (App)

**증상:** 바텀시트가 올라올 때 뚝뚝 끊기거나, 닫힐 때 슬라이드 애니메이션 없이 순간적으로 사라짐

**원인:** React Native `Modal`의 `visible` prop을 부모 컴포넌트가 직접 제어하면, `visible=false`가 되는 즉시 Modal이 언마운트되어 닫히는 애니메이션이 재생되지 않음. 열릴 때도 `Easing.out(Easing.cubic)`처럼 초반 가속도가 강한 easing을 쓰면 이질감이 생길 수 있음.

**해결:** 내부 `modalVisible` state를 분리하고, 닫기 애니메이션 완료 후 Modal을 숨기도록 변경.

```tsx
// ❌ 잘못된 방식: 부모 visible prop으로 Modal 직접 제어
<Modal visible={visible} ...>

// ✅ 올바른 방식: 내부 state 분리 + 애니메이션 완료 후 닫기
const [modalVisible, setModalVisible] = useState(false);

useEffect(() => {
  if (visible) {
    setModalVisible(true); // 먼저 Modal 열고
    Animated.parallel([...]).start(); // 그 다음 애니메이션
  } else {
    Animated.parallel([...]).start(() => {
      slideAnim.setValue(SHEET_HEIGHT);
      fadeAnim.setValue(0);
      setModalVisible(false); // 애니메이션 완료 후 닫기
    });
  }
}, [visible]);

<Modal visible={modalVisible} ...>
```

**easing 통일:** 여러 바텀시트의 느낌을 통일하려면 easing을 지정하지 않아 기본값(`Easing.inOut(Easing.ease)`)을 사용하거나, 동일한 easing을 공유할 것. `Easing.out(Easing.cubic)`은 초반이 지나치게 빨라 이질감을 줄 수 있음.

**적용 파일:** `application/components/WorkoutStartSheet.tsx`

---

## 📚 관련 문서

| 문서 | 용도 |
|------|------|
| [REQUIREMENTS.md](./REQUIREMENTS.md) | 비즈니스 로직, 데이터 모델 |
| [USER_GUIDE.md](./USER_GUIDE.md) | 앱 사용자 가이드 |
| Swagger UI | API 명세 (http://localhost:8080/swagger-ui) |
