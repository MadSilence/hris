import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { DocumentCategoriesContainer } from "./DocumentCategoriesContainer";
import type { DocumentCategoryDTO } from "@/api/modules/documents/dto";

const category = (over: Partial<DocumentCategoryDTO>): DocumentCategoryDTO => ({
  id: "c1",
  name: "Certificates",
  isActive: true,
  isSystem: false,
  requiresExpiry: false,
  remindDaysBefore: 30,
  defaultVisibility: "VISIBLE_TO_EMPLOYEE",
  ...over,
});

const categories = [
  category({}),
  category({ id: "c2", name: "Identity" }),
  category({ id: "c3", name: "Payslips", remindDaysBefore: null }),
  category({ id: "c4", name: "Retired", isActive: false }),
];

jest.mock(
  "@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/useDocumentCategories",
  () => ({ useDocumentCategories: () => ({ data: categories, isLoading: false }) }),
);

const mutateAsync = jest.fn(async () => ({}));
jest.mock("@/components/modules/settings/modules/documentCategories/hooks/useDocumentCategoryMutations", () => ({
  useSaveDocumentCategory: () => ({ mutateAsync: jest.fn(), isPending: false, error: null, reset: jest.fn() }),
  useDeleteDocumentCategory: () => ({ mutateAsync, isPending: false, error: null, reset: jest.fn() }),
}));

const get = jest.fn();
jest.mock("@/components/providers/AppDataProvider", () => ({
  useAppDataContext: () => ({ internalApiClient: { get } }),
}));

const show = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <DocumentCategoriesContainer />
    </QueryClientProvider>,
  );

beforeEach(() => {
  mutateAsync.mockClear();
  get.mockReset();
});

describe("DocumentCategoriesContainer (AQ-19)", () => {
  it("lists the categories in use with their rules, a retired one gone", () => {
    show();
    expect(screen.getByText("Certificates")).toBeInTheDocument();
    expect(screen.getAllByText("Expiry date optional · remind 30 days before · visible to the person")).toHaveLength(2);
    expect(screen.getByText("No expiry · visible to the person")).toBeInTheDocument();
    expect(screen.queryByText("Retired")).not.toBeInTheDocument();
  });

  it("keeps a used category's documents by default, and moves them on request", async () => {
    get.mockResolvedValue({ name: "Certificates", documents: 12, trashed: 0 });
    const user = userEvent.setup();
    show();

    await user.click(screen.getByRole("button", { name: "Actions for Certificates" }));
    expect(await screen.findByRole("menuitem", { name: "Edit" })).toBeInTheDocument();
    await user.click(screen.getByRole("menuitem", { name: "Delete" }));

    expect(await screen.findByText("Delete “Certificates”?")).toBeInTheDocument();
    expect(await screen.findByText("12 documents have this category")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Keep them as they are" })).toBeChecked();

    await user.click(screen.getByRole("radio", { name: "Move them to another category" }));
    await user.click(screen.getByRole("button", { name: "Delete and move" }));
    // No category chosen yet: the dialog says so and sends nothing.
    expect(await screen.findByText("Choose the category to move them to.")).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();

    await user.click(screen.getByRole("radio", { name: "Keep them as they are" }));
    await user.click(screen.getByRole("button", { name: "Delete category" }));
    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({ id: "c1", strategy: "KEEP", targetCategoryId: null }));
  });

  it("asks plainly when nobody uses the category", async () => {
    get.mockResolvedValue({ name: "Payslips", documents: 0, trashed: 0 });
    const user = userEvent.setup();
    show();

    await user.click(screen.getByRole("button", { name: "Actions for Payslips" }));
    await user.click(await screen.findByRole("menuitem", { name: "Delete" }));

    expect(await screen.findByText("No documents have this category")).toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete category" })).toBeInTheDocument();
  });

  it("counts the trash too, since a move re-tags it (W10)", async () => {
    get.mockResolvedValue({ name: "Certificates", documents: 1, trashed: 1 });
    const user = userEvent.setup();
    show();

    await user.click(screen.getByRole("button", { name: "Actions for Certificates" }));
    await user.click(await screen.findByRole("menuitem", { name: "Delete" }));

    expect(await screen.findByText("1 document has this category, and 1 in the trash")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Move them to another category" })).toBeInTheDocument();
  });

  it("offers the choice when only the trash carries the category (W10)", async () => {
    get.mockResolvedValue({ name: "Payslips", documents: 0, trashed: 2 });
    const user = userEvent.setup();
    show();

    await user.click(screen.getByRole("button", { name: "Actions for Payslips" }));
    await user.click(await screen.findByRole("menuitem", { name: "Delete" }));

    expect(await screen.findByText("2 documents in the trash have this category")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Keep them as they are" })).toBeChecked();
  });
});
