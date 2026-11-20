import * as React from "react";
import { render, screen } from "@testing-library/react";
import { EmptyFolderState } from "./PersonalDocumentsEmptyState";

describe("EmptyFolderState", () => {
  it("invites somebody who may add to drop files", () => {
    render(<EmptyFolderState canAdd />);
    expect(screen.getByText("This folder is empty")).toBeInTheDocument();
    expect(screen.getByText("Drop files here or use Add.")).toBeInTheDocument();
  });

  it("is one line for a reader who may not upload (REDESIGN F5.1, walk of 2026-11-19)", () => {
    render(<EmptyFolderState canAdd={false} />);
    expect(screen.getByText("This folder is empty")).toBeInTheDocument();
    expect(screen.queryByText("Drop files here or use Add.")).not.toBeInTheDocument();
    expect(screen.queryByText(/Create a folder or upload a file/)).not.toBeInTheDocument();
  });
});
