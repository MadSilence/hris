import * as React from "react";
import { render, screen } from "@testing-library/react";
import { PdfViewer } from "./PdfViewer";

describe("PdfViewer", () => {
  it("names the document and its zoom, and says so when the file cannot be read", async () => {
    global.fetch = jest.fn(async () => {
      throw new Error("gone");
    }) as unknown as typeof fetch;
    render(<PdfViewer src="blob:x" title="Employment contract" />);
    expect(screen.getByRole("document", { name: "Employment contract" })).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(await screen.findByText("We couldn’t show this document. Download it instead.")).toBeInTheDocument();
  });
});
