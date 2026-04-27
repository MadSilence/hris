"use client";

import styles from "./contact.module.css";
import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";

export default function ContactPage() {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    console.log(e);
  }

  return (
    <div className={styles.wrap}>
      <h1>Contact</h1>
      <p className={styles.lead}>
        Tell us about your team—we’ll get back within 1 business day.
      </p>

      <Card className={styles.card}>
        {sent ? (
          <p className={styles.success}>Thanks! We’ll reach out shortly.</p>
        ) : (
          <form onSubmit={submit} className={styles.form} noValidate>
            <label>
              Name*
              <Input name="name" placeholder="Jane Doe" required disabled={busy}/>
            </label>

            <label>
              Work email*
              <Input
                name="email"
                type="email"
                placeholder="jane@company.com"
                required
                disabled={busy}
              />
            </label>

            <label>
              Company
              <Input name="company" placeholder="Company Inc." disabled={busy}/>
            </label>

            <label>
              Message
              <Input name="message" placeholder="How can we help?" disabled={busy}/>
            </label>

            <Button type="submit" disabled={busy}>
              {busy ? "Sending…" : "Send message"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
