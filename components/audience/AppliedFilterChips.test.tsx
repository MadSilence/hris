import { fireEvent, render, screen } from "@testing-library/react";
import { AppliedFilterChips } from "./AppliedFilterChips";
import type { FieldDTO, FilterDTO } from "@/models/user/fields";

jest.mock("@/components/auth/useAccess", () => ({ useAccess: () => ({ access: { systemOwner: true } }) }));
jest.mock("@/components/audience/hooks/useAudienceFieldOptions", () => ({
  useAudienceFieldOptions: () => ({ options: [], isLoading: false, hasOptions: false }),
}));
jest.mock("@/components/hooks/useUser/useUser", () => ({ useUser: () => ({ data: undefined }) }));

const fields: FieldDTO[] = ["a", "b", "c", "d", "e"].map(
  (k) => ({ id: `sys:${k}`, label: `Field ${k.toUpperCase()}`, isSystem: true, configurable: false, type: "TEXT" }) as FieldDTO,
);
const filters: FilterDTO[] = ["a", "b", "c", "d", "e"].map((k) => ({ field: `sys:${k}`, op: "eq", value: `Value ${k}` }));

describe("AppliedFilterChips (N09c)", () => {
  it("shows nothing while no condition is in force", () => {
    const { container } = render(<AppliedFilterChips fields={fields} value={[]} onChange={jest.fn()} onShowAll={jest.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the first three, then +N more, which opens the filter", () => {
    const onShowAll = jest.fn();
    render(<AppliedFilterChips fields={fields} value={filters} onChange={jest.fn()} onShowAll={onShowAll} />);
    expect(screen.getByText("Value a")).toBeInTheDocument();
    expect(screen.getByText("Value c")).toBeInTheDocument();
    expect(screen.queryByText("Value d")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "+2 more" }));
    expect(onShowAll).toHaveBeenCalled();
  });

  it("folds into +N more earlier when a crowded toolbar asks for fewer chips (W3)", () => {
    const { rerender } = render(
      <AppliedFilterChips fields={fields} value={filters.slice(0, 2)} onChange={jest.fn()} onShowAll={jest.fn()} shown={1} />,
    );
    expect(screen.getByText("Value a")).toBeInTheDocument();
    expect(screen.queryByText("Value b")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "+1 more" })).toBeInTheDocument();

    rerender(<AppliedFilterChips fields={fields} value={filters.slice(0, 2)} onChange={jest.fn()} onShowAll={jest.fn()} shown={0} />);
    expect(screen.queryByText("Value a")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "+2 more" })).toBeInTheDocument();
  });

  it("takes one condition off with its ×, and all with Clear all", () => {
    const onChange = jest.fn();
    render(<AppliedFilterChips fields={fields} value={filters.slice(0, 2)} onChange={onChange} onShowAll={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove the filter: Field A" }));
    expect(onChange).toHaveBeenLastCalledWith([filters[1]]);
    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it("says an operator other than is between the field and the value", () => {
    render(<AppliedFilterChips fields={fields} value={[{ field: "sys:a", op: "neq", value: "X" }]} onChange={jest.fn()} onShowAll={jest.fn()} />);
    expect(screen.getByText("Field A is not")).toBeInTheDocument();
  });
});
