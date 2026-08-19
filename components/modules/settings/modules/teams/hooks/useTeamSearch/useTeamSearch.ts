"use client";

import { useMemo } from "react";

import type { TeamTreeNode } from "@/models/teams";

export type TeamSearchResult = {
  /** Ids of the teams matching the query, in canvas (depth-first) order. */
  matchIds: string[];
  matchSet: Set<string>;
  /** Ancestor chain of every team, so a picked result can be revealed on demand. */
  ancestorsById: Map<string, string[]>;
};

function normalize(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

/**
 * Matching only. Typing never re-shapes the tree — branches open when a result is actually picked,
 * which keeps the canvas still while someone is still typing.
 */
export function useTeamSearch(
  tree: TeamTreeNode[],
  query: string,
): TeamSearchResult {
  return useMemo(() => {
    const ancestorsById = new Map<string, string[]>();
    const term = normalize(query);
    const matchIds: string[] = [];

    const walk = (node: TeamTreeNode, ancestors: string[]) => {
      ancestorsById.set(node.id, ancestors);
      if (term) {
        const hit = normalize(node.name).includes(term) || normalize(node.code).includes(term);
        if (hit) matchIds.push(node.id);
      }
      node.children?.forEach((child) => walk(child, [...ancestors, node.id]));
    };
    tree.forEach((root) => walk(root, []));

    return { matchIds, matchSet: new Set(matchIds), ancestorsById };
  }, [tree, query]);
}
