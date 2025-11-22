import localFont from "next/font/local";

export const helveticaNeue = localFont({
  src: [
    // Thin / 100
    { path: "./helvetica-neue/HelveticaNeueThin.otf", weight: "100", style: "normal" },
    { path: "./helvetica-neue/HelveticaNeueThinItalic.otf", weight: "100", style: "italic" },

    // UltraLight / 200
    { path: "./helvetica-neue/HelveticaNeueUltraLight.otf", weight: "200", style: "normal" },
    { path: "./helvetica-neue/HelveticaNeueUltraLightItalic.otf", weight: "200", style: "italic" },

    // Light / 300
    { path: "./helvetica-neue/HelveticaNeueLight.otf", weight: "300", style: "normal" },
    { path: "./helvetica-neue/HelveticaNeueLightItalic.otf", weight: "300", style: "italic" },

    // Regular / 400  (a.k.a. Roman in your set)
    { path: "./helvetica-neue/HelveticaNeueRoman.otf", weight: "400", style: "normal" },
    { path: "./helvetica-neue/HelveticaNeueItalic.ttf", weight: "400", style: "italic" },

    // Medium / 500
    { path: "./helvetica-neue/HelveticaNeueMedium.otf", weight: "500", style: "normal" },
    { path: "./helvetica-neue/HelveticaNeueMediumItalic.otf", weight: "500", style: "italic" },

    // Bold / 700
    { path: "./helvetica-neue/HelveticaNeueBold.otf", weight: "700", style: "normal" },
    { path: "./helvetica-neue/HelveticaNeueBoldItalic.otf", weight: "700", style: "italic" },

    // Heavy / 800
    { path: "./helvetica-neue/HelveticaNeueHeavy.otf", weight: "800", style: "normal" },
    { path: "./helvetica-neue/HelveticaNeueHeavyItalic.otf", weight: "800", style: "italic" },

    // Black / 900
    { path: "./helvetica-neue/HelveticaNeueBlack.otf", weight: "900", style: "normal" },
    { path: "./helvetica-neue/HelveticaNeueBlackItalic.otf", weight: "900", style: "italic" },
  ],
  variable: "--font-sans",
  display: "swap",
  fallback: [
    "Helvetica",
    "Arial",
    "ui-sans-serif",
    "system-ui",
    "-apple-system",
    "Segoe UI",
    "Roboto",
  ],
});
