import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { PersonalInfoContainer } from "./PersonalInfoContainer";
import { AttributeType } from "@/models/attribute";
import type { Attribute } from "@/models/attribute/Attribute";
import type { AttributeGroup } from "@/models/attribute/AttributeGroup";
import type { User } from "@/models/user/User";
import type { FieldDTO } from "@/models/user/fields";
import { ActionStatus } from "@/components/models/ActionStatus";
import { updateUserAction } from "@/components/modules/organization/modules/profile/actions/updateUserAction";
import { useAttributeGroups } from "@/components/modules/settings/modules/attributes/hooks/AttributeGroup/useAttributeGroups";
import { useUserFields } from "@/components/modules/organization/hooks/useUserFields/useUserFields";
import { partialMock } from "@/test/types";

jest.mock("@/components/modules/settings/modules/attributes/hooks/AttributeGroup/useAttributeGroups");
jest.mock("@/components/modules/organization/hooks/useUserFields/useUserFields");
jest.mock("@/components/modules/organization/modules/profile/actions/updateUserAction");
jest.mock("swr", () => ({ useSWRConfig: () => ({ mutate: jest.fn() }) }));
const mockSetDirty = jest.fn();
jest.mock("@/components/modules/organization/modules/profile/context/ProfileEditGuard", () => ({
  useProfileEditGuard: () => ({ setDirty: mockSetDirty, isDirty: false }),
}));
// The timeline has its own tests; here it only has to take its place among the sections.
jest.mock("@/components/modules/organization/modules/profile/components/PositionHistoryPanel", () => ({
  PositionHistoryPanel: () => <div>Position timeline</div>,
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
  (updateUserAction as jest.Mock).mockResolvedValue({ status: ActionStatus.SUCCESS });
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

  /**
   * An option arrives as `{ id, label }` and is displayed by its label. The id is the identity —
   * matching on the text is what let a rename of an option quietly change what a filter meant.
   */
  it("reads a SELECT value as the pair the API sends", () => {
    mockGroups([
      group([
        attribute({
          id: "a1",
          name: "Employment type",
          type: AttributeType.SELECT,
          options: [{ id: "opt:9c21", value: "Contractor", sortOrder: 0 }],
        } as Partial<Attribute>),
      ]),
    ]);

    render(
      <PersonalInfoContainer
        user={user({
          fieldAccess: { "attr:a1": "VIEW" },
          custom: { "attr:a1": { id: "opt:9c21", label: "Contractor" } },
        })}
      />
    );

    expect(screen.getByText("Contractor")).toBeInTheDocument();
  });

  /**
   * The shapes the app really gets: `/groups` spells an option id bare, a person's value spells it
   * `opt:<uuid>`. Compared as strings they never matched, and the profile printed `opt:…` for every
   * SELECT and MULTI_SELECT value (walk of 2026-09-21).
   */
  it("labels an option whose id the definitions spell without the prefix", () => {
    mockGroups([
      group([
        attribute({
          id: "a1",
          name: "Pronouns",
          type: AttributeType.SELECT,
          options: [{ id: "9c21", value: "They/Them", sortOrder: 0 }],
        } as Partial<Attribute>),
        attribute({
          id: "a2",
          name: "Skills",
          type: AttributeType.MULTI_SELECT,
          options: [
            { id: "b1", value: "Go", sortOrder: 0 },
            { id: "b2", value: "SQL", sortOrder: 1 },
          ],
        } as Partial<Attribute>),
      ]),
    ]);

    render(
      <PersonalInfoContainer
        user={user({
          fieldAccess: { "attr:a1": "VIEW", "attr:a2": "VIEW" },
          custom: {
            "attr:a1": { id: "opt:9c21", label: "They/Them" },
            "attr:a2": [{ id: "opt:b1", label: "Go" }, { id: "opt:b2", label: "SQL" }],
          },
        })}
      />
    );

    expect(screen.getByText("They/Them")).toBeInTheDocument();
    expect(screen.getByText("Go")).toBeInTheDocument();
    expect(screen.getByText("SQL")).toBeInTheDocument();
    expect(screen.queryByText(/opt:/)).not.toBeInTheDocument();
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

  // The pencil in the group's header opens that group.
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

    await waitFor(() => expect(updateUserAction).toHaveBeenCalled());
    expect(updateUserAction).toHaveBeenCalledWith({
      userId: "u1",
      attributes: { a1: "Hamburg" },
    });
  });

  it("offers no Save while nothing changed", () => {
    mockGroups([group([attribute({ id: "a1", name: "City" })])]);

    render(<PersonalInfoContainer user={editableUser({ "attr:a1": "Berlin" })} />);
    enterEditMode();

    // The bar appears as soon as something changed, and not before.
    expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
    expect(updateUserAction).not.toHaveBeenCalled();
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
 * Blocks are opened one by one, by their own pencil — one page-wide Edit armed every field at once —
 * but they share one draft and one Save: the sticky bar at the bottom (person-profile plan 9.3).
 */
describe("PersonalInfoContainer — one draft, one Save", () => {
  const twoGroups = () => [
    group([attribute({ id: "a1", name: "City" })]),
    group([attribute({ id: "a2", name: "Shirt size" })], { id: "g2", name: "Extras", sortOrder: 1 }),
  ];

  const bothEditable = () =>
    user({
      fieldAccess: { "attr:a1": "EDIT", "attr:a2": "EDIT" },
      custom: { "attr:a1": "Berlin", "attr:a2": "M" },
    });

  it("opens an editor only in the block whose pencil was clicked", () => {
    mockGroups(twoGroups());
    render(<PersonalInfoContainer user={bothEditable()}/>);

    fireEvent.click(screen.getByRole("button", { name: "Edit Details" }));

    // The open block's value is in an input; the other block's is still just text on the page.
    expect(screen.getByDisplayValue("Berlin")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("M")).not.toBeInTheDocument();
    expect(screen.getByText("M")).toBeInTheDocument();
  });

  it("shows the bar as soon as something changed, counts the changes, and arms the leave guard", () => {
    mockGroups(twoGroups());
    render(<PersonalInfoContainer user={bothEditable()}/>);

    fireEvent.click(screen.getByRole("button", { name: "Edit Details" }));
    expect(screen.queryByRole("region", { name: "Unsaved changes" })).not.toBeInTheDocument();
    expect(mockSetDirty).toHaveBeenLastCalledWith(false);

    fireEvent.change(screen.getByDisplayValue("Berlin"), { target: { value: "Hamburg" } });
    expect(screen.getByText("1 unsaved change")).toBeInTheDocument();
    expect(mockSetDirty).toHaveBeenLastCalledWith(true);
  });

  it("keeps the first block's changes when a second one is opened, and saves both in one request", async () => {
    mockGroups(twoGroups());
    render(<PersonalInfoContainer user={bothEditable()}/>);

    fireEvent.click(screen.getByRole("button", { name: "Edit Details" }));
    fireEvent.change(screen.getByDisplayValue("Berlin"), { target: { value: "Hamburg" } });
    // The other pencil stays: with one draft, opening another block cannot lose anything.
    fireEvent.click(screen.getByRole("button", { name: "Edit Extras" }));
    fireEvent.change(screen.getByDisplayValue("M"), { target: { value: "L" } });

    expect(screen.getByDisplayValue("Hamburg")).toBeInTheDocument();
    expect(screen.getByText("2 unsaved changes")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(updateUserAction).toHaveBeenCalledTimes(1));
    expect(updateUserAction).toHaveBeenCalledWith({
      userId: "u1",
      attributes: { a1: "Hamburg", a2: "L" },
    });
    await waitFor(() =>
      expect(screen.queryByRole("region", { name: "Unsaved changes" })).not.toBeInTheDocument()
    );
    expect(screen.getByRole("button", { name: "Edit Details" })).toBeInTheDocument();
  });

  it("closes an unchanged block with Cancel, and offers no Cancel on a changed one", () => {
    mockGroups(twoGroups());
    render(<PersonalInfoContainer user={bothEditable()}/>);

    fireEvent.click(screen.getByRole("button", { name: "Edit Details" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("button", { name: "Edit Details" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Edit Details" }));
    fireEvent.change(screen.getByDisplayValue("Berlin"), { target: { value: "Hamburg" } });
    // Only the bar can throw a draft away — no stray click in a header can.
    expect(screen.queryByRole("button", { name: "Cancel" })).not.toBeInTheDocument();
  });

  it("Discard throws every block's changes away and closes them", () => {
    mockGroups(twoGroups());
    render(<PersonalInfoContainer user={bothEditable()}/>);

    fireEvent.click(screen.getByRole("button", { name: "Edit Details" }));
    fireEvent.change(screen.getByDisplayValue("Berlin"), { target: { value: "Hamburg" } });
    fireEvent.click(screen.getByRole("button", { name: "Discard" }));

    expect(screen.getByText("Berlin")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("Hamburg")).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Unsaved changes" })).not.toBeInTheDocument();
    expect(updateUserAction).not.toHaveBeenCalled();
  });

  it("keeps the draft and says why when the save is refused", async () => {
    (updateUserAction as jest.Mock).mockResolvedValue({
      status: ActionStatus.ERROR,
      errorMessage: "Somebody else saved this profile. Reload and try again.",
    });
    mockGroups(twoGroups());
    render(<PersonalInfoContainer user={bothEditable()}/>);

    fireEvent.click(screen.getByRole("button", { name: "Edit Details" }));
    fireEvent.change(screen.getByDisplayValue("Berlin"), { target: { value: "Hamburg" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Somebody else saved this profile.");
    expect(screen.getByDisplayValue("Hamburg")).toBeInTheDocument();
  });
});

/** Built-in fields and custom attributes travel in the same request. */
describe("PersonalInfoContainer — system fields in the same save", () => {
  const field = (over: Partial<FieldDTO>): FieldDTO =>
    partialMock<FieldDTO>({ isSystem: true, type: AttributeType.TEXT, level: "EDIT", ...over });

  it("sends a name and a custom value together, with the version editing started from", async () => {
    (useUserFields as jest.Mock).mockReturnValue({
      data: [
        field({ id: "sys:first_name", key: "first_name", label: "First name", group: "Account" }),
        field({ id: "sys:last_name", key: "last_name", label: "Last name", group: "Account" }),
      ],
      isLoading: false,
    });
    mockGroups([group([attribute({ id: "a1", name: "City" })])]);
    render(
      <PersonalInfoContainer
        user={user({
          version: 4,
          custom: { "attr:a1": "Berlin" },
          fieldAccess: { "sys:first_name": "EDIT", "sys:last_name": "VIEW", "attr:a1": "EDIT" },
        })}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit Account" }));
    fireEvent.change(screen.getByDisplayValue("Ada"), { target: { value: "Augusta" } });
    fireEvent.click(screen.getByRole("button", { name: "Edit Details" }));
    fireEvent.change(screen.getByDisplayValue("Berlin"), { target: { value: "Hamburg" } });

    expect(screen.getByText("2 unsaved changes")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(updateUserAction).toHaveBeenCalledTimes(1));
    // The last name is view-only here, so it is neither an editor nor in the patch.
    expect(screen.queryByDisplayValue("Lovelace")).not.toBeInTheDocument();
    expect(updateUserAction).toHaveBeenCalledWith({
      userId: "u1",
      version: 4,
      firstName: "Augusta",
      attributes: { a1: "Hamburg" },
    });
  });

  it("places the position timeline after Organization, in the sidebar too", () => {
    (useUserFields as jest.Mock).mockReturnValue({
      data: [
        field({ id: "sys:first_name", key: "first_name", label: "First name", group: "Account" }),
        field({ id: "sys:job", key: "job_id", label: "Job", group: "Organization" }),
      ],
      isLoading: false,
    });
    mockGroups([group([attribute({ id: "a1", name: "City" })])]);
    render(
      <PersonalInfoContainer
        user={user({ fieldAccess: { "sys:first_name": "VIEW", "sys:job": "VIEW", "attr:a1": "VIEW" } })}
      />
    );

    const sectionIds = Array.from(document.querySelectorAll("[data-group-id]")).map((el) =>
      el.getAttribute("data-group-id")
    );
    expect(sectionIds).toEqual(["sys-group:Account", "sys-group:Organization", "position-history", "g1"]);
    expect(screen.getByText("Position timeline")).toBeInTheDocument();
    // The sidebar entry.
    expect(screen.getByText("Position History")).toBeInTheDocument();
  });

  it("leaves the timeline out for a reader who may not see the position", () => {
    (useUserFields as jest.Mock).mockReturnValue({
      data: [field({ id: "sys:first_name", key: "first_name", label: "First name", group: "Account" })],
      isLoading: false,
    });
    mockGroups([group([attribute({ id: "a1", name: "City" })])]);
    render(<PersonalInfoContainer user={user({ fieldAccess: { "sys:first_name": "VIEW", "attr:a1": "VIEW" } })}/>);

    expect(screen.queryByText("Position timeline")).not.toBeInTheDocument();
    expect(screen.queryByText("Position History")).not.toBeInTheDocument();
  });
});
