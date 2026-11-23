import { toTagColor, type TagColor } from "@/lib/theme/tags";

/*
 * The leave palette (K01, `hris/design/screens/leave-colours`): how a time off policy's colour is drawn wherever leave
 * shows. A policy still stores a tag name (`TagColor` — the backend's enum); this is a second, separate set of values
 * for the same names, the `--leave-<name>-fill | -edge | -text` tokens in `styles/globals.css`. **Leave never reads
 * the tag palette, and nothing but leave reads this one.** Gray is not a policy's colour: it is "Away", leave whose
 * type the reader may not see.
 *
 *   approved   a pill in the fill, its words in the text colour
 *   pending    white (the card), a 1.5 px dashed edge in the edge colour, the words in the text colour
 *   marker     a 16 px circle of the fill with an 8 px dot of the edge in the middle (`PolicyMarker`)
 *
 * Written out in full so Tailwind finds every class in the source.
 */
export type LeaveClasses = {
  /** The tint: an approved pill, the marker's circle. */
  fill: string;
  /** The marker's dot, as a background. */
  edge: string;
  /** Words on the fill, or on white for pending. */
  text: string;
  /** A border in the edge colour — add the width and style. */
  border: string;
  /** An approved pill: the fill and the text colour. */
  approved: string;
  /** A pending pill: the card, a 1.5 px dashed edge, the text colour. */
  pending: string;
};

export const LEAVE_CLASSES: Record<TagColor, LeaveClasses> = {
  gray: {
    fill: "bg-leave-gray-fill",
    edge: "bg-leave-gray-edge",
    text: "text-leave-gray-text",
    border: "border-leave-gray-edge",
    approved: "bg-leave-gray-fill text-leave-gray-text",
    pending: "border-[1.5px] border-dashed border-leave-gray-edge bg-card text-leave-gray-text",
  },
  berry: {
    fill: "bg-leave-berry-fill",
    edge: "bg-leave-berry-edge",
    text: "text-leave-berry-text",
    border: "border-leave-berry-edge",
    approved: "bg-leave-berry-fill text-leave-berry-text",
    pending: "border-[1.5px] border-dashed border-leave-berry-edge bg-card text-leave-berry-text",
  },
  plum: {
    fill: "bg-leave-plum-fill",
    edge: "bg-leave-plum-edge",
    text: "text-leave-plum-text",
    border: "border-leave-plum-edge",
    approved: "bg-leave-plum-fill text-leave-plum-text",
    pending: "border-[1.5px] border-dashed border-leave-plum-edge bg-card text-leave-plum-text",
  },
  indigo: {
    fill: "bg-leave-indigo-fill",
    edge: "bg-leave-indigo-edge",
    text: "text-leave-indigo-text",
    border: "border-leave-indigo-edge",
    approved: "bg-leave-indigo-fill text-leave-indigo-text",
    pending: "border-[1.5px] border-dashed border-leave-indigo-edge bg-card text-leave-indigo-text",
  },
  ocean: {
    fill: "bg-leave-ocean-fill",
    edge: "bg-leave-ocean-edge",
    text: "text-leave-ocean-text",
    border: "border-leave-ocean-edge",
    approved: "bg-leave-ocean-fill text-leave-ocean-text",
    pending: "border-[1.5px] border-dashed border-leave-ocean-edge bg-card text-leave-ocean-text",
  },
  teal: {
    fill: "bg-leave-teal-fill",
    edge: "bg-leave-teal-edge",
    text: "text-leave-teal-text",
    border: "border-leave-teal-edge",
    approved: "bg-leave-teal-fill text-leave-teal-text",
    pending: "border-[1.5px] border-dashed border-leave-teal-edge bg-card text-leave-teal-text",
  },
  cocoa: {
    fill: "bg-leave-cocoa-fill",
    edge: "bg-leave-cocoa-edge",
    text: "text-leave-cocoa-text",
    border: "border-leave-cocoa-edge",
    approved: "bg-leave-cocoa-fill text-leave-cocoa-text",
    pending: "border-[1.5px] border-dashed border-leave-cocoa-edge bg-card text-leave-cocoa-text",
  },
  bronze: {
    fill: "bg-leave-bronze-fill",
    edge: "bg-leave-bronze-edge",
    text: "text-leave-bronze-text",
    border: "border-leave-bronze-edge",
    approved: "bg-leave-bronze-fill text-leave-bronze-text",
    pending: "border-[1.5px] border-dashed border-leave-bronze-edge bg-card text-leave-bronze-text",
  },
  lilac: {
    fill: "bg-leave-lilac-fill",
    edge: "bg-leave-lilac-edge",
    text: "text-leave-lilac-text",
    border: "border-leave-lilac-edge",
    approved: "bg-leave-lilac-fill text-leave-lilac-text",
    pending: "border-[1.5px] border-dashed border-leave-lilac-edge bg-card text-leave-lilac-text",
  },
  orange: {
    fill: "bg-leave-orange-fill",
    edge: "bg-leave-orange-edge",
    text: "text-leave-orange-text",
    border: "border-leave-orange-edge",
    approved: "bg-leave-orange-fill text-leave-orange-text",
    pending: "border-[1.5px] border-dashed border-leave-orange-edge bg-card text-leave-orange-text",
  },
  mustard: {
    fill: "bg-leave-mustard-fill",
    edge: "bg-leave-mustard-edge",
    text: "text-leave-mustard-text",
    border: "border-leave-mustard-edge",
    approved: "bg-leave-mustard-fill text-leave-mustard-text",
    pending: "border-[1.5px] border-dashed border-leave-mustard-edge bg-card text-leave-mustard-text",
  },
  olive: {
    fill: "bg-leave-olive-fill",
    edge: "bg-leave-olive-edge",
    text: "text-leave-olive-text",
    border: "border-leave-olive-edge",
    approved: "bg-leave-olive-fill text-leave-olive-text",
    pending: "border-[1.5px] border-dashed border-leave-olive-edge bg-card text-leave-olive-text",
  },
};

/** The classes for a policy's colour as stored — an unknown or missing value is gray, "Away". */
export const leaveClasses = (color: string | null | undefined): LeaveClasses => LEAVE_CLASSES[toTagColor(color)];

/** The same colours as custom properties, for a bar positioned by style (the calendars). */
export const leaveVars = (color: string | null | undefined) => {
  const name = toTagColor(color);
  return { fill: `var(--leave-${name}-fill)`, edge: `var(--leave-${name}-edge)`, text: `var(--leave-${name}-text)` };
};
