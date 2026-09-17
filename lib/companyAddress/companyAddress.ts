/**
 * A company's address — the label in front of the root domain a person signs in at — and how a host
 * is read back into one.
 *
 * Pure and shared by the middleware, server components, the BFF and the browser, so the same host
 * cannot be read two ways in one request.
 */

export type WebAddressConfig = {
  scheme: string;
  /** `localhost:3000` locally; the port is part of it. */
  rootDomain: string;
};

export type HostKind = { kind: "root" } | { kind: "company"; subdomain: string };

/**
 * The address last typed into "sign in to your company", kept on the root's own host by that page. Not a
 * credential and not httpOnly: it holds only what the person typed. See `rememberedCompany.ts`.
 */
export const TYPED_COMPANY_COOKIE = "last_company_typed";

/** A DNS label is at most 63 characters. */
export const COMPANY_ADDRESS_MAX_LENGTH = 63;

/** Hosts that are the root under another name. */
const ROOT_ALIASES = ["www"];

/**
 * What somebody typed, turned into an address.
 *
 * **The twin of `SubdomainService.normalize` in the backend**, which is what registration gives out.
 * Both sides assert the same table of cases (`companyAddress.test.ts` and `SubdomainServiceTest`); a
 * change to one without the other sends step 1 to addresses no company can hold.
 */
export const normalizeCompanyAddress = (raw: string | null | undefined): string => {
  if (!raw) return "";

  const normalized = raw
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

  return normalized.length > COMPANY_ADDRESS_MAX_LENGTH
    ? normalized.slice(0, COMPANY_ADDRESS_MAX_LENGTH).replace(/-+$/, "")
    : normalized;
};

/**
 * Which kind of host a request arrived at.
 *
 * Anything that is not `<label>.<root>` reads as the root — an IP address, a misconfigured domain, a
 * deeper subdomain. The root is the safe answer: it holds nothing that belongs to a company.
 */
export const parseHost = (host: string | null | undefined, rootDomain: string): HostKind => {
  if (!host) return { kind: "root" };
  const h = host.trim().toLowerCase();
  const root = rootDomain.trim().toLowerCase();

  if (h === root) return { kind: "root" };

  const suffix = `.${root}`;
  if (!h.endsWith(suffix)) return { kind: "root" };

  const label = h.slice(0, -suffix.length);
  if (!label || label.includes(".") || ROOT_ALIASES.includes(label)) return { kind: "root" };
  if (label !== normalizeCompanyAddress(label)) return { kind: "root" };

  return { kind: "company", subdomain: label };
};

/** `http://localhost:3000` */
export const rootOrigin = (config: WebAddressConfig): string => `${config.scheme}://${config.rootDomain}`;

/** `acme.localhost:3000` — the address as a person reads it. */
export const companyHost = (subdomain: string, config: WebAddressConfig): string =>
  `${subdomain}.${config.rootDomain}`;

/** `http://acme.localhost:3000` */
export const companyOrigin = (subdomain: string, config: WebAddressConfig): string =>
  `${config.scheme}://${companyHost(subdomain, config)}`;

/**
 * The host a request was made to, as the browser typed it.
 *
 * `x-forwarded-host` first: behind a proxy `host` is the proxy's own address, and reading it would
 * put every company on the root.
 */
export const requestHost = (headers: { get(name: string): string | null }): string | null =>
  headers.get("x-forwarded-host")?.split(",")[0]?.trim() || headers.get("host");
