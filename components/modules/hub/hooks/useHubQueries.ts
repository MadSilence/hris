"use client";

import { keepPreviousData, useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import type {
  AgreementTab,
  AudienceResolved,
  FeedScope,
  Handbook,
  HubAudience,
  HubHome,
  HubPage,
  HubSearchResult,
  HubSettings,
  ManagePostRow,
  MyAgreements,
  Overview,
  PageEdit,
  PageTree,
  Post,
  PostEdit,
  PostPage,
  PostStatusFilter,
  PostType,
  SavedItem,
  SectionDeleteImpact,
  WhoAgreed,
} from "@/models/hub";

/** Every hub key starts with `HUB`, so one invalidation refreshes the whole module after a write. */
export const hubQueryKeys = {
  root: ["HUB"] as const,
  home: (scope: FeedScope) => ["HUB", "HOME", scope] as const,
  posts: (scope: FeedScope, type: PostType | null, q: string) => ["HUB", "POSTS", scope, type, q] as const,
  post: (id: string) => ["HUB", "POST", id] as const,
  handbook: ["HUB", "HANDBOOK"] as const,
  page: (id: string, preview: boolean) => ["HUB", "PAGE", id, preview] as const,
  agreements: ["HUB", "AGREEMENTS"] as const,
  saved: ["HUB", "SAVED"] as const,
  search: (q: string, pagesOnly: boolean) => ["HUB", "SEARCH", q, pagesOnly] as const,
  overview: ["HUB", "MANAGE", "OVERVIEW"] as const,
  managePosts: (status: PostStatusFilter, q: string) => ["HUB", "MANAGE", "POSTS", status, q] as const,
  postEdit: (id: string) => ["HUB", "MANAGE", "POST", id] as const,
  tree: ["HUB", "MANAGE", "TREE"] as const,
  pageEdit: (id: string) => ["HUB", "MANAGE", "PAGE", id] as const,
  whoAgreed: (id: string, tab: AgreementTab) => ["HUB", "MANAGE", "AGREED", id, tab] as const,
  sectionImpact: (id: string) => ["HUB", "MANAGE", "SECTION_IMPACT", id] as const,
  settings: ["HUB", "MANAGE", "SETTINGS"] as const,
  audience: (audience: HubAudience, q: string) => ["HUB", "AUDIENCE", audience, q] as const,
};

const qs = (params: Record<string, string | null | undefined>): string => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
  const text = search.toString();
  return text ? `?${text}` : "";
};

/** Refreshes everything the hub shows — after any write, since one act (a publish, an agreement) moves several counts. */
export const useInvalidateHub = () => {
  const queryClient = useQueryClient();
  return useCallback(() => queryClient.invalidateQueries({ queryKey: hubQueryKeys.root }), [queryClient]);
};

// ── the reader ──
export const useHubHome = (scope: FeedScope) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<HubHome>({
    queryKey: hubQueryKeys.home(scope),
    queryFn: () => internalApiClient.get<HubHome>(`/hub/home${qs({ scope })}`),
    placeholderData: keepPreviousData,
  });
};

/** CH02: 20 a page, the next page when the reader nears the end. */
export const useHubPosts = (scope: FeedScope, type: PostType | null, q: string) => {
  const { internalApiClient } = useAppDataContext();
  return useInfiniteQuery<PostPage>({
    queryKey: hubQueryKeys.posts(scope, type, q),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      internalApiClient.get<PostPage>(`/hub/posts${qs({ scope, type, q: q.trim() || null, cursor: pageParam as string | null })}`),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    placeholderData: keepPreviousData,
  });
};

export const useHubPost = (id: string) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<Post>({ queryKey: hubQueryKeys.post(id), queryFn: () => internalApiClient.get<Post>(`/hub/posts/${id}`), retry: false });
};

export const useHandbook = () => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<Handbook>({ queryKey: hubQueryKeys.handbook, queryFn: () => internalApiClient.get<Handbook>("/hub/handbook") });
};

/** CP02; with `preview`, the editor's draft as a reader would see it (CM06 Preview). */
export const useHubPage = (id: string, preview = false) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<HubPage>({
    queryKey: hubQueryKeys.page(id, preview),
    queryFn: () => internalApiClient.get<HubPage>(preview ? `/hub/manage/pages/${id}/preview` : `/hub/pages/${id}`),
    retry: false,
  });
};

export const useMyAgreements = () => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<MyAgreements>({ queryKey: hubQueryKeys.agreements, queryFn: () => internalApiClient.get<MyAgreements>("/hub/agreements") });
};

export const useSavedItems = (enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<SavedItem[]>({
    queryKey: hubQueryKeys.saved,
    queryFn: () => internalApiClient.get<SavedItem[]>("/hub/saved"),
    enabled,
  });
};

export const useHubSearch = (q: string, pagesOnly = false) => {
  const { internalApiClient } = useAppDataContext();
  const term = q.trim();
  return useQuery<HubSearchResult>({
    queryKey: hubQueryKeys.search(term, pagesOnly),
    queryFn: () => internalApiClient.get<HubSearchResult>(`/hub/search${qs({ q: term, pagesOnly: pagesOnly ? "true" : null })}`),
    enabled: term.length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
};

// ── managing ──
export const useHubOverview = () => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<Overview>({ queryKey: hubQueryKeys.overview, queryFn: () => internalApiClient.get<Overview>("/hub/manage/overview") });
};

export const useManagePosts = (status: PostStatusFilter, q: string) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<ManagePostRow[]>({
    queryKey: hubQueryKeys.managePosts(status, q.trim()),
    queryFn: () => internalApiClient.get<ManagePostRow[]>(`/hub/manage/posts${qs({ status, q: q.trim() || null })}`),
    placeholderData: keepPreviousData,
  });
};

export const usePostEdit = (id: string | null) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<PostEdit>({
    queryKey: hubQueryKeys.postEdit(id ?? ""),
    queryFn: () => internalApiClient.get<PostEdit>(`/hub/manage/posts/${id}`),
    enabled: Boolean(id),
    staleTime: 0,
  });
};

export const usePageTree = () => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<PageTree>({ queryKey: hubQueryKeys.tree, queryFn: () => internalApiClient.get<PageTree>("/hub/manage/pages") });
};

/** The editor reads the page once; autosave writes the cache rather than reading it again. */
export const usePageEdit = (id: string) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<PageEdit>({
    queryKey: hubQueryKeys.pageEdit(id),
    queryFn: () => internalApiClient.get<PageEdit>(`/hub/manage/pages/${id}`),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    retry: false,
  });
};

export const useWhoAgreed = (id: string, tab: AgreementTab) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<WhoAgreed>({
    queryKey: hubQueryKeys.whoAgreed(id, tab),
    queryFn: () => internalApiClient.get<WhoAgreed>(`/hub/manage/pages/${id}/agreements${qs({ tab })}`),
    placeholderData: keepPreviousData,
  });
};

export const useSectionDeleteImpact = (id: string | null) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<SectionDeleteImpact>({
    queryKey: hubQueryKeys.sectionImpact(id ?? ""),
    queryFn: () => internalApiClient.get<SectionDeleteImpact>(`/hub/manage/sections/${id}/delete-impact`),
    enabled: Boolean(id),
    staleTime: 0,
  });
};

export const useHubSettings = () => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<HubSettings>({ queryKey: hubQueryKeys.settings, queryFn: () => internalApiClient.get<HubSettings>("/hub/manage/settings") });
};

/** CM07's live count, avatars and "See who" list. */
export const useAudienceResolve = (audience: HubAudience, q = "", enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  const term = q.trim().length >= 2 ? q.trim() : "";
  return useQuery<AudienceResolved>({
    queryKey: hubQueryKeys.audience(audience, term),
    queryFn: () => internalApiClient.post<AudienceResolved>("/hub/audience/resolve", { audience, q: term || null, limit: 50 }),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
};
