# PROLOG - 운동 기록 관리 서비스

**점진적 과부하 추적과 성장 분석을 통해 꾸준한 운동 습관 형성을 돕는 모바일 앱**

**버전:** v1.0.0 | **최종 업데이트:** 2026-03-09

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
├── application/       # Expo React Native App
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

## 🌐 배포 현황

| 항목 | 상태 | 주소 / 비고 |
|------|------|-------------|
| **Backend API** | ✅ 운영 중 | `https://api.prolog.jooky.site` |
| **Swagger UI** | ✅ 운영 중 | `https://api.prolog.jooky.site/swagger-ui/index.html` |
| **Mobile App** | 🚧 EAS 빌드 테스트 중 | TestFlight 배포 예정 |
| **Admin Web** | 📋 미개발 | Phase 3-2 이후 예정 |

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

| Phase | 내용 | 상태 | 진행률 |
|-------|------|------|--------|
| **Phase 1** | MVP Core (인증, 루틴, 운동 세션, 기본 통계) | ✅ 완료 | 100% |
| **Phase 2** | 성장 통계 (볼륨 추이, 최고 중량, 회차 비교) | 🚧 진행 중 | 20% |
| **Phase 3-1** | 커뮤니티 기본 (공유, 가져오기, 댓글) | ✅ 완료 | 100% |
| **Phase 3-2** | 커뮤니티 고급 (좋아요, 추천) | 📋 계획 | 0% |
| **UI/UX 개선** | 운동 화면 개편, 모달 네비게이션 | 🚧 진행 중 | - |

> **Phase 2 상세:** 홈 통계(`GET /api/stats/home`)만 완료. 종목별 볼륨 추이, 최고 중량 추이, 루틴별 회차 비교 등은 미구현.

### 🎯 다음 작업 방향

**TestFlight 배포 전**, 실 사용 시 필수적인 기능을 Phase 순서와 무관하게 우선 개발.

| 우선순위 | 항목 | 비고 |
|----------|------|------|
| 🔴 1 | 비밀번호 재설정 (이메일) | 비번 분실 시 계정 복구 방법 없음, 백엔드 이메일 발송 필요 |
| 🔴 2 | 이용약관 / 개인정보처리방침 | Apple 심사 필수, settings 화면에 링크 추가 |
| 🟡 3 | 이메일 / 비밀번호 변경 | 현재 닉네임·신체정보만 수정 가능, 계정 정보 변경 API 없음 |
| 🟡 4 | 세션 중 세트 데이터 임시저장 | 앱 강제 종료 시 입력 중 세트 기록 유실 위험 |
