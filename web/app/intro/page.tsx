import { AppStoreBadge, SiteLayout } from "@/components/SiteLayout";

const FEATURES = [
  {
    file: "Frame 1.png",
    title: "점진적 과부하, 눈으로 확인하세요",
    desc: "최근 운동 횟수, 평균 운동 시간, 부위별 대표 종목의 성장 추세를 한눈에 확인하세요. 무게와 횟수를 함께 고려한 강도 기반 지표로 진짜 강해졌는지를 측정합니다.",
  },
  {
    file: "Frame 2.png",
    title: "어제의 나와 실시간 경쟁",
    desc: "같은 루틴으로 운동할 때마다 직전 운동의 무게와 횟수가 자동으로 표시됩니다. 오늘 1kg이라도 더 들었다면, 그게 바로 성장입니다.",
  },
  {
    file: "Frame 3.png",
    title: "루틴 관리의 압도적 간편함",
    desc: "자주 하는 운동 조합을 루틴으로 저장하고 반복 사용하세요. 가슴·어깨·등·하체 등 8가지 부위로 종목을 관리합니다.",
  },
  {
    file: "Frame 4.png",
    title: "성장 노하우를 내 루틴으로",
    desc: "다른 사람의 루틴을 그대로 가져와서 바로 사용하세요. 내 것이 된 루틴은 자유롭게 수정 가능합니다.",
  },
  {
    file: "Frame 5.png",
    title: "오늘의 운동, 바로 시작",
    desc: "홈에서 루틴을 선택해 바로 시작하거나, 루틴 없는 자유 운동도 OK. 운동 후 마음에 들면 새 루틴으로 저장할 수도 있어요.",
  },
  {
    file: "Frame 6.png",
    title: "나만의 운동 등록",
    desc: "기본 제공 종목 외에 커스텀 종목을 직접 추가할 수 있습니다. 내 운동 스타일에 맞게 자유롭게 구성하세요.",
  },
];

export default function Home() {
  return (
    <SiteLayout activePath="/intro">
      {/* Hero */}
      <section style={{ padding: "80px 48px 40px", textAlign: "center" }}>
        <div
          style={{
            maxWidth: 640,
            margin: "0 auto 40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
        >
          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 58px)",
              fontWeight: 700,
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            웨이트 트레이닝의 <br />
            진짜 <span style={{ color: "#3182F6" }}>상급노하우</span>
          </h1>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.8,
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "0.01em",
              margin: 0,
              maxWidth: 460,
            }}
          >
            비싼 PT도, 특별한 운동법도 아닙니다.
            <br />
            어제보다 &ldquo;단 한 번&rdquo; 더 들기 위한 노력,
            <br />
            ProLog와 함께하세요.
          </p>
          <AppStoreBadge />
        </div>
      </section>

      {/* Features — alternating image / text */}
      <section style={{ padding: "0 48px 80px" }}>
        <div
          style={{
            maxWidth: 880,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          {FEATURES.map((f, i) => {
            const imageLeft = i % 2 === 0;
            return (
              <div
                key={f.file}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "clamp(40px, 6vw, 96px)",

                  flexWrap: "wrap",
                }}
              >
                <img
                  src={`/screenshots/${encodeURIComponent(f.file)}`}
                  alt={f.title}
                  style={{
                    width: "clamp(200px, 25vw, 280px)",
                    borderRadius: 24,
                    display: "block",
                    flexShrink: 0,
                    order: imageLeft ? 1 : 2,
                  }}
                />
                <div
                  style={{
                    flex: 1,
                    minWidth: 240,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 16,
                    order: imageLeft ? 2 : 1,
                  }}
                >
                  <h2
                    style={{
                      fontSize: "clamp(22px, 3vw, 32px)",
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                      lineHeight: 1.25,
                      margin: 0,
                      textAlign: "center",
                    }}
                  >
                    {f.title}
                  </h2>
                  <p
                    style={{
                      fontSize: 16,
                      lineHeight: 1.8,
                      color: "rgba(255,255,255,0.5)",
                      margin: 0,
                      maxWidth: 420,
                      textAlign: "center",
                    }}
                  >
                    {f.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </SiteLayout>
  );
}
