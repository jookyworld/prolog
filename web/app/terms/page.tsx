import { TERMS_OF_SERVICE } from "@/lib/terms";
import Link from "next/link";

export const metadata = {
  title: "서비스 이용약관 | ProLog",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            ProLog
          </Link>
        </div>
      </header>

      <main className="flex-1 px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-2">서비스 이용약관</h1>
          <p className="text-sm text-muted mb-8">최종 업데이트: 2026년 3월 13일</p>
          <div className="bg-card rounded-2xl border border-white/10 p-8">
            <pre className="text-sm text-muted leading-8 whitespace-pre-wrap font-sans">
              {TERMS_OF_SERVICE}
            </pre>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 px-6 py-6">
        <div className="max-w-3xl mx-auto flex gap-6">
          <Link href="/terms" className="text-sm text-primary">서비스 이용약관</Link>
          <Link href="/privacy" className="text-sm text-muted hover:text-white transition-colors">개인정보 처리방침</Link>
        </div>
      </footer>
    </div>
  );
}
