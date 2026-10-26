import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ProvenanceMarker } from "./ProvenanceMarker";
import { ActionStatus } from "@/components/models/ActionStatus";
import { returnToRuleAction } from "@/components/modules/automations/actions/automationActions";
import { showError, showSuccess } from "@/lib/errors/errorToast";
import type { AssignmentProvenance } from "@/models/automations";

jest.mock("@/components/modules/automations/actions/automationActions");
jest.mock("@/lib/errors/errorToast", () => ({ showError: jest.fn(), showSuccess: jest.fn() }));

const fromRule: AssignmentProvenance = {
  assignableType: "PUBLIC_HOLIDAY_CALENDAR",
  assignableId: "cal-de",
  assignableName: "Germany 2026",
  origin: "RULE",
  rule: { id: "r1", name: "Berlin office calendar" },
  since: "2026-06-01T08:00:00Z",
  overriddenRule: null,
};

const handOverride: AssignmentProvenance = {
  assignableType: "OFFICE",
  assignableId: "munich",
  assignableName: "Munich",
  origin: "HAND",
  rule: null,
  since: null,
  overriddenRule: { id: "r2", name: "Sales sit in Berlin" },
};

const renderMarker = (props: Partial<React.ComponentProps<typeof ProvenanceMarker>>) =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>
      <ProvenanceMarker userId="u1" fieldId="sys:calendar" provenance={[fromRule, handOverride]} canEdit {...props} />
    </QueryClientProvider>,
  );

describe("ProvenanceMarker", () => {
  it("names the rule a value came from", () => {
    renderMarker({ fieldId: "sys:calendar", canEdit: false });

    expect(screen.getByTestId("provenance-sys:calendar")).toHaveTextContent("From rule: Berlin office calendar");
  });

  it("draws nothing for a plain hand value", () => {
    renderMarker({ fieldId: "sys:team", provenance: [{ ...fromRule, assignableType: "TEAM", origin: "HAND", rule: null }] });

    expect(screen.queryByTestId("provenance-sys:team")).not.toBeInTheDocument();
  });

  it("shows a hand value that holds a rule off, with Return to Rule, to an editor only", () => {
    const { unmount } = renderMarker({ fieldId: "sys:office", canEdit: false });
    expect(screen.queryByRole("button", { name: "Return to Rule" })).not.toBeInTheDocument();
    unmount();

    renderMarker({ fieldId: "sys:office", canEdit: true });
    expect(screen.getByTestId("provenance-sys:office")).toHaveTextContent("Set by hand — the rule “Sales sit in Berlin” would set something else.");
    expect(screen.getByRole("button", { name: "Return to Rule" })).toBeInTheDocument();
  });

  it("returns the value to the rule and tells the profile to read the person again", async () => {
    (returnToRuleAction as jest.Mock).mockResolvedValue({ status: ActionStatus.SUCCESS, data: [] });
    const onReturned = jest.fn();
    renderMarker({ fieldId: "sys:office", onReturned });

    fireEvent.click(screen.getByRole("button", { name: "Return to Rule" }));

    await waitFor(() => expect(onReturned).toHaveBeenCalled());
    expect(returnToRuleAction).toHaveBeenCalledWith({ userId: "u1", assignableType: "OFFICE", assignableId: null });
    expect(showSuccess).toHaveBeenCalledWith("Returned to the rule “Sales sit in Berlin”.");
  });

  it("names the place a holiday calendar is inherited from", () => {
    renderMarker({
      fieldId: "sys:calendar",
      canEdit: false,
      provenance: [{
        ...fromRule,
        rule: { id: "r3", name: "Holiday Calendar · Office Berlin → Germany 2026" },
        source: { kind: "OFFICE", refId: "berlin", name: "Berlin", calendarId: "cal-de", calendarName: "Germany 2026" },
      }],
    });

    expect(screen.getByTestId("provenance-sys:calendar")).toHaveTextContent("From office: Berlin");
  });

  it("offers Return to Rule for an own calendar that holds off the inherited one, to an editor only", async () => {
    (returnToRuleAction as jest.Mock).mockResolvedValue({ status: ActionStatus.SUCCESS, data: [] });
    const own: AssignmentProvenance = {
      assignableType: "PUBLIC_HOLIDAY_CALENDAR",
      assignableId: "cal-ie",
      assignableName: "Ireland 2026",
      origin: "HAND",
      rule: null,
      since: null,
      overriddenRule: { id: "r3", name: "Holiday Calendar · Office Berlin → Germany 2026" },
      overriddenSource: { kind: "OFFICE", refId: "berlin", name: "Berlin", calendarId: "cal-de", calendarName: "Germany 2026" },
    };
    const { unmount } = renderMarker({ fieldId: "sys:calendar", canEdit: false, provenance: [own] });
    expect(screen.queryByTestId("provenance-sys:calendar")).not.toBeInTheDocument();
    unmount();

    renderMarker({ fieldId: "sys:calendar", canEdit: true, provenance: [own] });
    expect(screen.getByTestId("provenance-sys:calendar"))
      .toHaveTextContent("Set by hand, in place of Germany 2026 from office: Berlin.");
    fireEvent.click(screen.getByRole("button", { name: "Return to Rule" }));

    await waitFor(() => expect(returnToRuleAction).toHaveBeenCalledWith({
      userId: "u1", assignableType: "PUBLIC_HOLIDAY_CALENDAR", assignableId: null,
    }));
    await waitFor(() => expect(showSuccess).toHaveBeenCalledWith("Returned to Germany 2026 from office: Berlin."));
  });

  it("shows a refusal on the card", async () => {
    (returnToRuleAction as jest.Mock).mockResolvedValue({ status: ActionStatus.ERROR, errorMessage: "No enabled automation sets this for this person, so there is no rule to return to." });
    renderMarker({ fieldId: "sys:office" });

    fireEvent.click(screen.getByRole("button", { name: "Return to Rule" }));

    await waitFor(() => expect(showError).toHaveBeenCalled());
  });
});
