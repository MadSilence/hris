"use client";

import * as React from "react";
import { useEditor, type Editor } from "@tiptap/react";
import type { AnyExtension } from "@tiptap/core";
import { hubExtensions, type HubDocKind } from "./extensions";
import { parseDoc, serializeDoc, withBlockIds, type DocNode } from "./doc";

/**
 * One TipTap editor over a stored body. The body is read once — the editor owns the text from then on — and every
 * change is handed back as the stored string, block ids included.
 */
export const useHubEditor = ({
  kind,
  body,
  placeholder,
  onChange,
  editable = true,
  ariaLabel,
  className,
  extra,
}: {
  kind: HubDocKind;
  body: string;
  placeholder: string;
  onChange: (body: string) => void;
  editable?: boolean;
  ariaLabel?: string;
  className?: string;
  /** Extensions only this editor has — the page editor's "/" menu. */
  extra?: AnyExtension[];
}): Editor | null => {
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;
  // The first body only: later bodies are the editor's own echoes.
  const [initial] = React.useState(() => withBlockIds(parseDoc(body)));
  // Built once: a new extension list on every render would make TipTap rebuild its schema.
  const [extensions] = React.useState(() => [...hubExtensions(kind, placeholder), ...(extra ?? [])]);

  return useEditor({
    extensions,
    content: initial as DocNode as Record<string, unknown>,
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: className ?? "",
        ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
        role: "textbox",
        "aria-multiline": "true",
      },
    },
    onUpdate: ({ editor }) => onChangeRef.current(serializeDoc(editor.getJSON() as DocNode)),
  });
};
