import type { Metadata } from "next";
import { Bodoni_Moda, DM_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const bodoni = Bodoni_Moda({
  variable: "--font-editorial",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-utility",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: 'The Abstract — An Editorial Document Summarizer',
  description:
    'Turn PDFs and images into concise, considered briefs with private browser-based extraction.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodoni.variable} ${dmSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
