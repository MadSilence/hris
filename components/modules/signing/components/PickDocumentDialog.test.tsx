import { fireEvent, render, screen } from "@testing-library/react";
import { PickDocumentDialog } from "./PickDocumentDialog";
import type { SectionDocumentRow } from "@/api/modules/signing/dto";
import { partialMock } from "@/test/types";

const row = partialMock<SectionDocumentRow>({
  personName: "Kevin Pinas",
  document: partialMock<SectionDocumentRow["document"]>({
    id: "d1",
    name: "walk-contract.pdf",
    mimeType: "application/pdf",
    categoryName: "Contract",
    signedAt: null,
  }),
});

jest.mock("../hooks/useDocumentsSection", () => ({
  useSectionDocuments: () => ({
    isLoading: false,
    isError: false,
    data: { pages: [{ rows: [row] }] },
    hasNextPage: false,
  }),
}));

describe("PickDocumentDialog (D14)", () => {
  it("draws a row's box without a button inside the row's button, so the markup is valid", () => {
    render(<PickDocumentDialog onCloseAction={jest.fn()} onNextAction={jest.fn()} />);
    const option = screen.getByRole("radio", { name: /walk-contract\.pdf/ });
    expect(option.querySelector("button")).toBeNull();

    fireEvent.click(option);
    expect(option).toHaveAttribute("aria-checked", "true");
    expect(option.querySelector("[data-state=checked]")).not.toBeNull();
  });
});
