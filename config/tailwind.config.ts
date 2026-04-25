import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./public/desact/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      /* Colors (all via HSL triplets; opacity modifiers work) */
      colors: {
        background: "hsl(var(--surface-page) / <alpha-value>)",
        foreground: "hsl(var(--text-body) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--surface-action-1) / <alpha-value>)",
          foreground: "hsl(var(--text-on-action) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--surface-secondary) / <alpha-value>)",
          foreground: "hsl(var(--text-body) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--surface-highlight) / <alpha-value>)",
          foreground: "hsl(var(--text-body) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--surface-secondary) / <alpha-value>)",
          foreground: "hsl(var(--text-body) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--surface-error) / <alpha-value>)",
          foreground: "hsl(var(--text-on-action) / <alpha-value>)",
        },
        input: "hsl(var(--border-primary) / <alpha-value>)",
        ring: "hsl(var(--border-focus) / <alpha-value>)",
        text: {
          headings: "hsl(var(--text-headings) / <alpha-value>)",
          body: "hsl(var(--text-body) / <alpha-value>)",
          action: "hsl(var(--text-action) / <alpha-value>)",
          "action-hover": "hsl(var(--text-action-hover) / <alpha-value>)",
          disabled: "hsl(var(--text-disabled) / <alpha-value>)",
          highlight: "hsl(var(--text-highlight) / <alpha-value>)",
          information: "hsl(var(--text-information) / <alpha-value>)",
          success: "hsl(var(--text-success) / <alpha-value>)",
          warning: "hsl(var(--text-warning) / <alpha-value>)",
          error: "hsl(var(--text-error) / <alpha-value>)",
          "on-action": "hsl(var(--text-on-action) / <alpha-value>)",
          "on-disabled": "hsl(var(--text-on-disabled) / <alpha-value>)",
        },
        icon: {
          primary: "hsl(var(--icon-primary) / <alpha-value>)",
          information: "hsl(var(--icon-information) / <alpha-value>)",
          success: "hsl(var(--icon-success) / <alpha-value>)",
          warning: "hsl(var(--icon-warning) / <alpha-value>)",
          error: "hsl(var(--icon-error) / <alpha-value>)",
        },
        surface: {
          page: "hsl(var(--surface-page) / <alpha-value>)",
          primary: "hsl(var(--surface-primary) / <alpha-value>)",
          secondary: "hsl(var(--surface-secondary) / <alpha-value>)",
          disabled: "hsl(var(--surface-disabled) / <alpha-value>)",
          success: "hsl(var(--surface-success) / <alpha-value>)",
          error: "hsl(var(--surface-error) / <alpha-value>)",
          warning: "hsl(var(--surface-warning) / <alpha-value>)",
          information: "hsl(var(--surface-information) / <alpha-value>)",
          highlight: "hsl(var(--surface-highlight) / <alpha-value>)",
          "action-1": "hsl(var(--surface-action-1) / <alpha-value>)",
          "action-1-hover": "hsl(var(--surface-action-1-hover) / <alpha-value>)",
          "action-2": "hsl(var(--surface-action-2))" /* already includes alpha */,
          "action-2-hover": "hsl(var(--surface-action-2-hover) / <alpha-value>)",
          modal: "hsl(var(--surface-modal))" /* already includes alpha */,
        },
        border: {
          primary: "hsl(var(--border-primary) / <alpha-value>)",
          secondary: "hsl(var(--border-secondary) / <alpha-value>)",
          information: "hsl(var(--border-information) / <alpha-value>)",
          success: "hsl(var(--border-success) / <alpha-value>)",
          warning: "hsl(var(--border-warning) / <alpha-value>)",
          error: "hsl(var(--border-error) / <alpha-value>)",
          highlight: "hsl(var(--border-highlight) / <alpha-value>)",
          disabled: "hsl(var(--border-disabled) / <alpha-value>)",
          action: "hsl(var(--border-action) / <alpha-value>)",
          "action-hover": "hsl(var(--border-action-hover) / <alpha-value>)",
          focus: "hsl(var(--border-focus) / <alpha-value>)",
        },
      },

      /* Spacing (rem) */
      spacing: {
        0: "var(--space-0)",
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        5: "var(--space-5)",
        6: "var(--space-6)",
        7: "var(--space-7)",
        8: "var(--space-8)",
        9: "var(--space-9)",
      },

      /* Border radii */
      borderRadius: {
        none: "var(--radius-none)",
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        round: "var(--radius-round)",
        input: "var(--radius-input-sem)",
        button: "var(--radius-button-sem)",
        card: "var(--radius-card-sem)",
        alert: "var(--radius-alert-sem)",
      },

      /* Border width */
      borderWidth: {
        DEFAULT: "var(--border-sm)",
        0: "var(--border-none)",
        1: "var(--border-sm)",
        2: "var(--border-md)",
        4: "var(--border-lg)",
      },

      /* Box shadows */
      boxShadow: {
        sm: "var(--shadow-sm-sem)",
        DEFAULT: "var(--shadow-md-sem)",
        md: "var(--shadow-md-sem)",
        lg: "var(--shadow-lg-sem)",
        xl: "var(--shadow-xl-sem)",
      },

      /* Typography */
      fontFamily: {
        sans: "var(--font-sans)",
        mono: "var(--font-mono)",
      },
      fontSize: {
        xs: ["var(--font-size-xs)", { lineHeight: "var(--line-height-xs)" }],
        sm: ["var(--font-size-sm)", { lineHeight: "var(--line-height-sm)" }],
        base: ["var(--font-size-base)", { lineHeight: "var(--line-height-base)" }],
        lg: ["var(--font-size-lg)", { lineHeight: "var(--line-height-lg)" }],
        xl: ["var(--font-size-xl)", { lineHeight: "var(--line-height-xl)" }],
        "2xl": ["var(--font-size-2xl)", { lineHeight: "var(--line-height-2xl)" }],
      },

      /* Motion */
      transitionDuration: {
        150: "var(--duration-fast)",
        200: "var(--duration-base)",
        300: "var(--duration-slow)",
      },
      transitionTimingFunction: {
        DEFAULT: "var(--easing-standard)",
        emphasized: "var(--easing-emphasized)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};

export default config;
