# 인프라 & 배포 가이드

ProLog 전체 배포 구성, CI/CD 파이프라인, 환경 설정을 정리한 문서.

---

## 전체 구성도

```
[GitHub main 브랜치]
        │
        ├── backend/** 변경 감지
        │         │
        │   [GitHub Actions]
        │         ├── Gradle 빌드 (bootJar)
        │         ├── Docker 이미지 빌드 → Docker Hub 푸시
        │         ├── docker-compose.prod.yml SCP → EC2
        │         └── SSH → docker-compose up -d
        │                       │
        │               [AWS EC2 (단일 인스턴스)]
        │               ┌───────────────────────────────┐
        │               │  prolog-npm (Nginx Proxy Mgr) │ :80, :443
        │               │  prolog-backend (Spring Boot)  │ :8080 (내부)
        │               │  prolog-mysql  (MySQL 8.4)     │ :3306 (loopback)
        │               │  prolog-redis  (Redis 7 Alpine)│ :6379 (loopback)
        │               └───────────────────────────────┘
        │                       │
        │               api.prolog.jooky.site (HTTPS)
        │
        ├── admin/** 변경 감지
        │         └── [Vercel] → admin.prolog.jooky.site
        │
        └── web/** 변경 감지
                  └── [Vercel] → prolog.jooky.site

[EAS CLI (수동)]
        └── eas build --platform ios
                  └── [Expo EAS Build] → [App Store]
```

---

## 1. Backend — AWS EC2 + Docker

### 1-1. GitHub Actions 파이프라인

**파일:** `.github/workflows/deploy-backend.yml`

**트리거:**
```yaml
on:
  push:
    branches: [main]
    paths: ["backend/**"]   # backend 코드 변경 시에만 실행
```

**Job 1: `build-and-push`**

| 단계 | 내용 |
|---|---|
| JDK 21 설치 | `eclipse-temurin` 배포판 |
| Gradle 캐시 | `~/.gradle/caches`, `~/.gradle/wrapper` / 키: `gradle-${{ hashFiles('**/*.gradle*') }}` |
| 빌드 | `./gradlew bootJar -x test` (테스트 스킵) |
| Docker Hub 로그인 | Secrets: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN` |
| 이미지 빌드·푸시 | `jookyworld/prolog-backend:latest` |

**Job 2: `deploy`** (build-and-push 완료 후 순차 실행)

| 단계 | 내용 |
|---|---|
| SCP 전송 | `backend/docker-compose.prod.yml`, `backend/mysql/my.cnf` → EC2 `~/app/` |
| SSH 접속 | `cd ~/app && docker-compose -f docker-compose.prod.yml up -d --remove-orphans --pull always` |
| 이미지 정리 | `docker image prune -f` (이전 이미지 삭제) |

**GitHub Actions Secrets (저장소 Settings > Secrets):**

| Secret | 값 |
|---|---|
| `EC2_HOST` | EC2 퍼블릭 IP 또는 도메인 |
| `EC2_USERNAME` | SSH 접속 유저 (`ubuntu` 등) |
| `EC2_SSH_KEY` | EC2 접속용 PEM 키 (개인키 전체) |
| `DOCKERHUB_USERNAME` | `jookyworld` |
| `DOCKERHUB_TOKEN` | Docker Hub Access Token |

---

### 1-2. Dockerfile (멀티스테이지 빌드)

**파일:** `backend/Dockerfile`

```
Stage 1 — build (eclipse-temurin:21-jdk)
  1. gradle wrapper + build.gradle 복사
  2. ./gradlew dependencies --no-daemon   ← 의존성 레이어 캐시 분리
  3. src 복사
  4. ./gradlew bootJar -x test

Stage 2 — runtime (eclipse-temurin:21-jre)  ← JDK 아닌 JRE (이미지 경량화)
  - Stage 1에서 빌드된 JAR만 복사
  - SPRING_PROFILES_ACTIVE=prod
  - TZ=Asia/Seoul
  - EXPOSE 8080
  - ENTRYPOINT ["java", "-jar", "-Duser.timezone=Asia/Seoul", "/app/app.jar"]
```

**레이어 캐시 전략:** `dependencies`를 먼저 내려받는 레이어를 분리해, 소스 코드만 변경됐을 때 의존성 다운로드를 건너뜀 → 빌드 시간 단축.

---

### 1-3. EC2 컨테이너 구성

**파일:** `backend/docker-compose.prod.yml`

4개 서비스, 단일 브리지 네트워크(`prolog-network`):

| 컨테이너 | 이미지 | 포트 | 역할 |
|---|---|---|---|
| `prolog-npm` | `jc21/nginx-proxy-manager:latest` | 80, 443, **81**(관리 UI) | 리버스 프록시 + SSL |
| `prolog-backend` | `jookyworld/prolog-backend:latest` | 8080 (내부 전용) | Spring Boot API |
| `prolog-mysql` | `mysql:8.4` | `127.0.0.1:3306` | DB (loopback만 허용) |
| `prolog-redis` | `redis:7-alpine` | `127.0.0.1:6379` | 캐시/토큰 (loopback만 허용) |

**의존성 순서:**
```
prolog-npm → prolog-backend → prolog-mysql (healthcheck 통과 후)
```

**볼륨 (데이터 영속성):**

| 볼륨 | 용도 |
|---|---|
| `prolog-mysql-data` | MySQL 데이터 |
| `npm-data` | Nginx Proxy Manager 설정 |
| `npm-letsencrypt` | SSL 인증서 (Let's Encrypt 자동 갱신) |

**보안 포인트:**
- MySQL, Redis는 `127.0.0.1` 바인딩 → EC2 외부에서 직접 접근 불가
- Spring → MySQL/Redis는 Docker 내부 서비스명으로 통신 (`mysql`, `redis`)
- Spring 컨테이너는 포트를 외부에 노출하지 않고 Nginx Proxy Manager를 통해서만 접근

---

### 1-4. Nginx Proxy Manager (SSL & 도메인 라우팅)

Nginx Proxy Manager는 웹 GUI로 설정하므로 파일로 관리되지 않음.

**접속:** `http://[EC2 IP]:81` (관리 UI)

**현재 설정 (추정):**

| 도메인 | 포워드 대상 | SSL |
|---|---|---|
| `api.prolog.jooky.site` | `prolog-backend:8080` | Let's Encrypt 자동 |

**SSL 인증서:** Let's Encrypt 90일 자동 갱신 (`npm-letsencrypt` 볼륨에 저장)

---

### 1-5. MySQL 문자셋 설정

**파일:** `backend/mysql/my.cnf`

```ini
[client]
default-character-set = utf8mb4

[mysql]
default-character-set = utf8mb4

[mysqld]
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
```

docker-compose에서도 `command` 옵션으로 `--character-set-server=utf8mb4` 이중 지정.
(EC2 배포 후 한글 데이터 깨짐 트러블슈팅 결과 적용된 설정)

---

### 1-6. EC2 서버 직접 관리

**EC2에서 직접 관리하는 파일:**

```
~/app/
├── docker-compose.prod.yml   ← 배포 시 GitHub Actions가 자동 갱신
├── mysql/my.cnf              ← 배포 시 GitHub Actions가 자동 갱신
└── .env                      ← 수동 관리 (배포 시 건드리지 않음)
```

**EC2 `.env` 파일 (런타임 시크릿):**

```env
# JWT
JWT_SECRET=
JWT_ACCESS_EXP=
JWT_REFRESH_EXP=

# MySQL
MYSQL_USERNAME=
MYSQL_PASSWORD=

# Mail (Gmail SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=       # Gmail 앱 비밀번호
MAIL_FROM=

# CORS (쉼표 구분)
CORS_ALLOWED_ORIGINS=https://admin.prolog.jooky.site
```

**수동 배포 / 재시작이 필요한 경우 (.env 변경 등):**

```bash
cd ~/app
sudo docker-compose -f docker-compose.prod.yml up -d
```

**로그 확인:**

```bash
sudo docker logs prolog-backend --tail 100 -f
sudo docker logs prolog-mysql --tail 50
```

---

### 1-7. Spring 프로파일 설정

**`application.yml` (공통):**
- `spring.profiles.active: local` (기본값)
- `.env` 파일 자동 로드 (`optional:file:.env[.properties]`)
- Redis: `localhost:6379`
- Mail SMTP: Gmail

**`application-local.yml`:**
- MySQL: `localhost:3306`
- CORS: `localhost:3000, 3001, 5173`
- `ddl-auto: update`, `show-sql: true`
- Flyway 활성화 (`classpath:db/migration`)

**`application-prod.yml`:**
- MySQL: `mysql:3306` (Docker 서비스명)
- Redis: `redis` (Docker 서비스명)
- CORS: `CORS_ALLOWED_ORIGINS` 환경변수
- `ddl-auto: update`, `show-sql: false`
- 로그: root INFO, com.back DEBUG

> **주의:** prod에서 `ddl-auto: update` 사용 중 — 컬럼 추가는 자동 처리되나 삭제는 반영되지 않음. 스키마 변경이 필요한 경우 수동으로 SQL을 EC2 MySQL에 직접 실행해야 함.

---

### 1-8. 현재 배포 방식 & 한계

| 항목 | 현황 | 개선 예정 |
|---|---|---|
| 배포 방식 | **중단 배포** (컨테이너 교체 시 수초 다운타임) | Blue-Green 무중단 배포 |
| 이미지 태그 | `latest` 고정 | 버전 태그 추가 → 롤백 가능 |
| 스키마 관리 | `ddl-auto: update` | Flyway 마이그레이션 (prod 적용) |
| DB 백업 | 볼륨 의존 | 자동 백업 스크립트 또는 RDS 전환 |
| 헬스체크 | MySQL만 | Spring 헬스체크 엔드포인트 추가 |

---

## 2. Admin / Web — Vercel

| 서비스 | 디렉토리 | 도메인 | 프레임워크 |
|---|---|---|---|
| admin | `/admin` | admin.prolog.jooky.site | Next.js 15 + React 19 |
| web | `/web` | prolog.jooky.site | Next.js + React 19 |

**배포 트리거:** main 브랜치 push 시 Vercel 자동 빌드·배포 (각 디렉토리 변경 감지)

**`admin/next.config.ts`:**
```ts
outputFileTracingRoot: path.join(__dirname, "../")
// 모노레포에서 상위 디렉토리(공유 모듈 등) 참조를 허용하기 위한 설정
```

**Vercel에서 설정해야 할 것:**
- Root Directory: `admin` 또는 `web` (각 프로젝트별)
- 환경변수: API URL 등 (Vercel 대시보드 > Settings > Environment Variables)
- 커스텀 도메인: DNS CNAME 레코드 연결

---

## 3. 앱 — Expo EAS Build

**Bundle ID:** `com.jooky.prolog`
**EAS 프로젝트 ID:** `99e3012a-4870-47c2-be53-1a4a586de32d`

### 빌드 프로파일 (`application/eas.json`)

| 프로파일 | 목적 | 배포 방식 | API URL |
|---|---|---|---|
| `development` | 개발용 (dev client) | internal | - |
| `preview` | 테스트 / TestFlight 내부 배포 | internal | `https://api.prolog.jooky.site` |
| `production` | App Store 정식 배포 | 공개 | `https://api.prolog.jooky.site` |

**주요 설정 (`application/app.json`):**

| 설정 | 값 | 목적 |
|---|---|---|
| `newArchEnabled` | `true` | React Native 신규 아키텍처 활성화 |
| `appVersionSource` | `remote` | 버전 번호를 EAS 서버에서 관리 |
| `autoIncrement` | `true` (production) | 빌드 시 빌드 번호 자동 증가 |
| `NSAllowsArbitraryLoads` | `false` | iOS HTTPS 강제 (HTTP 비허용) |
| `ITSAppUsesNonExemptEncryption` | `false` | 앱 내 암호화 미사용 선언 (심사용) |
| `usesCleartextTraffic` | `false` | Android HTTP 비허용 |
| `updates.checkOnLaunch` | `NEVER` | OTA 업데이트 자동 체크 비활성화 |

**빌드 & 제출 명령어:**

```bash
# 빌드
npx eas build --platform ios --profile production
npx eas build --platform android --profile production

# App Store 제출
npx eas submit --platform ios
npx eas submit --platform android

# TestFlight 배포 (preview 프로파일)
npx eas build --platform ios --profile preview
```

---

## 4. 로컬 개발 환경

**파일:** `backend/docker-compose.yml`

MySQL + Redis만 컨테이너로 실행. Spring Boot는 IDE(IntelliJ)에서 직접 실행.

```bash
# 로컬 인프라 시작
cd backend
docker-compose up -d

# 확인
docker ps   # prolog-mysql, prolog-redis 실행 중인지 확인
```

**로컬 포트:**

| 서비스 | 포트 |
|---|---|
| Spring Boot | 8080 |
| MySQL | 127.0.0.1:3306 |
| Redis | 127.0.0.1:6379 |
| Admin | 3001 |
| Web | 3000 |

**로컬 `.env` 파일 위치:** 프로젝트 루트 (`prolog/.env`)
IDE의 Working Directory가 루트이므로 `backend/.env`가 아닌 루트에 위치.

**앱 로컬 API 연결:**
```env
# application/.env
EXPO_PUBLIC_API_URL=http://192.168.x.x:8080
# iOS 시뮬레이터는 localhost 인식 불가 → Mac 실제 IP 사용
# Mac IP 확인: ifconfig | grep "inet " | grep -v 127.0.0.1
```

---

## 5. 서비스·도메인 전체 목록

| 서비스 | 플랫폼 | 도메인 / 주소 |
|---|---|---|
| API 서버 | AWS EC2 + Docker | https://api.prolog.jooky.site |
| Swagger UI | (API 서버 내) | https://api.prolog.jooky.site/swagger-ui/index.html |
| 관리자 페이지 | Vercel | https://admin.prolog.jooky.site |
| 공식 웹페이지 | Vercel | https://prolog.jooky.site |
| iOS 앱 | App Store | com.jooky.prolog |
| Docker Hub | Docker Hub | jookyworld/prolog-backend |
| EAS 빌드 | expo.dev | 프로젝트 ID: 99e3012a-... |

---

## 6. 외부 플랫폼 확인 포인트

코드 레포에서 확인할 수 없는 설정들.

### GitHub (저장소 Settings > Secrets and variables > Actions)
- `EC2_HOST`, `EC2_USERNAME`, `EC2_SSH_KEY`, `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`
- Actions 탭에서 워크플로우 실행 이력 및 실패 로그 확인

### AWS EC2 콘솔
- 인스턴스 타입 및 사양
- 보안그룹 인바운드 규칙 (80, 443 공개 / 포트 81 NPM 관리 UI 노출 여부 / 22 SSH 제한)
- 탄력적 IP(Elastic IP) 사용 여부
- 리전

### Nginx Proxy Manager (`http://[EC2 IP]:81`)
- `api.prolog.jooky.site` → `prolog-backend:8080` 프록시 설정 확인
- SSL 인증서 만료일 및 자동 갱신 상태
- 리다이렉트 규칙 (HTTP → HTTPS)

### Vercel 대시보드 (vercel.com)
- admin, web 각 프로젝트 환경변수
- 배포 히스토리 및 빌드 로그
- 커스텀 도메인 DNS 상태

### Docker Hub (hub.docker.com)
- `jookyworld/prolog-backend` 이미지 목록 및 최근 푸시 시점
- 이미지 레이어 크기

### Expo EAS (expo.dev)
- 빌드 히스토리 (production 빌드 시점, 성공/실패)
- App Store 제출 이력
- OTA 업데이트 채널 상태

### App Store Connect (appstoreconnect.apple.com)
- 앱 심사 상태
- TestFlight 빌드 이력
- 다운로드 수, 평점, 크래시 리포트

---

## 7. 장애 대응

### 배포 후 API 응답 없음

```bash
# 1. 컨테이너 상태 확인
sudo docker ps

# 2. 백엔드 로그 확인
sudo docker logs prolog-backend --tail 100

# 3. 컨테이너 재시작
cd ~/app
sudo docker-compose -f docker-compose.prod.yml restart spring-app

# 4. 전체 재시작
sudo docker-compose -f docker-compose.prod.yml down
sudo docker-compose -f docker-compose.prod.yml up -d
```

### MySQL 연결 실패

```bash
# MySQL 컨테이너 상태
sudo docker logs prolog-mysql --tail 50

# MySQL 직접 접속
sudo docker exec -it prolog-mysql mysql -uroot -p
```

### MySQL 한글 데이터 확인

```bash
sudo docker exec prolog-mysql mysql -uroot -p[비밀번호] prolog \
  -e "SHOW VARIABLES LIKE 'character%';"
# character_set_client/connection/results 모두 utf8mb4여야 함
```

### EC2 디스크 공간 부족

```bash
# 디스크 사용량 확인
df -h

# 오래된 Docker 이미지 정리
sudo docker image prune -a

# 로그 크기 확인
sudo docker system df
```

---

## 관련 문서

| 문서 | 내용 |
|---|---|
| [DEVELOPMENT.md](./DEVELOPMENT.md) | 개발 가이드, 파일 구조, 트러블슈팅 |
| [REQUIREMENTS.md](./REQUIREMENTS.md) | 비즈니스 로직, 데이터 모델 |
| [USER_GUIDE.md](./USER_GUIDE.md) | 앱 사용자 가이드 |
| [Swagger UI](https://api.prolog.jooky.site/swagger-ui/index.html) | API 명세 |
