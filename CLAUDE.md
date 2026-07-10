# PROLOG - Claude Code 컨텍스트

## 프로젝트 개요

운동 기록 관리 서비스 (점진적 과부하 추적 + 성장 분석). 개인 프로젝트, 단일 모노레포.

| 디렉토리 | 설명 |
|---|---|
| `backend/` | Spring Boot 4.0.1 API — Java 21, MySQL 8, Redis 7, JWT, 포트 8080 |
| `application/` | 사용자 앱 — Expo SDK 54, React Native, TypeScript, NativeWind |
| `admin/` | 관리자 웹 — Next.js, TailwindCSS, 포트 3001 |
| `web/` | 공식 웹페이지 — Next.js, TailwindCSS, Vercel 배포 |

---

## 자주 쓰는 명령어

```bash
# backend/
./gradlew bootRun          # 개발 서버 실행
./gradlew build            # 빌드 + 테스트
./gradlew test             # 테스트만
./gradlew compileJava      # 컴파일만 (빠른 문법 확인)
./gradlew bootJar -x test  # 배포용 JAR (테스트 스킵)

# application/
npm start                  # expo start
npm run ios                # iOS 시뮬레이터
node_modules/.bin/tsc --noEmit  # 타입 체크

# admin/
npm run dev                # 개발 서버 (port 3001)
npm run build              # 프로덕션 빌드

# web/
npm run dev                # 개발 서버
npm run build              # 프로덕션 빌드
```

---

## 아키텍처 결정사항

### 운동 기록 스냅샷 불변성

완료된 세션 데이터는 이후 종목/루틴 수정에 영향받지 않아야 한다 — 통계 정확성의 전제이기 때문.

- `WorkoutSession.routineTitleSnapshot`: 세션 시작 시점의 루틴 제목을 복사해 저장. 루틴이 삭제되어도 `routine_id`는 NULL이 되지만 제목은 보존됨 (ON DELETE SET NULL).
- `WorkoutSessionExercise.exerciseName` + `.bodyPartSnapshot`: 종목명과 운동 부위를 시점에 복사. 종목이 수정되어도 과거 기록은 변하지 않음.
- **규칙: 세션/운동 기록 엔티티는 UPDATE 금지 — 수정이 필요하면 삭제 후 재생성.**

### Redis 키 패턴

| 키 | 용도 | TTL |
|---|---|---|
| `refresh:{userId}` | Refresh 토큰 서버 측 저장 (무효화용) | 7일 |
| `email-verify:{email}` | 회원가입 이메일 인증 코드 | 10분 |
| `email-verify-verified:{email}` | 인증 완료 상태 (회원가입 세션 유지) | 30분 |
| `email-verify-attempts:{email}` | 인증 코드 오입력 횟수 (최대 5회) | 10분 |
| `email-verify-rate:{email}` | 인증 코드 발송 Rate limit (최대 3회/10분) | 10분 |
| `pwd-reset:{email}` | 비밀번호 재설정 코드 | 10분 |
| `pwd-reset-attempts:{email}` | 재설정 코드 오입력 횟수 (최대 5회) | 10분 |
| `pwd-reset-rate:{email}` | 재설정 코드 발송 Rate limit (최대 3회/10분) | 10분 |

### 인증 흐름

- Access Token은 `HttpOnly + Secure + SameSite=None` 쿠키(`accessToken`)로 전달. 앱에서는 `Authorization: Bearer` 헤더도 허용 (JwtTokenResolver가 헤더 우선, 없으면 쿠키 폴백).
- Refresh Token은 쿠키(`refreshToken`) + Redis(`refresh:{userId}`) 이중 저장 — Redis 삭제만으로 즉시 무효화 가능.
- **새 엔드포인트 추가 시 `SecurityConfig`에 `permitAll` 또는 `authenticated` 명시 필수** — 누락 시 기본적으로 인증 필요.
- 로그아웃/탈퇴 시 반드시 `RefreshTokenService.deleteRefreshToken(userId)` + `CookieManager.clearAuthCookies()` 둘 다 호출.

### CI/CD — main 브랜치는 곧 프로덕션

`.github/workflows/deploy-backend.yml`: `main` 브랜치에 `backend/**` 경로 변경이 포함된 커밋이 push되면 **테스트 없이 즉시 프로덕션 배포**된다 (`-x test`).

- **main에 직접 push 전 반드시 로컬에서 `./gradlew build` 통과 확인.**
- DB 마이그레이션 파일이 포함된 경우 특히 주의 — 롤백 불가.
- application / admin / web은 별도 CI 없음 (web은 Vercel 자동 배포).

---

## 코딩 규칙

### Backend

- **패키지 구조**: `domain/{도메인}/{controller,service,repository,entity,dto}` — 도메인 간 직접 참조 금지, Service를 통할 것.
- **레이어**: Controller → Service → Repository 순방향만 허용. Controller에서 Repository 직접 호출 금지.
- **응답**: Entity 직접 반환 금지 — 항상 DTO로 변환. 응답 래퍼는 `global/dto` 확인.
- **예외**: 비즈니스 예외는 `global/exception/type/` 하위 커스텀 예외 사용 → `GlobalExceptionHandler`가 처리.
- **인증 필요 API**: `@AuthenticationPrincipal UserPrincipal principal`로 현재 사용자 주입.

### Application (React Native)

- **API 호출**: `lib/api/{도메인}.ts`만 사용 — 컴포넌트에서 직접 `fetch` 금지.
- **타입**: `lib/types/{도메인}.ts` 정의 — `any` 사용 금지.
- **폼**: `react-hook-form` + `zod` 조합.
- **상태**: `contexts/` 하위 Context API — 전역 상태 라이브러리 추가 금지.
- **스타일**: NativeWind (Tailwind 클래스) — 인라인 StyleSheet 신규 추가 금지.
- **라우팅**: `app/(auth)/`, `app/(tabs)/` 파일 기반.

### Admin

- **API 호출**: `lib/api.ts` 사용.
- **타입**: `lib/types.ts` 정의.

### Git 컨벤션

```
<type>(<scope>): <subject>
```
- type: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`
- scope: `backend`, `application`, `admin`, `web`, 또는 도메인명
- 예: `feat(backend): 볼륨 통계 API 추가`

### 보안

- `.env` 파일 커밋 금지 (`.gitignore` 적용됨).
- 비밀번호: BCrypt 해싱 — 평문 저장/비교 금지.
- JWT: Access 1시간, Refresh 7일.
