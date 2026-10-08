"use client";

import Navbar from "@/components/layout/Navbar/Navbar";
import { Footer } from "@/components/layout/Footer/Footer";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const AUTH_SCREEN_PATHS = ["/login", "/find-company"];

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isDesact = pathname?.startsWith("/desact");
  // The sign-in screens paint their own backdrop edge to edge, between the navbar and the footer.
  const isAuthScreen = AUTH_SCREEN_PATHS.includes(pathname ?? "");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar/>

      <main
        className={
          isAuthScreen
            ? "flex flex-1 flex-col"
            : isDesact
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
