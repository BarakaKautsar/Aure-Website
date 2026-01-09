import type { ReactNode } from "react";
import "./globals.css";
import { DM_Sans } from "next/font/google";
import LayoutContent from "./LayoutContent";
import FloatingWhatsAppButton from "@/components/FloatingWhatsAppButton";

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
        <LayoutContent>{children}</LayoutContent>
        <FloatingWhatsAppButton /> {/* ← Add this */}
      </body>
    </html>
  );
}
