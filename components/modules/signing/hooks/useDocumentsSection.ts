"use client";

import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { internalApiClient } from "@/components/clients/apiClient";
import type {
  DocumentRequestRow,
  DocumentTemplateDTO,
  ExpiringRow,
  SectionCounts,
  SectionDocumentsPage,
  SectionSigningRow,
  SectionSort,
} from "@/api/modules/signing/dto";

export type SectionFilters = { q: string; personIds: string[]; categoryIds: string[] };

const PAGE = 50;

const params = (f: SectionFilters, extra: Record<string, string> = {}) => {
  const p = new URLSearchParams(extra);
  if (f.q.trim()) p.set("q", f.q.trim());
  f.personIds.forEach((id) => p.append("personIds", id));
  f.categoryIds.forEach((id) => p.append("categoryIds", id));
  const s = p.toString();
  return s ? `?${s}` : "";
};

export const sectionKeys = {
  all: ["SIGNING", "SECTION"] as const,
  documents: (f: SectionFilters, sort: SectionSort, asc: boolean) => ["SIGNING", "SECTION", "DOCUMENTS", f, sort, asc] as const,
  signings: (f: SectionFilters) => ["SIGNING", "SECTION", "SIGNINGS", f] as const,
  requests: ["SIGNING", "SECTION", "REQUESTS"] as const,
  expiring: ["SIGNING", "SECTION", "EXPIRING"] as const,
  counts: ["SIGNING", "SECTION", "COUNTS"] as const,
};

/** D01: every document the reader may see, fifty at a time — the list scrolls on, with no pages. */
export const useSectionDocuments = (f: SectionFilters, sort: SectionSort, asc: boolean) =>
  useInfiniteQuery<SectionDocumentsPage>({
    queryKey: sectionKeys.documents(f, sort, asc),
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      internalApiClient.get<SectionDocumentsPage>(
        `/documents/section/documents${params(f, { sort, asc: String(asc), offset: String(pageParam), size: String(PAGE) })}`,
      ),
    getNextPageParam: (last, pages) => {
      const loaded = pages.reduce((n, p) => n + p.rows.length, 0);
      return loaded < last.total ? loaded : undefined;
    },
    placeholderData: keepPreviousData,
  });

export const useSectionSignings = (f: SectionFilters, enabled: boolean) =>
  useQuery<SectionSigningRow[]>({
    queryKey: sectionKeys.signings(f),
    queryFn: () => internalApiClient.get<SectionSigningRow[]>(`/documents/section/signings${params(f)}`),
    enabled,
  });

export const useSectionRequests = (enabled: boolean) =>
  useQuery<DocumentRequestRow[]>({
    queryKey: sectionKeys.requests,
    queryFn: () => internalApiClient.get<DocumentRequestRow[]>(`/documents/section/requests`),
    enabled,
  });

export const useSectionExpiring = (enabled: boolean) =>
  useQuery<ExpiringRow[]>({
    queryKey: sectionKeys.expiring,
    queryFn: () => internalApiClient.get<ExpiringRow[]>(`/documents/section/expiring`),
    enabled,
  });

export const useSectionCounts = () =>
  useQuery<SectionCounts>({
    queryKey: sectionKeys.counts,
    queryFn: () => internalApiClient.get<SectionCounts>(`/documents/section/counts`),
  });

/** The company's document templates, for a signing step or a Sign task to pick one (9.7). */
export const useDocumentTemplates = (enabled = true) =>
  useQuery<DocumentTemplateDTO[]>({
    queryKey: ["SIGNING", "TEMPLATES"],
    queryFn: () => internalApiClient.get<DocumentTemplateDTO[]>("/documents/templates"),
    enabled,
    staleTime: 60_000,
  });
