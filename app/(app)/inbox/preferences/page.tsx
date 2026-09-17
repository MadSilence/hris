import { redirect } from "next/navigation";

/**
 * Notification categories moved into `/preferences`, beside the display settings.
 *
 * <p>Kept as a redirect rather than deleted: the inbox's own link is not the only way anybody
 * reached it, and two half-pages of "your own settings" at two different addresses was the problem.
 */
export default function NotificationPreferencesPage() {
  redirect("/preferences");
}
