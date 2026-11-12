"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Bookmark02Icon, BookmarkCheck02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/desact/tooltip";
import { showUndoToast } from "@/lib/feedback/undoToast";
import { showError } from "@/lib/errors/errorToast";
import { cn } from "@/lib/cn";
import type { SavedType } from "@/models/hub";
import { saveHubItemAction, unsaveHubItemAction } from "../actions";
import { unwrapHub, useInvalidateHub } from "../hooks";

/**
 * Save / unsave a post or a page: toggles at once, with an Undo toast — "Saved" / "Removed from saved" (Home's
 * rule 11). The mark is the reader's own; the hub's counts refresh after.
 */
export const SaveButton: React.FC<{ type: SavedType; id: string; saved: boolean; className?: string }> = ({ type, id, saved, className }) => {
  const t = useTranslations("hub");
  const invalidate = useInvalidateHub();
  const [on, setOn] = React.useState(saved);
  React.useEffect(() => setOn(saved), [saved]);

  const write = async (next: boolean) => {
    setOn(next);
    try {
      unwrapHub(await (next ? saveHubItemAction({ type, id }) : unsaveHubItemAction({ type, id })));
      void invalidate();
      return true;
    } catch (error) {
      setOn(!next);
      showError(error);
      return false;
    }
  };

  const toggle = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const next = !on;
    if (await write(next)) {
      showUndoToast({ message: next ? t("save.saved") : t("save.removed"), onUndo: () => write(!next) });
    }
  };

  const label = on ? t("save.savedLabel") : t("save.save");
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          aria-pressed={on}
          onClick={toggle}
          className={cn(on ? "text-accent-text" : "text-tertiary hover:text-secondary", className)}
        >
          <Icon icon={on ? BookmarkCheck02Icon : Bookmark02Icon} size="sm" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
};
