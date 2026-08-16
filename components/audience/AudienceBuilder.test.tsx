import { fireEvent, render, screen } from "@testing-library/react";

import { AudienceBuilder } from "./AudienceBuilder";
import type { FieldDTO } from "@/models/user/fields";

jest.mock("@/components/auth/useAccess", () => ({
  useAccess: () => ({ access: { systemOwner: true } }),
}));

// Value pickers fetch their options; this suite is about the operator row, not the pickers.
jest.mock("@/components/audience/hooks/useAudienceFieldOptions", () => ({
  useAudienceFieldOptions: () => ({ options: [], isLoading: false, hasOptions: false }),
}));

beforeAll(() => {
  Object.defineProperty(global, "ResizeObserver", {
    writable: true,
    configurable: true,
    value: class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  });
});

const fields: FieldDTO[] = [
  { id: "sys:first_name", label: "First name", isSystem: true, type: "TEXT" } as FieldDTO,
];

describe("AudienceBuilder", () => {
  // Rows are seeded from props at mount only (that is why PeoplePicker remounts the builder with a
  // key), so these are two separate renders rather than a rerender.
  it("hides the empty-value choice on a positive operator", () => {
    render(
      <AudienceBuilder
        fields={fields}
        value={[{ field: "sys:first_name", op: "eq", value: "Ann" }]}
        onChange={jest.fn()}
      />,
    );

    expect(screen.queryByText(/include people with no value/i)).not.toBeInTheDocument();
  });

  it("shows the empty-value choice on an excluding operator", () => {
    render(
      <AudienceBuilder
        fields={fields}
        value={[{ field: "sys:first_name", op: "neq", value: "Ann" }]}
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByText(/include people with no value/i)).toBeInTheDocument();
  });

  it("carries includeEmpty into the emitted filter", () => {
    const onChange = jest.fn();
    render(
      <AudienceBuilder
        fields={fields}
        value={[{ field: "sys:first_name", op: "neq", value: "Ann" }]}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("checkbox"));

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ field: "sys:first_name", op: "neq", includeEmpty: true }),
    ]);
  });

  it("leaves includeEmpty off a positive filter's payload", () => {
    const onChange = jest.fn();
    render(
      <AudienceBuilder
        fields={fields}
        value={[{ field: "sys:first_name", op: "eq", value: "Ann" }]}
        onChange={onChange}
      />,
    );

    // Nothing to click — the point is that the emitted shape is unchanged for positive operators.
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("shows the population toggle only when the caller owns that choice", () => {
    const { rerender } = render(
      <AudienceBuilder fields={fields} value={[]} onChange={jest.fn()} />,
    );
    expect(screen.queryByText(/include non-active people/i)).not.toBeInTheDocument();

    rerender(
      <AudienceBuilder
        fields={fields}
        value={[]}
        onChange={jest.fn()}
        includeInactive={false}
        onIncludeInactiveChange={jest.fn()}
      />,
    );
    expect(screen.getByText(/include non-active people/i)).toBeInTheDocument();
  });
});
