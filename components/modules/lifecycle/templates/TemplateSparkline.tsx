import React from "react";

type Props = {
  /** Each task's day relative to the start day; null = "by the start day". */
  offsets: (number | null)[];
};

const WIDTH = 120;
const HEIGHT = 16;
const FROM = -14;
const TO = 90;

/**
 * A template's tasks as dots on a line from 14 days before the start to day 90, with Day 1 marked — the
 * shape of a template at a glance. Decorative: the task count beside it says the same thing in words.
 */
export function TemplateSparkline({ offsets }: Props) {
  const x = (offset: number) => ((Math.min(TO, Math.max(FROM, offset)) - FROM) / (TO - FROM)) * WIDTH;
  return (
    <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} aria-hidden className="shrink-0">
      <line x1={0} x2={WIDTH} y1={HEIGHT / 2} y2={HEIGHT / 2} className="stroke-brown-200" strokeWidth={1} />
      <line x1={x(0)} x2={x(0)} y1={2} y2={HEIGHT - 2} className="stroke-primary" strokeWidth={1.5} />
      {offsets.map((o, i) => (
        <circle key={i} cx={o === null ? x(-0.5) : x(o)} cy={HEIGHT / 2} r={2.5} className="fill-brown-500" />
      ))}
    </svg>
  );
}
