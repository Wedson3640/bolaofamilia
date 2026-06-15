import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "bolao.online | Crie seu bolão da Copa em minutos",
  description:
    "Crie seu bolão online, compartilhe no WhatsApp, acompanhe palpites e ranking em tempo real durante a Copa.",
  metadataBase: new URL("https://bolao.online"),
  openGraph: {
    title: "bolao.online",
    description: "Configure seu bolão em minutos e compartilhe no WhatsApp.",
    url: "https://bolao.online",
    siteName: "bolao.online",
    images: [
      {
        url: "/images/fanpage-bolao.png",
        width: 1024,
        height: 1536,
        alt: "bolao.online",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
