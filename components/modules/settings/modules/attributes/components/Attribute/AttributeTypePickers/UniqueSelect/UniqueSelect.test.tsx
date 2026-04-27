import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UniqueSelect } from "./UniqueSelect";

describe("UniqueSelect", () => {
  it("renders label", () => {
    render(
      <UniqueSelect
        checked={false}
        onChangeAction={() => {
        }}
      />,
    );

    expect(screen.getByText("Unique")).toBeInTheDocument();
  });

  it("reflects unchecked state", () => {
    render(
      <UniqueSelect
        checked={false}
        onChangeAction={() => {
        }}
      />,
    );

    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("reflects checked state", () => {
    render(
      <UniqueSelect
        checked={true}
        onChangeAction={() => {
        }}
      />,
    );

    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("calls onChange(true) when clicked from false", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <UniqueSelect
        checked={false}
        onChangeAction={onChange}
      />,
    );

    await user.click(screen.getByRole("checkbox"));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("calls onChange(false) when clicked from true", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <UniqueSelect
        checked={true}
        onChangeAction={onChange}
      />,
    );

    await user.click(screen.getByRole("checkbox"));

    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("clicking label toggles checkbox", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <UniqueSelect
        checked={false}
        onChangeAction={onChange}
      />,
    );

    await user.click(screen.getByText("Unique"));

    expect(onChange).toHaveBeenCalledWith(true);
  });
});
