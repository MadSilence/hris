import * as React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";

import type { RecipientSpec } from "@/models/automations";
import { automationCatalogFixture } from "@/test/fixtures/automationCatalog";
import { PeoplePicker } from "./PeoplePicker";
import { addRecipient, roleChoices, splitMatch } from "./recipients";

jest.mock("@/components/audience/hooks/useSegmentResolve", () => jest.requireActual("@/test/automationSettingsMocks").segmentResolve);
jest.mock("@/components/hooks/useUser/useUser", () => jest.requireActual("@/test/automationSettingsMocks").user);

const catalog = automationCatalogFixture();

const Harness: React.FC<{ initial: RecipientSpec[]; onChange: (v: RecipientSpec[]) => void; mode?: "single" | "multiple"; approver?: boolean }> = ({
  initial,
  onChange,
  mode,
  approver,
}) => {
  const [value, setValue] = React.useState(initial);
  return (
    <PeoplePicker
      aria-label="Who gets it"
      mode={mode}
      catalog={catalog}
      event={approver ? { recipientKinds: ["APPROVER"] } : null}
      value={value}
      onChange={(v) => {
        setValue(v);
        onChange(v);
      }}
    />
  );
};

describe("recipients", () => {
  it("offers the roles in the design's order, the approver for time off, then the company's roles A–Z", () => {
    expect(roleChoices(catalog, { recipientKinds: ["APPROVER"] })).toEqual([
      { kind: "PERSON" },
      { kind: "MANAGER" },
      { kind: "MANAGERS_MANAGER" },
      { kind: "DEPARTMENT_HEAD" },
      { kind: "ONBOARDING_MANAGER" },
      { kind: "APPROVER" },
      { kind: "ROLE", roleId: "r-hr" },
      { kind: "ROLE", roleId: "r-mkt" },
    ]);
  });

  it("single mode replaces, multiple adds once", () => {
    expect(addRecipient([{ kind: "MANAGER" }], { kind: "PERSON" }, "single")).toEqual([{ kind: "PERSON" }]);
    expect(addRecipient([{ kind: "MANAGER" }], { kind: "MANAGER" }, "multiple")).toEqual([{ kind: "MANAGER" }]);
    expect(splitMatch("Marketing lead", "mar")).toEqual(["", "Mar", "keting lead"]);
  });
});

describe("PeoplePicker", () => {
  it("lists Roles, then People A–Z with their office; the picks are chips", () => {
    const onChange = jest.fn();
    render(<Harness initial={[{ kind: "ROLE", roleId: "r-hr" }]} onChange={onChange} />);
    expect(screen.getByText("HR Admin")).toBeInTheDocument();
    fireEvent.focus(screen.getByRole("combobox", { name: "Who gets it" }));
    const list = screen.getByRole("listbox");
    expect(within(list).getByRole("group", { name: "Roles" })).toBeInTheDocument();
    expect(within(list).getByRole("group", { name: "People A–Z" })).toBeInTheDocument();
    expect(within(list).queryByText("HR Admin")).not.toBeInTheDocument();
    expect(within(list).getByText("Vilnius")).toBeInTheDocument();
  });

  it("typing filters the roles and bolds what was typed; the keyboard picks", () => {
    const onChange = jest.fn();
    render(<Harness initial={[]} onChange={onChange} />);
    const input = screen.getByRole("combobox", { name: "Who gets it" });
    fireEvent.change(input, { target: { value: "mar" } });
    const option = screen.getAllByRole("option")[0];
    expect(option).toHaveTextContent("Marketing lead");
    expect(within(option).getByText("Mar")).toHaveClass("font-semibold");
    expect(screen.queryByText("Their manager")).not.toBeInTheDocument();
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenLastCalledWith([{ kind: "ROLE", roleId: "r-mkt" }]);
  });

  it("Backspace in an empty field takes the last chip back", () => {
    const onChange = jest.fn();
    render(<Harness initial={[{ kind: "MANAGER" }, { kind: "PERSON" }]} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole("combobox", { name: "Who gets it" }), { key: "Backspace" });
    expect(onChange).toHaveBeenLastCalledWith([{ kind: "MANAGER" }]);
  });

  it("single mode: a pick replaces the one there and closes the list", () => {
    const onChange = jest.fn();
    render(<Harness mode="single" approver initial={[{ kind: "MANAGER" }]} onChange={onChange} />);
    fireEvent.focus(screen.getByRole("combobox", { name: "Who gets it" }));
    fireEvent.click(within(screen.getByRole("listbox")).getByText("The approver"));
    expect(onChange).toHaveBeenLastCalledWith([{ kind: "APPROVER" }]);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
