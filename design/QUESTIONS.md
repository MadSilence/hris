# Open questions — design and code

Only open questions. When one is answered, delete it and write the answer where it lives (the
screen's spec, the package, or the owner's rules). The format is in `HANDOFF.md` § "Questions".

## Q-1 — A segmented control is used on almost every automations window, and the package has none · automations-triggers, automations-steps, automations-test-and-turn-on · from code · 2026-11-06
Before / After, Requested · Approved · Declined · Cancelled, Day · Week · Month · Quarter · Year, Assign / Unassign, And / Or, Approves / Declines / No answer — every one is drawn as a segmented control. `styles/noddo/SPEC.md` has no such component and it is not under "New components" in any spec. The code builds it from the frames (height 32, radius 8, the picked segment white on Mist, level 1) and lists it in `CHANGELOG.md`.
Recommended: the designers add it to the package as drawn; the code's values are replaced by theirs when it lands.
**Blocks:** nothing (built from the frames)

## Q-2 — The word for an approval's time-out "Go on" · automations-steps · from code · 2026-11-06
With branches there is nothing after an approval but its two paths. The owner settled that "Go on" follows the **Declined** path (nothing is granted without a yes). "Go on" now reads like approval.
Recommended: "Treat it as declined". The code uses that until the designers answer.
**Blocks:** nothing

## Q-7 — What the owner cut from the home handoff · home, home-edit, home-widgets · from code · 2026-11-11
The owner answered the places where the design asked owner rules to give way (`(claude)/DECISIONS.md` § "The home redesign"). Three change what is drawn:
- **My time is not built** — a running clock is clock-in, which the product does not do. It leaves the panel (For me counts one fewer), the employee default and HF01–HF04.
- **To sign waits for e-signing**, which is not planned; the same for the deck's *Do · document* card and "My documents · {n} to sign" in the profile menu.
- **The birthday choice moves to the person**: a switch in their own preferences, on by default, instead of Settings → General → Home. It is not drawn.
Recommended: the designers fill the space My time leaves in the defaults and the finished frames, and draw the preferences switch; the code builds the rest meanwhile from the specs as they are, leaving those two widgets out.
**Blocks:** nothing

## Q-9 — Who can manage the hub · company-hub, company-hub-manage · from designers · 2026-11-12
**Answered by the owner (CH2, CH4):** HR only in v1 — no team-lead mode yet (scoped authors come later); the right is granted in Manage hub → Settings, "Who can post and edit pages".

## Q-10 — What the hub's ask box answers from · company-hub, company-hub-page · from designers · 2026-11-12
**Answered by the owner:** as recommended — Pages and News from the hub's search over what the person may see; Ask noddo is Home's stub until the assistant exists.

## Q-11 — How "What changed" is made · company-hub-page, company-hub-manage · from designers · 2026-11-12
**Answered by the owner:** in v1 the editor writes the points in the publish dialog, with no "Drafted by AI" label; points drafted by the assistant come later, with the assistant.

## Q-12 — A widget required for everyone on Home · company-hub-manage, home, home-edit · from designers · 2026-11-12
**Answered by the owner:** deferred to the next Home round; `showOnHome` is stored on posts from the start and the toggle stays hidden.

## Q-13 — What "For me" means in News · company-hub · from designers · 2026-11-12
**Answered by the owner:** as recommended — For me is a narrowed audience that includes the reader; Everyone is everything they may see; the last choice is kept.

## Q-14 — The root's remembered company needs its public logo and name · sign-in-root · from designers · 2026-11-13
A2 shows the company the browser last logged in to as its logo, name and address. Today the browser remembers only the address. The company's own login page already shows its logo and name publicly.
Recommended: the root reads the same public data for the remembered address. Without it A2 shows the address only.
**Blocks:** nothing

## Q-15 — Terms as a line instead of a checkbox · sign-in-registration · from designers · 2026-11-13
B1 has "By continuing, you agree to the Terms and the Privacy policy." under the three ways in; Notion had a checkbox (which Google/Microsoft skipped anyway).
Recommended: the line. Legal should confirm an explicit checkbox isn't required for our EU markets.
**Blocks:** nothing

## Q-16 — "Remember this device" length · sign-in-second-step · from designers · 2026-11-13
D1 draws "Remember this device for 30 days". The length should come from the company's setting (MFA_DESIGN § 3.4); shown only when the company allows it and the person is not a System Owner.
Recommended: the setting's value in the label ("for {n} days").
**Blocks:** nothing

## Q-17 — Setting two-step up again from D3 · sign-in-second-step · from designers · 2026-11-13
With 1 or 0 backup codes left, D3 offers "Set up again" → D4 → D5 with a new set, right from the login.
Recommended: allow it (the person just proved a factor). If the backend can't, D3 keeps "Continue" and the warning only.
**Blocks:** nothing

## Q-18 — "Full demo" leaves the setup wizard · first-run-setup · from designers · 2026-11-13
S2 offers only Example company (with a size slider 8 · 25 · 60 · 150) or Start empty; the code has three presets.
Recommended: drop the third from the wizard. Does the full demo stay reachable anywhere (e.g. for sales demos)?
**Blocks:** nothing

## Q-19 — A personal language in the welcome · first-run-welcome · from designers · 2026-11-13
W4 asks for the time zone and the language, pre-filled with the company's. Today the language is the company's ("Everybody in the company sees noddo in it").
Recommended: a personal language overrides the company's for screens and emails; exports stay in the company's language. If not built, W4 shows the time zone only.
**Blocks:** nothing

## Q-20 — The welcome opened on a phone · first-run-welcome, first-run-photo · from designers · 2026-11-13
Notion § 14.10 covers the photo from a phone while the welcome is on a computer, not the welcome itself on a phone. Drawn: one "Upload a photo" button using the phone's own picker.
Recommended: as drawn.
**Blocks:** nothing

## Q-21 — Email senders · sign-in-emails · from designers · 2026-11-13
Drawn: noddo's own emails (M1, M6, M18) from "noddo <no-reply@noddo.so>"; company emails from "Acme <no-reply@acme.noddo.so>" with the company's logo as the avatar.
Recommended: as drawn if deliverability allows per-company senders; otherwise "Acme via noddo <no-reply@noddo.so>".
**Blocks:** nothing

## Q-25 — Logo file formats and size · sign-in-appearance · from designers · 2026-11-13
Drawn: "PNG, JPEG or SVG, at least 256 × 256 px", refused above 5 MB.
Recommended: the limits the code already uses for the logo; tell us and we fix the words.
**The code's limits (2026-11-13):** PNG, JPEG or WebP, up to 5 MB, checked by the file's bytes. No SVG: the logo is served without a session, and an SVG can carry script. No minimum size is enforced. The page says "PNG, JPEG or WebP" until you fix `words.md`.
**Blocks:** nothing

## Q-28 — The ring row in emails per company · sign-in-emails · from designers · 2026-11-13
The band's rings are a static image; with "Your own" and with the Light background they have to be generated per company (or drawn as a table of circles).
Recommended: generate the PNG when the colour or the background is saved.
**Blocks:** nothing

## Q-29 — The package still carries the old ten presets · sign-in-appearance · from code · 2026-11-13
`styles/noddo/tokens.css` has `[data-accent]` blocks for Wine, Brick, Terracotta, Sun, Forest, Teal, Denim, Iris, Raspberry and Graphite. The code took the nine (Q-24) without waiting: Wine and Graphite read the package's blocks; Cherry, Tangerine, Sunflower, Basil, Indigo, Ocean, Mulberry and Black are derived in `lib/theme/accent.ts` exactly as a "Your own" colour is, and `accent.test.ts` fails the day the package's list changes, so the two cannot drift silently.
Recommended: the next package version carries the nine (light and dark values, Sunflower with Graphite on its fill) and drops the eight; the code then reads them as it reads Wine.
**Blocks:** nothing

## Q-30 — "Close to a status" measured by hue alone calls Wine red · sign-in-appearance · from code · 2026-11-13
L8-Rules makes a workspace "red" within 25° of Declined (#C42B1C, 5°). Wine (#6E1630) sits at 342°, 23° away, so by hue alone Wine — the default — would turn every confirm dialog's Delete into an outline, which the frames do not show. The code adds lightness: within 25° of hue **and** within 0.15 of the status colour's HSL lightness. Cherry and Tangerine are red; Wine is not. The quiet line in Appearance is drawn only for approvals ("Close to the color noddo uses for approvals"), so the code shows it only near Approved; by hue alone Indigo (20° from In progress) and Tangerine and Sunflower (near Pending) would also be "close", against the spec's "none of the nine".
Recommended: keep both as built; if the line should cover other statuses, give it the words for each.
**Blocks:** nothing
