"use client";

import { toast } from "sonner";
import { toastText } from "@/lib/errors/errorToast";

/**
 * Why a button could not do its job yet, said when it is pressed (NEVER-DISABLED, AQ-01 —
 * `technical_documentation/ui/README.md` rule 2). Nothing in the product is shown disabled: a button whose action
 * cannot work yet stays pressable and explains itself — under the field it waits on when there is one, and here when
 * there is not ("Select at least one person", "Choose what starts it").
 *
 * It is not an error: nothing failed and nothing was sent, so the toast is the neutral one, and it has no full stop at
 * its end (`ui/NAMING.md` § 1).
 */
export const explain = (message: string) => toast(toastText(message));
