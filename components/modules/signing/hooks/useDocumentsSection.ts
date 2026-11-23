"use client";

import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { internalApiClient } from "@/components/clients/apiClient";
import type {
  DocumentRequestRow,
  DocumentTemplateDTO,
  SectionCounts,
  SectionDocumentsPage,
  SectionExpiringRow,
  SectionFacets,
  SectionSigningRow,
  SectionSort,
} from "@/api/modules/signing/dto";

export type SectionFilters = { q: string; personIds: string[]; categoryIds: string[] };

/** No filter at all — Home's Expiring widget reads the whole list. */
export const NO_SECTION_FILTERS: SectionFilters = { q: "", personIds: [], categoryIds: [] };

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
  documents: (f: SectionFilters, sort: SectionSort, asc: boolean, pdfOnly = false) =>
    ["SIGNING", "SECTION", "DOCUMENTS", f, sort, asc, pdfOnly] as const,
  signings: (f: SectionFilters) => ["SIGNING", "SECTION", "SIGNINGS", f] as const,
  requests: (f: SectionFilters) => ["SIGNING", "SECTION", "REQUESTS", f] as const,
  expiring: (f: SectionFilters) => ["SIGNING", "SECTION", "EXPIRING", f] as const,
  counts: (f: SectionFilters) => ["SIGNING", "SECTION", "COUNTS", f] as const,
  facets: (personIds: string[], categoryIds: string[]) => ["SIGNING", "SECTION", "FACETS", personIds, categoryIds] as const,
};

/**
 * D01: every document the reader may see, fifty at a time — the list scrolls on, with no pages. `pdfOnly` is the
 * signing picker's list (D14, DS19): only the files that can be sent for signature.
 */
export const useSectionDocuments = (f: SectionFilters, sort: SectionSort, asc: boolean, opts: { pdfOnly?: boolean; enabled?: boolean } = {}) =>
  useInfiniteQuery<SectionDocumentsPage>({
    queryKey: sectionKeys.documents(f, sort, asc, opts.pdfOnly ?? false),
    initialPageParam: 0,
    enabled: opts.enabled ?? true,
    queryFn: ({ pageParam }) =>
      internalApiClient.get<SectionDocumentsPage>(
        `/documents/section/documents${params(f, {
          sort,
          asc: String(asc),
          offset: String(pageParam),
          size: String(PAGE),
          ...(opts.pdfOnly ? { pdfOnly: "true" } : {}),
        })}`,
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

export const useSectionRequests = (f: SectionFilters, enabled: boolean) =>
  useQuery<DocumentRequestRow[]>({
    queryKey: sectionKeys.requests(f),
    queryFn: () => internalApiClient.get<DocumentRequestRow[]>(`/documents/section/requests${params(f)}`),
    enabled,
  });

export const useSectionExpiring = (f: SectionFilters, enabled: boolean) =>
  useQuery<SectionExpiringRow[]>({
    queryKey: sectionKeys.expiring(f),
    queryFn: () => internalApiClient.get<SectionExpiringRow[]>(`/documents/section/expiring${params(f)}`),
    enabled,
  });

/** The view switch's counts follow the filters (DS5); the previous ones stay while the next load, so nothing jumps. */
export const useSectionCounts = (f: SectionFilters) =>
  useQuery<SectionCounts>({
    queryKey: sectionKeys.counts(f),
    queryFn: () => internalApiClient.get<SectionCounts>(`/documents/section/counts${params(f)}`),
    placeholderData: keepPreviousData,
  });

/** The Person and Category menus' choices and counts (D05, DS7, DS8). */
export const useSectionFacets = (personIds: string[], categoryIds: string[]) =>
  useQuery<SectionFacets>({
    queryKey: sectionKeys.facets(personIds, categoryIds),
    queryFn: () =>
      internalApiClient.get<SectionFacets>(
        `/documents/section/facets${params({ q: "", personIds, categoryIds })}`,
      ),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

/** The company's document templates, for a signing step or a Sign task to pick one (9.7). */
export const useDocumentTemplates = (enabled = true) =>
  useQuery<DocumentTemplateDTO[]>({
    queryKey: ["SIGNING", "TEMPLATES"],
    queryFn: () => internalApiClient.get<DocumentTemplateDTO[]>("/documents/templates"),
    enabled,
    staleTime: 60_000,
  });
