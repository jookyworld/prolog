import Link from "next/link";

const FEATURES = [
  {
    icon: "📊",
    title: "점진적 과부하 추적",
    description: "루틴별 회차 기록을 비교해 얼마나 성장했는지 한눈에 확인하세요.",
  },
  {
    icon: "📋",
    title: "루틴 관리",
    description: "나만의 운동 루틴을 만들고 세트·중량·반복 수를 체계적으로 기록하세요.",
  },
  {
    icon: "🤝",
    title: "루틴 공유",
    description: "다른 사람의 루틴을 참고하고, 내 루틴을 커뮤니티에 공유하세요.",
  },
  {
    icon: "📈",
    title: "성장 통계",
    description: "주간·월간 운동 데이터를 분석해 꾸준한 습관 형성을 도와드립니다.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <span className="text-xl font-bold text-white">ProLog</span>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="px-6 py-24 text-center">
          <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
            <h1 className="text-5xl font-bold text-white leading-tight">
              운동 기록,<br />
              <span className="text-primary">성장</span>으로 이어지다
            </h1>
            <p className="text-lg text-muted leading-relaxed">
              점진적 과부하 추적과 성장 분석으로<br />
              꾸준한 운동 습관을 만드세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href="#"
                className="flex items-center justify-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors"
              >
                <span>🍎</span> App Store
              </a>
              <a
                href="#"
                className="flex items-center justify-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors"
              >
                <span>🤖</span> Google Play
              </a>
            </div>
            <p className="text-sm text-white/30">출시 준비 중입니다.</p>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 py-16 border-t border-white/10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white text-center mb-12">
              ProLog와 함께라면
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="bg-card rounded-2xl p-6 border border-white/10 flex flex-col gap-3"
                >
                  <span className="text-3xl">{f.icon}</span>
                  <h3 className="text-base font-semibold text-white">{f.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-white/30">© 2026 ProLog. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/terms" className="text-sm text-muted hover:text-white transition-colors">
              서비스 이용약관
            </Link>
            <Link href="/privacy" className="text-sm text-muted hover:text-white transition-colors">
              개인정보 처리방침
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
