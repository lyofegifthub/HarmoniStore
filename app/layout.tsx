import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HarmoniStore - Pusat Alat Musik & Kebutuhan Musik Terlengkap",
  description:
    "Toko alat musik resmi bergaransi terlengkap di Indonesia. Jual gitar elektrik & akustik, piano digital, keyboard synthesizer, drum kit, dan aksesoris audio panggung.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isProduction =
    process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
  const snapUrl = isProduction
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";

  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script
          src={snapUrl}
          data-client-key={clientKey}
          strategy="lazyOnload"
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
