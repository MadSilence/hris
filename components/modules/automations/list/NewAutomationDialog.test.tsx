import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import type { AutomationTemplate } from "@/models/automations";
import { NewAutomationDialog } from "./NewAutomationDialog";

const push = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push, replace: jest.fn() }) }));

const template = (key: string, name: string, category: string): AutomationTemplate => ({
  key,
  name,
  description: "",
  category,
  definition: {
    trigger: { type: "DATE_OFFSET", field: "HIRE_DATE", direction: "BEFORE", days: 7 },
    conditions: { filters: [], excludeUserIds: [] },
    steps: [{ id: "s1", type: "SEND_EMAIL" }],
  },
});

let templates: { data?: AutomationTemplate[]; isLoading: boolean; error: Error | null } = { isLoading: false, error: null };
jest.mock("@/components/modules/automations/hooks", () => ({
  useAutomationTemplates: () => ({ ...templates, refetch: jest.fn() }),
}));
jest.mock("./seams", () => ({
  useAutomationWords: () => ({ triggerLine: () => "7 days before the hire date", stepTitle: () => "Email the new teammate" }),
}));

beforeEach(() => {
  push.mockReset();
  templates = {
    isLoading: false,
    error: null,
    data: [
      template("welcome", "Welcome email before the first day", "Onboarding"),
      template("birthday", "Birthday", "Celebrations"),
      template("leave", "A long leave approved", "Time off"),
    ],
  };
});

describe("New automation", () => {
  it("lists the templates with what starts them and what they do, and filters by category", () => {
    render(<NewAutomationDialog open onOpenChange={jest.fn()} />);

    expect(screen.getByRole("heading", { name: "New automation" })).toBeInTheDocument();
    expect(screen.getAllByText("7 days before the hire date")).toHaveLength(3);
    expect(screen.getAllByText("Email the new teammate")).toHaveLength(3);
    // Only the categories that have a template.
    expect(screen.queryByRole("button", { name: "Compliance" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Time off" }));

    expect(screen.getByRole("link", { name: /A long leave approved/ })).toHaveAttribute("href", "/automations/new?template=leave");
    expect(screen.queryByRole("link", { name: /Birthday/ })).not.toBeInTheDocument();
  });

  it("starts from scratch, or from a prompt for noddo AI", () => {
    render(<NewAutomationDialog open onOpenChange={jest.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Start from scratch" }));
    expect(push).toHaveBeenLastCalledWith("/automations/new");

    fireEvent.change(screen.getByLabelText("Describe what should happen"), { target: { value: "Tell HR & the manager" } });
    fireEvent.click(screen.getByRole("button", { name: "Draft with AI" }));
    expect(push).toHaveBeenLastCalledWith("/automations/new?ai=Tell%20HR%20%26%20the%20manager");
  });

  it("keeps the AI field and Start from scratch when the templates do not load", () => {
    templates = { isLoading: false, error: new Error("boom") };
    render(<NewAutomationDialog open onOpenChange={jest.fn()} />);

    expect(screen.getByText("We couldn't load the templates")).toBeInTheDocument();
    expect(screen.getByLabelText("Describe what should happen")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start from scratch" })).toBeInTheDocument();
  });
});
