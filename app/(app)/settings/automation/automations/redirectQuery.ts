export type SearchParams = Record<string, string | string[] | undefined>;

/** `path` with the same query string the old address was opened with. */
export const withQuery = (path: string, searchParams: SearchParams): string => {
  const query = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach((one) => query.append(key, one));
    else if (value !== undefined) query.append(key, value);
  });
  const text = query.toString();
  return text ? `${path}?${text}` : path;
};
