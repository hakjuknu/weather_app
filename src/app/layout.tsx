import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "날씨정보 - 실시간 날씨 예보 서비스",
  description: "전 세계 도시의 실시간 날씨 정보와 24시간 예보, 7일 예보를 확인하세요. GPS 위치 기반 현재 날씨, 체감온도, 습도, 풍속, 자외선 지수, 강수확률 등 상세한 기상 정보 제공.",
  keywords: ["날씨", "weather", "예보", "forecast", "기상청", "실시간", "GPS", "온도", "습도", "풍속", "자외선", "강수확률"],
  authors: [{ name: "Weather App Team" }],
  creator: "Weather App",
  publisher: "Weather App",
  applicationName: "날씨정보",
  generator: "Next.js",
  openGraph: {
    title: "날씨정보 - 실시간 날씨 예보",
    description: "정확한 날씨 정보와 예보를 확인하세요",
    type: "website",
    locale: "ko_KR",
    siteName: "날씨정보",
    url: "https://weather-app.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "날씨정보 - 실시간 날씨 예보",
    description: "정확한 날씨 정보와 예보를 확인하세요",
    creator: "@weatherapp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: "weather",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <main className="flex-1">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
