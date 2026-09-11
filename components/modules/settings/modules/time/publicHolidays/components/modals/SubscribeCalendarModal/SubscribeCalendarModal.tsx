"use client";

import { useEffect, useState, type FC } from "react";
import { Check, Copy, RefreshCw } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { ActionStatus } from "@/components/models/ActionStatus";
import { CalendarFeedKind } from "@/api/modules/calendarFeeds/dto";
import {
  issueCalendarFeedAction,
  rotateCalendarFeedAction,
} from "../../../actions/calendarFeedActions";

type Props = {
  isOpen: boolean;
  onCloseAction: () => void;
  calendarId: string;
  calendarName: string;
};

/**
 * Hands over a subscription URL for one holiday calendar.
 *
 * A subscription, not an export: the calendar client re-reads the address on its own schedule, so a
 * day added here shows up in someone's Outlook without them doing anything. The URL carries a secret
 * token because calendar clients cannot authenticate — hence the reset button, which is the only way
 * to take a leaked link out of circulation.
 */
export const SubscribeCalendarModal: FC<Props> = ({
  isOpen,
  onCloseAction,
  calendarId,
  calendarName,
}) => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const toAbsolute = (path: string) =>
    typeof window === "undefined" ? path : `${window.location.origin}/api${path}`;

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setIsLoading(true);
    setError("");
    setCopied(false);

    issueCalendarFeedAction({ kind: CalendarFeedKind.Calendar, calendarId })
      .then((result) => {
        if (cancelled) return;
        if (result.status === ActionStatus.ERROR || !result.data) {
          setError(result.errorMessage ?? "Could not create the subscription link.");
          return;
        }
        setUrl(toAbsolute(result.data.path));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, calendarId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setError("Could not copy. Select the link and copy it by hand.");
    }
  };

  const handleRotate = async () => {
    setIsLoading(true);
    setError("");
    setCopied(false);

    const result = await rotateCalendarFeedAction({
      kind: CalendarFeedKind.Calendar,
      calendarId,
    });

    if (result.status === ActionStatus.ERROR || !result.data) {
      setError(result.errorMessage ?? "Could not reset the link.");
    } else {
      setUrl(toAbsolute(result.data.path));
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCloseAction()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Subscribe to &ldquo;{calendarName}&rdquo;</DialogTitle>
          <DialogDescription>
            Add this link in Outlook, Google Calendar or Apple Calendar and the holidays appear
            alongside your meetings. Changes made here follow automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="feed-url">Subscription Link</Label>
          <div className="flex items-center gap-2">
            <Input id="feed-url" readOnly value={isLoading ? "Loading…" : url} />
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Copy link"
              disabled={isLoading || !url}
              onClick={handleCopy}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Anyone with this link can read the calendar. Reset it if it ends up somewhere it should
            not be — existing subscriptions stop working immediately.
          </p>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" disabled={isLoading} onClick={handleRotate}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset link
          </Button>
          <Button type="button" onClick={onCloseAction}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
