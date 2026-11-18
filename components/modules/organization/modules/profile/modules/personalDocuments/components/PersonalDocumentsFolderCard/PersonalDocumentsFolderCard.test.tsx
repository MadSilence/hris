import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { PersonalDocumentsFolderCard } from "./PersonalDocumentsFolderCard";

const folder = { id: "f1", name: "Contracts", parentId: null, userId: "u1", createdAt: "2026-11-01T00:00:00Z", icon: "briefcase", color: "ocean" };

describe("PersonalDocumentsFolderCard", () => {
  it("shows the name and its file count, and opens on a click", () => {
    const onOpen = jest.fn();
    render(<PersonalDocumentsFolderCard folder={folder} fileCount={3} onOpen={onOpen} />);
    expect(screen.getByText("3 files")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Contracts"));
    expect(onOpen).toHaveBeenCalledWith(folder);
  });

  it("offers no menu to a reader who can do nothing to it", () => {
    render(<PersonalDocumentsFolderCard folder={folder} onOpen={jest.fn()} />);
    expect(screen.queryByRole("button", { name: "Folder actions" })).not.toBeInTheDocument();
  });
});
