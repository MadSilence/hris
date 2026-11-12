"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { Editor } from "@tiptap/react";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { FieldError } from "@/components/desact/field-error";
import { isSafeHref } from "./doc";

/** A link over the selected text: https or mailto only, or a hub path (the backend refuses anything else). */
export const LinkForm: React.FC<{ editor: Editor; onDone: () => void }> = ({ editor, onDone }) => {
  const t = useTranslations("hub");
  const current = editor.getAttributes("link").href as string | undefined;
  const [href, setHref] = React.useState(current ?? "");
  const [invalid, setInvalid] = React.useState(false);

  const normalised = (value: string) => {
    const v = value.trim();
    if (!v) return v;
    if (/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(v)) return `mailto:${v}`;
    if (!/^[a-z]+:/i.test(v) && !v.startsWith("/")) return `https://${v}`;
    return v;
  };

  const apply = () => {
    const value = normalised(href);
    if (!value) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      onDone();
      return;
    }
    if (!isSafeHref(value)) {
      setInvalid(true);
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: value }).run();
    onDone();
  };

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
    >
      <label className="text-label text-secondary" htmlFor="hub-link-href">
        {t("editor.linkAddress")}
      </label>
      <Input
        id="hub-link-href"
        autoFocus
        value={href}
        aria-invalid={invalid || undefined}
        placeholder={t("editor.linkPlaceholder")}
        onChange={(e) => {
          setHref(e.target.value);
          setInvalid(false);
        }}
      />
      {invalid && <FieldError>{t("editor.linkInvalid")}</FieldError>}
      <div className="flex justify-end gap-2">
        {current && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              onDone();
            }}
          >
            {t("editor.removeLink")}
          </Button>
        )}
        <Button type="submit" size="sm">
          {t("editor.applyLink")}
        </Button>
      </div>
    </form>
  );
};
