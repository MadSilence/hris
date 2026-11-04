"use client";

import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { RadioGroup, RadioGroupItem } from "@/components/desact/radio-group";
import { Label } from "@/components/desact/label";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { DatePicker, dateToISO } from "@/components/ui/DatePicker";
import { FormError } from "@/components/feedback/FormError";
import { ActionStatus } from "@/components/models/ActionStatus";
import { inviteUserAction } from "@/components/modules/organization/modules/profile/actions/userLifecycleActions/userLifecycleActions";
import type { InviteStateDTO } from "@/api/modules/users/clients/hrisApiUsersClient";
import { FieldError } from "@/components/desact/field-error";
import { InlineAlert } from "@/components/desact/alert";

type Props = {
  open: boolean;
  userId: string;
  fullName: string;
  /** The address on record; the field is required only when there is none. */
  email?: string | null;
  /** Somebody already invited gets a new link, and the old one stops working. */
  isResend?: boolean;
  onCloseAction: () => void;
  /** Handed the invitation as it now stands, so the caller can show it without waiting for a refetch. */
  onInvitedAction: (state: InviteStateDTO | null) => void | Promise<void>;
};

type Values = { email: string; when: "now" | "later"; sendOn: string; preboarding: "" | "KEEP" | "END" };

/** Answered only when the backend says the person has an unfinished preboarding (LC00034). */
const PREBOARDING_DECISION_REQUIRED = "LC00034";

const tomorrowISO = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return dateToISO(d);
};

/**
 * Invite a person — now, or on a chosen day.
 *
 * **A missing email is not a refusal.** The field is here, and required only when the profile has no
 * address; the backend's `INVITE_EMAIL_REQUIRED` lands on it if the record changed underneath
 * (LIFECYCLE_PROCESSES.md § 2.3).
 */
export function InviteUserModal({
  open, userId, fullName, email, isResend = false, onCloseAction, onInvitedAction,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [askPreboarding, setAskPreboarding] = useState(false);
  const hasEmail = Boolean(email);

  const formik = useFormik<Values>({
    initialValues: { email: email ?? "", when: "now", sendOn: "", preboarding: "" },
    validationSchema: Yup.object({
      email: hasEmail
        ? Yup.string().trim().email("Enter a valid email address.")
        : Yup.string().trim().required("Enter an email address to send the invitation to.")
            .email("Enter a valid email address."),
      when: Yup.string().oneOf(["now", "later"]),
      sendOn: Yup.string().when("when", {
        is: "later",
        then: (s) => s.required("Pick the day to send it."),
      }),
    }),
    onSubmit: async (values, helpers) => {
      setError(null);
      const typed = values.email.trim();
      const res = await inviteUserAction({
        userId,
        email: typed && typed.toLowerCase() !== (email ?? "").toLowerCase() ? typed : null,
        sendOn: values.when === "later" && !isResend ? values.sendOn : null,
        preboarding: values.preboarding || null,
      });
      if (res.status !== ActionStatus.SUCCESS) {
        if (res.code === PREBOARDING_DECISION_REQUIRED && !values.preboarding) {
          // Inviting somebody mid-preboarding is a choice (design § 5.3): ask, then send again.
          setAskPreboarding(true);
          return;
        }
        if (res.fieldErrors?.email) helpers.setFieldError("email", res.fieldErrors.email);
        else setError(res.errorMessage ?? null);
        return;
      }
      await onInvitedAction(res.data ?? null);
      onCloseAction();
    },
  });

  useEffect(() => {
    if (open) {
      formik.resetForm({ values: { email: email ?? "", when: "now", sendOn: "", preboarding: "" } });
      setError(null);
      setAskPreboarding(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const busy = formik.isSubmitting;
  const later = formik.values.when === "later" && !isResend;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !busy) onCloseAction(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isResend ? "Resend invitation" : "Invite"}</DialogTitle>
          <DialogDescription>
            {isResend
              ? `${fullName} gets a new link to set a password. The previous one stops working.`
              : `${fullName} gets a link to set a password and sign in. Nothing is granted until they accept.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <RequiredLabel htmlFor="invite-email" required={!hasEmail}>Email</RequiredLabel>
            <Input
              id="invite-email"
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={busy}
              aria-invalid={Boolean(formik.errors.email)}
            />
            {formik.touched.email && formik.errors.email && (
              <FieldError>{formik.errors.email}</FieldError>
            )}
          </div>

          {!isResend && (
            <div className="space-y-2">
              <Label>Send</Label>
              <RadioGroup
                value={formik.values.when}
                onValueChange={(v) => formik.setFieldValue("when", v)}
                className="space-y-1"
              >
                <label className="flex items-center gap-2 text-body" htmlFor="invite-now">
                  <RadioGroupItem value="now" id="invite-now" />
                  Now
                </label>
                <label className="flex items-center gap-2 text-body" htmlFor="invite-later">
                  <RadioGroupItem value="later" id="invite-later" />
                  On a date
                </label>
              </RadioGroup>
              {later && (
                <div className="space-y-1.5 pl-6">
                  <DatePicker
                    value={formik.values.sendOn}
                    onChange={(v) => formik.setFieldValue("sendOn", v)}
                    min={tomorrowISO()}
                    disabled={busy}
                    ariaLabel="Send on"
                    invalid={Boolean(formik.touched.sendOn && formik.errors.sendOn)}
                  />
                  {formik.touched.sendOn && formik.errors.sendOn && (
                    <FieldError>{formik.errors.sendOn}</FieldError>
                  )}
                  <p className="text-hint text-tertiary">
                    It goes out on that day, in your company&apos;s timezone.
                  </p>
                </div>
              )}
            </div>
          )}

          {askPreboarding && (
            <InlineAlert tone="pending" title={`${fullName} has an unfinished preboarding.`}>
              <RadioGroup
                value={formik.values.preboarding}
                onValueChange={(v) => formik.setFieldValue("preboarding", v)}
                className="space-y-1"
              >
                <label className="flex items-center gap-2 text-body" htmlFor="invite-keep-preboarding">
                  <RadioGroupItem value="KEEP" id="invite-keep-preboarding" />
                  Keep it — the remaining tasks follow them into the app
                </label>
                <label className="flex items-center gap-2 text-body" htmlFor="invite-end-preboarding">
                  <RadioGroupItem value="END" id="invite-end-preboarding" />
                  End it early — the remaining tasks are cancelled
                </label>
              </RadioGroup>
            </InlineAlert>
          )}

          <FormError message={error} />
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onCloseAction} disabled={busy}>
            Cancel
          </Button>
          <Button type="button"
            onClick={async () => {
              await formik.setTouched({ email: true, sendOn: true });
              formik.handleSubmit();
            }}
            disabled={busy}
          >
            {busy ? "Sending…" : later ? "Schedule" : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
