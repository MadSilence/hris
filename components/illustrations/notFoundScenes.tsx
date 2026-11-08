/*
 * The 404 page's drawing (empty-state spec, "404 page"), generated from the package's
 * `assets/illustrations/404/*.svg` by `generate.mjs` — regenerate rather than edit by hand.
 *
 * MOVING plays once (SMIL, 3.6 s, `fill="freeze"`): five balls fall from one point, bounce, roll apart and stay.
 * STILL is the same picture at rest, for reduced motion. Lines are 5 px, the page's own.
 */
import * as React from "react";

export const NOT_FOUND_MOVING = (
  <>
      <path data-role="baseline" d="M30 136 H210" strokeWidth="3" style={{ stroke: "var(--illustration-baseline)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <g strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
      <animateTransform attributeName="transform" type="translate" values="56 -170; 56 -170; 39 0; 31 -10; 22 0; 0 0; 0 0" keyTimes="0; 0.0; 0.18; 0.24; 0.3; 0.45; 1" dur="3.6s" begin="0s" fill="freeze"/>
      <animate attributeName="opacity" values="0; 0; 1; 1" keyTimes="0; 0.0; 0.04; 1" dur="3.6s" begin="0s" fill="freeze"/>
      <circle data-role="ink" cx="64" cy="122" r="10" strokeWidth="5" style={{ stroke: "var(--illustration-ink)", fill: "var(--illustration-knockout)" }}/>
      </g>
      <g strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
      <animateTransform attributeName="transform" type="translate" values="24 -170; 24 -170; 17 0; 13 -10; 10 0; 0 0; 0 0" keyTimes="0; 0.033; 0.213; 0.273; 0.333; 0.483; 1" dur="3.6s" begin="0s" fill="freeze"/>
      <animate attributeName="opacity" values="0; 0; 1; 1" keyTimes="0; 0.033; 0.073; 1" dur="3.6s" begin="0s" fill="freeze"/>
      <circle data-role="ink" cx="96" cy="117" r="15" strokeWidth="5" style={{ stroke: "var(--illustration-ink)", fill: "var(--illustration-knockout)" }}/>
      </g>
      <g strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
      <animateTransform attributeName="transform" type="translate" values="-12 -170; -12 -170; -8 0; -7 -10; -5 0; 0 0; 0 0" keyTimes="0; 0.067; 0.247; 0.307; 0.367; 0.517; 1" dur="3.6s" begin="0s" fill="freeze"/>
      <animate attributeName="opacity" values="0; 0; 1; 1" keyTimes="0; 0.067; 0.107; 1" dur="3.6s" begin="0s" fill="freeze"/>
      <circle data-role="ring" cx="132" cy="118" r="14" strokeWidth="5" stroke="currentColor" style={{ fill: "var(--illustration-knockout)" }}/>
      </g>
      <g strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
      <animateTransform attributeName="transform" type="translate" values="-46 -170; -46 -170; -32 0; -25 -10; -18 0; 0 0; 0 0" keyTimes="0; 0.1; 0.28; 0.34; 0.4; 0.55; 1" dur="3.6s" begin="0s" fill="freeze"/>
      <animate attributeName="opacity" values="0; 0; 1; 1" keyTimes="0; 0.1; 0.14; 1" dur="3.6s" begin="0s" fill="freeze"/>
      <circle data-role="ink" cx="166" cy="120" r="12" strokeWidth="5" style={{ stroke: "var(--illustration-ink)", fill: "var(--illustration-knockout)" }}/>
      </g>
      <g strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
      <animateTransform attributeName="transform" type="translate" values="-76 -170; -76 -170; -53 0; -42 -10; -30 0; 0 0; 0 0" keyTimes="0; 0.133; 0.313; 0.373; 0.433; 0.583; 1" dur="3.6s" begin="0s" fill="freeze"/>
      <animate attributeName="opacity" values="0; 0; 1; 1" keyTimes="0; 0.133; 0.173; 1" dur="3.6s" begin="0s" fill="freeze"/>
      <circle data-role="ink" cx="196" cy="121" r="11" strokeWidth="5" style={{ stroke: "var(--illustration-ink)", fill: "var(--illustration-knockout)" }}/>
      </g>
  </>
);

export const NOT_FOUND_STILL = (
  <>
      <path data-role="baseline" d="M30 136 H210" strokeWidth="3" style={{ stroke: "var(--illustration-baseline)", fill: "none" }} strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ink" cx="64" cy="122" r="10" strokeWidth="5" style={{ stroke: "var(--illustration-ink)", fill: "var(--illustration-knockout)" }} strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ink" cx="96" cy="117" r="15" strokeWidth="5" style={{ stroke: "var(--illustration-ink)", fill: "var(--illustration-knockout)" }} strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ring" cx="132" cy="118" r="14" strokeWidth="5" stroke="currentColor" style={{ fill: "var(--illustration-knockout)" }} strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ink" cx="166" cy="120" r="12" strokeWidth="5" style={{ stroke: "var(--illustration-ink)", fill: "var(--illustration-knockout)" }} strokeLinecap="round" strokeLinejoin="round"/>
      <circle data-role="ink" cx="196" cy="121" r="11" strokeWidth="5" style={{ stroke: "var(--illustration-ink)", fill: "var(--illustration-knockout)" }} strokeLinecap="round" strokeLinejoin="round"/>
  </>
);
