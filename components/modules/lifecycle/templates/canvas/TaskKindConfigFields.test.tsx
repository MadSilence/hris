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

const renderDocumentTask = () =>
  render(
    <TaskKindConfigFields idPrefix="t" kind="DOCUMENT" type="ONBOARDING" attributeIds={[]} categoryId={null} onChange={jest.fn()} />,
  );

describe("TaskKindConfigFields — Upload Document", () => {
  it("says where to add categories when the company has none", () => {
    (useDocumentCategories as jest.Mock).mockReturnValue({ data: [], isLoading: false });
    renderDocumentTask();
    expect(screen.getByText(/No document categories yet — add them in Settings → People → Documents/)).toBeInTheDocument();
  });

  it("says nothing while the categories are still loading, or when there are some", () => {
    (useDocumentCategories as jest.Mock).mockReturnValue({ data: undefined, isLoading: true });
    const { unmount } = renderDocumentTask();
    expect(screen.queryByText(/No document categories yet/)).not.toBeInTheDocument();
    unmount();

    (useDocumentCategories as jest.Mock).mockReturnValue({ data: [{ id: "passport", name: "Passport" }], isLoading: false });
    renderDocumentTask();
    expect(screen.queryByText(/No document categories yet/)).not.toBeInTheDocument();
  });
});
