import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import { ProfileSaveBar } from "./ProfileSaveBar";

const renderBar = (props: Partial<React.ComponentProps<typeof ProfileSaveBar>> = {}) => {
  const onDiscard = jest.fn();
  const onSave = jest.fn();
  render(
    <ProfileSaveBar
      changeCount={3}
      isSaving={false}
      onDiscard={onDiscard}
      onSave={onSave}
      {...props}
    />
  );
  return { onDiscard, onSave };
};

describe("ProfileSaveBar", () => {
  it("is not drawn while nothing has changed", () => {
    renderBar({ changeCount: 0 });

    expect(screen.queryByRole("region", { name: "Unsaved changes" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
  });

  it("says how many changes are waiting — '3 unsaved changes · Discard · Save'", () => {
    const { onDiscard, onSave } = renderBar();

    expect(screen.getByText("3 unsaved changes")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Discard" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onDiscard).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("speaks in the singular for one change", () => {
    renderBar({ changeCount: 1 });

    expect(screen.getByText("1 unsaved change")).toBeInTheDocument();
  });

  it("holds Save while a field is invalid, and both buttons while saving", () => {
    const { rerender } = render(
      <ProfileSaveBar changeCount={2} isSaving={false} saveBlocked onDiscard={jest.fn()} onSave={jest.fn()}/>
    );
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Discard" })).toBeEnabled();

    rerender(<ProfileSaveBar changeCount={2} isSaving onDiscard={jest.fn()} onSave={jest.fn()}/>);
    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Discard" })).toBeDisabled();
  });

  it("shows the server's refusal beside the buttons, keeping the draft", () => {
    renderBar({ error: "You cannot edit this field." });

    expect(screen.getByRole("alert")).toHaveTextContent("You cannot edit this field.");
    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
  });
});
