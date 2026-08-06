import { ReactNode } from "react";
import { UserProvider } from "@/components/providers/UserProvider";
import { ProfileShell } from "@/components/modules/organization/modules/profile/components/ProfileShell/ProfileShell";
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

  return (
    <UserProvider userId={id} initialUser={user}>
      <ProfileShell userId={id} user={user}>
        {children}
      </ProfileShell>
    </UserProvider>
  );
}
