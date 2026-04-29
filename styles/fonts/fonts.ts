import localFont from "next/font/local";

export const helveticaNeue = localFont({
  src: [
    { path: "./helvetica-neue/HelveticaNeueThin.otf", weight: "100", style: "normal" },
    { path: "./helvetica-neue/HelveticaNeueThinItalic.otf", weight: "100", style: "italic" },
    { path: "./helvetica-neue/HelveticaNeueUltraLight.otf", weight: "200", style: "normal" },
    { path: "./helvetica-neue/HelveticaNeueUltraLightItalic.otf", weight: "200", style: "italic" },
    { path: "./helvetica-neue/HelveticaNeueLight.otf", weight: "300", style: "normal" },
    { path: "./helvetica-neue/HelveticaNeueLightItalic.otf", weight: "300", style: "italic" },
    { path: "./helvetica-neue/HelveticaNeueRoman.otf", weight: "400", style: "normal" },
    { path: "./helvetica-neue/HelveticaNeueItalic.ttf", weight: "400", style: "italic" },
    { path: "./helvetica-neue/HelveticaNeueMedium.otf", weight: "500", style: "normal" },
    { path: "./helvetica-neue/HelveticaNeueMediumItalic.otf", weight: "500", style: "italic" },
    { path: "./helvetica-neue/HelveticaNeueBold.otf", weight: "700", style: "normal" },
    { path: "./helvetica-neue/HelveticaNeueBoldItalic.otf", weight: "700", style: "italic" },
    { path: "./helvetica-neue/HelveticaNeueHeavy.otf", weight: "800", style: "normal" },
    { path: "./helvetica-neue/HelveticaNeueHeavyItalic.otf", weight: "800", style: "italic" },
    { path: "./helvetica-neue/HelveticaNeueBlack.otf", weight: "900", style: "normal" },
    { path: "./helvetica-neue/HelveticaNeueBlackItalic.otf", weight: "900", style: "italic" },
  ],
  variable: "--font-sans",
  display: "swap",
  fallback: ["Helvetica", "Arial", "ui-sans-serif", "system-ui"],
});
