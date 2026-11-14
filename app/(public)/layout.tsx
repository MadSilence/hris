"use client";

import Navbar from "@/components/layout/Navbar/Navbar";
import { Footer } from "@/components/layout/Footer/Footer";
import { ReactNode } from "react";


export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar/>

      <main
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-10"
      >
        {children}
      </main>

      <Footer/>
    </div>
  );
}
