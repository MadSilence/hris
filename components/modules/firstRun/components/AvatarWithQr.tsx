"use client";

import * as React from "react";
import QRCode from "qrcode";
import { Loader2, QrCode, Upload } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/public/desact/src/components/ui/avatar";
import { Button } from "@/public/desact/src/components/ui/button";
import { ActionStatus } from "@/components/models/ActionStatus";
import { showActionError } from "@/lib/errors/errorToast";
import { issueAvatarUploadTokenAction } from "@/components/modules/firstRun/actions";
import { uploadUserAvatarAction } from "@/components/modules/organization/modules/profile/actions/uploadUserAvatarAction";

const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "—";

/**
 * A person's photo, from this computer or from the phone in their pocket.
 *
 * <p><b>The boring path never disappears.</b> The QR is the pleasant way to do it and the file
 * picker is the way that always works — no camera, no phone, a locked-down device, a video call
 * where nobody wants to hold a phone up. Replacing one with the other would make a nicety into a
 * requirement.
 *
 * <p>While the code is on screen the profile is polled, so the photo lands by itself: the phone has
 * no way to tell this tab it is finished, and asking the person to press something after they
 * already pressed something on their phone is a step that exists only because of how we built it.
 */
export const AvatarWithQr: React.FC<{
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  /** Called when a photo arrives, from either path, so the page can refresh what it shows. */
  onUploadedAction: () => void;
}> = ({ userId, fullName, avatarUrl, onUploadedAction }) => {
  const fileInput = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [qr, setQr] = React.useState<{ dataUrl: string; expiresAt: number } | null>(null);
  const [issuing, setIssuing] = React.useState(false);

  // Retires the code itself rather than leaving a dead one on screen to be scanned.
  React.useEffect(() => {
    if (!qr) return;
    const remaining = qr.expiresAt - Date.now();
    if (remaining <= 0) {
      setQr(null);
      return;
    }
    const timer = setTimeout(() => setQr(null), remaining);
    return () => clearTimeout(timer);
  }, [qr]);

  // The phone cannot tell this tab anything, so the tab asks. Only while the code is up.
  React.useEffect(() => {
    if (!qr) return;
    const poll = setInterval(() => onUploadedAction(), 3000);
    return () => clearInterval(poll);
  }, [qr, onUploadedAction]);

  /*
    The photo arriving is what closes the code, and it is the only signal there is.

    A one-time token is spent by the upload, so a code left on screen afterwards is a picture of
    something that no longer works — and the person, who is holding their phone and has just seen
    "That's your photo", would be looking at it wondering whether to scan again. The new avatar
    address is how this tab learns the phone finished: the poll refetches, the parent hands down a
    different `avatarUrl`, and the code retires itself.
  */
  const avatarWhenShown = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!qr) return;
    if (avatarWhenShown.current === null) {
      avatarWhenShown.current = avatarUrl ?? "";
      return;
    }
    if ((avatarUrl ?? "") !== avatarWhenShown.current) setQr(null);
  }, [qr, avatarUrl]);

  React.useEffect(() => {
    if (!qr) avatarWhenShown.current = null;
  }, [qr]);

  const showQr = async () => {
    setIssuing(true);
    const res = await issueAvatarUploadTokenAction();
    setIssuing(false);

    if (res.status !== ActionStatus.SUCCESS || !res.data) {
      showActionError(res);
      return;
    }

    // The company's own host, which is the only address this token is any use on.
    const url = `${window.location.origin}/m/avatar?token=${encodeURIComponent(res.data.token)}`;
    const dataUrl = await QRCode.toDataURL(url, { width: 220, margin: 1 });
    setQr({ dataUrl, expiresAt: Date.now() + res.data.expiresInSeconds * 1000 });
  };

  const pick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    const res = await uploadUserAvatarAction({ userId, file });
    setUploading(false);

    if (res.status !== ActionStatus.SUCCESS) {
      showActionError(res);
      return;
    }
    setQr(null);
    onUploadedAction();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="size-28">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={fullName} /> : null}
        <AvatarFallback className="text-2xl">{initialsOf(fullName)}</AvatarFallback>
      </Avatar>

      {qr ? (
        <div className="flex flex-col items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- a data: URL drawn in this browser */}
          <img src={qr.dataUrl} alt="Scan to upload a photo from your phone" className="rounded-md border border-brown-200" />
          <p className="max-w-[14rem] text-center text-xs text-muted-foreground">
            Scan it with your phone&apos;s camera. The code works once, for the next few minutes.
          </p>
          <Button key="hide-qr" type="button" variant="ghost" size="sm" onClick={() => setQr(null)}>
            Hide Code
          </Button>
        </div>
      ) : (
        <Button key="show-qr" type="button" variant="outline" size="sm" className="gap-1.5" onClick={showQr} disabled={issuing}>
          {issuing ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
          Use My Phone
        </Button>
      )}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="gap-1.5"
        onClick={() => fileInput.current?.click()}
        disabled={uploading}
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        Upload From This Computer
      </Button>

      <input
        ref={fileInput}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={pick}
      />
    </div>
  );
};
