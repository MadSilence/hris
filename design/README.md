# noddo — design and code, one place

This folder is where design and code meet. The designers work in Claude Design; the code is written
with Claude Code. Both read this folder, so nobody works from a retelling of somebody else's chat.

**Start here, every time.** Then read only what the task needs.

## Who decides what

| Question | Decides | Where it is written |
|---|---|---|
| How it looks: colour, type, spacing, radii, icons, motion | the designers | `../styles/noddo/` — the package |
| How a screen flows: what is on it, in what order, which states it has | the designers | `screens/<name>/spec.md` |
| What the product does: data, permissions, what is possible | the owner | `rules/`, and answers in `QUESTIONS.md` |
| Whether a design can be built as drawn | the code side | the screen's spec, section "Built" |

A disagreement is a question in `QUESTIONS.md`, not an edit on the other side's file.

## What is here

| Path | What | Who writes it |
|---|---|---|
| `../styles/noddo/` | **The design system package** — `SPEC.md` (rules), `tokens.json` / `tokens.css` (values), `icons.md`, `fonts.md`. Copied verbatim; a new version replaces the files | the designers |
| `rules/` | **The product's settled UI rules** — menus, tables, statuses, forms, naming, and how the package is wired into the code. `rules/DESIGN_SYSTEM.md` § 7 lists every place **the code deliberately differs from SPEC**: take it into the next package version | generated from the owner's notes — never edit here |
| `SETUP.md` | **For a designer: connecting Claude to this folder, and exporting a screen after edits** | — |
| `HANDOFF.md` | **The protocol** — how a design arrives, how it is built, how it comes back for review | both |
| `SCREEN_SPEC_TEMPLATE.md` | The shape of a screen's spec | — |
| `screens/<name>/` | One folder per screen or flow: `spec.md`, plus exported prototypes and images | the designers write the spec; the code side adds "Built" |
| `briefs/` | **The owner's input before a screen is drawn** — what the product already does behind it, what is decided, ideas, the states to draw. `SCREENS_BRIEF.md`: the stub screens, Automations, the lifecycle processes | the code side, from the owner's answers |
| `QUESTIONS.md` | Open questions, both directions | both |
| `CHANGELOG.md` | What changed in the code that a designer should know — a new component, a changed rule, a deviation from SPEC | the code side |

## Read order

**For a designer, or the Claude Design project:**
1. this file and `HANDOFF.md`;
2. `../styles/noddo/SPEC.md` — your own package;
3. `rules/README.md`, then `rules/DESIGN_SYSTEM.md` §§ 5 and 7 — the components that already exist,
   and where the code differs from SPEC;
4. `CHANGELOG.md` since your last visit, and `QUESTIONS.md`;
5. the `rules/` file for what you are designing (a list → `TABLES_AND_LISTS.md`, a form →
   `FORMS_AND_FIELDS.md`, a menu → `ACTIONS_AND_MENUS.md`).

**For Claude Code, before building a screen:** its `screens/<name>/spec.md` must have
`status: ready`. If it is not ready, the screen is not built — ask.

## Instructions for the Claude Design project

Paste this into the project's instructions, so every chat there starts from the same rules:

```text
You design screens for noddo, an HR system. The product is built in code by another team with
Claude Code; your output is read by them, not only looked at.

Source of truth, in order:
1. styles/noddo/SPEC.md and tokens — the design system. Never invent a colour, radius, size,
   font, shadow or icon set outside it.
2. design/rules/ — the product's settled UI rules. design/rules/DESIGN_SYSTEM.md § 7 lists where
   the code deliberately differs from SPEC; follow § 7, not SPEC, on those points.
3. design/rules/DESIGN_SYSTEM.md § 5 — the components that exist. Use them. A new component is a
   question, not a silent addition.

For every screen you deliver:
- When I say "prepare the handoff", write spec.md for the screen from design/SCREEN_SPEC_TEMPLATE.md
  as a file I can download, with status: ready only if every item of the checklist in
  design/HANDOFF.md holds — otherwise status: draft and the gaps listed. A picture alone is not a
  delivery.
- Draw every state: loading, empty, no results, error, no permission, the full list, a long name.
- Every value you pick names its SPEC section. If you want a value SPEC does not have, or one
  that contradicts it, write it under "Changes to SPEC" in the spec — do not just draw it.
- Write every word on the screen in the spec, in English, sentence case. The code translates them.
- If something depends on what the product does (who sees it, what data exists), ask in
  design/QUESTIONS.md instead of guessing.

Before starting, read design/CHANGELOG.md and design/QUESTIONS.md for what changed since the last
time.
```

## How this folder stays true

- `rules/` is copied from the owner's notes with `node design/sync-rules.mjs`, after any change to
  them. A hand edit there is lost on the next sync.
- A screen's folder lives until the screen is built and reviewed; then its spec stays as the record
  of what was agreed (status `reviewed`), and the prototypes may go.
- `QUESTIONS.md` keeps only open questions. An answered one is deleted, and the answer goes where it
  belongs — a rule, the package, or a spec.
