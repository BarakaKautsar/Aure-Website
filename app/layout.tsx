import type { ReactNode } from "react";
import "./globals.css";
import { DM_Sans } from "next/font/google";
import LayoutContent from "./LayoutContent";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-dm-sans",
});

export const metadata = {
  title: "Aure Pilates Studio",
  description: "Pilates studio website",
  other: {
    "facebook-domain-verification": "4ico95vckr7l0rd6gmc4aabppqkbf4",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable}`}>
      <body>
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
