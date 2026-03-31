import { SiteLayout } from "@/components/SiteLayout";

export const metadata = {
  title: "개발 정보 | ProLog",
};

const GITHUB_URL = "https://github.com/jookyworld/prolog";
const SWAGGER_URL = "https://api.prolog.jooky.site/swagger-ui/index.html";
const APP_STORE_URL =
  "https://apps.apple.com/kr/app/%EC%83%81%EA%B8%89%EB%85%B8%ED%95%98%EC%9A%B0/id6760579875";

const TECH_STACK = [
  {
    category: "Backend",
    items: [
      { name: "Spring Boot 4.0.1", desc: "메인 API 서버" },
      { name: "Java 21", desc: "Virtual Threads 활용" },
      { name: "MySQL 8.4", desc: "운동 기록·루틴·사용자 데이터" },
      { name: "Redis 7.0", desc: "이메일 인증 코드, JWT 블랙리스트" },
      { name: "Spring Security + JWT", desc: "Access/Refresh Token 기반 인증" },
    ],
  },
  {
    category: "App (iOS)",
    items: [
      { name: "React Native 0.81 / Expo SDK 54", desc: "크로스 플랫폼 모바일" },
      { name: "TypeScript", desc: "전체 코드베이스 타입 안전성" },
      { name: "Expo Router 6", desc: "파일 기반 라우팅" },
      { name: "NativeWind 4.2", desc: "TailwindCSS 기반 스타일링" },
    ],
  },
  {
    category: "Web",
    items: [
      { name: "Next.js 15 (App Router)", desc: "서비스 소개 및 포트폴리오 웹" },
      { name: "React 19", desc: "" },
      { name: "TailwindCSS", desc: "" },
    ],
  },
  {
    category: "Infra",
    items: [
      { name: "AWS EC2", desc: "API 서버 호스팅" },
      { name: "AWS RDS", desc: "MySQL 관리형 DB" },
      { name: "AWS ElastiCache", desc: "Redis 관리형 캐시" },
      { name: "GitHub Actions", desc: "CI/CD 자동 배포" },
      { name: "Nginx + SSL", desc: "리버스 프록시, HTTPS" },
    ],
  },
];

const DECISIONS = [
  {
    title: "세션-운동-세트 3단계 구조",
    desc: "workout_sessions → workout_session_exercises → workout_sets 로 계층을 분리해 종목별 순서 변경, 세트 독립 수정, 운동 완료 후 부분 삭제 등 다양한 편집 시나리오를 유연하게 처리합니다.",
  },
  {
    title: "스냅샷 패턴으로 과거 기록 불변성 보장",
    desc: "운동 세션 저장 시 exercise_name·body_part·routine_title을 스냅샷으로 복사 저장합니다. 이후 종목이나 루틴을 삭제·수정해도 과거 기록이 그대로 유지됩니다.",
  },
  {
    title: "루틴 삭제 시 ON DELETE SET NULL",
    desc: "루틴 삭제 후에도 해당 루틴으로 운동한 세션 기록을 보존하기 위해 workout_sessions.routine_id를 SET NULL로 설정했습니다. routine_title_snapshot과 함께 '어떤 루틴으로 운동했는지'를 항상 표시할 수 있습니다.",
  },
  {
    title: "SharedRoutine의 FK 없는 독립 설계",
    desc: "커뮤니티 공유 루틴(SharedRoutine)은 원본 routines 테이블과 FK를 두지 않고 스냅샷으로 저장합니다. 원본 루틴을 수정하거나 삭제해도 공유 게시물이 유지되어 커뮤니티의 안정성을 확보합니다.",
  },
  {
    title: "맨몸 운동 weight = 0 (NOT NULL)",
    desc: "풀업·딥스 같은 맨몸 운동에서 무게를 NULL이 아닌 0으로 저장합니다. 집계·통계 쿼리에서 NULL 처리 분기를 제거하고 '0kg = 맨몸'이라는 명확한 의미론을 유지합니다.",
  },
];

const px = "clamp(20px, 5vw, 48px)";


function LinkButton({
  href,
  children,
  icon,
}: {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 18px",
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 600,
        textDecoration: "none",
        color: "#fff",
        backgroundColor: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {icon}
      {children}
    </a>
  );
}

export default function DevPage() {
  return (
    <SiteLayout activePath="/dev">
      {/* Hero */}
      <section style={{ padding: `clamp(60px, 10vw, 60px) ${px} 80px` }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              margin: "0 0 24px",
            }}
          >
            개인 풀스택 프로젝트
          </h1>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.5)",
              margin: "0 0 36px",
              maxWidth: 560,
            }}
          >
            백엔드 API 설계부터 iOS 앱, 웹, 인프라 배포까지 혼자 개발·운영하는
            운동 기록 서비스입니다.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <LinkButton
              href={GITHUB_URL}
              icon={
                <svg
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              }
            >
              GitHub 저장소
            </LinkButton>
            <LinkButton
              href={SWAGGER_URL}
              icon={
                <svg
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                </svg>
              }
            >
              API 문서 (Swagger)
            </LinkButton>
            <LinkButton
              href={APP_STORE_URL}
              icon={
                <svg
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
              }
            >
              App Store
            </LinkButton>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section style={{ padding: `0 ${px} 80px` }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "clamp(20px, 2.5vw, 28px)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              margin: "0 0 40px",
            }}
          >
            기술 스택
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {TECH_STACK.map((group) => (
              <div
                key={group.category}
                style={{
                  backgroundColor: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 14,
                  padding: 24,
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.3)",
                    margin: "0 0 16px",
                  }}
                >
                  {group.category}
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {group.items.map((item) => (
                    <div key={item.name}>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#fff",
                        }}
                      >
                        {item.name}
                      </span>
                      {item.desc && (
                        <span
                          style={{
                            fontSize: 13,
                            color: "rgba(255,255,255,0.35)",
                            marginLeft: 8,
                          }}
                        >
                          {item.desc}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Decisions */}
      <section
        style={{
          padding: `80px ${px} 100px`,
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "clamp(20px, 2.5vw, 28px)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              margin: "0 0 40px",
            }}
          >
            주요 설계 결정
          </h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {DECISIONS.map((d, i) => (
              <div
                key={i}
                style={{
                  padding: "32px 0",
                  borderTop: "1px solid rgba(255,255,255,0.07)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    margin: 0,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {d.title}
                </p>
                <p
                  style={{
                    fontSize: 15,
                    lineHeight: 1.75,
                    color: "rgba(255,255,255,0.5)",
                    margin: 0,
                    maxWidth: 720,
                  }}
                >
                  {d.desc}
                </p>
              </div>
            ))}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }} />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
