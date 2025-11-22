import Navbar from "@/components/layout/Navbar/Navbar";
import {Footer} from "@/components/layout/Footer/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
      <Footer />
    </>
  );
}
