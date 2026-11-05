# For a designer — connect once, export after every round

No git, no terminal. You read the repository through Claude, and send screens back as files.

What you need: a Claude plan of **Pro or higher** (design systems are not on Free), and read access
to the GitHub repository `MadSilence/hris` (the owner adds you as a collaborator).

## 1. Once — a project that knows the rules

Everything below happens in Claude itself (claude.ai or the desktop app). The standalone
claude.ai/design closes on 2026-12-14; if your design systems are there, see step 1.4.

1. **Create a project** — Projects → New project, named `noddo`.
2. **Instructions.** Open `design/README.md` in the repository, copy the block under
   "Instructions for the Claude Design project", paste it into the project's instructions.
3. **Knowledge from GitHub.** In the project's knowledge: Add content → GitHub. Connect your GitHub
   account when asked, pick `MadSilence/hris`, and select only two folders:
   - `design/`
   - `styles/noddo/`

   Not the whole repository — the code would drown the rules. When the repository changes, press
   **sync** on the GitHub item; do it at the start of every round of work.

   *If GitHub does not connect:* download those two folders from github.com and upload the files
   to the project's knowledge by hand. Re-upload when the owner says `CHANGELOG.md` changed.
4. **The design system.** If noddo already exists as a design system in standalone Claude Design,
   move it: in Claude, the Design tab → **Move team design systems**. If it does not exist yet, ask
   the owner to push it from the code (`/design-sync` in Claude Code), so its components are the
   code's real ones. Pick it as the design system for your designs.

## 2. Every round — design a screen

1. In the `noddo` project, start a chat. First message: *"Read CHANGELOG.md and QUESTIONS.md and tell
   me what changed."*
2. Ask for the design as usual (Output → Design in the message box, or just ask).
3. Questions about what the product does — who sees it, what data exists — go to the owner, not to
   a guess. Claude will flag them: they are part of the instructions.

## 3. After edits — export and send

When the screen is done, or after a round of fixes on it:

1. In the chat, write: **"Prepare the handoff for <screen name>."** Claude writes `spec.md` from the
   template and checks it against the checklist. If it says `status: draft` and lists gaps, close
   them first, or send it as draft deliberately.
2. Download `spec.md`.
3. Open the design → **Export** (upper right) → **Download as .zip**.
4. Send both files to the owner in one message, with the screen's name — the same name every time
   for the same screen (`time-off-request`, not "new version of the dialog").

A fix to a screen already built goes the same way: the same name, a new export, and `spec.md` with
what changed. The code side replaces the old export; git keeps the history.

## 4. When it comes back

The code side builds the screen and fills **"Built"** in its spec — where to see it, what differs
from your design and why, images of the real screen. It also writes to `CHANGELOG.md` anything you
should carry into the next package version. After a sync (step 1.3) you see both in the project.
Look at the real screen; if it is right, tell the owner "reviewed", otherwise send a question.
