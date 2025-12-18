// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { DM_Sans } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"], // choose the weights you need
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
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
