# PROLOG - 운동 기록 관리 서비스

**점진적 과부하 추적과 성장 분석을 통해 꾸준한 운동 습관 형성을 돕는 웹 서비스**

**버전:** v1.0.0
**최종 업데이트:** 2026-02-26

---

## 📖 문서 구조

| 문서 | 내용 |
|------|------|
| **README.md** (현재 문서) | 프로젝트 개요, 기술 스택, 진행 상황, 환경 설정 |
| **[REQUIREMENTS.md](./REQUIREMENTS.md)** | 비즈니스 로직, 핵심 가치, 데이터 모델 |
| **[API.md](./API.md)** | API 명세서 (39개 엔드포인트) |

---

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [시스템 아키텍처](#시스템-아키텍처)
4. [환경 설정](#환경-설정)
5. [진행 상황](#진행-상황)
6. [개발 로드맵](#개발-로드맵)
7. [변경 이력](#변경-이력)

---

## 프로젝트 개요

### 한 줄 소개
점진적 과부하 추적과 성장 분석을 통해 꾸준한 운동 습관 형성을 돕는 웹 서비스

### 타겟 사용자
- 웨이트 트레이닝을 하는 운동 초보자 ~ 중급자
- 자신의 운동 기록을 체계적으로 관리하고 싶은 사람
- 진척도를 시각적으로 확인하며 동기부여를 받고 싶은 사람
- 운동 루틴을 공유하고 다른 사람의 루틴을 참고하고 싶은 사람

### 핵심 가치

#### 1. 점진적 과부하 추적 (Progressive Overload)
- 동일 루틴 반복 시 회차별 성장 확인
- `GET /api/workouts/sessions/routines/{routineId}/last` - 직전 회차 조회

#### 2. 실시간 피드백
- 루틴 수행 시 직전 기록 참고하여 목표 설정

#### 3. 스냅샷 기반 영속성
- 과거 기록은 절대 변경되지 않음
- 루틴/종목 수정해도 기록 불변

---

## 기술 스택

### 백엔드
- **Framework:** Spring Boot 4.0.1
- **Language:** Java 21
- **Database:** MySQL 8.0+
- **Cache:** Redis 7.0+
- **ORM:** Spring Data JPA (Hibernate)
- **Security:** Spring Security + JWT

### 프론트엔드
- **Framework:** Next.js 16.1.6
- **Language:** TypeScript 5.9.3
- **UI:** React 19.2.0, Tailwind CSS, shadcn/ui
- **State:** Zustand, React Query
- **Charts:** Recharts 2.15.4

### 인프라
- **Container:** Docker
- **CI/CD:** (TBD)

---

## 시스템 아키텍처

### 전체 구조

```
┌─────────────┐
│   Browser   │
│  (Next.js)  │
└──────┬──────┘
       │ HTTP/REST
       │
┌──────▼────────────┐
│  Spring Boot API  │
│  (JWT Auth)       │
└──────┬────────────┘
       │ JPA
       │
┌──────▼──────┐     ┌────────┐
│   MySQL     │     │ Redis  │
│  (RDS/Local)│     │ (Cache)│
└─────────────┘     └────────┘
```

### 백엔드 패키지 구조

```
com.back.domain
├── user
│   ├── auth            # 인증/인가
│   └── user            # 사용자 관리
├── exercise            # 운동 종목
├── routine             # 루틴 관리
│   ├── routine
│   └── routineItem
├── workout             # 운동 기록
│   ├── session
│   └── set
├── stats               # 통계
└── community           # 커뮤니티 (Phase 3)
```

---

## 환경 설정

### 필수 소프트웨어
- Java 21
- MySQL 8.0+
- Redis 7.0+
- Docker
- Node.js 20+

### 백엔드 실행

```bash
# 1. 환경 변수 설정 (.env)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=prolog
JWT_SECRET=your_jwt_secret
REDIS_HOST=localhost

# 2. Docker로 MySQL + Redis 실행
docker-compose up -d

# 3. 애플리케이션 실행
./gradlew bootRun

# 4. Swagger 확인
http://localhost:8080/swagger-ui.html
```

### 프론트엔드 실행

```bash
# 1. 환경 변수 설정 (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# 2. 실행
npm install
npm run dev

# 3. 확인
http://localhost:3000
```

---

## 진행 상황

### 전체 진행률

| Phase | 상태 | 진행률 | 완료일 |
|-------|------|--------|--------|
| **Phase 1: MVP Core** | ✅ 완료 | 100% (26/26) | 2026-02-26 |
| **Phase 2: 성장 통계** | 🚧 진행 중 | 20% (1/5) | 2026-03-31 (예정) |
| **Phase 3: 커뮤니티** | 📋 계획 | 0% (0/8) | 2026-04-30 (예정) |

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
| Community (커뮤니티) | 0 | 0 | 8 |
| Admin (관리자) | 2 | 0 | 0 |

### Phase 1: MVP Core ✅ (완료)

#### 주요 기능
- [x] 회원가입 / 로그인 (JWT)
- [x] 프로필 관리
- [x] 운동 종목 관리 (공식/커스텀)
- [x] 루틴 CRUD (활성화/보관)
- [x] 운동 세션 CRUD
- [x] 4가지 완료 액션 정책
- [x] 세트 기록 (일괄 저장, 스냅샷)
- [x] 홈 화면 통계
- [x] 관리자 종목 관리

#### 주요 성과
1. **스냅샷 패턴 구현** - 과거 기록 불변성 보장
2. **4가지 세션 완료 액션** - RECORD_ONLY, CREATE_ROUTINE_AND_RECORD, DETACH_AND_RECORD, UPDATE_ROUTINE_AND_RECORD
3. **통계 도메인 분리** - RESTful API 구조 개선

### Phase 2: 성장 통계 🚧 (진행 중)

#### 진행 상황 (1/5 완료)
- [x] 홈 화면 통계 (이번 주/달, 주간 활동, 자주 하는 운동 TOP 5)
- [ ] 종목별 볼륨 추이 API
- [ ] 종목별 최고 중량 추이 API
- [ ] 루틴별 회차 비교 API
- [ ] 운동 요약 대시보드 API

#### 다음 우선순위
1. 종목별 볼륨 추이 API 구현
2. 종목별 최고 중량 추이 API 구현
3. 루틴별 회차 비교 API 구현

### Phase 3: 커뮤니티 📋 (계획)

#### 기능 목록 (0/8)
- [ ] 루틴 공유 (스냅샷 저장)
- [ ] 공유 루틴 조회 (목록/상세)
- [ ] 루틴 가져오기
- [ ] 댓글 작성/삭제
- [ ] 댓글 좋아요

---

## 개발 로드맵

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

## 변경 이력

### [v1.0.0] - 2026-02-26

#### 🎉 Added

**인증/인가 (6개 API)**
- 회원가입, 로그인, 내 정보 조회, 로그아웃, 토큰 갱신, 회원 탈퇴
- JWT 기반 인증, BCrypt 비밀번호 해싱

**사용자 관리 (1개 API)**
- 프로필 수정

**운동 종목 (2개 API)**
- 운동 종목 목록 조회, 커스텀 종목 추가
- BodyPart Enum 8가지

**루틴 관리 (7개 API)**
- 루틴 CRUD, 활성화/비활성화

**운동 세션 (8개 API)**
- 세션 CRUD, 진행 중인 세션 조회, 루틴의 최근 세션 조회
- 4가지 완료 액션 정책

**통계 (1개 API)**
- 홈 화면 통계 (이번 주/달, 주간 활동, 자주 하는 운동 TOP 5, 최근 기록)

**관리자 (2개 API)**
- 전체 운동 종목 조회, 기본 종목 추가

**데이터베이스**
- 6개 테이블: users, exercises, routines, routine_items, workout_sessions, workout_sets
- 인덱스 최적화

**비즈니스 로직**
- 스냅샷 패턴 (과거 기록 불변성)
- 동시 진행 세션 1개 제한
- 루틴 수정 시 항목 전체 교체

**인프라**
- Docker Compose (MySQL + Redis)
- Redis 캐싱 (홈 통계 5분 TTL)
- Swagger API 문서화

#### 🔧 Changed
- 통계 도메인 분리 (`/api/workouts/sessions/stats` → `/api/stats/home`)

#### 🐛 Fixed
- JPQL FUNCTION 타입 추론 실패 → Native Query 전환
- JPQL LIMIT 미지원 → Native Query 전환

---

### [Unreleased]

#### 🚧 Phase 2 (진행 중)
- [ ] 종목별 볼륨 추이 API
- [ ] 종목별 최고 중량 추이 API
- [ ] 루틴별 회차 비교 API
- [ ] 운동 요약 대시보드 API

#### 📋 Phase 3 (계획)
- 루틴 공유 및 커뮤니티 기능 (8개 API)

---

## 성능 최적화

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

## 코딩 컨벤션

### 백엔드 (Java)
- 레이어 분리: Controller → Service → Repository → Entity
- DTO 필수 사용 (Entity 직접 반환 금지)
- Lombok 활용: `@RequiredArgsConstructor`, `@Getter`, `@Builder`

### 프론트엔드 (TypeScript)
- `any` 사용 금지
- Custom Hook으로 API 호출 로직 분리
- React Query 사용

### Git
- 브랜치: `main`, `develop`, `feature/*`
- 커밋 메시지: `<type>: <subject>` (feat, fix, refactor, docs, etc.)

---

## 보안

- **인증:** JWT (Access Token 1시간, Refresh Token 7일)
- **비밀번호:** BCrypt 해싱 (strength 10)
- **입력 검증:** Bean Validation
- **SQL Injection 방지:** JPA 사용

---

## 관련 문서

- **[REQUIREMENTS.md](./REQUIREMENTS.md)** - 비즈니스 로직, 핵심 가치, 데이터 모델 상세
- **[API.md](./API.md)** - API 명세서 (39개 엔드포인트)

---

**프로젝트 진행 중 | Phase 2 개발 중 🚧**
