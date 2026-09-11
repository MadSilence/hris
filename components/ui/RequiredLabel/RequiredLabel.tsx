"use client";

import * as React from "react";
import { Label } from "@/public/desact/src/components/ui/label";

/**
 * A field label, with a grey asterisk when the field is required.
 *
 * **Grey and not red.** The asterisk is a marker, not a warning, and it appears on most fields of
 * most forms — drawing it in red shouts at somebody who has done nothing wrong.
 *
 * **Optional is the absence of the asterisk, and nothing else.** No `(optional)` in the label, and
 * no grey "Optional" inside the field. Saying it twice, in two vocabularies, in two places, is how the product
 * ended up with four conventions across 47 files — including a legal-entity form where ten fields
 * were required and **nothing on screen said so** until submit.
 *
 * Rule: `technical_documentation/ui/FORMS_AND_FIELDS.md` §§ 1, 3.
 */
export const RequiredLabel: React.FC<{
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ htmlFor, required = false, children, className }) => (
  <Label htmlFor={htmlFor} className={className}>
    {children}
    {required && (
      <span className="text-muted-foreground" aria-hidden>
        {" "}
        *
      </span>
    )}
  </Label>
);
