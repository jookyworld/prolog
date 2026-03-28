import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProLog: 상급노하우",
  description:
    "점진적 과부하 추적과 성장 분석으로 꾸준한 운동 습관을 만드세요.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
