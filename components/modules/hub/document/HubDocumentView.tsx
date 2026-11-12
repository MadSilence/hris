"use client";

import * as React from "react";
import Link from "next/link";
import { File01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { hubFileUrl } from "@/models/hub";
import { cn } from "@/lib/cn";
import { isSafeHref, parseDoc, type DocMark, type DocNode } from "./doc";

/*
 * A body drawn from its JSON, node by node, through the same schema the backend validated (§ 6.1). **Nothing is
 * set as HTML** — an unknown node is skipped, a link that is not https, mailto or a hub path is drawn as text.
 */

const num = (value: unknown, fallback: number): number => (typeof value === "number" && Number.isFinite(value) ? value : fallback);

/** Italics are not part of the system (SPEC § 5): an italic mark the schema still accepts is drawn as plain text. */
const renderMarks = (text: React.ReactNode, marks: DocMark[] | undefined, key: string): React.ReactNode =>
  (marks ?? []).reduce<React.ReactNode>((inner, mark, i) => {
    const k = `${key}-m${i}`;
    switch (mark.type) {
      case "bold":
        return <strong key={k} className="font-semibold text-primary">{inner}</strong>;
      case "strike":
        return <s key={k}>{inner}</s>;
      case "highlight":
        return <mark key={k} className="rounded-tag bg-accent-muted px-0.5 text-primary">{inner}</mark>;
      case "link": {
        const href = mark.attrs?.href;
        if (!isSafeHref(href)) return inner;
        if (href.startsWith("/hub")) return <Link key={k} href={href} className="text-accent-text underline underline-offset-2">{inner}</Link>;
        return (
          <a key={k} href={href} target="_blank" rel="noopener noreferrer nofollow" className="text-accent-text underline underline-offset-2">
            {inner}
          </a>
        );
      }
      default:
        return inner;
    }
  }, text);

const children = (node: DocNode, key: string) => (node.content ?? []).map((child, i) => renderNode(child, `${key}-${i}`));

const renderNode = (node: DocNode, key: string): React.ReactNode => {
  switch (node.type) {
    case "text":
      return <React.Fragment key={key}>{renderMarks(node.text ?? "", node.marks, key)}</React.Fragment>;
    case "hardBreak":
      return <br key={key} />;
    case "paragraph":
      return (
        <p key={key} className="min-h-[1lh]">
          {children(node, key)}
        </p>
      );
    case "heading": {
      const level = num(node.attrs?.level, 2);
      const cls = level === 3 ? "text-card-title text-primary" : "text-section-title text-primary";
      return level === 1 ? (
        <h2 key={key} className={cls}>{children(node, key)}</h2>
      ) : level === 2 ? (
        <h3 key={key} className={cls}>{children(node, key)}</h3>
      ) : (
        <h4 key={key} className={cls}>{children(node, key)}</h4>
      );
    }
    case "bulletList":
      return <ul key={key} className="flex list-disc flex-col gap-1 pl-6">{children(node, key)}</ul>;
    case "orderedList":
      return (
        <ol key={key} start={num(node.attrs?.start, 1)} className="flex list-decimal flex-col gap-1 pl-6">
          {children(node, key)}
        </ol>
      );
    case "listItem":
      return <li key={key} className="[&>p]:min-h-0">{children(node, key)}</li>;
    case "blockquote":
      return <blockquote key={key} className="border-l-2 border-strong pl-4 text-secondary">{children(node, key)}</blockquote>;
    case "horizontalRule":
      return <hr key={key} className="border-divider" />;
    case "pageLink": {
      const pageId = typeof node.attrs?.pageId === "string" ? node.attrs.pageId : "";
      const title = String(node.attrs?.title ?? "");
      if (!pageId) return <React.Fragment key={key}>{title}</React.Fragment>;
      return (
        <Link key={key} href={`/hub/handbook/${pageId}`} className="inline-flex items-baseline gap-1 text-accent-text underline underline-offset-2">
          <Icon icon={File01Icon} size="sm" className="self-center" />
          {title}
        </Link>
      );
    }
    case "image": {
      const fileId = typeof node.attrs?.fileId === "string" ? node.attrs.fileId : "";
      if (!fileId) return null;
      return (
        // eslint-disable-next-line @next/next/no-img-element -- a session-bound hub file, not an optimisable asset
        <img
          key={key}
          src={hubFileUrl(fileId)}
          alt={String(node.attrs?.alt ?? "")}
          title={node.attrs?.title ? String(node.attrs.title) : undefined}
          className="max-w-full rounded-card"
        />
      );
    }
    case "table":
      return (
        <div key={key} className="overflow-x-auto">
          <table className="w-full border-collapse text-body">
            <tbody>{children(node, key)}</tbody>
          </table>
        </div>
      );
    case "tableRow":
      return <tr key={key} className="border-b border-divider">{children(node, key)}</tr>;
    case "tableHeader":
      return (
        <th key={key} colSpan={num(node.attrs?.colspan, 1)} rowSpan={num(node.attrs?.rowspan, 1)} className="bg-subtle px-3 py-2 text-left align-top text-label text-secondary [&>p]:min-h-0">
          {children(node, key)}
        </th>
      );
    case "tableCell":
      return (
        <td key={key} colSpan={num(node.attrs?.colspan, 1)} rowSpan={num(node.attrs?.rowspan, 1)} className="px-3 py-2 align-top [&>p]:min-h-0">
          {children(node, key)}
        </td>
      );
    default:
      return null;
  }
};

/**
 * The reading view of a post or page. `changedBlockIds` marks the top-level blocks that differ from the version
 * the reader agreed to (CP02: shown with What changed, only to the reader who saw the older version).
 */
export const HubDocumentView: React.FC<{
  body: string;
  changedBlockIds?: string[];
  className?: string;
  empty?: React.ReactNode;
}> = ({ body, changedBlockIds, className, empty }) => {
  const doc = React.useMemo(() => parseDoc(body), [body]);
  const changed = React.useMemo(() => new Set(changedBlockIds ?? []), [changedBlockIds]);
  const blocks = doc.content ?? [];
  if (blocks.length === 0 && empty) return <>{empty}</>;
  return (
    <div className={cn("flex flex-col gap-4 text-hub-reading text-secondary", className)}>
      {blocks.map((block, i) => {
        const id = typeof block.attrs?.id === "string" ? block.attrs.id : null;
        const rendered = renderNode(block, `b${i}`);
        if (!id || !changed.has(id)) return <React.Fragment key={id ?? `b${i}`}>{rendered}</React.Fragment>;
        return (
          <div key={id} data-changed className="-mx-2 rounded-tag bg-accent-muted px-2 py-0.5">
            {rendered}
          </div>
        );
      })}
    </div>
  );
};
