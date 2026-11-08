/*
 * The 59 ring illustrations of the noddo design system (SPEC § 10), generated from the package's
 * `assets/illustrations/*.svg` by `generate.mjs` beside this file — regenerate rather than edit by hand. The
 * provenance manifests the files carry are left out of the bundle; the package keeps them.
 *
 * One object in Ink, exactly one ring in the accent (`currentColor`), gray support lines, one baseline; every
 * colour is a CSS variable, so the same scene works on any accent and in the dark theme. `onboarding-on-wine` is
 * the one drawn for a Wine or Ink background.
 */
import * as React from "react";

export const SCENES = {
  "all-approved-l": (
    <>
      <circle data-role="ring" cx="120" cy="72" r="38" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ring" d="M102 74 L115 87 L140 60" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M58 46 L68 52 M54 84 H66 M180 44 L170 52 M186 84 H174 M120 14 V22" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "all-approved": (
    <>
      <path data-role="baseline" d="M30 136 H210" style={{ fill: "none", stroke: "var(--illustration-baseline)" }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="120" cy="72" r="38" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ring" d="M102 74 L115 87 L140 60" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M58 46 L68 52 M54 84 H66 M180 44 L170 52 M186 84 H174 M120 14 V22" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "all-caught-up": (
    <>
      <path data-role="baseline" d="M30 136 H210" strokeWidth="3" style={{ stroke: "var(--illustration-baseline)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M50 90 V116 Q50 122 56 122 H184 Q190 122 190 116 V90 Q190 84 188 80 L172 44 Q170 40 165 40 H75 Q70 40 68 44 L52 80 Q50 84 50 90 Z M50 84 H88 Q92 84 94 88 L98 96 Q100 100 104 100 H136 Q140 100 142 96 L146 88 Q148 84 152 84 H190" strokeWidth="7" style={{ stroke: "var(--illustration-ink)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="120" cy="68" r="18" strokeWidth="7" stroke="currentColor" style={{ fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ring" d="M112 69 L118 75 L128 63" strokeWidth="5" stroke="currentColor" style={{ fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "analytics": (
    <>
      <path data-role="baseline" d="M30 136 H210" style={{ fill: "none", stroke: "var(--illustration-baseline)" }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support-light" d="M40 118 L80 108 L120 112 L160 100 L200 98" style={{ fill: "none", stroke: "var(--illustration-support-light)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M40 112 L76 90 L106 100 L140 64 L162 78 L176 58" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="184" cy="46" r="10" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "announcements": (
    <>
      <path data-role="baseline" d="M30 136 H210" style={{ fill: "none", stroke: "var(--illustration-baseline)" }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <g transform="rotate(-14 110 80)">
      <rect data-role="ink" x="54" y="60" width="34" height="32" rx="10" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M88 67 Q88 63 92 62 L134 42 A8 8 0 0 1 145 49 V103 A8 8 0 0 1 134 110 L92 90 Q88 89 88 85" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="170" cy="76" r="10" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M190 58 A26 26 0 0 1 190 94" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
    </>
  ),
  "archive": (
    <>
      <path data-role="baseline" d="M30 136 H210" strokeWidth="3" style={{ stroke: "var(--illustration-baseline)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <g transform="rotate(-10 58 64)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
      <rect data-role="ink" x="58" y="38" width="124" height="26" rx="8" strokeWidth="7" style={{ stroke: "var(--illustration-ink)", fill: "none" }}/>
      <path data-role="support" d="M84 51 H100" strokeWidth="4" style={{ stroke: "var(--illustration-support)", fill: "none" }}/>
      </g>
      <path data-role="ink" d="M68 64 V120 A10 10 0 0 0 78 130 H162 A10 10 0 0 0 172 120 V64" strokeWidth="7" style={{ stroke: "var(--illustration-ink)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="120" cy="94" r="11" strokeWidth="7" stroke="currentColor" style={{ fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "attendance-s": (
    <>
      <circle data-role="ink" cx="120" cy="72" r="46" strokeWidth="7" style={{ stroke: "var(--illustration-ink)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M120 72 V54 M120 72 L134 80" strokeWidth="7" style={{ stroke: "var(--illustration-ink)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="120" cy="38" r="5" strokeWidth="5" stroke="currentColor" style={{ fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "attendance": (
    <>
      <path data-role="baseline" d="M30 136 H210" style={{ fill: "none", stroke: "var(--illustration-baseline)" }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ink" cx="120" cy="72" r="46" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M158 72 H152 M120 110 V104 M82 72 H88" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M120 72 V54 M120 72 L134 80" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="120" cy="38" r="5" stroke="currentColor" style={{ fill: "none" }} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "automations": (
    <>
      <path data-role="baseline" d="M30 136 H210" strokeWidth="3" style={{ stroke: "var(--illustration-baseline)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M60 66 H80 M54 82 H70" strokeWidth="4" style={{ stroke: "var(--illustration-support)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M129.1 60 L129.9 27 Q130 21 126.9 26.1 L97.1 75.9 Q94 81 100 81 H115 Q121 81 120.4 86.9 L116.6 124 Q116 130 119.3 125.1 L155.7 71 Q159 66 153 66 H135 Q129 66 129.1 60 Z" strokeWidth="7" style={{ stroke: "var(--illustration-ink)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="184" cy="46" r="15" strokeWidth="7" stroke="currentColor" style={{ fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "benefits": (
    <>
      <path data-role="baseline" d="M30 136 H210" style={{ fill: "none", stroke: "var(--illustration-baseline)" }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <rect data-role="ink" x="78" y="58" width="84" height="70" rx="16" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="120" cy="94" r="14" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M120 54 C110 36 94 34 94 46 C94 56 110 56 120 54 C130 36 146 34 146 46 C146 56 130 56 120 54 Z" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "calendar": (
    <>
      <path data-role="baseline" d="M30 136 H210" style={{ fill: "none", stroke: "var(--illustration-baseline)" }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <rect data-role="ink" x="64" y="24" width="112" height="104" rx="12" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M64 52 H176 M92 14 V32 M148 14 V32" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M84 74 H88 M108 74 H112 M132 74 H136 M84 102 H88 M108 102 H112" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="152" cy="99" r="12" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "career-s": (
    <>
      <path data-role="ink" d="M52 128 H82 Q88 128 88 122 V110 Q88 104 94 104 H114 Q120 104 120 98 V86 Q120 80 126 80 H146 Q152 80 152 74 V62 Q152 56 158 56 H188" strokeWidth="7" style={{ stroke: "var(--illustration-ink)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="170" cy="36" r="11" strokeWidth="7" stroke="currentColor" style={{ fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "career": (
    <>
      <path data-role="baseline" d="M30 136 H210" strokeWidth="3" style={{ stroke: "var(--illustration-baseline)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M52 128 H82 Q88 128 88 122 V110 Q88 104 94 104 H114 Q120 104 120 98 V86 Q120 80 126 80 H146 Q152 80 152 74 V62 Q152 56 158 56 H188" strokeWidth="7" style={{ stroke: "var(--illustration-ink)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="170" cy="36" r="11" strokeWidth="7" stroke="currentColor" style={{ fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M64 84 L84 64 M74 62 H85 V73" strokeWidth="4" style={{ stroke: "var(--illustration-support)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "celebrations": (
    <>
      <path data-role="baseline" d="M30 136 H210" style={{ fill: "none", stroke: "var(--illustration-baseline)" }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M62 118 L85 70 Q90 60 98 67 L116 85 Q123 93 114 97 L67 123 Q56 129 62 118 Z" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M74 102 L94 118 M84 82 L106 100" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M112 52 L116 34 M134 70 L152 64 M128 48 L140 36 M176 82 C184 74 178 66 190 60 M100 36 C96 28 104 22 98 14" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="176" cy="46" r="4" style={{ fill: "var(--illustration-support)" }} data-role="support-fill"/>
      <circle cx="150" cy="96" r="4" style={{ fill: "var(--illustration-support)" }} data-role="support-fill"/>
      <circle data-role="ring" cx="160" cy="26" r="9" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "coming-soon": (
    <>
      <path data-role="baseline" d="M30 136 H210" strokeWidth="3" style={{ stroke: "var(--illustration-baseline)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <g data-role="ink" strokeWidth="7" style={{ stroke: "var(--illustration-ink)" }} strokeLinecap="round" strokeLinejoin="round">
      <path d="M100 104 H140 Q145 104 144 109 L140 127 Q139 132 134 132 H106 Q101 132 100 127 L96 109 Q95 104 100 104 Z"/>
      <path d="M120 104 V70"/>
      <path d="M120 92 C108 92 100 84 98 74 C110 74 118 82 120 92"/>
      <path d="M120 84 C132 84 140 76 142 66 C130 66 122 74 120 84"/>
      </g>
      <circle data-role="ring" cx="120" cy="52" r="12" strokeWidth="7" stroke="currentColor" style={{ fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M86 52 H78 M154 52 H162 M120 31 V25" strokeWidth="4" style={{ stroke: "var(--illustration-support)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "company-hub": (
    <>
      <rect data-role="support" x="50" y="70" width="28" height="60" rx="10" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <rect data-role="support" x="166" y="84" width="28" height="46" rx="10" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <rect data-role="ink" x="90" y="24" width="64" height="106" rx="16" style={{ fill: "var(--illustration-knockout)", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="122" cy="50" r="10" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <rect data-role="support" x="104" y="72" width="10" height="10" rx="3" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <rect data-role="support" x="130" y="72" width="10" height="10" rx="3" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <rect data-role="support" x="104" y="92" width="10" height="10" rx="3" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <rect data-role="support" x="130" y="92" width="10" height="10" rx="3" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M113 126 V118 A9 9 0 0 1 131 118 V126" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "documents": (
    <>
      <path data-role="baseline" d="M30 136 H210" style={{ fill: "none", stroke: "var(--illustration-baseline)" }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <rect data-role="support" x="100" y="16" width="76" height="104" rx="10" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <rect data-role="ink" x="76" y="24" width="76" height="104" rx="10" style={{ fill: "var(--illustration-knockout)", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M92 50 H136 M92 66 H136 M92 82 H120" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="134" cy="108" r="12" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "equipment": (
    <>
      <path data-role="baseline" d="M30 136 H210" style={{ fill: "none", stroke: "var(--illustration-baseline)" }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <rect data-role="ink" x="66" y="30" width="108" height="74" rx="8" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M48 118 H192" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="120" cy="67" r="13" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "forms-s": (
    <>
      <rect data-role="ink" x="66" y="24" width="108" height="108" rx="14" strokeWidth="7" style={{ stroke: "var(--illustration-ink)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="120" cy="24" r="11" strokeWidth="7" stroke="currentColor" style={{ fill: "var(--illustration-knockout)" }} strokeLinecap="round" strokeLinejoin="round"/>
      <rect data-role="ink-fill" x="84" y="52" width="18" height="18" rx="5" style={{ fill: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="knockout" d="M88 61 L92 65 L98 57" strokeWidth="3" style={{ stroke: "var(--illustration-knockout)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "forms": (
    <>
      <path data-role="baseline" d="M30 136 H210" style={{ fill: "none", stroke: "var(--illustration-baseline)" }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <rect data-role="ink" x="66" y="24" width="108" height="108" rx="14" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="120" cy="24" r="11" stroke="currentColor" style={{ fill: "var(--illustration-knockout)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="84" y="52" width="18" height="18" rx="5" style={{ fill: "var(--illustration-ink)" }} data-role="ink-fill"/>
      <path d="M88 61 L92 65 L98 57" fill="none" stroke="var(--illustration-knockout)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M114 61 H156" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <rect data-role="support" x="84" y="86" width="18" height="18" rx="5" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M114 95 H148" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "goals-and-growth": (
    <>
      <path data-role="baseline" d="M30 136 H210" strokeWidth="3" style={{ stroke: "var(--illustration-baseline)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ink" cx="108" cy="76" r="48" strokeWidth="7" style={{ stroke: "var(--illustration-ink)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="support" cx="108" cy="76" r="29" strokeWidth="4" style={{ stroke: "var(--illustration-support)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="108" cy="76" r="10" strokeWidth="7" stroke="currentColor" style={{ fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M124 60 L196 18" strokeWidth="7" style={{ stroke: "var(--illustration-ink)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M184 14 Q196 16 198 28 M176 22 Q188 24 190 36" strokeWidth="4" style={{ stroke: "var(--illustration-support)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "hiring": (
    <>
      <path data-role="baseline" d="M30 136 H210" style={{ fill: "none", stroke: "var(--illustration-baseline)" }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ink" cx="112" cy="70" r="44" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M144 102 L176 130" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="112" cy="60" r="12" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ring" d="M94 92 A18 18 0 0 1 130 92" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "history-s": (
    <>
      <path data-role="ink" d="M96 52 V128 M118 34 H160" strokeWidth="7" style={{ stroke: "var(--illustration-ink)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="96" cy="34" r="10" strokeWidth="7" stroke="currentColor" style={{ fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "history": (
    <>
      <path data-role="baseline" d="M30 136 H210" strokeWidth="3" style={{ stroke: "var(--illustration-baseline)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M96 52 V128 M118 34 H160" strokeWidth="7" style={{ stroke: "var(--illustration-ink)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="96" cy="34" r="10" strokeWidth="7" stroke="currentColor" style={{ fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <g data-role="support" strokeWidth="4" style={{ stroke: "var(--illustration-support)" }} strokeLinecap="round" strokeLinejoin="round">
      <circle data-role="knockout" cx="96" cy="74" r="6" style={{ fill: "var(--illustration-knockout)" }}/>
      <circle data-role="knockout" cx="96" cy="108" r="6" style={{ fill: "var(--illustration-knockout)" }}/>
      <path d="M114 74 H152 M114 108 H142"/>
      </g>
    </>
  ),
  "integrations": (
    <>
      <path data-role="baseline" d="M30 136 H210" style={{ fill: "none", stroke: "var(--illustration-baseline)" }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="74" cy="76" r="24" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M113 63 L127 77 M127 63 L113 77" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <rect data-role="ink" x="140" y="46" width="50" height="50" rx="15" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "job-families": (
    <>
      <path data-role="baseline" d="M30 136 H210" strokeWidth="3" style={{ stroke: "var(--illustration-baseline)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M120 46 V60 M64 60 H176 M64 60 V76 M120 60 V76 M176 60 V76" strokeWidth="4" style={{ stroke: "var(--illustration-support)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="120" cy="32" r="12" strokeWidth="7" stroke="currentColor" style={{ fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <g data-role="ink" strokeWidth="7" style={{ stroke: "var(--illustration-ink)" }} strokeLinecap="round" strokeLinejoin="round">
      <rect x="46" y="80" width="36" height="26" rx="9"/>
      <rect x="102" y="80" width="36" height="26" rx="9"/>
      <rect x="158" y="80" width="36" height="26" rx="9"/>
      </g>
      <path data-role="support" d="M57 93 H71 M113 93 H127 M169 93 H183" strokeWidth="4" style={{ stroke: "var(--illustration-support)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "learning": (
    <>
      <path data-role="baseline" d="M30 136 H210" style={{ fill: "none", stroke: "var(--illustration-baseline)" }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M120 58 C102 48 74 48 56 54 V124 C74 118 102 118 120 128 C138 118 166 118 184 124 V54 C166 48 138 48 120 58 V128" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="120" cy="28" r="12" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "legal-entity": (
    <>
      <path data-role="baseline" d="M30 136 H210" strokeWidth="3" style={{ stroke: "var(--illustration-baseline)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M54 128 H186" strokeWidth="4" style={{ stroke: "var(--illustration-support)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M70 52 Q60 52 69 47 L113 24 Q120 20 127 24 L171 47 Q180 52 170 52 Z M80 62 V110 M106 62 V110 M134 62 V110 M160 62 V110 M62 118 H178" strokeWidth="7" style={{ stroke: "var(--illustration-ink)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="120" cy="40" r="7" strokeWidth="5" stroke="currentColor" style={{ fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "no-match-s": (
    <>
      <path data-role="ink" d="M68 30 H172 Q182 30 175 37 L137 77 Q134 80 134 85 V107 Q134 112 129 114 L113 121 Q106 124 106 117 V85 Q106 80 103 77 L65 37 Q58 30 68 30 Z" strokeWidth="7" style={{ stroke: "var(--illustration-ink)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="120" cy="50" r="10" strokeWidth="7" stroke="currentColor" style={{ fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "no-match": (
    <>
      <path data-role="baseline" d="M30 136 H210" strokeWidth="3" style={{ stroke: "var(--illustration-baseline)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <g data-role="support" strokeWidth="4" strokeDasharray="5 7" style={{ stroke: "var(--illustration-support)" }} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="40" cy="58" r="8"/>
      <circle cx="200" cy="58" r="8"/>
      <circle cx="196" cy="96" r="6"/>
      </g>
      <path data-role="ink" d="M68 30 H172 Q182 30 175 37 L137 77 Q134 80 134 85 V107 Q134 112 129 114 L113 121 Q106 124 106 117 V85 Q106 80 103 77 L65 37 Q58 30 68 30 Z" strokeWidth="7" style={{ stroke: "var(--illustration-ink)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="120" cy="50" r="10" strokeWidth="7" stroke="currentColor" style={{ fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "no-results-s": (
    <>
      <circle data-role="ink" cx="108" cy="68" r="42" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M139 99 L170 128" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="108" cy="68" r="16" strokeDasharray="6 10" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "no-results": (
    <>
      <path data-role="baseline" d="M30 136 H210" style={{ fill: "none", stroke: "var(--illustration-baseline)" }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <rect data-role="support" x="34" y="34" width="96" height="18" rx="9" strokeDasharray="6 8" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <rect data-role="support" x="34" y="66" width="96" height="18" rx="9" strokeDasharray="6 8" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <rect data-role="support" x="34" y="98" width="72" height="18" rx="9" strokeDasharray="6 8" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ink" cx="160" cy="72" r="32" style={{ fill: "var(--illustration-knockout)", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M183 95 L206 120" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="160" cy="72" r="11" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "nomination": (
    <>
      <path data-role="baseline" d="M30 136 H210" strokeWidth="3" style={{ stroke: "var(--illustration-baseline)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <g data-role="ring" strokeWidth="7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="66" cy="66" r="14"/>
      <path d="M44 126 A22 22 0 0 1 88 126"/>
      </g>
      <path data-role="ink" d="M96 96 H118 M110 88 L118 96 L110 104" strokeWidth="7" style={{ stroke: "var(--illustration-ink)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <g data-role="support" strokeWidth="4" strokeDasharray="6 8" style={{ stroke: "var(--illustration-support)" }} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="146" cy="72" r="12"/>
      <path d="M127 126 A19 19 0 0 1 165 126"/>
      <circle cx="188" cy="72" r="12"/>
      <path d="M169 126 A19 19 0 0 1 207 126"/>
      </g>
    </>
  ),
  "notes": (
    <>
      <path data-role="baseline" d="M30 136 H210" style={{ fill: "none", stroke: "var(--illustration-baseline)" }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <rect data-role="ink" x="70" y="22" width="100" height="108" rx="10" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="92" cy="50" r="6" stroke="currentColor" style={{ fill: "none" }} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M108 50 H150 M88 74 H150 M88 96 H134" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "notifications": (
    <>
      <path data-role="baseline" d="M30 136 H210" strokeWidth="3" style={{ stroke: "var(--illustration-baseline)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M70 56 Q62 68 68 82 M170 56 Q178 68 172 82" strokeWidth="4" style={{ stroke: "var(--illustration-support)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M120 40 V32 M88 100 V72 A32 32 0 0 1 152 72 V100 Q152 104 156 106 Q160 110 154 110 H86 Q80 110 84 106 Q88 104 88 100 Z" strokeWidth="7" style={{ stroke: "var(--illustration-ink)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="120" cy="122" r="8" strokeWidth="7" stroke="currentColor" style={{ fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "offboarding": (
    <>
      <path data-role="baseline" d="M30 136 H210" style={{ fill: "none", stroke: "var(--illustration-baseline)" }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <rect data-role="ink" x="48" y="20" width="60" height="96" rx="10" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="66" cy="70" r="4" style={{ fill: "var(--illustration-ink)" }} data-role="ink-fill"/>
      <rect data-role="support" x="42" y="124" width="72" height="6" rx="3" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="162" cy="68" r="18" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M136 28 H156 M150 22 L156 28 L150 34" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ring" d="M138 126 A24 24 0 0 1 186 126" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "office": (
    <>
      <path data-role="baseline" d="M30 136 H210" strokeWidth="3" style={{ stroke: "var(--illustration-baseline)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M124 124 Q120 129 116 124 C104 110 84 88 84 62 A36 36 0 0 1 156 62 C156 88 136 110 124 124 Z" strokeWidth="7" style={{ stroke: "var(--illustration-ink)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="120" cy="62" r="13" strokeWidth="7" stroke="currentColor" style={{ fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "onboarding-on-wine": (
    <>
      <rect data-role="ink" x="130" y="24" width="64" height="106" rx="10" style={{ fill: "none", stroke: "var(--white)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="174" cy="80" r="4" style={{ fill: "var(--white)" }} data-role="ink-fill"/>
      <circle data-role="ring" cx="82" cy="68" r="18" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ring" d="M58 126 A24 24 0 0 1 106 126" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M30 136 H210" style={{ fill: "none", stroke: "var(--wine-500)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "onboarding": (
    <>
      <path data-role="baseline" d="M30 136 H210" style={{ fill: "none", stroke: "var(--illustration-baseline)" }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <rect data-role="ink" x="132" y="20" width="60" height="96" rx="10" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="174" cy="70" r="4" style={{ fill: "var(--illustration-ink)" }} data-role="ink-fill"/>
      <rect data-role="support" x="126" y="124" width="72" height="6" rx="3" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="78" cy="68" r="18" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M84 28 H104 M98 22 L104 28 L98 34" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ring" d="M54 126 A24 24 0 0 1 102 126" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "payroll": (
    <>
      <path data-role="baseline" d="M30 136 H210" style={{ fill: "none", stroke: "var(--illustration-baseline)" }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <rect data-role="support-light" x="50" y="30" width="150" height="66" rx="8" transform="rotate(-9 125 63)" style={{ fill: "none", stroke: "var(--illustration-support-light)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <rect data-role="ink" x="40" y="54" width="150" height="66" rx="8" style={{ fill: "var(--illustration-knockout)", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <rect data-role="support" x="52" y="66" width="126" height="42" rx="4" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="115" cy="87" r="12" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M64 78 V96 M166 78 V96" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "people-s": (
    <>
      <g data-role="ink" strokeWidth="7" style={{ stroke: "var(--illustration-ink)" }} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="82" cy="54" r="13"/>
      <path d="M60 116 A22 22 0 0 1 104 116"/>
      <circle cx="158" cy="54" r="13"/>
      <path d="M136 116 A22 22 0 0 1 180 116"/>
      </g>
      <g data-role="ring" strokeWidth="7" stroke="currentColor" style={{ fill: "var(--illustration-knockout)" }} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="120" cy="64" r="16"/>
      <path d="M90 130 A30 30 0 0 1 150 130"/>
      </g>
    </>
  ),
  "people": (
    <>
      <path data-role="baseline" d="M30 136 H210" strokeWidth="3" style={{ stroke: "var(--illustration-baseline)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <g data-role="ink" strokeWidth="7" style={{ stroke: "var(--illustration-ink)" }} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="82" cy="54" r="13"/>
      <path d="M60 116 A22 22 0 0 1 104 116"/>
      <circle cx="158" cy="54" r="13"/>
      <path d="M136 116 A22 22 0 0 1 180 116"/>
      </g>
      <g data-role="ring" strokeWidth="7" stroke="currentColor" style={{ fill: "var(--illustration-knockout)" }} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="120" cy="64" r="16"/>
      <path d="M90 130 A30 30 0 0 1 150 130"/>
      </g>
    </>
  ),
  "policies": (
    <>
      <path data-role="baseline" d="M30 136 H210" strokeWidth="3" style={{ stroke: "var(--illustration-baseline)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M116 20 Q120 18 124 20 L162 34 Q168 36 168 42 V72 C168 100 148 116 124 126 Q120 128 116 126 C92 116 72 100 72 72 V42 Q72 36 78 34 Z" strokeWidth="7" style={{ stroke: "var(--illustration-ink)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="120" cy="72" r="14" strokeWidth="7" stroke="currentColor" style={{ fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "review-cycle": (
    <>
      <path data-role="baseline" d="M30 136 H210" strokeWidth="3" style={{ stroke: "var(--illustration-baseline)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="support" cx="120" cy="74" r="44" strokeWidth="4" style={{ stroke: "var(--illustration-support)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M158 68 L164 76 L170 68 M70 80 L76 72 L82 80" strokeWidth="4" style={{ stroke: "var(--illustration-support)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <g data-role="ink" strokeWidth="7" style={{ stroke: "var(--illustration-ink)", fill: "var(--illustration-knockout)" }} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="82" cy="96" r="11"/>
      <circle cx="158" cy="96" r="11"/>
      </g>
      <circle data-role="ring" cx="120" cy="30" r="11" strokeWidth="7" stroke="currentColor" style={{ fill: "var(--illustration-knockout)" }} strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "reviews-and-one-on-ones-s": (
    <>
      <g data-role="ink" strokeWidth="7" style={{ stroke: "var(--illustration-ink)" }} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="70" cy="62" r="18"/>
      <path d="M46 126 A24 24 0 0 1 94 126"/>
      </g>
      <g data-role="ring" strokeWidth="7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="170" cy="68" r="18"/>
      <path d="M146 126 A24 24 0 0 1 194 126"/>
      </g>
    </>
  ),
  "reviews-and-one-on-ones": (
    <>
      <path data-role="baseline" d="M30 136 H210" style={{ fill: "none", stroke: "var(--illustration-baseline)" }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ink" cx="70" cy="62" r="18" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M46 126 A24 24 0 0 1 94 126" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="170" cy="68" r="18" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ring" d="M146 126 A24 24 0 0 1 194 126" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M106 46 H134 M106 62 H126" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "sick-day": (
    <>
      <path data-role="baseline" d="M30 136 H210" style={{ fill: "none", stroke: "var(--illustration-baseline)" }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M44 84 V128 M196 100 V128 M44 112 H196" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <rect data-role="support" x="56" y="78" width="40" height="22" rx="10" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="76" cy="68" r="14" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M100 112 V96 A12 12 0 0 1 112 84 H184 A12 12 0 0 1 196 96 V100" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "signing": (
    <>
      <path data-role="baseline" d="M30 136 H210" style={{ fill: "none", stroke: "var(--illustration-baseline)" }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <rect data-role="ink" x="62" y="20" width="84" height="110" rx="10" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M78 46 H130 M78 62 H130" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M78 100 C86 86 94 82 96 94 C98 104 104 98 108 94" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M78 112 H130" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="124" cy="96" r="5.5" stroke="currentColor" style={{ fill: "none" }} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M169 108 L194 47 Q196 43 200 45 L205 47 Q209 49 207 53 L182 114 Q181 117 178 119 L171 122 Q166 124 166 119 Z" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "something-broke": (
    <>
      <path data-role="baseline" d="M30 136 H210" style={{ fill: "none", stroke: "var(--illustration-baseline)" }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M100 18 A46 46 0 0 0 100 110" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ring" d="M142 34 A46 46 0 0 1 140 126" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M121 44 L114 62 L128 74 L119 96" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "surveys": (
    <>
      <path data-role="baseline" d="M30 136 H210" style={{ fill: "none", stroke: "var(--illustration-baseline)" }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M56 26 H184 A10 10 0 0 1 194 36 V88 A10 10 0 0 1 184 98 H96 L79 114 Q72 120 72 111 V98 H56 A10 10 0 0 1 46 88 V36 A10 10 0 0 1 56 26 Z" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="support" cx="92" cy="62" r="10" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="support" cx="120" cy="62" r="10" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="148" cy="62" r="10" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "tasks": (
    <>
      <path data-role="baseline" d="M30 136 H210" strokeWidth="3" style={{ stroke: "var(--illustration-baseline)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="84" cy="30" r="15" strokeWidth="7" stroke="currentColor" style={{ fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ring" d="M78 31 L82 35 L89 26" strokeWidth="5" stroke="currentColor" style={{ fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support-light" d="M110 30 H168" strokeWidth="4" style={{ stroke: "var(--illustration-support-light)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <g data-role="ink" strokeWidth="7" style={{ stroke: "var(--illustration-ink)" }} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="84" cy="72" r="15"/>
      <circle cx="84" cy="114" r="15"/>
      </g>
      <path data-role="support" d="M110 72 H172 M110 114 H152" strokeWidth="4" style={{ stroke: "var(--illustration-support)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "team-and-org": (
    <>
      <path data-role="baseline" d="M30 136 H210" style={{ fill: "none", stroke: "var(--illustration-baseline)" }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M120 58 V76 M68 76 H172 M68 76 V89 M172 76 V89 M120 76 V89" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="120" cy="34" r="16" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ink" cx="68" cy="114" r="16" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ink" cx="120" cy="114" r="16" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ink" cx="172" cy="114" r="16" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "templates": (
    <>
      <path data-role="baseline" d="M30 136 H210" strokeWidth="3" style={{ stroke: "var(--illustration-baseline)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <rect data-role="support" x="88" y="22" width="96" height="88" rx="10" strokeWidth="4" style={{ stroke: "var(--illustration-support)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <rect data-role="ink" x="64" y="38" width="96" height="88" rx="10" strokeWidth="7" style={{ stroke: "var(--illustration-ink)", fill: "var(--illustration-knockout)" }} strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="88" cy="62" r="8" strokeWidth="7" stroke="currentColor" style={{ fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <g data-role="support" strokeWidth="4" style={{ stroke: "var(--illustration-support)" }} strokeLinecap="round" strokeLinejoin="round">
      <path d="M106 62 H140"/>
      <rect x="80" y="82" width="64" height="28" rx="6" strokeDasharray="6 8"/>
      </g>
    </>
  ),
  "time-off-l": (
    <>
      <path data-role="baseline" d="M30 136 H210" style={{ fill: "none", stroke: "var(--illustration-baseline)" }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ring" d="M70 110 A50 50 0 0 1 170 110" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M40 110 H200" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M120 30 V46 M64 54 L75 65 M176 54 L165 65" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "time-off-m": (
    <>
      <path data-role="ring" d="M70 110 A50 50 0 0 1 170 110" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M40 110 H200" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M120 30 V46 M64 54 L75 65 M176 54 L165 65" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "time-off-s": (
    <>
      <path data-role="ring" d="M70 110 A50 50 0 0 1 170 110" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M40 110 H200" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "time-off": (
    <>
      <path data-role="ring" d="M70 110 A50 50 0 0 1 170 110" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M40 110 H200" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M120 30 V46 M64 54 L75 65 M176 54 L165 65" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="baseline" d="M84 128 H156" style={{ fill: "none", stroke: "var(--illustration-baseline)" }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "trash": (
    <>
      <path data-role="baseline" d="M30 136 H210" strokeWidth="3" style={{ stroke: "var(--illustration-baseline)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <g transform="rotate(-10 74 48)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
      <path data-role="ink" d="M74 48 H166" strokeWidth="7" style={{ stroke: "var(--illustration-ink)", fill: "none" }}/>
      <circle data-role="ring" cx="120" cy="34" r="8" strokeWidth="7" stroke="currentColor" style={{ fill: "none" }}/>
      </g>
      <path data-role="ink" d="M80 58 L88 126 A6 6 0 0 0 94 132 H146 A6 6 0 0 0 152 126 L160 58" strokeWidth="7" style={{ stroke: "var(--illustration-ink)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M104 72 V116 M120 72 V116 M136 72 V116" strokeWidth="4" style={{ stroke: "var(--illustration-support)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "welcome": (
    <>
      <path data-role="baseline" d="M30 136 H210" strokeWidth="3" style={{ stroke: "var(--illustration-baseline)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <g transform="rotate(20 120 66)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
      <path data-role="support" d="M112 110 L110 120 M120 110 V124 M128 110 L130 120" strokeWidth="4" style={{ stroke: "var(--illustration-support)", fill: "none" }}/>
      <path data-role="ink" d="M116 19 Q120 15 124 19 C139 34 146 56 144 98 Q144 102 140 102 H100 Q96 102 96 98 C94 56 101 34 116 19 Z M96 76 Q80 86 80 100 Q80 108 88 104 L96 99 M144 76 Q160 86 160 100 Q160 108 152 104 L144 99" strokeWidth="7" style={{ stroke: "var(--illustration-ink)", fill: "none" }}/>
      <circle data-role="ring" cx="120" cy="54" r="12" strokeWidth="7" stroke="currentColor" style={{ fill: "none" }}/>
      </g>
    </>
  ),
} satisfies Record<string, React.ReactElement>;

export type Scene = keyof typeof SCENES;

/** What each scene shows, read by assistive technology when the scene is not decorative. */
export const SCENE_LABELS: Record<Scene, string> = {
  "all-approved-l": "All approved illustration",
  "all-approved": "Success: an accent ring with a check and small confetti lines",
  "all-caught-up": "All caught up: a tray holding the accent ring with an accent check",
  "analytics": "Analytics: a rising line chart ending in the accent ring",
  "announcements": "Announcements: a megaphone with an accent notification ring",
  "archive": "Archive: a box with its lid lifted, an accent ring inside",
  "attendance-s": "Attendance, simplified for S size: a clock",
  "attendance": "Attendance: a clock with the accent ring marking twelve",
  "automations": "Automations: a lightning bolt with a ring and speed lines",
  "benefits": "Benefits: a gift box with an accent ring bow",
  "calendar": "Calendar with one date circled by a ring",
  "career-s": "Career, simplified for S size: steps going up to a ring",
  "career": "Career: steps going up, a ring person on the top step",
  "celebrations": "Celebrations: a party popper bursting confetti with an accent ring",
  "coming-soon": "Coming soon: a sprout in a pot, its bud is the ring",
  "company-hub": "Company hub: a simple building with the accent ring as its sign and an arched door",
  "documents": "Documents: a page with a ring seal",
  "equipment": "Equipment: a laptop with an accent ring on screen",
  "forms-s": "Forms, simplified for S size: a clipboard with one checked box",
  "forms": "Forms: a clipboard with checkboxes, its clip in the accent colour",
  "goals-and-growth": "Goals: a target with an arrow hitting the accent ring in the center",
  "hiring": "Hiring: a magnifying glass over a ring person",
  "history-s": "History, simplified for S size: a timeline starting at the ring",
  "history": "History: a timeline, the newest entry is the ring",
  "integrations": "Integrations: the noddo ring times another app tile",
  "job-families": "Job families: a ring branching into three role cards",
  "learning": "Learning: an open book with a ring head reading above it",
  "legal-entity": "Legal entity: a building with columns and a round emblem",
  "no-match-s": "No match, simplified for S size: a filter funnel with the ring inside",
  "no-match": "No match: a filter funnel with the ring inside, items left outside",
  "no-results-s": "No results illustration",
  "no-results": "No results: an empty list of dashed rows and a magnifying glass",
  "nomination": "Nomination: a ring person and an arrow toward two empty seats",
  "notes": "Notes: a notepad with lines and an accent ring bullet",
  "notifications": "Notifications: a bell, its clapper is the ring",
  "offboarding": "Offboarding: a ring person stepping away from the door, a small arrow pointing away",
  "office": "Office: a map pin, its hole is the ring",
  "onboarding-on-wine": "Onboarding illustration on Wine",
  "onboarding": "Onboarding: a ring person stepping toward an open door with a welcome mat",
  "payroll": "Payroll: two fanned banknotes with an inner frame and an accent oval",
  "people-s": "People, simplified for S size: a ring person between two colleagues",
  "people": "People: a ring person in front of two colleagues",
  "policies": "Policies: a shield with an accent ring inside",
  "review-cycle": "Review cycle: people on a turning loop, one is the ring",
  "reviews-and-one-on-ones-s": "Reviews, simplified for S size: two people facing each other, one is the ring",
  "reviews-and-one-on-ones": "Reviews: two ring people facing each other",
  "sick-day": "Sick day: a ring head resting on a pillow under a blanket",
  "signing": "Signing: a page with a signature line and a pen",
  "something-broke": "Something went wrong: a ring broken into two arcs",
  "surveys": "Surveys: a speech bubble with three rating rings, one in the accent colour",
  "tasks": "Tasks: a to-do list, the first item checked in the accent",
  "team-and-org": "Team: an org tree of rings",
  "templates": "Templates: a stack of layout cards, a ring marks where to start",
  "time-off-l": "Time off, L size: a sun ring setting on the horizon with a baseline",
  "time-off-m": "Time off, M size: a sun ring setting on the horizon",
  "time-off-s": "Time off, simplified for S size: a sun ring on the horizon",
  "time-off": "Time off: a sun ring setting on the horizon",
  "trash": "Trash: a bin with its lid slightly open, the knob is the ring",
  "welcome": "Welcome: a rocket ready to launch, the porthole is the ring"
};
