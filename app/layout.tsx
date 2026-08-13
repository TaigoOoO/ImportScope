import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { EventTracker } from "@/components/analytics/event-tracker";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ImportScope — Radar de Oportunidades China-Brasil",
    template: "%s | ImportScope",
  },
  description:
    "Descubra produtos da China com margem real calculada. Custo tributário, risco de retenção e preço de venda antes de comprar.",
  keywords: ["importação", "China", "Brasil", "NCM", "tributos", "dropshipping", "fornecedores"],
  openGraph: {
    title: "ImportScope — Radar de Oportunidades",
    description: "Cálculo real de custo de importação. Sem surpresas na Receita.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "ImportScope",
    description: "Seu radar de oportunidades de importação.",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans bg-background min-h-screen">
        <EventTracker />
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "#111827",
              border: "1px solid #1E293B",
              color: "#F8FAFC",
            },
          }}
        />
      </body>
    </html>
  );
}
