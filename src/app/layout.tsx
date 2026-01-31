import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GUIDEON - AI 관광 안내 시스템',
  description: '관광지에 생명을 불어넣는 AI 안내 솔루션. 다국어 대화형 키오스크로 방문객에게 잊지 못할 경험을 선사합니다.',
  keywords: ['AI', '관광', '키오스크', '다국어', '안내', 'GUIDEON', '스마트 관광'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${inter.variable} ${outfit.variable}`}>
      <body className="font-sans antialiased bg-white text-slate-900">
        {children}
      </body>
    </html>
  );
}