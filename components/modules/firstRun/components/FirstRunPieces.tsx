"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Tick02Icon } from "@hugeicons/core-free-icons";

import { Icon } from "@/components/desact/icon";
import { NodRing } from "@/components/desact/nod";

/*
 * The pieces the three first-run specs draw (first-run-setup, first-run-welcome, first-run-photo § New components):
 * the two-bar stepper, the choice card, the stops slider, the progress list, the welcome's frame and its Skip. Their
 * look is `.fr-*` in styles/globals.css.
 */

/**
 * "Step 1 of 2 · Your company" over two (or three) short bars — accent for done and current, grey ahead. Not the ring
 * Stepper of SPEC § 13.10: the owner's call, the wordmark and the orbit already carry rings.
 */
export function StepBars({ current, total, name }: { current: number; total: number; name: string }) {
  const t = useTranslations("firstRun");
  return (
    <div className="fr-bars">
      <div className="fr-bars-track" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => <span key={i} data-on={i < current} />)}
      </div>
      <p className="fr-bars-label">{t("stepOf", { current, total, name })}</p>
    </div>
  );
}

/** A radio drawn as a card: title, text, and — when chosen — whatever it opens (the slider). */
export function ChoiceCard({
  checked,
  onSelect,
  title,
  body,
  children,
}: {
  checked: boolean;
  onSelect: () => void;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="fr-choice" data-checked={checked}>
      <button type="button" role="radio" aria-checked={checked} className="fr-choice-head" onClick={onSelect}>
        <span className="fr-choice-dot" aria-hidden="true" />
        <span className="min-w-0">
          <span className="fr-choice-title">{title}</span>
          <span className="fr-choice-body">{body}</span>
        </span>
      </button>
      {checked && children}
    </div>
  );
}

/**
 * Discrete stops with their labels under them. The thumb always sits on a stop: a drag snaps to the nearest, ←/→ move
 * one, a label is a stop to click.
 */
export function StopsSlider({
  stops,
  value,
  onChange,
  label,
}: {
  stops: readonly number[];
  value: number;
  onChange: (value: number) => void;
  label: string;
}) {
  const track = React.useRef<HTMLDivElement>(null);
  const index = Math.max(0, stops.indexOf(value));
  const at = (i: number) => (stops.length > 1 ? (i / (stops.length - 1)) * 100 : 0);

  const fromPointer = (clientX: number) => {
    const box = track.current?.getBoundingClientRect();
    if (!box || box.width === 0) return;
    const ratio = Math.min(1, Math.max(0, (clientX - box.left) / box.width));
    onChange(stops[Math.round(ratio * (stops.length - 1))]);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const step = event.key === "ArrowRight" || event.key === "ArrowUp" ? 1
      : event.key === "ArrowLeft" || event.key === "ArrowDown" ? -1 : 0;
    if (event.key === "Home") onChange(stops[0]);
    else if (event.key === "End") onChange(stops[stops.length - 1]);
    else if (step) onChange(stops[Math.min(stops.length - 1, Math.max(0, index + step))]);
    else return;
    event.preventDefault();
  };

  return (
    <div className="fr-slider">
      <div className="fr-slider-head">
        <span>{label}</span>
        <span className="fr-slider-value">{value}</span>
      </div>
      <div
        ref={track}
        className="fr-slider-track"
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
          fromPointer(e.clientX);
        }}
        onPointerMove={(e) => {
          if (e.buttons === 1) fromPointer(e.clientX);
        }}
      >
        <span className="fr-slider-fill" style={{ width: `${at(index)}%` }} />
        <span
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={stops[0]}
          aria-valuemax={stops[stops.length - 1]}
          aria-valuenow={value}
          className="fr-slider-thumb"
          style={{ left: `${at(index)}%` }}
          onKeyDown={onKeyDown}
        />
      </div>
      <div className="fr-slider-stops">
        {stops.map((stop, i) => (
          <button key={stop} type="button" tabIndex={-1} aria-current={stop === value} style={{ left: `${at(i)}%` }}
                  onClick={() => onChange(stop)}>
            {stop}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Done = an accent check, current = the one nodding ring, ahead = a small grey dot. */
export function ProgressList({ items, current }: { items: { key: string; label: string }[]; current: number }) {
  return (
    <ol className="fr-progress">
      {items.map((item, i) => {
        const state = i < current ? "done" : i === current ? "current" : "ahead";
        return (
          <li key={item.key} data-state={state} aria-current={state === "current" ? "step" : undefined}>
            <span className="fr-progress-mark" data-state={state} aria-hidden="true">
              {state === "done" && <Icon icon={Tick02Icon} size="sm" />}
              {state === "current" && <NodRing size="sm" label="" />}
            </span>
            {item.label}
          </li>
        );
      })}
    </ol>
  );
}

/** "Skip": a text button in the accent's text colour, centred under the main button. */
export function SkipButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  const t = useTranslations("firstRun");
  return (
    <button type="button" className="fr-skip" onClick={onClick} disabled={disabled}>
      {t("welcome.skip")}
    </button>
  );
}

/** The company as the welcome shows it: its logo on a white tile, or its initial when it has none, and its name beside it. */
export type FirstRunCompany = { name: string; logoUrl: string | null };

function CompanyLogo({ company }: { company: FirstRunCompany }) {
  return (
    <div className="fr-brand">
      <span className="fr-logo" title={company.name}>
        {company.logoUrl ? (
          // A backend-hosted upload of unknown size; next/image would need a remote pattern for the API origin.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={company.logoUrl} alt={company.name} />
        ) : (
          <span aria-label={company.name}>{(company.name.trim()[0] ?? "").toUpperCase()}</span>
        )}
      </span>
      {company.name && <b className="fr-brand-name" aria-hidden="true">{company.name}</b>}
    </div>
  );
}

/*
 * The board's two ring rows (first-run-welcome W0-Desktop, the designers' fix W2): a fixed drawing, centred and never
 * stretched — 9 rings a row, r 22, stroke 7, 106 apart (SVG 900 × 167) on a computer; 7 a row, r 12, stroke 5 on a
 * phone. Resting accent-muted, the three strong ones in the accent, nodding on the 24 s loop.
 */
const RING_GRIDS = {
  desktop: { cols: 9, r: 22, stroke: 7, step: 106.125, width: 900, height: 167, hot: { "3,0": "rn6x3x3-0", "7,0": "rn6x3x3-1", "5,1": "rn6x3x3-2" } },
  phone: { cols: 7, r: 12, stroke: 5, step: 52, width: 341, height: 91, hot: { "2,0": "rn6x3x3-0", "5,0": "rn6x3x3-1", "4,1": "rn6x3x3-2" } },
} as const;

function WelcomeRings({ size }: { size: keyof typeof RING_GRIDS }) {
  const { cols, r, stroke, step, width, height, hot } = RING_GRIDS[size];
  const hotRings: Record<string, string> = hot;
  const pad = r + stroke / 2;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      {Array.from({ length: 2 }, (_, row) =>
        Array.from({ length: cols }, (_, col) => {
          const name = hotRings[`${col},${row}`];
          return (
            <circle
              key={`${col},${row}`}
              className={name ? "hot" : undefined}
              style={name ? { animationName: name } : undefined}
              cx={pad + col * step}
              cy={pad + row * step}
              r={r}
              strokeWidth={stroke}
            />
          );
        }),
      )}
    </svg>
  );
}

/**
 * The welcome's page, *Finish your profile* and the phone's photo page (first-run-welcome § Where it lives): white,
 * the company's logo tile and name on top, one centred column, the two ring rows along the bottom in the company's
 * colour. The lower row is cut by the window's edge alone: the rings hang 36 px (24 on a phone) below the page and
 * nothing clips them, so pulling the page up shows them whole (W2). `intro` is W0: centred, and the column is not held
 * to 400, so "Glad you're here" stays on one line (W1).
 */
export function WelcomeFrame({
  company,
  back,
  wide = false,
  intro = false,
  children,
}: {
  company: FirstRunCompany;
  back?: React.ReactNode;
  wide?: boolean;
  intro?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="fr-welcome">
      {back && <span className="fr-welcome-back">{back}</span>}
      <CompanyLogo company={company} />
      <main className="fr-welcome-mid">
        <div className="fr-welcome-col" data-wide={wide} data-intro={intro}>{children}</div>
      </main>
      <div className="fr-welcome-rings">
        <span className="hidden md:block"><WelcomeRings size="desktop" /></span>
        <span className="md:hidden"><WelcomeRings size="phone" /></span>
      </div>
    </div>
  );
}
