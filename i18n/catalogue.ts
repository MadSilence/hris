import type { AppLocale } from "./locales";
import type { Messages } from "./messages";

let browserMessages: Messages | null = null;

/** The page's own catalogue, which the provider already holds. `LocaleBridge` hands it over during render. */
export const setBrowserCatalogue = (messages: Messages): void => {
  browserMessages = messages;
};

/**
 * The catalogue for code that is a plain function, not a hook, and runs on both sides.
 *
 * On the server, the full catalogues. In the browser, the one the page was rendered with: importing
 * `./messages` from client code puts every language of every area into the JavaScript of every page, and the
 * bundler drops this `require` from the client build because the `typeof window` test is constant there.
 */
export const catalogueFor = (locale: AppLocale): Messages => {
  if (typeof window === "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return (require("./messages") as typeof import("./messages")).messagesFor(locale);
  }
  if (!browserMessages) throw new Error("catalogueFor: LocaleBridge has not rendered yet");
  return browserMessages;
};
