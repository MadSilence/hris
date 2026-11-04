import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";

/*
 * The three families of the noddo design system (SPEC § 5, fonts.md), self-hosted by next/font.
 *
 * Every subset is requested because names arrive in any script: Latin with any diacritics, Cyrillic and Greek
 * are guaranteed. The browser downloads only the subsets a page actually uses, through `unicode-range`.
 * next/font gives each family a generated name, so the token stacks in `styles/globals.css` point at these
 * variables rather than at "Inter". The options are written out in every call: next/font reads them at
 * build time and accepts literals only.
 */
export const interFont = Inter({
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext", "greek", "greek-ext", "vietnamese"],
  variable: "--font-family-inter",
  display: "swap",
});

export const interTightFont = Inter_Tight({
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext", "greek", "greek-ext", "vietnamese"],
  weight: ["500", "600"],
  variable: "--font-family-inter-tight",
  display: "swap",
});

export const jetBrainsMonoFont = JetBrains_Mono({
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext", "greek", "vietnamese"],
  weight: ["400", "500"],
  variable: "--font-family-jetbrains-mono",
  display: "swap",
});

export const fontVariables = [interFont.variable, interTightFont.variable, jetBrainsMonoFont.variable].join(" ");
