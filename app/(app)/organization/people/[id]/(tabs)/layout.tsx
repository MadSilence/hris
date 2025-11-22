import { ReactNode } from "react";
import { UserProvider } from "@/components/providers/UserProvider";
import { Tabs } from "@/components/layout/Tabs/Tabs";
import { UserDataHeader } from "@/components/modules/organization/modules/profile/components/UserDataHeader";
import styles from "./TabsLayout.module.css";
import { getUserServer } from "@/server/users/users";

export default async function UserTabsLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { id: string };
}) {
  const { id } = params;
  const user = await getUserServer(id);

  const tabs = [
    { id: "personal", label: "Personal Info", href: `personal` },
    { id: "documents", label: "Documents", href: `documents` },
    { id: "time-off", label: "Time Off", href: `time-off` },
  ];

  return (
    <UserProvider userId={id} initialUser={user}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <UserDataHeader title="User" userId={id} user={user}/>
        </header>
        <nav className={styles.tabs}>
          <Tabs tabs={tabs}/>
        </nav>
        <main className={styles.main}>{children}</main>
      </div>
    </UserProvider>
  );
}
