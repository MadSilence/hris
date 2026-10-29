import React, { useCallback, useState } from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { QuickSearchDialog } from "./QuickSearchDialog";
import { useQuickSearchShortcut } from "@/components/modules/search/hooks";
import { searchService } from "@/components/modules/search/services";
import type { EffectiveAccess } from "@/models/access";
import type { SearchParams, SearchResponse } from "@/models/search";

const push = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

const access: EffectiveAccess = {
  systemOwner: false,
  permissions: { "ROLES.ROLE": { VIEW: ["COMPANY"] } },
  fields: {},
  moduleSummary: {},
  accessHash: "hash",
};
jest.mock("@/components/auth", () => ({
  useAccess: () => ({ access }),
}));

jest.mock("@/components/modules/search/services", () => ({
  searchService: { search: jest.fn() },
}));

const searchMock = searchService.search as jest.MockedFunction<typeof searchService.search>;

const person = (n: number, status = "ACTIVE") => ({
  id: `p${n}`,
  title: `Anna Person${n}`,
  subtitle: n === 1 ? "Engineer" : null,
  avatarUrl: null,
  status,
  accountStatus: "ACTIVE",
  parentId: null,
});

const FIRST_FIVE: SearchResponse = {
  groups: [
    { kind: "PEOPLE", total: 7, truncated: false, items: [1, 2, 3, 4].map((n) => person(n)).concat(person(5, "ARCHIVED")) },
    {
      kind: "TIME_OFF_POLICY",
      total: 1,
      truncated: false,
      items: [{ id: "pol1", title: "Annual Leave", subtitle: "Vacation", avatarUrl: null, status: null, accountStatus: null, parentId: "lt1" }],
    },
    {
      kind: "ROLE",
      total: 1,
      truncated: false,
      items: [{ id: "r1", title: "Annalist", subtitle: null, avatarUrl: null, status: null, accountStatus: null, parentId: null }],
    },
  ],
};

const ALL_PEOPLE: SearchResponse = {
  groups: [{ kind: "PEOPLE", total: 7, truncated: false, items: [1, 2, 3, 4, 5, 6, 7].map((n) => person(n)) }],
};

/** The shell's wiring, reduced to what the window needs: the shortcut and the open state. */
const Shell = () => {
  const [open, setOpen] = useState(false);
  const openSearch = useCallback(() => setOpen(true), []);
  useQuickSearchShortcut(openSearch);
  return (
    <QuickSearchDialog
      open={open}
      onOpenChange={setOpen}
      appPages={[{ label: "Home", href: "/dashboard" }, { label: "Calendar", href: "/calendar" }]}
    />
  );
};

const renderShell = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <Shell/>
    </QueryClientProvider>,
  );

const openWithKeyboard = () => fireEvent.keyDown(window, { key: "k", ctrlKey: true });

const typeTerm = (value: string) => fireEvent.change(screen.getByPlaceholderText("Search"), { target: { value } });

beforeAll(() => {
  // cmdk scrolls the selected row into view; jsdom has no layout to scroll.
  Element.prototype.scrollIntoView = jest.fn();
});

beforeEach(() => {
  push.mockReset();
  searchMock.mockReset();
  searchMock.mockImplementation(async (params: SearchParams) => (params.kinds ? ALL_PEOPLE : FIRST_FIVE));
});

describe("QuickSearchDialog", () => {
  it("opens on Ctrl+K and on Cmd+K, and offers the pages before anything is typed", async () => {
    renderShell();
    expect(screen.queryByPlaceholderText("Search")).not.toBeInTheDocument();

    openWithKeyboard();
    expect(await screen.findByPlaceholderText("Search")).toBeInTheDocument();
    expect(screen.getByText("Go To")).toBeInTheDocument();
    expect(screen.getByText("Calendar")).toBeInTheDocument();
    // A settings page the reader holds the resource for, and not one they do not.
    expect(screen.getByText("Employee Roles & Access")).toBeInTheDocument();
    expect(screen.queryByText("Logs")).not.toBeInTheDocument();
    expect(searchMock).not.toHaveBeenCalled();

    fireEvent.keyDown(screen.getByPlaceholderText("Search"), { key: "Escape" });
    await waitFor(() => expect(screen.queryByPlaceholderText("Search")).not.toBeInTheDocument());

    fireEvent.keyDown(window, { key: "K", metaKey: true });
    expect(await screen.findByPlaceholderText("Search")).toBeInTheDocument();
  });

  it("groups the hits by kind, in the server's order, with a chip only for who has left", async () => {
    renderShell();
    openWithKeyboard();
    typeTerm("an");

    expect(await screen.findByText("Anna Person1")).toBeInTheDocument();
    const headings = Array.from(document.querySelectorAll("[cmdk-group-heading]")).map((h) => h.textContent);
    expect(headings).toEqual(["People", "Time Off Policies", "Roles"]);
    // A kind the server left out is not drawn — not even as an empty heading.
    expect(screen.queryByText("Departments")).not.toBeInTheDocument();

    expect(screen.getByText("Archived")).toBeInTheDocument();
    expect(screen.queryByText("Active")).not.toBeInTheDocument();
    expect(searchMock).toHaveBeenCalledWith({ q: "an", limit: 5 });
  });

  it("does not ask the server for one character", async () => {
    renderShell();
    openWithKeyboard();
    typeTerm("a");

    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(searchMock).not.toHaveBeenCalled();
  });

  it("Show More widens that kind inside the window", async () => {
    renderShell();
    openWithKeyboard();
    typeTerm("an");

    const people = (await screen.findByText("Anna Person1")).closest("[cmdk-group]") as HTMLElement;
    expect(within(people).queryByText("Anna Person6")).not.toBeInTheDocument();

    fireEvent.click(within(people).getByText("Show More"));

    expect(await within(people).findByText("Anna Person7")).toBeInTheDocument();
    expect(searchMock).toHaveBeenCalledWith({ q: "an", kinds: ["PEOPLE"], limit: 50 });
    expect(within(people).queryByText("Show More")).not.toBeInTheDocument();
    // The other kinds are still there.
    expect(screen.getByText("Annalist")).toBeInTheDocument();
  });

  it("Enter opens the selected hit and closes the window; the arrows move the selection", async () => {
    renderShell();
    openWithKeyboard();
    typeTerm("an");
    await screen.findByText("Anna Person1");
    const input = screen.getByPlaceholderText("Search");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(push).toHaveBeenCalledWith("/organization/people/p2/personal");
    await waitFor(() => expect(screen.queryByPlaceholderText("Search")).not.toBeInTheDocument());
  });

  it("a policy opens under its leave type", async () => {
    renderShell();
    openWithKeyboard();
    typeTerm("an");

    fireEvent.click(await screen.findByText("Annual Leave"));

    expect(push).toHaveBeenCalledWith("/settings/time/leave-type/lt1/policies/pol1");
  });

  it("says so when nothing matches", async () => {
    searchMock.mockResolvedValue({ groups: [{ kind: "PEOPLE", total: 0, truncated: false, items: [] }] });
    renderShell();
    openWithKeyboard();
    typeTerm("zzz");

    expect(await screen.findByText("No results")).toBeInTheDocument();
  });
});
