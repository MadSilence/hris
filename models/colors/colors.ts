export const SOFT_PALETTE = [
  "#FF7A7A",
  "#FF9A5B",
  "#FFC857",
  "#7DD36C",
  "#44C6B5",
  "#5EC8FF",
  "#6B8CFF",
  "#8B79FF",
  "#B377F2",
  "#FF77C7",
] as const;

export type SoftColor = typeof SOFT_PALETTE[number];
