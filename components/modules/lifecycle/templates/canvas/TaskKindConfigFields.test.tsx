import * as React from "react";
import { render, screen } from "@testing-library/react";
import { TaskKindConfigFields } from "./TaskKindConfigFields";
import { useDocumentCategories } from "@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/useDocumentCategories";

jest.mock("@/public/desact/src/components/ui/select", () => jest.requireActual("@/test/selectMock"));
jest.mock("@/components/modules/settings/modules/attributes/hooks/AttributeGroup/useAttributeGroups", () => ({
  useAttributeGroups: () => ({ data: [] }),
}));
jest.mock("@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/useDocumentCategories", () => ({
  useDocumentCategories: jest.fn(),
}));

const render_ = (kind: "DOCUMENT" | "TODO", categoryId: string | null) =>
  render(
    <TaskKindConfigFields idPrefix="t" kind={kind} type="ONBOARDING" attributeIds={[]} categoryId={categoryId}
      materials={[]} questions={[]} onChange={jest.fn()} />,
  );

describe("TaskKindConfigFields", () => {
  it("asks no category of an Upload Document task: any document closes it", () => {
    (useDocumentCategories as jest.Mock).mockReturnValue({ data: [{ id: "passport", name: "Passport" }], isLoading: false });
    render_("DOCUMENT", null);
    expect(screen.queryByLabelText(/Document Category/)).not.toBeInTheDocument();
    expect(screen.getByText(/goes into their Documents and closes the task/)).toBeInTheDocument();
  });

  it("says where to add categories when a to-do requires a file and the company has none", () => {
    (useDocumentCategories as jest.Mock).mockReturnValue({ data: [], isLoading: false });
    render_("TODO", "");
    expect(screen.getByText(/No document categories yet — add them in Settings → People → Documents/)).toBeInTheDocument();
  });

  it("says nothing while the categories are still loading, or when there are some", () => {
    (useDocumentCategories as jest.Mock).mockReturnValue({ data: undefined, isLoading: true });
    const { unmount } = render_("TODO", "");
    expect(screen.queryByText(/No document categories yet/)).not.toBeInTheDocument();
    unmount();

    (useDocumentCategories as jest.Mock).mockReturnValue({ data: [{ id: "passport", name: "Passport" }], isLoading: false });
    render_("TODO", "passport");
    expect(screen.queryByText(/No document categories yet/)).not.toBeInTheDocument();
  });
});
