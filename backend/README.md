# ProLog Backend

운동 기록 및 루틴 관리를 위한 REST API 백엔드 서버입니다.

## Tech Stack

| 분류 | 기술 |
|------|------|
| Language | Java 21 |
| Framework | Spring Boot 4.0.1 |
| ORM | Spring Data JPA (Hibernate) |
| Database | MySQL 8.4 |
| Cache / Token Store | Redis 7 |
| Authentication | JWT (jjwt 0.12.6) + Spring Security |
| API Docs | Swagger (springdoc-openapi 2.8.9) |
| Build Tool | Gradle (Kotlin DSL) |
| Container | Docker / Docker Compose |
| CI/CD | GitHub Actions |

## Project Structure

```
src/main/java/com/back/
├── domain/
│   ├── user/
│   │   ├── auth/          # 인증 (로그인, 회원가입, 로그아웃, 회원탈퇴, JWT 토큰 관리)
│   │   └── user/          # 사용자 프로필 조회/수정
│   ├── exercise/          # 운동 종목 관리
│   ├── routine/
│   │   ├── routine/       # 루틴 CRUD
│   │   └── routineItem/   # 루틴 내 운동 항목
│   ├── workout/
│   │   ├── session/       # 운동 세션 (시작/완료/이력)
│   │   └── set/           # 개별 세트 (무게/횟수)
│   └── home/              # 헬스체크
└── global/
    ├── config/            # Swagger 설정
    ├── cookieManager/     # 쿠키 관리
    ├── exception/         # 예외 처리
    └── security/          # JWT 필터, CORS 설정
```

## API Endpoints

### Auth (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/login` | 로그인 (JWT 토큰 발급) |
| GET | `/api/auth/me` | 내 정보 조회 |
| POST | `/api/auth/logout` | 로그아웃 (Redis refresh token 삭제 + 쿠키 제거) |
| POST | `/api/auth/refresh` | 액세스 토큰 갱신 |
| DELETE | `/api/auth/deleteMe` | 회원 탈퇴 (모든 관련 데이터 삭제) |

### User (`/api/users`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/api/users/me` | 프로필 수정 (닉네임, 성별, 키, 몸무게) |

### Exercise (`/api/exercises`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/exercises` | 운동 목록 조회 (시스템 + 커스텀) |
| POST | `/api/exercises/custom` | 커스텀 운동 생성 |

### Admin Exercise (`/api/admin/exercises`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/exercises` | 전체 운동 조회 (ADMIN) |
| POST | `/api/admin/exercises` | 시스템 운동 생성 (ADMIN) |

### Routine (`/api/routines`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/routines` | 루틴 생성 |
| GET | `/api/routines` | 루틴 목록 조회 (상태 필터: ACTIVE/ARCHIVED/ALL) |
| GET | `/api/routines/{routineId}` | 루틴 상세 조회 |
| PUT | `/api/routines/{routineId}` | 루틴 수정 (제목, 설명, 운동 항목 전체 교체) |
| DELETE | `/api/routines/{routineId}` | 루틴 삭제 |
| PATCH | `/api/routines/{routineId}/activate` | 루틴 활성화 |
| PATCH | `/api/routines/{routineId}/archive` | 루틴 보관 |

### Workout Session (`/api/workouts/sessions`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/workouts/sessions` | 운동 세션 시작 |
| GET | `/api/workouts/sessions/active` | 진행 중인 세션 조회 |
| PATCH | `/api/workouts/sessions/{id}/complete` | 세션 완료 |
| DELETE | `/api/workouts/sessions/{id}/cancel` | 세션 취소 |
| DELETE | `/api/workouts/sessions/{id}` | 세션 삭제 |
| GET | `/api/workouts/sessions` | 세션 이력 조회 (페이징) |
| GET | `/api/workouts/sessions/{id}` | 세션 상세 조회 |
| GET | `/api/workouts/sessions/routines/{routineId}/last` | 루틴별 마지막 세션 조회 |

## Workout Complete Actions

운동 세션 완료 시 `action` 필드로 후처리 방식을 지정합니다.

### 자유 운동 세션 (루틴 없이 시작)

| Action | 설명 |
|--------|------|
| `RECORD_ONLY` | 기록만 저장 (기본값) |
| `CREATE_ROUTINE_AND_RECORD` | 기록 저장 + 현재 운동 내용으로 새 루틴 자동 생성 |

### 루틴 기반 세션

| Action | 설명 |
|--------|------|
| `RECORD_ONLY` | 기록만 저장 (루틴 링크 유지, 변경 내용과 무관) |
| `DETACH_AND_RECORD` | 루틴 연결 해제 → 자유 운동 기록으로 저장 |
| `UPDATE_ROUTINE_AND_RECORD` | 기록 저장 + 루틴 구성을 현재 운동 내용으로 업데이트 |

### 클라이언트 흐름 예시

```
루틴 기반 운동 시작
  → 운동 중 종목/세트 변경
  → 완료 시 앱이 원본 루틴과 차이를 비교
  → 변경이 없으면: RECORD_ONLY
  → 변경이 있으면 사용자에게 선택지 표시:
     ① "이대로 저장"        → RECORD_ONLY
     ② "자유 운동으로 저장"  → DETACH_AND_RECORD
     ③ "루틴도 업데이트"     → UPDATE_ROUTINE_AND_RECORD
```

## Database Schema

```
users
├── id, username, password, email, nickname
├── gender (MALE/FEMALE/UNKNOWN), height, weight
├── role (USER/ADMIN)
└── createdAt, updatedAt

exercises
├── id, name, body_part, part_detail
├── is_custom, created_by (FK → users)
└── createdAt

routines
├── id, user_id (FK → users)
├── title, description, active
└── createdAt, updatedAt

routine_items
├── id, routine_id (FK → routines), exercise_id (FK → exercises)
├── order_in_routine, sets, rest_seconds
└── createdAt, updatedAt

workout_sessions
├── id, user_id (FK → users), routine_id (FK → routines, nullable)
├── startedAt, completedAt
└── createdAt, updatedAt

workout_sets
├── id, workout_session_id (FK → workout_sessions, CASCADE)
├── exercise_id (FK → exercises), exerciseName, bodyPartSnapshot
├── setNumber, weight, reps
└── createdAt, updatedAt
```

**Body Part Enum:** `CHEST`, `SHOULDER`, `BACK`, `ARM`, `LOWER_BODY`, `CORE`, `CARDIO`, `OTHER`

## Authentication

- **Access Token**: 1시간 유효, HS256 서명, Authorization 헤더 또는 쿠키로 전달
- **Refresh Token**: 14일 유효, Redis에 저장 (`refresh:{userId}`)
- **비밀번호**: BCrypt 해싱
- **로그아웃**: Redis refresh token 삭제 + 쿠키 제거
- **회원 탈퇴**: 모든 관련 데이터 cascade 삭제 (sets → sessions → routine items → routines → exercises → token → user)

## Security

- **CORS**: 환경변수(`cors.allowed-origins`)로 허용 origin 관리
  - local: `http://localhost:3000`, `http://localhost:5173`
  - prod: `CORS_ALLOWED_ORIGINS` 환경변수로 설정
- **CSRF**: 비활성화 (Stateless API)
- **Session**: STATELESS (JWT 기반)
- **DDL**: prod 환경 `validate` (스키마 자동 변경 방지)

## Getting Started

### Prerequisites

- Java 21
- Docker & Docker Compose

### Environment Variables

`.env` 파일에 다음 변수를 설정합니다:

```env
JWT_SECRET=<your-jwt-secret>
JWT_ACCESS_EXP=3600000
JWT_REFRESH_EXP=1209600000
MYSQL_USERNAME=root
MYSQL_PASSWORD=<your-mysql-password>
CORS_ALLOWED_ORIGINS=https://your-admin-domain.com    # prod 전용, 쉼표로 복수 지정 가능
```

### Run with Docker Compose

```bash
docker-compose up -d
```

MySQL(3306), Redis(6379), Spring App(8080)이 함께 실행됩니다.

### Local Development

```bash
./gradlew bootRun --args='--spring.profiles.active=local'
```

로컬 실행 시 MySQL과 Redis가 별도로 실행 중이어야 합니다.

### API Documentation

서버 실행 후 Swagger UI에서 API를 확인할 수 있습니다:

```
http://localhost:8080/swagger-ui/index.html
```

## CI/CD

GitHub Actions를 통해 자동 배포됩니다:

1. **Build**: Gradle 빌드 → Docker 이미지 빌드 → Docker Hub 푸시 (`jookyworld/prolog-backend:latest`)
2. **Deploy**: EC2 SSH 접속 → 이미지 Pull → Docker Compose 재시작
