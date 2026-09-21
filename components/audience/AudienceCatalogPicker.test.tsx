import { fireEvent, render, screen } from "@testing-library/react";

import { AudienceBuilder } from "./AudienceBuilder";
import type { FieldDTO } from "@/models/user/fields";
import { AttributeType } from "@/models/attribute";

jest.mock("@/components/auth/useAccess", () => ({
  useAccess: () => ({ access: { systemOwner: true } }),
}));

// No reference catalogue is involved here; the real hook would need a query client.
jest.mock("@/components/hooks/useReferenceOptions", () => ({
  REFERENCE_ENDPOINTS: {},
  useReferenceOptions: () => ({ options: [], isLoading: false, hasEndpoint: false }),
}));

const attribute = (over: Partial<FieldDTO>): FieldDTO => ({
  id: "attr:11111111-1111-1111-1111-111111111111",
  key: "Citizenship",
  label: "Citizenship",
  type: AttributeType.COUNTRY,
  isSystem: false,
  level: "READ",
  viewScopes: ["COMPANY"],
  ...over,
});

/**
 * A custom attribute whose values come from a catalogue is filtered by picking an entry, not by
 * typing one — "Germany" typed as "germany" or "DE" matched nobody. The filter sends the entry's
 * stored text, which is what the attribute holds.
 */
describe("AudienceBuilder — catalogue-backed attribute values", () => {
  it("picks a country from the catalogue and sends its stored text", () => {
    const onChange = jest.fn();
    const field = attribute({});
    render(
      <AudienceBuilder
        fields={[field]}
        value={[{ field: field.id, op: "eq", value: "" }]}
        onChange={onChange}
      />,
    );

    // No free-text box for the value.
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Select value"));
    fireEvent.click(screen.getByRole("option", { name: "Germany" }));

    expect(onChange).toHaveBeenLastCalledWith([{ field: field.id, op: "eq", value: "Germany" }]);
  });

  it("offers several currencies at once for 'is any of'", () => {
    const onChange = jest.fn();
    const field = attribute({ type: AttributeType.CURRENCY, label: "Pay currency" });
    render(
      <AudienceBuilder
        fields={[field]}
        value={[{ field: field.id, op: "in", values: [] }]}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByText("Select values"));
    fireEvent.click(screen.getByRole("option", { name: /^EUR/ }));

    expect(onChange).toHaveBeenLastCalledWith([{ field: field.id, op: "in", values: ["EUR"] }]);
  });

  it("shows a picked value by its label", () => {
    const field = attribute({});
    render(
      <AudienceBuilder
        fields={[field]}
        value={[{ field: field.id, op: "eq", value: "France" }]}
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByText("France")).toBeInTheDocument();
  });

  it("uses the attribute's own options for a select, by id", () => {
    const onChange = jest.fn();
    const field = attribute({
      type: AttributeType.SELECT,
      label: "Seniority",
      options: [
        { id: "opt:a", value: "Junior" },
        { id: "opt:b", value: "Senior" },
      ],
    });
    render(
      <AudienceBuilder
        fields={[field]}
        value={[{ field: field.id, op: "in", values: [] }]}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByText("Select values"));
    fireEvent.click(screen.getByRole("option", { name: "Senior" }));

    expect(onChange).toHaveBeenLastCalledWith([{ field: field.id, op: "in", values: ["opt:b"] }]);
  });
});
