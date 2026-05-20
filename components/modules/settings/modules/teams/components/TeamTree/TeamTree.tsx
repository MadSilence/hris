"use client";

import React, { useMemo, useState } from "react";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { cn } from "@/public/desact/src/components/ui/utils";

export type TeamNode = {
  id: string;
  name: string;
  members: number;
  about?: string | null;
  founded?: string | null;
  directReports?: number;
  responsibilities?: string[];
  children?: TeamNode[];
};

type Props = {
  data: TeamNode[];
  selectedId: string | null;
  defaultExpandedIds?: string[];
  onSelect: (id: string) => void;
};

function collectMatchingAndAncestors(nodes: TeamNode[], query: string): Set<string> {
  const result = new Set<string>();

  function traverse(node: TeamNode, ancestors: string[]): boolean {
    const selfMatches = node.name.toLowerCase().includes(query.toLowerCase());
    const childrenMatch = (node.children ?? []).some((c) =>
      traverse(c, [...ancestors, node.id]),
    );
    if (selfMatches || childrenMatch) {
      result.add(node.id);
      ancestors.forEach((id) => result.add(id));
    }
    return selfMatches || childrenMatch;
  }

  nodes.forEach((n) => traverse(n, []));
  return result;
}

function FolderIcon({ open, active }: { open: boolean; active: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      className={cn("flex-none transition-colors", active ? "text-brown-700" : "text-brown-400")}
    >
      <path
        d="M1.5 4.5A1 1 0 0 1 2.5 3.5h3.086l1 1H13.5a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V4.5z"
        fill="currentColor"
        fillOpacity={open ? 0.18 : 0.08}
      />
      <path
        d="M1.5 4.5A1 1 0 0 1 2.5 3.5h3.086l1 1H13.5a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V4.5z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      className={cn("flex-none text-brown-400 transition-transform duration-150", open && "rotate-90")}
    >
      <path
        d="M3 1.5l4 3.5-4 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TeamTree({
  data,
  selectedId,
  defaultExpandedIds = [],
  onSelect,
}: Props) {
  const [query, setQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(defaultExpandedIds),
  );

  const visibleIds = useMemo<Set<string> | null>(() => {
    const q = query.trim();
    if (!q) return null;
    return collectMatchingAndAncestors(data, q);
  }, [data, query]);

  function toggle(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function renderNode(node: TeamNode, depth: number): React.ReactNode {
    if (visibleIds !== null && !visibleIds.has(node.id)) return null;

    const hasChildren = (node.children?.length ?? 0) > 0;
    const isExpanded = expandedIds.has(node.id);
    const isSelected = selectedId === node.id;

    return (
      <div key={node.id}>
        <div
          className={cn(
            "flex items-center gap-1.5 py-1.5 pr-3 rounded-md text-sm cursor-pointer select-none transition-colors",
            isSelected
              ? "bg-brown-100 text-brown-900 font-medium"
              : "text-brown-700 hover:bg-brown-50",
          )}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={() => onSelect(node.id)}
        >
          <span
            className="w-4 h-4 flex items-center justify-center flex-none"
            onClick={(e) => {
              if (!hasChildren) return;
              e.stopPropagation();
              toggle(node.id);
            }}
          >
            {hasChildren && <ChevronIcon open={isExpanded} />}
          </span>

          <FolderIcon open={isExpanded} active={isSelected} />

          <span className="flex-1 truncate leading-snug">{node.name}</span>

          <Badge
            variant="secondary"
            className="ml-auto flex-none h-5 min-w-[20px] px-1.5 text-xs font-normal rounded-md"
          >
            {node.members}
          </Badge>
        </div>

        {hasChildren && isExpanded && (
          <div>{(node.children ?? []).map((child) => renderNode(child, depth + 1))}</div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="p-3 border-b border-brown-200 flex-none">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brown-400 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <Input
              placeholder="Search teams..."
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>

          <Button
            size="icon"
            aria-label="Add team"
            className="flex-none h-9 w-9 rounded-lg bg-brown-500 text-white border border-brown-500 hover:bg-brown-600 hover:border-brown-600 active:translate-y-px"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 min-h-0">
        {data.map((node) => renderNode(node, 0))}
      </div>
    </div>
  );
}
