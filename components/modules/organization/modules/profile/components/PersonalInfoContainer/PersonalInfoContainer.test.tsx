import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { PersonalInfoContainer } from "./PersonalInfoContainer";
import { AttributeType } from "@/models/attribute";
import type { Attribute } from "@/models/attribute/Attribute";
import type { AttributeGroup } from "@/models/attribute/AttributeGroup";
import type { User } from "@/models/user/User";
import { ActionStatus } from "@/components/models/ActionStatus";
import { updateUserAttributesAction } from "@/components/modules/organization/modules/profile/actions/updateUserAttributesAction";
import { useAttributeGroups } from "@/components/modules/settings/modules/attributes/hooks/AttributeGroup/useAttributeGroups";
import { useUserFields } from "@/components/modules/organization/hooks/useUserFields/useUserFields";
import { partialMock } from "@/test/types";

jest.mock("@/components/modules/settings/modules/attributes/hooks/AttributeGroup/useAttributeGroups");
jest.mock("@/components/modules/organization/hooks/useUserFields/useUserFields");
jest.mock("@/components/modules/organization/modules/profile/actions/updateUserAttributesAction");
jest.mock("swr", () => ({ useSWRConfig: () => ({ mutate: jest.fn() }) }));
jest.mock("@/components/modules/organization/modules/profile/context/ProfileEditGuard", () => ({
  useProfileEditGuard: () => ({ setDirty: jest.fn(), isDirty: false }),
}));

const attribute = (over: Partial<Attribute>): Attribute =>
  partialMock<Attribute>({
    id: "a1",
    name: "Attribute",
    type: AttributeType.TEXT,
    sortOrder: 0,
    options: [],
    ...over,
  });

const group = (
  attributes: Attribute[],
  over: Partial<AttributeGroup> = {}
): AttributeGroup =>
  partialMock<AttributeGroup>({
    id: "g1",
    name: "Details",
    sortOrder: 0,
    attributes,
    ...over,
  });

const user = (over: Partial<User>): User =>
  partialMock<User>({
    id: "u1",
    firstName: "Ada",
    lastName: "Lovelace",
    custom: {},
    ...over,
  });

const mockGroups = (groups: AttributeGroup[], isLoading = false) =>
  (useAttributeGroups as jest.Mock).mockReturnValue({ data: groups, isLoading, error: null });

beforeEach(() => {
  jest.clearAllMocks();
  (useUserFields as jest.Mock).mockReturnValue({ data: [], isLoading: false });
  (updateUserAttributesAction as jest.Mock).mockResolvedValue({ status: ActionStatus.SUCCESS });
});

describe("PersonalInfoContainer — what the caller may see", () => {
  it("renders only the attributes present in fieldAccess", () => {
    // The visibility filter is the whole point: an attribute the server did not grant must not be
    // listed at all, not listed-and-empty.
    mockGroups([
      group([
        attribute({ id: "visible", name: "City" }),
        attribute({ id: "hidden", name: "Salary band" }),
      ]),
    ]);

    render(
      <PersonalInfoContainer
        user={user({ fieldAccess: { "attr:visible": "VIEW" } })}
      />
    );

    expect(screen.getByText("City")).toBeInTheDocument();
    expect(screen.queryByText("Salary band")).not.toBeInTheDocument();
  });

  it("offers no Edit pencil when nothing in the block is editable", () => {
    mockGroups([group([attribute({ id: "a1", name: "City" })])]);

    render(<PersonalInfoContainer user={user({ fieldAccess: { "attr:a1": "VIEW" } })} />);

    expect(screen.queryByRole("button", { name: "Edit Details" })).not.toBeInTheDocument();
  });

  it("waits for the field catalogue before painting", () => {
    // Rendering while `useUserFields` is still in flight showed a profile with no system-field
    // sections and half a sidebar — the same defect that was fixed in the People table.
    mockGroups([group([attribute({ id: "a1", name: "City" })])]);
    (useUserFields as jest.Mock).mockReturnValue({ data: undefined, isLoading: true });

    render(<PersonalInfoContainer user={user({ fieldAccess: { "attr:a1": "VIEW" } })} />);

    expect(screen.queryByText("City")).not.toBeInTheDocument();
  });
});

describe("PersonalInfoContainer — saving", () => {
  const editableUser = (custom: Record<string, unknown> = {}) =>
    user({ fieldAccess: { "attr:a1": "EDIT", "attr:a2": "VIEW" }, custom });

  // Editing is per block now: the pencil in the group's header opens that group and no other.
  const enterEditMode = () =>
    fireEvent.click(screen.getByRole("button", { name: "Edit Details" }));

  it("sends only the fields that changed", async () => {
    mockGroups([
      group([
        attribute({ id: "a1", name: "City" }),
        attribute({ id: "a2", name: "Country" }),
      ]),
    ]);

    render(<PersonalInfoContainer user={editableUser({ "attr:a1": "Berlin", "attr:a2": "DE" })} />);
    enterEditMode();

    fireEvent.change(screen.getByDisplayValue("Berlin"), { target: { value: "Hamburg" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(updateUserAttributesAction).toHaveBeenCalled());
    expect(updateUserAttributesAction).toHaveBeenCalledWith({
      userId: "u1",
      values: { a1: "Hamburg" },
    });
  });

  it("does not call the action when nothing changed", async () => {
    mockGroups([group([attribute({ id: "a1", name: "City" })])]);

    render(<PersonalInfoContainer user={editableUser({ "attr:a1": "Berlin" })} />);
    enterEditMode();

    // Save is disabled while the form is clean — the guard the user actually meets.
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    expect(updateUserAttributesAction).not.toHaveBeenCalled();
  });

  it("blocks Save while a required field is being cleared, and not before", () => {
    // `required` means "cannot be cleared", which is the rule the server enforces. Treating it as
    // "must be filled" made the client stricter than the API: one never-filled required attribute
    // froze every other edit on the page.
    mockGroups([group([attribute({ id: "a1", name: "City", required: true })])]);

    render(<PersonalInfoContainer user={editableUser({ "attr:a1": "Berlin" })} />);
    enterEditMode();

    fireEvent.change(screen.getByDisplayValue("Berlin"), { target: { value: "" } });
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    expect(screen.getByText("This field cannot be cleared.")).toBeInTheDocument();
  });

  it("leaves a required field that was already empty alone", () => {
    mockGroups([
      group([
        attribute({ id: "a1", name: "City" }),
        attribute({ id: "a2", name: "Country", required: true }),
      ]),
    ]);

    render(
      <PersonalInfoContainer
        user={user({
          fieldAccess: { "attr:a1": "EDIT", "attr:a2": "EDIT" },
          custom: { "attr:a1": "Berlin" },
        })}
      />
    );
    enterEditMode();

    fireEvent.change(screen.getByDisplayValue("Berlin"), { target: { value: "Hamburg" } });

    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
  });
});

/**
 * Editing is per block. It used to be one page-wide flag: a single Edit armed every field on the
 * profile at once and put Save above a form you had already scrolled past.
 */
describe("PersonalInfoContainer — one block at a time", () => {
  const twoGroups = () => [
    group([attribute({ id: "a1", name: "City" })]),
    group([attribute({ id: "a2", name: "Shirt size" })], { id: "g2", name: "Extras", sortOrder: 1 }),
  ];

  const bothEditable = () =>
    user({ fieldAccess: { "attr:a1": "EDIT", "attr:a2": "EDIT" } });

  it("opens an editor only in the block whose pencil was clicked", () => {
    mockGroups(twoGroups());
    render(
      <PersonalInfoContainer
        user={user({
          fieldAccess: { "attr:a1": "EDIT", "attr:a2": "EDIT" },
          custom: { "attr:a1": "Berlin", "attr:a2": "M" },
        })}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit Details" }));

    // The open block's value is in an input; the other block's is still just text on the page.
    expect(screen.getByDisplayValue("Berlin")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("M")).not.toBeInTheDocument();
    expect(screen.getByText("M")).toBeInTheDocument();
  });

  it("withdraws the other blocks' pencils while one is open, so no draft is lost to a click", () => {
    mockGroups(twoGroups());
    render(<PersonalInfoContainer user={bothEditable()}/>);

    fireEvent.click(screen.getByRole("button", { name: "Edit Details" }));

    expect(screen.queryByRole("button", { name: "Edit Extras" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("gives the pencils back when the edit is cancelled", () => {
    mockGroups(twoGroups());
    render(<PersonalInfoContainer user={bothEditable()}/>);

    fireEvent.click(screen.getByRole("button", { name: "Edit Details" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByRole("button", { name: "Edit Details" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit Extras" })).toBeInTheDocument();
  });

  it("sends only the open block's fields", async () => {
    mockGroups(twoGroups());
    render(
      <PersonalInfoContainer
        user={user({
          fieldAccess: { "attr:a1": "EDIT", "attr:a2": "EDIT" },
          custom: { "attr:a1": "Berlin", "attr:a2": "M" },
        })}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit Details" }));
    fireEvent.change(screen.getByDisplayValue("Berlin"), { target: { value: "Hamburg" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(updateUserAttributesAction).toHaveBeenCalled());
    expect(updateUserAttributesAction).toHaveBeenCalledWith({
      userId: "u1",
      values: { a1: "Hamburg" },
    });
  });
});
