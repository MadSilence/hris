import { ReactNode } from "react";
import { UserProvider } from "@/components/providers/UserProvider";
import { ProfileShell } from "@/components/modules/organization/modules/profile/components/ProfileShell/ProfileShell";
import { getUserServer } from "@/server/users/users";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { ForbiddenError } from "@/components/clients/exceptions";

export default async function UserTabsLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Caught here rather than in an error boundary: this throws during the server render, and Next
  // strips the error's class on the way to the client, so `instanceof` would not survive the trip.
  let user;
  try {
    user = await getUserServer(id);
  } catch (e) {
    if (e instanceof ForbiddenError) return <AccessDenied/>;
    throw e;
  }

  return (
    <UserProvider userId={id} initialUser={user}>
      <ProfileShell userId={id} user={user}>
        {children}
      </ProfileShell>
    </UserProvider>
  );
}
