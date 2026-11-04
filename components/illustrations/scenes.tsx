/*
 * The 36 ring illustrations of the noddo design system (SPEC § 10), generated from the package's
 * `assets/illustrations/*.svg` — regenerate rather than edit by hand. The provenance manifests the files carry
 * are left out of the bundle; the package keeps them.
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
      <path data-role="baseline" d="M30 136 H210" style={{ fill: "none", stroke: "var(--illustration-baseline)" }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M50 84 L70 40 H170 L190 84 V122 H50 Z M50 84 H92 L100 100 H140 L148 84 H190" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="120" cy="68" r="18" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ring" d="M112 69 L118 75 L128 63" stroke="currentColor" style={{ fill: "none" }} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
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
      <path data-role="ink" d="M88 64 L134 42 A8 8 0 0 1 145 49 V103 A8 8 0 0 1 134 110 L88 88" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="170" cy="76" r="10" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M190 58 A26 26 0 0 1 190 94" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
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
      <path data-role="baseline" d="M30 136 H210" style={{ fill: "none", stroke: "var(--illustration-baseline)" }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M120 14 L100 44 H118 L108 66" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M86 24 L80 18 M138 30 H146 M136 52 L142 58" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <rect data-role="ink" x="62" y="80" width="116" height="46" rx="23" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="155" cy="103" r="14" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
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
      <path data-role="baseline" d="M30 136 H210" style={{ fill: "none", stroke: "var(--illustration-baseline)" }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ink" cx="108" cy="76" r="48" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="support" cx="108" cy="76" r="29" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="108" cy="76" r="10" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M124 60 L196 18" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M184 14 L196 18 L200 30 M176 22 L188 26 L192 38" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
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
  "integrations": (
    <>
      <path data-role="baseline" d="M30 136 H210" style={{ fill: "none", stroke: "var(--illustration-baseline)" }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="74" cy="76" r="24" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M113 63 L127 77 M127 63 L113 77" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <rect data-role="ink" x="140" y="46" width="50" height="50" rx="15" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "learning": (
    <>
      <path data-role="baseline" d="M30 136 H210" style={{ fill: "none", stroke: "var(--illustration-baseline)" }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M120 58 C102 48 74 48 56 54 V124 C74 118 102 118 120 128 C138 118 166 118 184 124 V54 C166 48 138 48 120 58 V128" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="120" cy="28" r="12" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
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
  "notes": (
    <>
      <path data-role="baseline" d="M30 136 H210" style={{ fill: "none", stroke: "var(--illustration-baseline)" }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <rect data-role="ink" x="70" y="22" width="100" height="108" rx="10" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="92" cy="50" r="6" stroke="currentColor" style={{ fill: "none" }} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="support" d="M108 50 H150 M88 74 H150 M88 96 H134" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
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
  "policies": (
    <>
      <path data-role="baseline" d="M30 136 H210" style={{ fill: "none", stroke: "var(--illustration-baseline)" }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path data-role="ink" d="M120 18 L168 36 V72 C168 100 148 118 120 128 C92 118 72 100 72 72 V36 Z" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="120" cy="72" r="14" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
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
      <path data-role="ink" d="M168 112 L196 44 L208 50 L180 118 L166 124 Z" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
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
      <path data-role="ink" d="M56 26 H184 A10 10 0 0 1 194 36 V88 A10 10 0 0 1 184 98 H96 L72 120 V98 H56 A10 10 0 0 1 46 88 V36 A10 10 0 0 1 56 26 Z" style={{ fill: "none", stroke: "var(--illustration-ink)" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="support" cx="92" cy="62" r="10" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="support" cx="120" cy="62" r="10" style={{ fill: "none", stroke: "var(--illustration-support)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="148" cy="62" r="10" stroke="currentColor" style={{ fill: "none" }} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
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
} satisfies Record<string, React.ReactElement>;

export type Scene = keyof typeof SCENES;

/** What each scene shows, read by assistive technology when the scene is not decorative. */
export const SCENE_LABELS: Record<Scene, string> = {
  "all-approved-l": "All approved illustration",
  "all-approved": "Success: an accent ring with a check and small confetti lines",
  "all-caught-up": "All caught up: a tray holding the accent ring with an accent check",
  "analytics": "Analytics: a rising line chart ending in the accent ring",
  "announcements": "Announcements: a megaphone with an accent notification ring",
  "attendance": "Attendance: a clock with the accent ring marking twelve",
  "automations": "Automations: a lightning bolt over a switch turned on, its knob the accent ring",
  "benefits": "Benefits: a gift box with an accent ring bow",
  "calendar": "Calendar with one date circled by a ring",
  "celebrations": "Celebrations: a party popper bursting confetti with an accent ring",
  "company-hub": "Company hub: a simple building with the accent ring as its sign and an arched door",
  "documents": "Documents: a page with a ring seal",
  "equipment": "Equipment: a laptop with an accent ring on screen",
  "forms": "Forms: a clipboard with checkboxes, its clip in the accent colour",
  "goals-and-growth": "Goals: a target with an arrow hitting the accent ring in the center",
  "hiring": "Hiring: a magnifying glass over a ring person",
  "integrations": "Integrations: the noddo ring times another app tile",
  "learning": "Learning: an open book with a ring head reading above it",
  "no-results-s": "No results illustration",
  "no-results": "No results: an empty list of dashed rows and a magnifying glass",
  "notes": "Notes: a notepad with lines and an accent ring bullet",
  "offboarding": "Offboarding: a ring person stepping away from the door, a small arrow pointing away",
  "onboarding-on-wine": "Onboarding illustration on Wine",
  "onboarding": "Onboarding: a ring person stepping toward an open door with a welcome mat",
  "payroll": "Payroll: two fanned banknotes with an inner frame and an accent oval",
  "policies": "Policies: a shield with an accent ring inside",
  "reviews-and-one-on-ones": "Reviews: two ring people facing each other",
  "sick-day": "Sick day: a ring head resting on a pillow under a blanket",
  "signing": "Signing: a page with a signature line and a pen",
  "something-broke": "Something went wrong: a ring broken into two arcs",
  "surveys": "Surveys: a speech bubble with three rating rings, one in the accent colour",
  "team-and-org": "Team: an org tree of rings",
  "time-off-l": "Time off, L size: a sun ring setting on the horizon with a baseline",
  "time-off-m": "Time off, M size: a sun ring setting on the horizon",
  "time-off-s": "Time off, simplified for S size: a sun ring on the horizon",
  "time-off": "Time off: a sun ring setting on the horizon"
};
