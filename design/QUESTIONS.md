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
