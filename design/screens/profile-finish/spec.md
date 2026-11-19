---
status: built
screen: profile-finish
owner: Ulia
updated: 2026-11-18
---

# Finish your profile (P2)

## What it is for
A person who left some of their own fields blank — on the welcome or ever since — fills them in later, on their own
terms. The welcome (`first-run-welcome`, W0–W4) runs once, at the first login, and is never reachable again; this page
is where the profile menu's *Finish your profile* goes instead. Approved by Ulia on 18 Nov; built from the board's W3.

## Where it lives
`<company>.<root>/profile/finish`, from the profile menu → *Finish your profile*. The menu item shows **only while the
person has at least one blank field they may edit** (P3); it stays where it is in the menu. The welcome's look, outside
the app frame: white page, the company logo tile 44 + its name on top, the back arrow top-left (back where the person
came from), one centred column 400, the two ring rows at the bottom exactly as on the welcome (W2). **No stepper.**
Reference: `handoffs/2026-11-18-fixes-misc/references/FP-finish-profile@1710/1470/1440`.

## Layout
- Title **"Finish your profile"**, line **"Fill in what’s missing. All of it can wait."** (W3's title and lead).
- Every blank field of the person's own profile that their role lets them edit — the same field components and order as
  W3 (and as My profile), each with its label and hint. A long list scrolls the page; the rings follow W2.
- **Save** (primary, full column width) saves what was filled and goes back. **Not now** (text button in `accent-text`,
  centred under Save) goes back without saving.

## States
| State | What the reader sees |
|---|---|
| Loading | The nodding ring in the middle of the page. |
| Normal | The blank fields. |
| Error | Field validation as W3 ("Enter a real date."). A failed save: toast "Couldn’t save. Try again." + Retry; the fields keep what was typed. |
| No permission | Nobody but the person: an impersonating actor is sent to Home. With nothing to finish the menu item is not shown. |

## Words
Finish your profile · Fill in what’s missing. All of it can wait. · Save · Not now · Couldn’t save. Try again. · Retry.

## Built
*Filled by the code side.*

- **Where to see it:** `/profile/finish` — `app/(first-run)/profile/finish/page.tsx`,
  `components/modules/firstRun/components/FinishProfileContainer.tsx`; the frame is the welcome's `WelcomeFrame`. Built
  2026-11-18, **not yet looked at in a browser**.
- **Which fields:** the welcome's rule (`WelcomeService`): the person's own custom attributes they may edit **about
  themselves** — a field an HR or System Owner grant lets them edit company-wide is not asked here, as it is not on the
  welcome. The list is taken when the page opens, so a field filled while it is open stays on it.
- **The menu item** follows the backend's `outstanding` on `GET /me/welcome`, which now means "a field of their own is
  blank" — a missing photo no longer counts (the page asks for fields only).
- **Save with nothing typed** goes back without a request.
