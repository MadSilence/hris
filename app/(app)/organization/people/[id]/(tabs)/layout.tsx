import { ReactNode } from "react";
import { UserProvider } from "@/components/providers/UserProvider";
import { Tabs } from "@/components/layout/Tabs/Tabs";
import { UserDataHeader } from "@/components/modules/organization/modules/profile/components/UserDataHeader";
import { getUserServer } from "@/server/users/users";

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
    { id: "personal", label: "Personal Info", href: `personal` },
    { id: "documents", label: "Documents", href: `documents` },
    { id: "time-off", label: "Time Off", href: `time-off` },
  ];

  return (
    <UserProvider userId={id} initialUser={user}>
      <div className="flex flex-col min-h-0">
        <header className="px-8 pt-6">
          <UserDataHeader userId={id} user={user}/>
        </header>
        <nav className="px-8">
          <Tabs tabs={tabs}/>
        </nav>
        <main className="flex-1 min-h-0">{children}</main>
      </div>
    </UserProvider>
  );
}
