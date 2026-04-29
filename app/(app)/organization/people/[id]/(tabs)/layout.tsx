import { ReactNode } from "react";
import Link from "next/link";
import { UserProvider } from "@/components/providers/UserProvider";
import { UserDataHeader } from "@/components/modules/organization/modules/profile/components/UserDataHeader";
import { getUserServer } from "@/server/users/users";
import { Button } from "@/public/desact/src/components/ui/button";

export default async function UserTabsLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUserServer(id);

  const tabs = [
    { id: "personal", label: "Personal Info", href: "personal" },
    { id: "documents", label: "Documents", href: "documents" },
    { id: "time-off", label: "Time Off", href: "time-off" },
  ];

  return (
    <UserProvider userId={id} initialUser={user}>
      <div className="flex h-full min-h-0 flex-col">
        <header className="px-8 pt-6">
          <UserDataHeader userId={id} user={user}/>
        </header>

        <nav className="px-8 pb-5">
          <div className="flex gap-1 border-b border-brown-200">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                asChild
                variant="ghost"
                className="rounded-none text-brown-600 hover:bg-brown-50 hover:text-brown-700"
              >
                <Link href={tab.href} className="no-underline">
                  {tab.label}
                </Link>
              </Button>
            ))}
          </div>
        </nav>

        <main className="flex h-full min-h-0 flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </UserProvider>
  );
}
