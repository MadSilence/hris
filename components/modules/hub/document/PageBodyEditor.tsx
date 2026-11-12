"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { EditorContent, type Editor } from "@tiptap/react";
import type { Range } from "@tiptap/core";
import { NodeSelection } from "@tiptap/pm/state";
import type { Slice } from "@tiptap/pm/model";
import {
  DragDropVerticalIcon,
  File01Icon,
  Heading02Icon,
  Image01Icon,
  LeftToRightListBulletIcon,
  LeftToRightListNumberIcon,
  MinusSignIcon,
  Table01Icon,
  TextIcon,
} from "@hugeicons/core-free-icons";
import { Icon, type IconSvgElement } from "@/components/desact/icon";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/desact/popover";
import { showActionError } from "@/lib/errors/errorToast";
import { ActionStatus } from "@/components/models/ActionStatus";
import { cn } from "@/lib/cn";
import { uploadHubFileAction } from "../actions";
import { HandbookPagePicker } from "./HandbookPagePicker";
import { insertPageLink } from "./PostEditor";
import { slashCommand, type SlashBridge, type SlashItem } from "./slashCommand";
import { useHubEditor } from "./useHubEditor";

const SLASH_ICONS: Record<SlashItem, IconSvgElement> = {
  heading: Heading02Icon,
  text: TextIcon,
  bulletList: LeftToRightListBulletIcon,
  orderedList: LeftToRightListNumberIcon,
  image: Image01Icon,
  table: Table01Icon,
  pageLink: File01Icon,
  divider: MinusSignIcon,
};

/** Image types the backend takes (`HubFileService`): png, jpeg, gif, webp, at most 10 MB. */
export const HUB_IMAGE_ACCEPT = "image/png,image/jpeg,image/gif,image/webp";

/** Uploads one image and answers its hub file id; a refusal is shown as a card and answers null. */
export const uploadHubImage = async (file: File): Promise<string | null> => {
  const form = new FormData();
  form.append("file", file);
  const result = await uploadHubFileAction(form);
  if (result.status === ActionStatus.ERROR || !result.data) {
    showActionError(result);
    return null;
  }
  return result.data.id;
};

/** What ProseMirror reads while a block is dragged (`EditorView.dragging`). */
type Dragging = { slice: Slice; move: boolean };

/**
 * The hover handle 32 to the left of a block (CM06): drag it to move the block. Ours, not TipTap's drag-handle
 * package (that one needs the collaboration extensions). It selects the block and hands ProseMirror a move, which
 * ProseMirror's own drop handling completes — the same mechanism the paid package uses.
 */
const DragHandle: React.FC<{ editor: Editor; container: React.RefObject<HTMLDivElement | null> }> = ({ editor, container }) => {
  const t = useTranslations("hub");
  const [block, setBlock] = React.useState<{ top: number; height: number; offset: number } | null>(null);

  React.useEffect(() => {
    const root = container.current;
    if (!root) return;
    const onMove = (event: MouseEvent) => {
      const view = editor.view;
      const box = root.getBoundingClientRect();
      let found: { top: number; height: number; offset: number } | null = null;
      view.state.doc.forEach((_node, offset) => {
        if (found) return;
        const dom = view.nodeDOM(offset);
        if (!(dom instanceof HTMLElement)) return;
        const rect = dom.getBoundingClientRect();
        if (event.clientY >= rect.top - 4 && event.clientY <= rect.bottom + 4) {
          found = { top: rect.top - box.top, height: rect.height, offset };
        }
      });
      setBlock(found);
    };
    const onLeave = () => setBlock(null);
    root.addEventListener("mousemove", onMove);
    root.addEventListener("mouseleave", onLeave);
    return () => {
      root.removeEventListener("mousemove", onMove);
      root.removeEventListener("mouseleave", onLeave);
    };
  }, [editor, container]);

  if (!block || !editor.isEditable) return null;

  const onDragStart = (event: React.DragEvent<HTMLButtonElement>) => {
    const view = editor.view;
    const selection = NodeSelection.create(view.state.doc, block.offset);
    view.dispatch(view.state.tr.setSelection(selection));
    const dom = view.nodeDOM(block.offset);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", "");
    if (dom instanceof HTMLElement) event.dataTransfer.setDragImage(dom, 0, 0);
    (view as unknown as { dragging: Dragging | null }).dragging = { slice: selection.content(), move: true };
  };

  return (
    <button
      type="button"
      draggable
      onDragStart={onDragStart}
      onClick={() => editor.chain().focus().setNodeSelection(block.offset).run()}
      aria-label={t("editor.dragBlock")}
      title={t("editor.dragBlock")}
      className="absolute -left-8 flex h-6 w-5 cursor-grab items-center justify-center rounded-control text-tertiary hover:bg-mist hover:text-secondary"
      style={{ top: block.top + Math.min(block.height, 26) / 2 - 12 }}
    >
      <Icon icon={DragDropVerticalIcon} size="sm" />
    </button>
  );
};

/**
 * CM06's body: a block editor with "/" for Heading, Text, Bulleted list, Numbered list, Image, Table, Link to a
 * page and Divider; a drag handle on hover; and the placeholder on an empty line.
 */
export const PageBodyEditor: React.FC<{ body: string; onChange: (body: string) => void; excludePageId?: string }> = ({
  body,
  onChange,
  excludePageId,
}) => {
  const t = useTranslations("hub");
  const container = React.useRef<HTMLDivElement>(null);
  const fileInput = React.useRef<HTMLInputElement>(null);
  const pendingRange = React.useRef<Range | null>(null);
  const [menu, setMenu] = React.useState<{ items: SlashItem[]; rect: DOMRect | null; command: (item: SlashItem) => void } | null>(null);
  const [active, setActive] = React.useState(0);
  const [pagePicker, setPagePicker] = React.useState<{ rect: DOMRect | null; range: Range } | null>(null);
  const menuRef = React.useRef(menu);
  menuRef.current = menu;
  const activeRef = React.useRef(active);
  activeRef.current = active;

  const label = React.useCallback(
    (item: SlashItem): string =>
      ({
        heading: t("editor.slash.heading"),
        text: t("editor.slash.text"),
        bulletList: t("editor.slash.bulletList"),
        orderedList: t("editor.slash.orderedList"),
        image: t("editor.slash.image"),
        table: t("editor.slash.table"),
        pageLink: t("editor.slash.pageLink"),
        divider: t("editor.slash.divider"),
      })[item],
    [t],
  );

  const bridge = React.useRef<SlashBridge | null>(null);
  bridge.current = {
    label,
    show: (state) => {
      setMenu(state);
      setActive(0);
    },
    keyDown: (event) => {
      const current = menuRef.current;
      if (!current || current.items.length === 0) return false;
      if (event.key === "ArrowDown") {
        setActive((a) => (a + 1) % current.items.length);
        return true;
      }
      if (event.key === "ArrowUp") {
        setActive((a) => (a - 1 + current.items.length) % current.items.length);
        return true;
      }
      if (event.key === "Enter") {
        const item = current.items[activeRef.current];
        if (item) current.command(item);
        return true;
      }
      return false;
    },
    run: (item, editor, range) => {
      const chain = editor.chain().focus().deleteRange(range);
      switch (item) {
        case "heading":
          chain.setNode("heading", { level: 2 }).run();
          break;
        case "text":
          chain.setParagraph().run();
          break;
        case "bulletList":
          chain.toggleBulletList().run();
          break;
        case "orderedList":
          chain.toggleOrderedList().run();
          break;
        case "table":
          chain.insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
          break;
        case "divider":
          chain.setHorizontalRule().run();
          break;
        case "image":
          chain.run();
          pendingRange.current = { from: range.from, to: range.from };
          fileInput.current?.click();
          break;
        case "pageLink": {
          chain.run();
          const coords = editor.view.coordsAtPos(range.from);
          setPagePicker({ rect: new DOMRect(coords.left, coords.top, 0, coords.bottom - coords.top), range: { from: range.from, to: range.from } });
          break;
        }
      }
    },
  };

  const [extra] = React.useState(() => [slashCommand(bridge)]);
  const editor = useHubEditor({
    kind: "PAGE",
    body,
    placeholder: t("editor.placeholder"),
    onChange,
    extra,
    ariaLabel: t("editor.body"),
    className: "hub-prose hub-prose-page min-h-[240px] outline-none",
  });

  const onFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !editor) return;
    const id = await uploadHubImage(file);
    if (!id) return;
    const at = pendingRange.current?.from ?? editor.state.selection.from;
    editor.chain().focus().insertContentAt(at, { type: "image", attrs: { fileId: id, alt: file.name } }).run();
  };

  return (
    <div ref={container} className="relative">
      {editor && <DragHandle editor={editor} container={container} />}
      <EditorContent editor={editor} className="text-hub-reading text-secondary" />
      <input ref={fileInput} type="file" accept={HUB_IMAGE_ACCEPT} className="hidden" onChange={onFile} aria-hidden tabIndex={-1} />

      {menu &&
        menu.items.length > 0 &&
        menu.rect &&
        createPortal(
          <div
            role="listbox"
            aria-label={t("editor.slash.label")}
            className="fixed z-50 flex w-60 flex-col gap-0.5 rounded-popover border border-divider bg-overlay p-1 shadow-popover"
            style={{ top: menu.rect.bottom + 6, left: menu.rect.left }}
          >
            {menu.items.map((item, index) => (
              <button
                key={item}
                type="button"
                role="option"
                aria-selected={index === active}
                onMouseEnter={() => setActive(index)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  menu.command(item);
                }}
                className={cn("flex items-center gap-2.5 rounded-control px-2 py-1.5 text-left text-body text-primary", index === active ? "bg-subtle" : "hover:bg-subtle")}
              >
                <span className="flex size-7 items-center justify-center rounded-control border border-divider bg-card">
                  <Icon icon={SLASH_ICONS[item]} size="sm" className="text-secondary" />
                </span>
                {label(item)}
              </button>
            ))}
          </div>,
          document.body,
        )}

      <Popover open={pagePicker !== null} onOpenChange={(open) => !open && setPagePicker(null)}>
        <PopoverAnchor asChild>
          <span
            aria-hidden
            className="pointer-events-none fixed size-0"
            style={pagePicker?.rect ? { top: pagePicker.rect.bottom, left: pagePicker.rect.left } : undefined}
          />
        </PopoverAnchor>
        <PopoverContent align="start" className="w-auto p-1">
          <HandbookPagePicker
            excludeId={excludePageId}
            onPick={(page) => {
              if (editor && pagePicker) insertPageLink(editor, page, pagePicker.range);
              setPagePicker(null);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
