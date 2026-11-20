---
status: built
screen: documents-tab
owner: Ulia
updated: 2026-11-17
---

# Documents tab on a profile — what exists, redesigned (V2, M3, T01–T26)

## What it is for
Whoever manages a person's documents opens their Documents tab to find, upload, sort, move, rename and trash their files. The person opens their own tab to see the files visible to them and to upload their own. This round redraws what exists today. It adds no new capability except folder icons and colours, column hiding and renaming in the preview.

## Where it lives
Profile → **Documents** tab (`/people/:id/documents`). The tab's rights are unchanged: "edit this person's documents" sees everything; the person sees only files visible to them (T18).

## Layout
The parts, top to bottom:

1. **Toolbar.**
   - Left: Search, 260 wide (§ 13.3).
   - Right: **Trash**, a secondary button with a label, then **Add**, the accent button.
   - Add opens: Upload files · New folder.
2. **Folders.**
   - A label: "Folders 4".
   - A row of folder tiles, Drive-style, above the files, never as rows in the list. Each tile has its icon in the folder's colour (tag palette, § 4.7), the name, "N files", and ⋯.
3. **View switch.**
   - `SegmentedControl`: Not in a folder · All documents · Starred (★). The Expiring view comes from `documents-expiry`.
   - Each segment carries a count. "Not in a folder" is the default.
4. **The list.** A table with no frame (product rule): only the header row and hairlines, § 13.5.
   - Columns: checkbox · Name (file-type tile 28 + name; the star after the name when starred) · Category (`TagChip`) · Who can see ("Visible" with an eye / "Hidden" with a crossed eye) · Uploaded · quick actions on hover (Download, Star, ⋯).
   - Every column sorts (T19–T21). A column shows its arrow on hover.
5. **Column picker (T22–T23).** A columns icon at the end of the header row. Name always stays. The icon is tinted while a column is hidden. The choice is remembered per person.
6. **Selection bar (T05b).** It sits right above the list, under the folders: white, 48 high, radius 10, hairline, shadow and border tinted with the company colour (Changes to SPEC).
   - Content: checkbox · "3 selected" · divider · "Select all 7" … Download · Move to… · Who can see · Star · divider · Move to trash · ×.
7. **Preview (V2-Preview, T25–T26).** A dialog, 960 wide.
   - Header: tile, name, star, and a meta line (category · who can see).
   - The PDF stage.
   - Footer: Move to trash on the left, apart; Download on the right.
   - One click on the name turns it into a field: Enter saves, Esc or a click outside cancels. On hover the name gets a soft background.
8. **Upload (M3).** A dialog, 800 wide.
   - Left: drop zone and file list with progress.
   - Right: Folder · Category · Who can see (`SegmentedControl`).
   - Footer: Cancel · Upload.

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | Skeleton in the real shape: folder tiles and the table rows, with shimmer (§ 12) | T16-Loading |
| Empty (nothing yet) | `EmptyState` "documents" in the vertical centre: "No documents yet" + Upload files / New folder; the whole tab takes a drop | T12-Empty; T13-FolderEmpty for an empty folder |
| No results | `EmptyState` "no-results": "Nothing called “contrakt”" / "Try a different word." / "Search looks in every folder." Folders hide while searching | T14-Search, T15-NoResults |
| Error | `ErrorState` "something-broke": "We couldn’t load the documents" / "Nothing is lost. Try again in a moment." + Try again | T17-Error |
| No permission | The tab isn't shown to someone without rights; the person on their own tab sees no hidden files and no Who can see column | T18-OwnView |
| Normal | V2-List, V2-Starred, T01-Folder, T19–T21 sorted | V2-*, T01, T19–T21 |
| Long content | A long name ends in … and keeps its star (V2-PreviewLong); a 90-character name in the list (V2-List row 6); 28 files in a folder | V2-PreviewLong, V2-List |
| Dragging | The tab becomes a drop zone; letting go opens Upload with the files in it | T07-Drop |
| Uploading | Per-file progress; a refused file says why and stays out ("Uploaded file type is not allowed") | T08-Uploading, M3-ManyFiles |
| Trash | Opens like a folder: Documents › Trash; Restore on hover, Delete forever in ⋯ (confirms); no Add | T10-Trash, T11-TrashEmpty |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Upload files | Add menu / drop | M3 opens with the files | no |
| New folder | Add menu | T03: name, one of eight colours, an icon | no |
| Folder ⋯ | tile | Upload here · Rename · Icon and color · — Delete folder | Delete folder confirms; its files go to the trash (T04) |
| Move to… | row ⋯ / selection bar | T06: the folders with icons; New folder right there | no |
| Who can see | row ⋯ / bar | Visible / Hidden | no |
| Move to trash | row ⋯ / bar / preview | Trashed at once; toast with Undo (T09) | no (Undo) |
| Delete forever | Trash ⋯ | Erased | yes (`destructive-confirm`) |
| Restore | Trash row hover | Back where it was | no |
| Rename | ⋯ (T24) or the name in the preview (T26) | Dialog: the name selected, the extension outside the field | no |
| Hide columns | header columns icon | Toggle per column; remembered per person | no |
| Sort | header | Toggles direction; files with no category go last | no |

## Words
Every string: `words.md`. The key ones:
- **Views:** "Not in a folder", "All documents", "Starred".
- **Toolbar and empty state:** "Trash", "Add", "Upload files", "New folder", "No documents yet", "Contracts, IDs and certificates live here.", "Drop files here or upload them."
- **Visibility and selection:** "Visible", "Hidden", "3 selected", "Select all 7".
- **Rename and trash:** "Rename", "Move to trash", "Delete forever", "Restore", "Nothing in the trash", "Deleted files wait here." "You can restore them any time."

## Values
- Folder tile: radius card (§ 8), Mist fill, icon tile 40 white.
- Row: 48 high, header 40 (§ 13.5).
- File-type tiles: 28, radius control, tag-palette bg/bar per type (§ 4.7).
- Preview dialog: 960; Upload dialog: 800 (§ 13.7, DESIGN_SYSTEM § 7 "Dialogs are white").

## Changes to SPEC
- **The selection bar** sits above the list it acts on, white, 48 high, radius 10, a hairline, and its border and shadow are tinted with the company colour. This contradicts DESIGN_SYSTEM § 7 (Mist, in the toolbar's place) and SPEC § 7 ("shadows are never tinted"). Owner's decision, 17 Nov 2026 (product-wide rule).
- **Lists of records have no frame** (product rule, Documents first).
- **Folder colours** use the tag palette with eight colours; folder icons come from Hugeicons.

## New components
- **FolderTile** — icon in colour, name, count, ⋯.
  - States: default, hover, menu open, drop target.
  - Used in Documents. It could be used elsewhere where folders appear.
- **ColumnPicker** — a header icon and a menu of checkboxes. Could be used for any table.
- **InlineRename** — the editable title in the preview. Could be used for any preview title.

## Open questions
None blocks this.

## Built
*Filled by the code side when the screen is built.*

- **Where to see it:** a person's profile → Documents —
  `components/modules/organization/modules/profile/modules/personalDocuments` (`PersonalDocumentsContainer`,
  `PersonalDocumentsFolderCard` = FolderTile, `FolderLookDialog`, `PersonalDocumentsFilesTable`); the shared pieces
  `components/ui/ColumnPicker`, `components/ui/InlineRename`, `components/ui/SelectionBar`. Built 2026-11-18, walked in the built-in browser the same day (`(claude)/HISTORY.md` § "Documents" → "The second part").
- **Differs from the design:**
  - **The Upload dialog (M3)** is built as drawn (800 wide, two columns, per-file progress, a refused file kept with
    why), and so are dropping onto a folder tile and the tile's drop-target state (`UploadDocumentForm.tsx`,
    `PersonalDocumentsFolderCard.tsx` `onDropFiles`) — documents batch 11, 2026-11-18, not yet seen in a visible window.
  - **Folder icons** are the folder plus nine from the hub's set; the colours are the package's eight.
  - **All documents** heads a group with the folder its files sit in — the root's, or a nested one under its own name
    (the root listing names every folder a file sits in, `folderNames`; 2026-11-19, not yet seen on screen). A nested
    folder heads its own group, not its root folder's.
  - The Expiring view (`documents-expiry`) appears in the switch only while something is expiring.
- **An empty folder for a reader who may not upload** (2026-11-19, F5.1): one line, no buttons and no "Drop files here or use Add".
- **The selection bar takes the view tabs' row** (2026-11-20, the owner): at the root, while rows are selected, the bar stands where Loose · All · Starred were, so the list does not move under the pointer; clearing brings the tabs back. Inside a folder (no tabs row) it still sits above the list.
