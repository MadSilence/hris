import * as React from "react";
import { Pencil } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";

type Props = {
  title: string;
  /** The pencil, or Cancel/Save while this group is being edited. Lives in the header bar. */
  actions?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * One block of the profile, shaped like a group on the attribute settings page.
 *
 * The two screens list the same thing — fields, grouped — and used to look nothing alike: settings
 * had a tinted header bar per group, the profile a bare `<h2>` over a hairline. Same component
 * language here, so a group reads as a group in both places.
 */
export const ProfileSectionCard: React.FC<Props> = ({ title, actions, children }) => (
  <div>
    <div className="flex min-h-[44px] items-center justify-between gap-3 rounded-md bg-brown-50 px-4 py-2.5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-brown-700">{title}</h2>

      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>

    <div className="px-4">{children}</div>
  </div>
);

/**
 * Starts editing this group. The same pencil the attribute settings page uses to rename a group —
 * one affordance for "change what is in this block", wherever the block is shown.
 */
export const SectionEditButton: React.FC<{ onClick: () => void; label: string }> = ({
  onClick,
  label,
}) => (
  <Button
    variant="ghost"
    size="icon"
    className="h-7 w-7 text-brown-600 hover:bg-brown-100"
    onClick={onClick}
    aria-label={label}
    title={label}
  >
    <Pencil className="h-4 w-4"/>
  </Button>
);
