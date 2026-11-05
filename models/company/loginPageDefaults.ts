/**
 * What a login page says when its company has not said anything. One place: the login page itself and
 * the Appearance preview both read these, so the preview cannot promise a page the login does not show.
 *
 * The words are keys of the `auth` catalogue, translated where they render — into the reader's language,
 * which is the point: they are the product's default, not company content. **Never store the translated
 * text as the company's headline**; an empty headline is how a company says "use the default".
 */
export const DEFAULT_LOGIN_HEADLINE_KEY = "login.defaults.headline" as const;
export const DEFAULT_LOGIN_SUBHEADLINE_KEY = "login.defaults.subheadline" as const;
