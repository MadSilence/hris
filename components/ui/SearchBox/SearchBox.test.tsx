import { fireEvent, render, screen } from "@testing-library/react";
import { SearchBox } from "./SearchBox";

/** DQ-04 and DT24 / B10: every search box reads "Search", and a filled one clears with the × inside it. */
describe("SearchBox", () => {
  it("reads Search, and shows its × only while there is something to clear", () => {
    const onChange = jest.fn();
    const { rerender } = render(<SearchBox value="" onChange={onChange} />);
    expect(screen.getByRole("textbox")).toHaveAttribute("placeholder", "Search");
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
    rerender(<SearchBox value="contrakt" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(onChange).toHaveBeenCalledWith("");
  });
});
