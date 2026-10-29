import { Suspense } from "react";
import { NotificationsInbox } from "@/components/modules/notifications/components/NotificationsInbox";

/** Suspense because the inbox reads its filter from the URL (`?filter=needs-action`). */
export default function InboxPage() {
  return (
    <Suspense fallback={null}>
      <NotificationsInbox />
    </Suspense>
  );
}
