import { MobileAvatarUpload } from "@/components/modules/firstRun/components/MobileAvatarUpload";
import { hrisFirstRunService } from "@/api/modules/firstRun/services";

export const metadata = { title: "Add your photo" };

type Props = { searchParams: Promise<{ token?: string }> };

/**
 * Where the QR code lands: a phone with no session, holding a one-time token.
 *
 * <p>Resolved on the server so a code that has expired or already been used says so, rather than
 * rendering a camera button that will fail after the photo is taken.
 */
export default async function MobileAvatarPage({ searchParams }: Props) {
  const { token } = await searchParams;

  let firstName: string | null = null;
  let usable = false;
  if (token) {
    try {
      firstName = (await hrisFirstRunService.resolveAvatarUploadToken(token)).firstName;
      usable = true;
    } catch {
      // Expired, already used, or never existed — one answer, because the holder cannot act
      // differently on the difference and telling them apart says whose link it was.
      usable = false;
    }
  }

  if (!usable || !token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-xl font-semibold text-foreground">This code has expired</h1>
        <p className="max-w-xs text-muted-foreground">
          Codes last a few minutes and work once. Show a new one on your computer and scan it again.
        </p>
      </div>
    );
  }

  return <MobileAvatarUpload token={token} firstName={firstName} />;
}
