import { fireEvent, render, screen } from "@testing-library/react";

import PeopleTable from "./PeopleTable";
import type { FieldDTO } from "@/models/user/fields";
import { AttributeType } from "@/models/attribute";

const NUMBER_ATTR = "attr:33333333-3333-3333-3333-333333333333";
const TAGS_ATTR = "attr:44444444-4444-4444-4444-444444444444";

const meta = (id: string, type: AttributeType, label: string): FieldDTO => ({
  id,
  key: label,
  label,
  type,
  isSystem: false,
  level: "READ",
  viewScopes: ["COMPANY"],
});

const columns = [
  { id: "sys:first_name", label: "Name", checked: true },
  { id: NUMBER_ATTR, label: "Salary band", checked: true },
  { id: TAGS_ATTR, label: "Skills", checked: true },
];

const renderTable = (onSortChange: jest.Mock, sort: { fieldId: string; dir: "asc" | "desc" } | null) =>
  render(
    <PeopleTable
      data={[]}
      sort={sort}
      onSortChange={onSortChange}
      visibleColumns={columns}
      fieldsMeta={[
        meta(NUMBER_ATTR, AttributeType.NUMBER, "Salary band"),
        meta(TAGS_ATTR, AttributeType.MULTI_SELECT, "Skills"),
      ]}
    />,
  );

describe("PeopleTable — sorting by an attribute column", () => {
  it("sorts a scalar attribute by its column id", () => {
    const onSortChange = jest.fn();
    renderTable(onSortChange, null);

    fireEvent.click(screen.getByText("Salary band"));

    expect(onSortChange).toHaveBeenCalledWith({ fieldId: NUMBER_ATTR, dir: "asc" });
  });

  it("turns an ascending attribute sort descending, and marks the header", () => {
    const onSortChange = jest.fn();
    renderTable(onSortChange, { fieldId: NUMBER_ATTR, dir: "asc" });

    expect(screen.getByText("↑")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Salary band"));

    expect(onSortChange).toHaveBeenCalledWith({ fieldId: NUMBER_ATTR, dir: "desc" });
  });

  it("leaves a multi-valued attribute's header inert", () => {
    const onSortChange = jest.fn();
    renderTable(onSortChange, null);

    fireEvent.click(screen.getByText("Skills"));

    expect(onSortChange).not.toHaveBeenCalled();
  });
});
