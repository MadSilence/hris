"use client";

import { useEffect, useState, type FC } from "react";
import { Copy01Icon, Refresh01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/desact/icon";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { ActionStatus } from "@/components/models/ActionStatus";
import { CalendarFeedKind } from "@/api/modules/calendarFeeds/dto";
import {
  issueCalendarFeedAction,
  rotateCalendarFeedAction,
} from "../../../actions/calendarFeedActions";
import { FormError } from "@/components/feedback/FormError";

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
  const t = useTranslations("timeOff");
  const tCommon = useTranslations("common");
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
          setError(result.errorMessage ?? t("publicHolidays.subscribe.createFailed"));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `t` is stable for the life of the page
  }, [isOpen, calendarId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setError(t("publicHolidays.subscribe.copyFailed"));
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
      setError(result.errorMessage ?? t("publicHolidays.subscribe.resetFailed"));
    } else {
      setUrl(toAbsolute(result.data.path));
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCloseAction()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("publicHolidays.subscribe.title", { name: calendarName })}</DialogTitle>
          <DialogDescription>
            {t("publicHolidays.subscribe.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="feed-url">{t("publicHolidays.subscribe.link")}</Label>
          <div className="flex items-center gap-2">
            <Input id="feed-url" readOnly value={isLoading ? tCommon("states.loading") : url} />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              aria-label={t("publicHolidays.subscribe.copyLink")}
              disabled={isLoading || !url}
              onClick={handleCopy}
            >
              {copied ? <Icon icon={Tick02Icon} size="sm" /> : <Icon icon={Copy01Icon} size="sm" />}
            </Button>
          </div>

          <p className="text-hint text-tertiary">
            {t("publicHolidays.subscribe.hint")}
          </p>

          {error && <FormError message={error} />}
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" disabled={isLoading} onClick={handleRotate}>
            <Icon icon={Refresh01Icon} size="sm" />
            {t("publicHolidays.subscribe.reset")}
          </Button>
          <Button type="button" onClick={onCloseAction}>
            {tCommon("actions.done")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
