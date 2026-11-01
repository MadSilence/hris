/**
 * A stand-in for `components/ui/SearchableSelect`, as a native `<select>` — the same idea as
 * `selectMock.tsx` for the plain one: a test picks with
 * `fireEvent.change(getByLabelText("Department"), { target: { value: "dep-1" } })` instead of opening a
 * popover and typing into cmdk, which jsdom can barely drive.
 *
 *   jest.mock("@/components/ui/SearchableSelect", () => jest.requireActual("@/test/searchableSelectMock"));
 *
 * The label is the `aria-label` prop, else the `id` (so a `<label htmlFor>` still finds it).
 */
import * as React from "react";
import type { SearchableOption } from "@/components/ui/SearchableSelect/SearchableSelect";

export type { SearchableOption };

export const SearchableSelect: React.FC<{
  options: SearchableOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  "aria-label"?: string;
}> = ({ options, value, onChange, placeholder, id, disabled, "aria-label": ariaLabel }) => (
  <select
    id={id}
    aria-label={ariaLabel}
    disabled={disabled}
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value || null)}
  >
    <option value="">{placeholder ?? "Select"}</option>
    {options.map((o) => (
      <option key={o.value} value={o.value} disabled={o.disabled}>
        {o.label}
      </option>
    ))}
  </select>
);
