import { SiteLayout } from "@/components/SiteLayout";

export const metadata = {
  title: "사용자 설명서 | ProLog",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        paddingBottom: 56,
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <h2
        style={{
          fontSize: "clamp(18px, 2.5vw, 24px)",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          margin: "0 0 24px",
          color: "#fff",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h3
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: "rgba(255,255,255,0.7)",
          margin: "0 0 12px",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 15,
        lineHeight: 1.75,
        color: "rgba(255,255,255,0.5)",
        margin: "0 0 12px",
      }}
    >
      {children}
    </p>
  );
}

function OL({ items }: { items: string[] }) {
  return (
    <ol
      style={{
        margin: "0 0 12px",
        paddingLeft: 20,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            fontSize: 15,
            lineHeight: 1.7,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          {item}
        </li>
      ))}
    </ol>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10,
        padding: "14px 16px",
        fontSize: 14,
        lineHeight: 1.7,
        color: "rgba(255,255,255,0.4)",
        margin: "12px 0",
      }}
    >
      {children}
    </div>
  );
}

function TableRow({ q, a }: { q: string; a: string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 2fr",
        gap: "12px 24px",
        padding: "16px 0",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        alignItems: "start",
      }}
    >
      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "rgba(255,255,255,0.7)",
        }}
      >
        {q}
      </span>
      <span
        style={{
          fontSize: 14,
          lineHeight: 1.65,
          color: "rgba(255,255,255,0.45)",
        }}
      >
        {a}
      </span>
    </div>
  );
}

const SAVE_OPTIONS = [
  { q: "기록만 저장", a: "루틴 변경 없이 기록만 남김 — 가장 일반적인 경우" },
  {
    q: "루틴으로 만들기",
    a: "오늘 한 운동을 새 루틴으로 저장 — 자유 운동 후 루틴화할 때",
  },
  {
    q: "자유 운동으로 전환",
    a: "루틴 연결 끊고 자유 운동으로 기록 — 루틴과 다르게 운동했을 때",
  },
  {
    q: "루틴 업데이트",
    a: "오늘 한 대로 루틴 구성도 변경 — 루틴을 개선하고 싶을 때",
  },
];

const HOME_STATS = [
  { q: "이번 주 / 이번 달", a: "해당 기간 운동 횟수" },
  { q: "평균 운동 시간", a: "세션당 평균 소요 시간" },
  { q: "주간 활동", a: "최근 7일간 운동한 부위 표시" },
  { q: "자주 하는 운동 TOP 5", a: "가장 많이 기록한 종목" },
  { q: "최근 운동 기록", a: "최근 완료한 세션 목록" },
];

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

export default function GuidePage() {
  return (
    <SiteLayout activePath="/guide">
      {/* Hero */}
      <section
        style={{
          padding: "clamp(80px, 12vw, 120px) clamp(20px, 5vw, 48px) 64px",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)",
              marginBottom: 20,
            }}
          >
            사용자 설명서
          </p>
          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 48px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
              margin: "0 0 20px",
            }}
          >
            ProLog 사용 방법
          </h1>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.45)",
              margin: 0,
            }}
          >
            루틴 만들기부터 운동 기록, 성장 통계까지 — 모든 기능을 안내합니다.
          </p>
        </div>
      </section>

      {/* Content */}
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "0 clamp(20px, 5vw, 48px) 120px",
          display: "flex",
          flexDirection: "column",
          gap: 56,
        }}
      >
        {/* 1. 시작하기 */}
        <Section title="시작하기">
          <SubSection title="회원가입">
            <OL
              items={[
                "앱 실행 후 회원가입 탭 선택",
                "아이디(영문/숫자), 비밀번호, 이메일, 닉네임 입력",
                "가입 완료 후 자동 로그인",
              ]}
            />
          </SubSection>
          <SubSection title="프로필 설정">
            <P>
              하단 탭 프로필 → 프로필 수정에서 닉네임, 성별, 키, 체중을 설정할
              수 있습니다.
            </P>
            <Callout>
              신체 정보는 선택 사항이며, 나중에 언제든 수정할 수 있습니다.
            </Callout>
          </SubSection>
        </Section>

        {/* 2. 루틴 관리 */}
        <Section title="루틴 관리">
          <P>
            루틴은 자주 하는 운동들의 묶음입니다. 예: "상체 루틴 A", "하체 데이"
          </P>
          <SubSection title="루틴 만들기">
            <OL
              items={[
                "하단 탭 루틴 선택",
                "우측 상단 + 버튼",
                "루틴 이름, 설명(선택) 입력",
                "부위별로 필터링해서 종목 선택 — 종목마다 목표 세트 수와 휴식 시간 설정",
                "저장",
              ]}
            />
          </SubSection>
          <SubSection title="루틴 수정">
            <P>
              루틴 상세 페이지에서 수정 버튼을 눌러 종목 추가/삭제, 순서 변경,
              세트 수를 조정할 수 있습니다.
            </P>
            <Callout>
              루틴을 수정해도 이전에 기록된 운동 내역은 변경되지 않습니다.
            </Callout>
          </SubSection>
          <SubSection title="루틴 보관 / 삭제">
            <P>
              더 이상 사용하지 않는 루틴은 보관 처리하면 목록에서 숨겨집니다.
              보관된 루틴은 다시 활성화하거나 완전히 삭제할 수 있습니다.
            </P>
            <Callout>
              삭제는 보관 상태에서만 가능합니다. 실수 방지를 위한 2단계
              프로세스입니다.
            </Callout>
          </SubSection>
        </Section>

        {/* 3. 운동 기록하기 */}
        <Section title="운동 기록하기">
          <SubSection title="운동 시작">
            <P>하단 탭 중앙의 덤벨 버튼 또는 운동 탭에서 시작합니다.</P>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 12,
              }}
            >
              {[
                { label: "루틴으로 시작", desc: "저장한 루틴을 선택 후 시작" },
                { label: "자유 운동", desc: "루틴 없이 그때그때 종목 선택" },
              ].map((opt) => (
                <div
                  key={opt.label}
                  style={{ display: "flex", gap: 12, alignItems: "baseline" }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.7)",
                      minWidth: 100,
                      flexShrink: 0,
                    }}
                  >
                    {opt.label}
                  </span>
                  <span
                    style={{ fontSize: 14, color: "rgba(255,255,255,0.45)" }}
                  >
                    {opt.desc}
                  </span>
                </div>
              ))}
            </div>
          </SubSection>
          <SubSection title="운동 화면">
            <P>
              진행 시간이 상단에 실시간으로 표시됩니다. 각 종목마다 이전 기록이
              자동으로 표시되며(같은 루틴 기준), 세트별로 무게(kg)와
              횟수(reps)를 입력 후 체크하면 됩니다.
            </P>
            <P>
              운동 화면 하단 종목 추가 버튼으로 진행 중에도 종목을 추가할 수
              있습니다.
            </P>
          </SubSection>
          <SubSection title="운동 완료 — 저장 방식 선택">
            <div style={{ marginBottom: 8 }}>
              {SAVE_OPTIONS.map((opt) => (
                <TableRow key={opt.q} q={opt.q} a={opt.a} />
              ))}
            </div>
          </SubSection>
        </Section>

        {/* 4. 홈 화면 통계 */}
        <Section title="홈 화면 통계">
          <P>홈 탭에서 확인할 수 있는 항목입니다.</P>
          <div>
            {HOME_STATS.map((s) => (
              <TableRow key={s.q} q={s.q} a={s.a} />
            ))}
          </div>
        </Section>

        {/* 5. 커뮤니티 */}
        <Section title="커뮤니티">
          <SubSection title="루틴 둘러보기">
            <P>
              하단 탭 커뮤니티에서 다른 사용자들이 공유한 루틴을 볼 수 있습니다.
              최신순 / 인기순 / 많이 가져간 순으로 정렬할 수 있습니다.
            </P>
          </SubSection>
          <SubSection title="루틴 가져오기">
            <OL
              items={[
                "공유 루틴 상세 페이지 접속",
                "가져오기 버튼",
                "내 루틴 목록에 자동 추가",
              ]}
            />
            <Callout>
              가져온 루틴은 내 것이 되어 자유롭게 수정할 수 있습니다.
            </Callout>
          </SubSection>
          <SubSection title="내 루틴 공유하기">
            <OL
              items={[
                "커뮤니티 탭 또는 루틴 상세에서 공유하기 버튼",
                "공유 제목과 설명 작성 (원본 루틴 이름과 다르게 써도 됩니다)",
                "공유 완료",
              ]}
            />
            <Callout>
              공유 후 원본 루틴을 수정하거나 삭제해도 공유된 내용은 유지됩니다.
            </Callout>
          </SubSection>
          <SubSection title="댓글">
            <P>
              공유 루틴 상세 페이지에서 댓글을 남기거나 확인할 수 있습니다.
              본인이 작성한 댓글만 삭제 가능합니다.
            </P>
          </SubSection>
        </Section>
      </div>
    </SiteLayout>
  );
}
