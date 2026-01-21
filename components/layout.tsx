import type { ReactNode } from "react";
import "./globals.css";
import { DM_Sans } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { LanguageProvider } from "@/lib/i18n";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-dm-sans",
});

export const metadata = {
  title: "Aure Pilates Studio",
  description: "Pilates studio website",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable}`}>
      <body>
        <LanguageProvider>
          <Header />
          {children}
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
