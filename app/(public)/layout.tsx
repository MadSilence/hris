 "use client";
import Navbar from "@/components/layout/Navbar/Navbar";
import { Footer } from "@/components/layout/Footer/Footer";
import { usePathname } from "next/navigation";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDesact = pathname?.startsWith("/desact");
  return (
    <>
      <Navbar />
      <main className={isDesact ? "px-0 py-0" : "mx-auto max-w-6xl px-4 py-10"}>
        {children}
      </main>
      <Footer />
    </>
  );
}
