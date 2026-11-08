/**
 * Stand-ins for the automations settings' compact pickers (`components/modules/automations/settings/conditions/chrome`)
 * as native selects — the same idea as `searchableSelectMock.tsx`: a test picks with
 * `fireEvent.change(getByLabelText("Field"), { target: { value: "sys:office" } })` instead of driving cmdk.
 *
 *   jest.mock("@/components/modules/automations/settings/conditions/chrome", () => jest.requireActual("@/test/automationPickersMock"));
 *
 * Everything else of the module is the real one. A pinned row ("Pick a date") is a button beside the select.
 */
import * as React from "react";

const real = jest.requireActual<typeof import("@/components/modules/automations/settings/conditions/chrome")>(
  "@/components/modules/automations/settings/conditions/chrome",
);

export const { ConditionGroup, ConditionCard, ConditionJoiner, AddConditionButton, compactTrigger } = real;
export type { PickOption, Joiner } from "@/components/modules/automations/settings/conditions/chrome";

const NONE = "__none__";

export const CompactPick: React.FC<{
  options: { value: string; label: string }[];
  value: string | null;
  onChange: (value: string) => void;
  ariaLabel: string;
  disabled?: boolean;
  pinned?: { label: string; onSelect: () => void } | null;
}> = ({ options, value, onChange, ariaLabel, disabled, pinned }) => (
  <>
    <select aria-label={ariaLabel} disabled={disabled} value={value ?? NONE} onChange={(e) => e.target.value !== NONE && onChange(e.target.value)}>
      <option value={NONE}>-</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
    {pinned && (
      <button type="button" onClick={pinned.onSelect}>
        {pinned.label}
      </button>
    )}
  </>
);

export const CompactMultiPick: React.FC<{
  options: { value: string; label: string }[];
  values: string[];
  onChange: (values: string[]) => void;
  ariaLabel: string;
}> = ({ options, values, onChange, ariaLabel }) => (
  <select
    multiple
    aria-label={ariaLabel}
    value={values}
    onChange={(e) => onChange(Array.from(e.target.selectedOptions).map((o) => o.value))}
  >
    {options.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
);
