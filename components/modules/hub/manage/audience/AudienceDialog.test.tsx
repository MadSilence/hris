import { fireEvent, render, screen } from "@testing-library/react";
import { EVERYONE_AUDIENCE, type AudienceResolved, type HubAudience } from "@/models/hub";
import { AudienceDialog } from "./AudienceDialog";
import { canApplyAudience, normalizeAudience } from "./audienceDraft";

let resolved: { data: AudienceResolved | undefined; isFetching: boolean } = { data: undefined, isFetching: false };

jest.mock("../../hooks", () => ({
  useAudienceResolve: () => resolved,
}));
jest.mock("@/components/audience/AudienceBuilder", () => ({
  AudienceBuilder: () => <div data-testid="builder" />,
}));
jest.mock("./HubPeopleField", () => ({
  HubPeopleField: () => <div data-testid="people" />,
}));
jest.mock("@/components/modules/organization/hooks/useUserFields", () => ({
  useUserFields: () => ({ data: [], isLoading: false }),
}));
jest.mock("@/components/providers/CompanyDataProvider/CompanyDataProvider", () => ({
  useCompanyData: () => ({ company: { name: "Acme" } }),
}));

const filtered: HubAudience = { mode: "FILTER", filters: [{ field: "sys:office", op: "in", values: ["o1"] }], userIds: [], roleIds: [] };

const renderDialog = (value: HubAudience = filtered) => {
  const onApply = jest.fn();
  render(<AudienceDialog open onOpenChange={jest.fn()} subject="page" value={value} onApply={onApply} />);
  return onApply;
};

describe("AudienceDialog (CM07)", () => {
  it("disables Apply and says so while the audience reaches nobody", () => {
    resolved = { data: { total: 0, people: [], label: "0" }, isFetching: false };
    renderDialog();
    expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled();
    expect(screen.getByText("No one matches these filters")).toBeInTheDocument();
  });

  it("applies an audience that reaches people, with the count in the summary", () => {
    resolved = { data: { total: 118, people: [], label: "118" }, isFetching: false };
    const onApply = renderDialog();
    expect(screen.getByText("118 people")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onApply).toHaveBeenCalledWith(filtered, resolved.data);
  });

  it("switching to Everyone drops the filters from what is applied", () => {
    resolved = { data: { total: 240, people: [], label: "EVERYONE" }, isFetching: false };
    const onApply = renderDialog();
    fireEvent.click(screen.getByRole("radio", { name: "Everyone" }));
    expect(screen.getByText("Everyone at Acme · 240 people")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onApply).toHaveBeenCalledWith(EVERYONE_AUDIENCE, resolved.data);
  });

  it("asks before closing with changes", () => {
    resolved = { data: { total: 240, people: [], label: "EVERYONE" }, isFetching: false };
    renderDialog();
    fireEvent.click(screen.getByRole("radio", { name: "Choose people" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByText("Discard changes?")).toBeInTheDocument();
  });
});

describe("the audience draft", () => {
  it("sends only what the mode on screen uses", () => {
    const draft: HubAudience = { mode: "PEOPLE", filters: filtered.filters, userIds: ["u1"], roleIds: ["r1"] };
    expect(normalizeAudience("PEOPLE", draft)).toEqual({ mode: "PEOPLE", filters: [], userIds: ["u1"], roleIds: ["r1"] });
    expect(normalizeAudience("EVERYONE", draft)).toEqual(EVERYONE_AUDIENCE);
  });

  it("can be applied only once it is known to reach somebody", () => {
    expect(canApplyAudience(0, false)).toBe(false);
    expect(canApplyAudience(undefined, false)).toBe(false);
    expect(canApplyAudience(5, true)).toBe(false);
    expect(canApplyAudience(5, false)).toBe(true);
  });
});
