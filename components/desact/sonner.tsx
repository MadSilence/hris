"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  Alert02Icon,
  Cancel01Icon,
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";

import { Icon } from "./icon";
import { NodRing } from "./nod";

/*
 * Toasts (SPEC § 13.7): a white card with a hairline, the level-2 shadow, radius 10; a round status icon
 * (Pine for success, red for an error); at most one text action (Undo, Retry); bottom left, five seconds.
 * Past tense and at most six words: "Time off approved". Never black.
 */
const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    theme="light"
    position="bottom-left"
    duration={5000}
    closeButton
    icons={{
      success: <Icon icon={CheckmarkCircle02Icon} className="text-status-approved-icon" />,
      error: <Icon icon={CancelCircleIcon} className="text-status-declined-icon" />,
      warning: <Icon icon={Alert02Icon} className="text-status-pending-icon" />,
      info: <Icon icon={InformationCircleIcon} className="text-status-info-icon" />,
      loading: <NodRing size="sm" label="" />,
      close: <Icon icon={Cancel01Icon} size="sm" />,
    }}
    toastOptions={{
      unstyled: true,
      classNames: {
        toast:
          "group flex w-[356px] items-start gap-3 rounded-popover border border-divider bg-overlay px-4 py-3 text-body text-primary shadow-popover",
        title: "font-medium",
        description: "mt-1 text-hint text-tertiary select-all",
        icon: "mt-px",
        actionButton:
          "ml-auto shrink-0 rounded-control px-2 py-1 text-body font-medium text-accent-text hover:bg-accent-subtle",
        cancelButton: "shrink-0 rounded-control px-2 py-1 text-body text-secondary hover:bg-mist",
        closeButton:
          "!static order-last ml-auto inline-flex size-6 shrink-0 items-center justify-center rounded-control !border-0 !bg-transparent text-tertiary hover:!bg-mist hover:text-primary",
      },
    }}
    {...props}
  />
);

export { Toaster };
