"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { EditorContent, type Editor } from "@tiptap/react";
import { File01Icon, Heading02Icon, LeftToRightListBulletIcon, Link01Icon, TextBoldIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/desact/button";
import { Icon, type IconSvgElement } from "@/components/desact/icon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/desact/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/desact/tooltip";
import { cn } from "@/lib/cn";
import { HandbookPagePicker } from "./HandbookPagePicker";
import { LinkForm } from "./LinkForm";
import { useHubEditor } from "./useHubEditor";

const ToolButton: React.FC<{ icon: IconSvgElement; label: string; active?: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={label}
        aria-pressed={active}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClick}
        className={cn(active && "bg-mist")}
      >
        <Icon icon={icon} size="sm" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>
);

/** Inserts a page link at the selection, as an inline chip in the text. */
export const insertPageLink = (editor: Editor, page: { pageId: string; title: string }, range?: { from: number; to: number }) => {
  const chain = editor.chain().focus();
  (range ? chain.deleteRange(range) : chain)
    .insertContent([{ type: "pageLink", attrs: { pageId: page.pageId, title: page.title } }, { type: "text", text: " " }])
    .run();
};

/**
 * CM05's text: a box 120 high that grows to 360 and then scrolls, with a toolbar of ghost icon buttons — Bold,
 * Heading, List, Link — and "Link a handbook page". The post subset of the schema: no images, no tables.
 */
export const PostEditor: React.FC<{ body: string; onChange: (body: string) => void; labelledBy?: string }> = ({ body, onChange, labelledBy }) => {
  const t = useTranslations("hub");
  const editor = useHubEditor({
    kind: "POST",
    body,
    placeholder: "",
    onChange,
    className: "hub-prose min-h-[120px] max-h-[360px] overflow-y-auto px-3.5 py-2.5 outline-none",
  });
  const [linkOpen, setLinkOpen] = React.useState(false);
  const [pageOpen, setPageOpen] = React.useState(false);
  // Re-render the toolbar's pressed states as the selection moves.
  const [, force] = React.useReducer((n: number) => n + 1, 0);
  React.useEffect(() => {
    if (!editor) return;
    editor.on("transaction", force);
    return () => {
      editor.off("transaction", force);
    };
  }, [editor]);

  return (
    <div
      className="flex flex-col rounded-control border border-field bg-card transition-[border-color,box-shadow] focus-within:border-accent focus-within:shadow-focus"
      aria-labelledby={labelledBy}
      role="group"
    >
      <div className="flex items-center gap-0.5 border-b border-divider px-1.5 py-1">
        <ToolButton icon={TextBoldIcon} label={t("editor.bold")} active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()} />
        <ToolButton
          icon={Heading02Icon}
          label={t("editor.heading")}
          active={editor?.isActive("heading")}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolButton
          icon={LeftToRightListBulletIcon}
          label={t("editor.list")}
          active={editor?.isActive("bulletList")}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        />
        <Popover open={linkOpen} onOpenChange={setLinkOpen}>
          <PopoverTrigger asChild>
            <span>
              <ToolButton icon={Link01Icon} label={t("editor.link")} active={editor?.isActive("link")} onClick={() => setLinkOpen(true)} />
            </span>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80 p-3">
            {editor && <LinkForm editor={editor} onDone={() => setLinkOpen(false)} />}
          </PopoverContent>
        </Popover>
        <Popover open={pageOpen} onOpenChange={setPageOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="gap-1.5" onMouseDown={(e) => e.preventDefault()}>
              <Icon icon={File01Icon} size="sm" />
              {t("editor.linkPage")}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-1">
            <HandbookPagePicker
              onPick={(page) => {
                if (editor) insertPageLink(editor, page);
                setPageOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <EditorContent editor={editor} className="text-body text-primary" />
    </div>
  );
};
