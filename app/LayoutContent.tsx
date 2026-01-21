"use client";

import { ReactNode } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { usePathname } from "next/navigation";
import FloatingWhatsAppButton from "@/components/FloatingWhatsAppButton";
import { LanguageProvider } from "@/lib/i18n";

export default function LayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");

  return (
    <LanguageProvider>
      {!isAdminPage && <Header />}
      {children}
      {!isAdminPage && <FloatingWhatsAppButton />}
      {!isAdminPage && <Footer />}
    </LanguageProvider>
  );
}
