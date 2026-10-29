import type { SearchKind } from "@/models/search";

export interface SearchItemDTO {
  id: string;
  title: string;
  subtitle: string | null;
  avatarUrl: string | null;
  status: string | null;
  accountStatus: string | null;
  parentId: string | null;
}

export interface SearchGroupDTO {
  kind: SearchKind;
  total: number;
  truncated: boolean;
  items: SearchItemDTO[];
}

export interface SearchResponseDTO {
  groups: SearchGroupDTO[];
}
