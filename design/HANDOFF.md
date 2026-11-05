# The handoff — design to code and back

One screen moves through five statuses. The status is the `status:` line at the top of its
`screens/<name>/spec.md`, and it is the only place the status lives.

```
draft ──▶ ready ──▶ building ──▶ built ──▶ reviewed
  ▲          │                      │
  └──────────┴──── question ◀───────┘
```

| Status | Means | Who moves it on |
|---|---|---|
| `draft` | The designers are working; the code side does not read it yet | the designers → `ready` |
| `ready` | Complete by the checklist below; can be built without asking | the code side → `building` |
| `building` | Being built. Changes to the design now go through `QUESTIONS.md`, not into the spec | the code side → `built` |
| `built` | In the app. "Built" in the spec says what differs from the design and why | the designers → `reviewed`, or a question |
| `reviewed` | The designers looked at the real screen and accept it | — |

A question that blocks a screen puts it back to `draft` (before building) or keeps it `building`
(after) — never silently changes the design.

## Design → code

**A screen is `ready` when its spec has all of this:**

- [ ] every state drawn or described: loading, empty, no results, error, no permission, the normal
      case, the long case (a 60-character name, 500 rows, a person with no photo);
- [ ] every component named from what exists (`rules/DESIGN_SYSTEM.md` § 5), or marked as new;
- [ ] every value traced to a SPEC section — or listed under "Changes to SPEC";
- [ ] every word on the screen written out, English, sentence case;
- [ ] what each action does, and which actions confirm (`rules/ACTIONS_AND_MENUS.md`);
- [ ] no open question in `QUESTIONS.md` that blocks it.

**What to attach** in `screens/<name>/`: the exported prototype (HTML or the Claude Design handoff),
and images of each state. Text wins over a picture: where they disagree, the spec is right and the
picture is fixed.

**How it gets there — the designers do not use git.** From Claude Design: **Export → Download as
.zip**, plus the `spec.md` their Claude wrote, sent to the owner as files (`SETUP.md` § 3 says how).
The code side unpacks it into `screens/<name>/` and commits. A designer who prefers git may commit to
`master` inside `design/` only — the result is the same folder.

**Taking an export in (the code side):**
1. Unpack into `screens/<name>/` — the spec as `spec.md`, the export under `export/`. A re-export of
   the same screen replaces `export/` whole; the old one is in git.
2. Check the spec against the list above. A gap is a question in `QUESTIONS.md` and the status stays
   `draft` — the screen is not built from a guess.
3. Values in the export that contradict SPEC and are not under "Changes to SPEC" are questions too:
   the export is a reference picture, never a source of values.
4. Commit only `design/`, and say in the message which screen and which status.

**A new package version** (SPEC, tokens) replaces the files in `../styles/noddo/` as a whole, with a
line in `CHANGELOG.md` saying what changed. It is not merged by hand.

## Code → design

When a screen is built, the code side:

1. moves it to `built`;
2. fills "Built" in the spec: what differs from the design and why (a component that already does it
   another way, a rule in `rules/`, a limit of the data), and where to see it;
3. adds images of the real screen to the folder;
4. adds a line to `CHANGELOG.md` for anything a designer should carry into the package — a new
   component, a deviation from SPEC (also in `rules/DESIGN_SYSTEM.md` § 7).

## Questions

`QUESTIONS.md`, one entry per question, either direction:

```markdown
## Q-<number> — <one line> · <screen or "system"> · from <designers | code> · <date>
<the question, the options, and which one the asker recommends and why>
**Blocks:** <screen name, or "nothing">
```

Answered → the entry is deleted, and the answer is written where it lives: the spec, the package, or
the owner's rules (then `node design/sync-rules.mjs`).

## What this replaces

Fixes sent as a document or chat export, with values that quietly contradict SPEC, and a round of
twenty questions afterwards. The round still happens — but before building, in `QUESTIONS.md`,
rather than after.
