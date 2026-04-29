"use client";

import Navbar from "@/components/layout/Navbar/Navbar";
import { Footer } from "@/components/layout/Footer/Footer";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isDesact = pathname?.startsWith("/desact");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar/>

      <main
        className={
          isDesact
            ? "flex-1 px-0 py-0"
            : "mx-auto w-full max-w-6xl flex-1 px-4 py-10"
        }
      >
        {children}
      </main>

      <Footer/>
    </div>
  );
}
