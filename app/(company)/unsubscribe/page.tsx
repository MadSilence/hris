import { hrisApiEmailService } from "@/api/modules/email/services";
import { UnsubscribeContainer } from "@/components/modules/email/components";
import type { UnsubscribeResult } from "@/models/email";

type Props = { searchParams: Promise<{ token?: string }> };

/**
 * Where an email's "Stop these emails" link lands (EMAIL_NOTIFICATIONS_DESIGN.md § 9.2). No session: the signed
 * token is the credential. The page reads what the token is about on the server; switching the emails off is
 * done by the page itself once it is open, so a mail scanner that only fetches the link changes nothing.
 */
export const dynamic = "force-dynamic";
export default async function UnsubscribePage({ searchParams }: Props) {
  const { token } = await searchParams;
  let about: UnsubscribeResult | null = null;
  if (token) {
    try {
      about = await hrisApiEmailService.describeUnsubscribe(token);
    } catch {
      about = null;
    }
  }
  return <UnsubscribeContainer token={about && token ? token : null} />;
}
