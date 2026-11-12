import type { AgreementTab, FeedScope, PostStatusFilter, PostType } from "@/models/hub";

/*
 * The query values the hub's reads accept, copied value by value: what reaches Java is what the screens can ask
 * for, nothing more.
 */

export const feedScopeOf = (params: URLSearchParams): FeedScope => (params.get("scope") === "FOR_ME" ? "FOR_ME" : "ALL");

const POST_TYPES: PostType[] = ["ANNOUNCEMENT", "POLICY_UPDATE", "EVENT"];
export const postTypeOf = (value: string | null): PostType | null =>
  POST_TYPES.includes(value as PostType) ? (value as PostType) : null;

const STATUSES: PostStatusFilter[] = ["ALL", "PUBLISHED", "SCHEDULED", "DRAFT"];
export const postStatusOf = (value: string | null): PostStatusFilter =>
  STATUSES.includes(value as PostStatusFilter) ? (value as PostStatusFilter) : "ALL";

export const agreementTabOf = (value: string | null): AgreementTab => (value === "AGREED" ? "AGREED" : "NOT_YET");

export const textOf = (value: string | null): string | null => {
  const text = value?.trim() ?? "";
  return text ? text.slice(0, 200) : null;
};
