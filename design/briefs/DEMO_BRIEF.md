# Brief: the demo company, the trial and *Go live*

**From the owner's side, 2026-11-14. Input for drawing, not a spec.** The screens below were **built first** to the
rules in `rules/` (the owner's go-ahead on `(claude)/development_plan/DEMO_PLAN.md` batch 4) and wait for your review;
draw them into `screens/<name>/spec.md` by `../HANDOFF.md` and we rebuild to your drawing.

How to read it — as `SCREENS_BRIEF.md`: **What exists**, **Decided** (draw to it), **States to draw**, and
**> Note for the designer** (a call left to you).

## What exists

- **One concept, the demo** (= the trial). Somebody registers, gets a company for 14 days free — with sample data
  (an example company of 8, 25, 60 or 150 people) or empty. A **real account** is paid for. A demo becomes real by
  **going live**: the owner chooses which of the example's set-up to keep, asks, the company is activated (paid —
  today by us, by hand), then the sample people and everything done in the demo are deleted. One way only.
- **The banner** — one line at the top of every page, under the impersonation and the owner-email banners:
  - a demo: "This is a demo company with sample people. 9 days left in the trial." · **Go live**
  - an empty trial: "9 days left in your trial." · **Go live**
  - the trial ended: "Your trial has ended. Everything is here and can be exported, but nothing can be changed until
    the company goes live." · **Go live**
  - asked / running / failed: one sentence each · **Open**
  - for somebody who may not go live: the same sentence, no button ("Ask your account owner to go live." was dropped — the designers' fixes, 18 Nov).
- **The *Sample* mark** — a chip beside a sample person's name in the People table and on the profile; on the
  profile, a line under the header: "This is a sample person. Sample people are deleted when the company goes live —
  add your real people after that." The People toolbar gets a **Hide samples** chip in a demo.
- **Settings → Subscription → *Go live*** (`/settings/admin/subscription`):
  - the state chip (Trial — N days left · Trial ended — read-only · Active);
  - **Deleted whatever you choose** — the counts: sample people, requests, processes, documents, attendance,
    automation runs, review cycles, the whole activity log;
  - **What to keep** — the example's offices, legal entities, departments and teams, job families, level groups,
    levels, positions, holiday calendars, roles, leave policies, by kind; each with a Keep / Delete control and why
    it is suggested ("You changed it", "Used by your people", "From the example"), and Keep all / Delete all per kind;
  - **Request activation** → one confirmation naming what cannot be undone;
  - then a status line: waiting for activation → removing the sample data → live; a failure offers *Try again*.
- **Limits in a demo**: no invitations (the Invite button is gone from the profile), no people import (the import
  page says why), single sign-on can be tested but not required, SCIM off; mail goes only to the owner.

## Decided

- The banner is on every page (B1), neutral like the other page banners (SPEC § 13.7).
- Going live is one way; nothing offers a way back to sample data (B2).
- Pay first: nothing is deleted until the company is activated (P3).

## States to draw

The banner's seven sentences above; *Go live* for a demo, for an empty trial (no list — "Your company has no sample
data", activation only), waiting, running, failed, live; the profile line; the import page's refusal.

> Note for the designer: the Keep/Delete list can be long (a 150-person example has ~50 departments and teams). We
> group by kind with per-kind Keep all / Delete all; a collapsed group per kind, or a search, is yours to choose.

> Note for the designer: the read-only state is a whole-app condition — every write answers "Your company is
> read-only…" in a card. Whether buttons should look disabled everywhere instead is a larger call; we left them as
> they are.
