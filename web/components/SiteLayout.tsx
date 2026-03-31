import Link from "next/link";

const APP_STORE_URL = "https://apps.apple.com/kr/app/%EC%83%81%EA%B8%89%EB%85%B8%ED%95%98%EC%9A%B0/id6760579875";
const GITHUB_URL = "https://github.com/jookyworld/prolog";

const NAV_LINKS = [
  { href: "/intro", label: "서비스 소개" },
  { href: "/guide", label: "사용자 설명서" },
  { href: "/support", label: "지원" },
];

const S = {
  base: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    backgroundColor: "#101012",
    color: "#fff",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
};

export function SiteHeader({ activePath }: { activePath?: string }) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        backgroundColor: "rgba(16,16,18,0.9)",
        backdropFilter: "blur(16px)",
        padding: "0 clamp(20px, 4vw, 48px)",
      }}
    >
      <div
        style={{
          maxWidth: 1040,
          margin: "0 auto",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/intro"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
          }}
        >
          <img
            src="/icon.png"
            alt="ProLog"
            className="site-logo-icon"
            style={{ width: 46, height: 46 }}
          />
          <span
            className="site-logo-text"
            style={{ fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1 }}
          >
            ProLog
          </span>
        </Link>
        <nav className="site-nav" style={{ display: "flex", alignItems: "center" }}>
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                fontWeight: 500,
                textDecoration: "none",
                color: activePath === l.href ? "#fff" : "rgba(255,255,255,0.5)",
                transition: "color 0.15s",
              }}
            >
              {l.label}
            </Link>
          ))}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub 저장소"
            style={{
              display: "flex",
              alignItems: "center",
              color: "rgba(255,255,255,0.5)",
              transition: "color 0.15s",
            }}
          >
            <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer style={{ backgroundColor: "#000", padding: "64px clamp(20px, 4vw, 48px) 40px" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: 48,
            paddingBottom: 48,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Brand */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img
                src="/icon.png"
                alt="ProLog"
                style={{ width: 36, height: 36, borderRadius: 9 }}
              />
              <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em" }}>
                ProLog: 상급노하우
              </span>
            </div>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.4)",
                margin: 0,
                maxWidth: 280,
              }}
            >
              점진적 과부하 추적과 루틴 관리에 집중한
              <br />
              웨이트 트레이닝 기록 앱
            </p>
            <AppStoreBadge />
          </div>

          {/* Links */}
          <div style={{ display: "flex", gap: 64, flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.3)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                서비스
              </span>
              <Link href="/guide" style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>
                사용자 설명서
              </Link>
              <Link href="/support" style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>
                지원
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.3)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                법적고지
              </span>
              <Link href="/terms" style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>
                서비스 이용약관
              </Link>
              <Link href="/privacy" style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>
                개인정보 처리방침
              </Link>
            </div>
          </div>
        </div>

        <div
          style={{
            paddingTop: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.2)" }}>
            © 2026 ProLog. All rights reserved.
          </span>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: "rgba(255,255,255,0.3)",
              textDecoration: "none",
              transition: "color 0.15s",
            }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout({
  children,
  activePath,
}: {
  children: React.ReactNode;
  activePath?: string;
}) {
  return (
    <div style={S.base}>
      <SiteHeader activePath={activePath} />
      <main style={{ flex: 1 }}>{children}</main>
      <SiteFooter />
    </div>
  );
}

export function AppStoreBadge() {
  return (
    <a
      href={APP_STORE_URL}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        backgroundColor: "#000",
        color: "#fff",
        padding: "10px 20px",
        borderRadius: 12,
        textDecoration: "none",
        border: "1px solid rgba(255,255,255,0.2)",
        width: "fit-content",
      }}
    >
      <svg width={22} height={22} viewBox="0 0 24 24" fill="white">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
        <span style={{ fontSize: 10, opacity: 0.8, letterSpacing: "0.02em" }}>
          Download on the
        </span>
        <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em" }}>
          App Store
        </span>
      </div>
    </a>
  );
}
