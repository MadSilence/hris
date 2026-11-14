---
status: ready
screen: sign-in-emails
owner: Ulia
updated: 2026-11-13
---

# Login emails (M1–M18)

## What it is for
Every email the login flow sends: codes, invitations, links to act on, and security notices. Each email is one responsive block the code builds as table-based email HTML; the board shows it opened in a neutral mail app on a computer (1440) and a phone (375) — the mail app around it is a stand-in, not part of the build.

## Where it lives
Sent by the backend (Java `AccentColors` paints the accent). Company emails come in the company's accent with its logo and name (noddo's Wine when the company has no colour — not drawn, the owner: a corner case; the nine presets are listed in `sign-in-appearance`); M1 and M6 are noddo's own (Wine, noddo wordmark), sent from the root. Every email in both languages; company content (name, address) is never translated. Onboarding / preboarding emails (M3 and everything before a first day) are **not** in this round.

## Layout (the block)
`.mailx` → `.mx` max 600, fluid below; on mist (`surface-canvas`) with 32/16 padding; a white card radius 20, `overflow:hidden`, hairline shadow.
- **Moments** (M1, M2, M4, M6, M7, M12, M16, M18): a band in the accent — logo (noddo's white wordmark with the Rose "o", or the company's white logo tile 36 + name 18/24 white) top-left; a big two-tone heading Inter Tight 600 44/46 (white + the accent's light tint: Rose on Wine, `color-mix(accent 35%, white)` on a company accent); no full stop; one row of 6 rings (r 20, stroke 6, two light ones, one dropped 9 px = the nod) cut in half by the band's bottom edge. Rings are a static image (PNG per accent) — emails don't animate.
- **Notices** (M5, M7b, M8, M9, M10, M13, M14, M15, M17): a slim band (logo + 3 small rings, a 4th cut in half by the card's right edge), then on white: a 48 icon circle (grey neutral / accent-subtle good news / pending warnings), heading 28/34, text, and the details as a Mist "facts" table (label left tertiary, value right 600).
- Body: 16/26 secondary, bold 600 primary. One accent button 48 high, radius control, 16 600 + arrow (moments only). Small print under a hairline 14/22 tertiary.
- **Footer (changed 2026-11-13, the owner's variant C):** a company email is signed by noddo — the noddo wordmark (Ink with the Wine nod, 26 high), then "Sent by noddo on behalf of Acme" (14/20 secondary), then "Acme · 12 Main Street, Warsaw · You get this because you have an account at Acme." (13/18 tertiary). Admin emails M13–M15 drop the generic reason — their own small print says why. noddo's own emails (M1, M6, M18) keep only "noddo · Six Software, Vilnius": their band already carries the wordmark.
- **Narrow (< 480, container query):** the card goes edge to edge, paddings 20, heading 24/30 on one line, the ring row r 20 scaled, buttons and the code box full width, the slim band's rings smaller.
- **The code (M1, M16):** one selectable text string in an accent-subtle box (radius 14, 1 px accent 18 %), JetBrains Mono 600 36/44 (30 narrow), letter-spacing .16em, shown as 3 + 3 by a visual gap only — the text is "482913" with no space, so copying and mail apps' code detection get one string; the code is also in the subject. No "Copy" button (mail apps run no scripts).
- **Light background (the company's choice in Appearance):** the band — the big one and the slim one — is **Gray 50** with **Gray 200** rings, the heading is Ink with its second line in the company colour, the canvas around the card turns **white** and the card gets a **1 px Gray 200 border** (many inboxes are grey, and mail apps drop shadows). The nodding rings take the company colour, or the logo's colours when the logo has several. Buttons keep the company colour. Frames: `sign-in-appearance` LT3, LT4 and L7-Light-Mail.
- **A light company colour** (Sunflower, or a light "Your own"): anything written on a fill is Graphite #2A2A2E, links and text on white take the same hue darkened to 4.5 : 1 — by contrast, as `accent.ts` decides.
- **Sender (Q-21):** noddo's own from "noddo <no-reply@noddo.so>"; company emails from "Acme <no-reply@acme.noddo.so>" with the company logo as the avatar (noddo's avatar = the mark: Wine circle, Rose ring 8 % below centre — SPEC § 3).

## The emails
| # | When | Subject | Kind | Heading | Text, extras | Button | Small print |
|---|---|---|---|---|---|---|---|
| M1 | Trial, B1 → B2 | {code} is your noddo code | moment, noddo | Here’s your / code | Enter it on the page where you started your free trial. + code | — | The code works for 10 minutes. If you didn’t ask for it, ignore this email. |
| M2 | Invitation (one for every company, also SSO-required) | Join Acme on noddo | moment | You’re invited / to join Acme | You’ll join as {email}. Acme uses noddo for time off, approvals and everything around them. | Join Acme | The invitation works once. If you weren’t expecting it, ignore this email. |
| M4 | Forgot password (F1) | Set a new password for Acme | moment | Set a new / password | Someone asked to reset the password for {email} at Acme. + pending note when a provider is connected: "Setting a password this way disconnects Google from your account." | Set a new password | The link works for 1 hour. If it wasn’t you, ignore this email — your password stays the same. |
| M5 | Account locked | Your Acme account is locked | notice (pending, lock) | Your account is locked | There were too many failed attempts to log in to Acme as {email}, so we locked the account for now. / To unlock it, set a new password. | Set a new password | If it wasn’t you, reset your password and tell your administrator. |
| M6 | Find your company (A3) | Your companies on noddo | moment, noddo | Your companies / on noddo | Here’s where you can log in with {email}. + one row per company: logo tile, name, address, "Log in" (link) | — | If you didn’t ask for this, ignore this email. |
| M7 | Email change, to the new address | Confirm your new email for Acme | moment | Confirm your / new email | Your Acme account will use {new email} once you confirm it. | Confirm email | The link works for 24 hours. If you didn’t ask for this, ignore this email. |
| M7b | Email change, to the old address | Your Acme email was changed | notice (mail) | Your email was changed | Your Acme account now uses another address. Facts: Before · Now | — | If it wasn’t you, reset your password and tell your administrator. |
| M8 | Security notices | Two-step login is on | notice (good, lock) | Two-step login is on | From now on, Acme asks for a code from your authenticator app when you log in. One template, one sentence per case: turned on / turned off / reset by your administrator / someone entered wrong two-step codes several times / a backup code was used — {n} left. | — | If it wasn’t you, reset your password and tell your administrator. |
| M9 | Provider connected | Google is connected to your Acme account | notice (good) | Google is connected | You can now log in to Acme with Google. Facts: Google account | — | same as M8 |
| M10 | Provider disconnected (M11 = the same + "because you set a new password") | Google was disconnected from your Acme account | notice (unlink) | Google was disconnected | You can no longer log in to Acme with Google. Use your password or a login code instead. Facts: Google account | — | same as M8 |
| M12 | The company stopped its SSO / turned the buttons off | Set a password to keep logging in to Acme | moment | Set a password / to keep logging in | Acme no longer logs in through Okta. Set a password for {email} to keep logging in. | Set a password | The link works for 7 days. After that, use “Forgot password?” on the login page. |
| M13 | To admins: SSO certificate expires (30, 7 days) | Acme’s Okta certificate expires in 7 days | notice (pending, clock) | Your Okta certificate expires in 7 days | Logins to Acme through Okta will stop unless you upload a new certificate. Facts: Expires · Provider | Open login settings | You get this because you manage Acme’s login settings. |
| M14 | To admins: SSO logins failing | Logins to Acme through Okta are failing | notice (pending, alert) | Logins through Okta are failing | In the last hour, {n} people couldn’t log in to Acme through Okta. Facts: Okta says · Since | Open login settings | System Owners can still log in with a password. You get this because you manage Acme’s login settings. |
| M15 | To System Owners: domain connected / provider changed or removed | acme.com was connected to Acme | notice (good, globe) | acme.com was connected | People with @acme.com addresses are now recognized when they log in with Google. Facts: Connected by · When. One sentence per case. | Open login settings | You get this because you’re a System Owner at Acme. |
| M16 | Login code (C10) | {code} is your Acme login code | moment | Here’s your / login code | Log in to Acme as {email} with this code, or with one click. + code + "or" + full-width button + "The button works in the browser where you asked for the code." | Log in with one click | The code works for 10 minutes. If you didn’t ask for it, ignore this email — no one can log in without it. |
| M17 | Password changed (F7, preferences, after M12) — **new** | Your Acme password was changed | notice (lock) | Your password was changed | The password for {email} at Acme was changed. You were logged out everywhere else. Facts: When | — | If it wasn’t you, reset your password now and tell your administrator. |
| M18 | To the owner, once, after setup (S3) — **new** | Acme is ready on noddo | moment, noddo | Acme / is ready | Your company is set up. This is its address — everyone at Acme logs in here. + the address row (letter tile on Wine) + "What’s next" / "Nothing else is needed from you right now. When you’re ready:" + a vertical 3-step flow (icon tiles on accent-subtle joined by a dashed line, "Step 1/2/3" to the left of each tile): Add your logo and color — Acme’s login page, emails and noddo itself will use them. · Tell noddo how Acme works — A few answers about how your company runs, and noddo fits itself around them. · Invite your team — When everything looks right, invite people. Each gets an email and joins in a minute. **No button and no links — an email takes nobody anywhere** (owner). | — | You get this because you created Acme on noddo. |

Removed: M2b (a separate invitation for SSO-required companies — the page it opens shows "Join with Okta"); M3 (preboarding, later round). No inviter's name in M2 (no colleagues before login).

## States
| State | What the reader sees | Image |
|---|---|---|
| Normal | Every email on a computer and a phone. | M*-Mail, M*-MailPhone |
| Long content | Long company name in the band wraps; long emails wrap whole. | (as drawn) |
| Loading / Empty / No results / Error / No permission | Not applicable to emails. | — |

## Actions
The only actions are the buttons and M6's "Log in" links, each opening the page named in the table (M16's button logs in only in the browser that asked for the code).

## Words
The table above; frame text in `words.md`.

## Values
As listed in Layout. Container query breakpoint 480.

## Changes to SPEC
Display size 44/46 in emails; the ring row image; the accent band (SPEC § 15 emails are plain). Approved by the owner.

## New components
Email template (moment / notice), facts table, code box, steps flow (M18).

## Open questions
- Q-21 — senders and reply-to. Blocks nothing.
- Q-28 — the ring row is a PNG per accent: with "Your own" and with Light it has to be generated per company. Blocks nothing: the band works without it.
