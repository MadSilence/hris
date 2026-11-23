import { fireEvent, render, screen } from "@testing-library/react";
import { DatePicker } from "./DatePicker";
import { DateRangePicker } from "./DateRangePicker";

/** X5 / AQ-02: the one date field takes a typed date, and the picker opens from it. */
describe("DatePicker", () => {
  it("keeps a typed date on Enter", () => {
    const onChange = jest.fn();
    render(<DatePicker value="" onChange={onChange} ariaLabel="Valid until" />);
    const field = screen.getByRole("textbox", { name: "Valid until" });
    fireEvent.change(field, { target: { value: "14.03.2031" } });
    fireEvent.keyDown(field, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("2031-03-14");
  });

  it("goes back to the last value when what was typed is not a date", () => {
    const onChange = jest.fn();
    render(<DatePicker value="2031-03-14" onChange={onChange} ariaLabel="Valid until" />);
    const field = screen.getByRole("textbox", { name: "Valid until" });
    fireEvent.change(field, { target: { value: "soon" } });
    fireEvent.keyDown(field, { key: "Enter" });
    expect(onChange).not.toHaveBeenCalled();
    expect(field).toHaveValue("14 Mar 2031");
  });

  it("refuses a typed date outside its bounds", () => {
    const onChange = jest.fn();
    render(<DatePicker value="" onChange={onChange} min="2031-01-01" ariaLabel="From" />);
    const field = screen.getByRole("textbox", { name: "From" });
    fireEvent.change(field, { target: { value: "14.03.2030" } });
    fireEvent.keyDown(field, { key: "Enter" });
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("DateRangePicker", () => {
  it("reads both ends from what was typed", () => {
    const onChange = jest.fn();
    render(<DateRangePicker value={null} onChange={onChange} ariaLabel="Period" />);
    const field = screen.getByRole("textbox", { name: "Period" });
    fireEvent.change(field, { target: { value: "11 Jan 2027 – 22 Jan 2027" } });
    fireEvent.keyDown(field, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith({ start: "2027-01-11", end: "2027-01-22" });
  });

  it("writes the year once when both ends share it", () => {
    render(<DateRangePicker value={{ start: "2027-01-11", end: "2027-01-22" }} onChange={jest.fn()} ariaLabel="Period" />);
    expect(screen.getByRole("textbox", { name: "Period" })).toHaveValue("11 Jan – 22 Jan 2027");
  });
});
