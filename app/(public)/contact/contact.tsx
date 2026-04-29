"use client";

import { FormEvent, useState } from "react";
import { Card, CardContent } from "@/public/desact/src/components/ui/card";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";

export default function ContactPage() {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setBusy(true);

    try {
      setSent(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10">
      <section className="space-y-4">
        <h1 className="text-5xl font-medium">Contact</h1>
        <p className="text-lg text-[var(--color-text-tertiary)]">
          Tell us about your team—we’ll get back within 1 business day.
        </p>
      </section>

      <Card>
        <CardContent>
          {sent ? (
            <p className="text-md">Thanks! We’ll reach out shortly.</p>
          ) : (
            <form onSubmit={submit} className="space-y-6" noValidate>
              <div className="space-y-2">
                <Label htmlFor="contact-name">Name*</Label>
                <Input
                  id="contact-name"
                  name="name"
                  placeholder="Jane Doe"
                  required
                  disabled={busy}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-email">Work email*</Label>
                <Input
                  id="contact-email"
                  name="email"
                  type="email"
                  placeholder="jane@company.com"
                  required
                  disabled={busy}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-company">Company</Label>
                <Input
                  id="contact-company"
                  name="company"
                  placeholder="Company Inc."
                  disabled={busy}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-message">Message</Label>
                <Input
                  id="contact-message"
                  name="message"
                  placeholder="How can we help?"
                  disabled={busy}
                />
              </div>

              <Button type="submit" disabled={busy} className="w-full">
                {busy ? "Sending…" : "Send message"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
