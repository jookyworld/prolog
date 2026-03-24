import { SiteLayout } from "@/components/SiteLayout";
import { CONTACT_EMAIL } from "@/lib/terms";

export const metadata = {
  title: "지원 | ProLog",
};

const FAQS = [
  {
    q: "운동 기록을 삭제할 수 있나요?",
    a: "네. 운동 기록 상세 페이지에서 삭제할 수 있습니다. 삭제하면 복구되지 않습니다.",
  },
  {
    q: "루틴을 삭제하면 이전 운동 기록도 사라지나요?",
    a: "아니요. 루틴을 삭제해도 과거에 그 루틴으로 운동한 기록은 그대로 유지됩니다.",
  },
  {
    q: "커스텀 운동 종목을 추가할 수 있나요?",
    a: "네. 루틴 편집 화면 또는 운동 중 종목 선택 시 커스텀 종목 추가 기능을 사용할 수 있습니다.",
  },
  {
    q: "이전 운동 기록은 어디서 볼 수 있나요?",
    a: "하단 탭 프로필 → 운동 기록에서 전체 기록을 확인할 수 있습니다.",
  },
  {
    q: "같은 루틴으로 운동할 때 지난번 기록이 안 보여요.",
    a: "루틴 기반으로 세션을 시작해야 이전 기록이 표시됩니다. 자유 운동으로 시작한 경우에는 표시되지 않습니다.",
  },
  {
    q: "비밀번호를 잊어버렸어요.",
    a: "로그인 화면에서 비밀번호 재설정을 선택하면 이메일로 인증 코드가 발송됩니다.",
  },
  {
    q: "회원 탈퇴하면 어떻게 되나요?",
    a: "계정 및 모든 운동 기록, 루틴, 공유한 루틴, 댓글이 영구 삭제됩니다. 복구가 불가능하니 신중하게 진행해주세요.",
  },
];

export default function SupportPage() {
  return (
    <SiteLayout activePath="/support">
      {/* Hero */}
      <section style={{ padding: "120px 48px 80px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 24 }}>
            지원
          </p>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15, margin: "0 0 24px" }}>
            무엇을 도와드릴까요?
          </h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", margin: 0 }}>
            자주 묻는 질문을 확인하거나, 이메일로 문의해 주세요.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "0 48px 80px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(20px, 2.5vw, 28px)", fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 32px" }}>
            자주 묻는 질문
          </h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {FAQS.map((faq, i) => (
              <div
                key={i}
                style={{
                  padding: "28px 0",
                  borderTop: "1px solid rgba(255,255,255,0.07)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <p style={{ fontSize: 16, fontWeight: 600, margin: 0, letterSpacing: "-0.01em" }}>
                  {faq.q}
                </p>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: "rgba(255,255,255,0.5)", margin: 0 }}>
                  {faq.a}
                </p>
              </div>
            ))}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }} />
          </div>
        </div>
      </section>

      {/* Contact */}
      <section style={{ padding: "80px 48px 100px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 style={{ fontSize: "clamp(20px, 2.5vw, 28px)", fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>
            직접 문의하기
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", margin: 0 }}>
            FAQ에서 해결되지 않은 문제는 이메일로 문의해 주세요. 최대한 빠르게 답변드리겠습니다.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginTop: 8,
              fontSize: 15,
              fontWeight: 600,
              color: "#3182F6",
              textDecoration: "none",
            }}
          >
            {CONTACT_EMAIL} →
          </a>
        </div>
      </section>
    </SiteLayout>
  );
}
