import { fireEvent, render, screen } from "@testing-library/react";

import { ShareViewDialog, previewSentences } from "./ShareViewDialog";
import type { PeopleView, PeopleViewShare, SharePreview } from "@/models/peopleView";
import type { PickedUser } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";

const shareMutate = jest.fn();
const unshareMutate = jest.fn();
const updateShareMutate = jest.fn();
const previewAsked: unknown[] = [];

let shares: PeopleViewShare[] = [];
let preview: SharePreview | undefined;

const mutation = (mutate: jest.Mock) => ({ mutate, reset: jest.fn(), isPending: false, error: null });

jest.mock("@/components/modules/organization/components/PeopleViews/hooks/usePeopleViews", () => ({
  usePeopleViewShares: () => ({ data: shares, isLoading: false }),
  useSharePreview: (_viewId: string | null, grantees: unknown[]) => {
    previewAsked.push(grantees);
    return { data: grantees.length ? preview : undefined, isFetching: false };
  },
  usePeopleViewMutations: () => ({
    share: mutation(shareMutate),
    unshare: mutation(unshareMutate),
    updateShare: mutation(updateShareMutate),
  }),
}));

jest.mock("@/components/hooks/useReferenceOptions", () => ({
  useReferenceOptions: () => ({ options: [{ id: "team-1", label: "Platform" }], isLoading: false, hasEndpoint: true }),
}));

// The real picker searches the directory; here it is a button that picks one person.
jest.mock("@/components/modules/settings/shared/UserPickerField/UserPickerField", () => ({
  UserPickerField: ({ onChange }: { onChange: (u: PickedUser | null) => void }) => (
    <button type="button" onClick={() => onChange({ id: "u-cid", firstName: "Cid", lastName: "Clerk" })}>
      Pick Cid
    </button>
  ),
}));

beforeAll(() => {
  Object.defineProperty(global, "ResizeObserver", {
    writable: true,
    configurable: true,
    value: class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  });
});

const view: PeopleView = {
  id: "view-1",
  name: "Pay Review",
  payload: { columns: ["sys:first_name"], filters: [], sort: null },
  access: "OWNER",
};

beforeEach(() => {
  jest.clearAllMocks();
  previewAsked.length = 0;
  shares = [];
  preview = undefined;
});

describe("ShareViewDialog", () => {
  it("lists who has the view, names a grantee that is gone, and asks before removing", () => {
    shares = [
      { id: "s-1", granteeType: "TEAM", granteeId: "t-1", granteeName: "Platform", permission: "EDIT" },
      { id: "s-2", granteeType: "ROLE", granteeId: "r-1", granteeName: null, permission: "VIEW" },
    ];

    render(<ShareViewDialog view={view} onClose={jest.fn()} />);

    const list = screen.getByRole("list", { name: "Shared With" });
    expect(list).toHaveTextContent("Platform");
    expect(list).toHaveTextContent("Removed Role");

    fireEvent.click(screen.getAllByRole("button", { name: "Remove" })[0]);
    expect(screen.getByText("Remove Access")).toBeInTheDocument();
    expect(unshareMutate).not.toHaveBeenCalled();

    fireEvent.click(screen.getAllByRole("button", { name: "Remove" }).at(-1)!);
    expect(unshareMutate).toHaveBeenCalledWith({ viewId: "view-1", shareId: "s-1" }, expect.anything());
  });

  it("warns who will not see which column before anything is shared, then shares what was picked", () => {
    preview = {
      recipientCount: 4,
      noPeopleAccessCount: 0,
      hiddenFields: [{ fieldId: "attr:s", label: "Salary", peopleCount: 3, sampleNames: ["Cid Clerk", "Dee Doe"] }],
    };

    render(<ShareViewDialog view={view} onClose={jest.fn()} />);
    expect(screen.getByRole("button", { name: "Share" })).toBeDisabled();
    expect(screen.getByText("Not shared with anyone yet.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Pick Cid" }));

    expect(screen.getByRole("list", { name: "To Share" })).toHaveTextContent("Cid Clerk");
    expect(previewAsked.at(-1)).toEqual([{ granteeType: "PERSON", granteeId: "u-cid" }]);
    expect(screen.getByText("3 people won't see Salary (Cid Clerk, Dee Doe and 1 more).")).toBeInTheDocument();
    expect(shareMutate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Share" }));
    expect(shareMutate).toHaveBeenCalledWith(
      { viewId: "view-1", grantees: [{ granteeType: "PERSON", granteeId: "u-cid", permission: "VIEW" }] },
      expect.anything(),
    );
  });

  it("takes a picked grantee off again before sharing", () => {
    render(<ShareViewDialog view={view} onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Pick Cid" }));

    fireEvent.click(screen.getByRole("button", { name: "Do Not Share With Cid Clerk" }));

    expect(screen.queryByRole("list", { name: "To Share" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Share" })).toBeDisabled();
  });
});

describe("previewSentences", () => {
  it("says who cannot open People at all, and who misses which field", () => {
    expect(
      previewSentences({
        recipientCount: 5,
        noPeopleAccessCount: 1,
        hiddenFields: [{ fieldId: "sys:email", label: "Email", peopleCount: 1, sampleNames: ["Ann Admin"] }],
      }),
    ).toEqual([
      "1 person can't open the People table and won't see this view at all.",
      "1 person won't see Email (Ann Admin).",
    ]);
  });
});
