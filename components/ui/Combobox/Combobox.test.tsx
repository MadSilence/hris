import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import { Combobox } from "./Combobox";

/** A dropdown is its own search (the designers' hub fixes A18, 2026-11-19). */
describe("Combobox", () => {
  const options = [
    { value: "de", label: "Germany" },
    { value: "fr", label: "France" },
    { value: "fi", label: "Finland" },
  ];

  const Harness: React.FC<{ onChange?: (v: string | null) => void }> = ({ onChange }) => {
    const [value, setValue] = React.useState<string | null>("de");
    return (
      <Combobox
        aria-label="Country"
        placeholder="Select a country"
        options={options}
        value={value}
        onChange={(v) => {
          setValue(v);
          onChange?.(v);
        }}
      />
    );
  };

  const field = () => screen.getByRole("combobox", { name: "Country" });

  it("types into the field itself and narrows the list, with the typed letters bold", () => {
    render(<Harness />);
    fireEvent.click(field());
    expect(screen.queryByPlaceholderText("Search")).not.toBeInTheDocument();

    fireEvent.change(field(), { target: { value: "fr" } });

    // jsdom's name computation puts a space at the bold span, so the row is read by its text.
    const rows = screen.getAllByRole("option");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent("France");
    expect(rows[0].querySelector(".font-semibold")).toHaveTextContent("Fr");
  });

  it("says Nothing found when nothing matches", () => {
    render(<Harness />);
    fireEvent.change(field(), { target: { value: "zzz" } });
    expect(screen.getByText("Nothing found")).toBeInTheDocument();
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("restores the last value on Esc", () => {
    const onChange = jest.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.change(field(), { target: { value: "fin" } });
    fireEvent.keyDown(field(), { key: "Escape" });

    expect(field()).toHaveValue("Germany");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("picks the highlighted option on Enter, and the arrows move", () => {
    const onChange = jest.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.change(field(), { target: { value: "f" } });
    fireEvent.keyDown(field(), { key: "ArrowDown" });
    fireEvent.keyDown(field(), { key: "Enter" });

    expect(onChange).toHaveBeenLastCalledWith("fi");
    expect(field()).toHaveValue("Finland");
  });
});
