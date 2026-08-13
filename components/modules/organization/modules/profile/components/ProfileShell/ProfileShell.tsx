import { ReactNode } from "react";
import { User } from "@/models/user/User";
import { UserDataHeader } from "@/components/modules/organization/modules/profile/components/UserDataHeader";
import { ProfileTabsNav } from "@/components/modules/organization/modules/profile/components/ProfileTabsNav/ProfileTabsNav";

type Props = {
  userId: string;
  user: User;
  children: ReactNode;
};

export function ProfileShell({ userId, user, children }: Props) {
  return (
    <div className="flex h-[calc(100svh-6rem)] min-h-0 w-full min-w-0 flex-col">
      <div className="flex-none">
        <header>
          <UserDataHeader userId={userId} user={user}/>
        </header>

        <nav className="pb-8">
          <ProfileTabsNav userId={userId}/>
        </nav>
      </div>

      <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
