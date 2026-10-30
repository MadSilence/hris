import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ActionStatus } from "@/components/models/ActionStatus";
import { PolicyActionError } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/policyActionError";
import {
  defaultPolicyWizardValues,
  PolicyWizardModal,
} from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/components/wizard";

const values = { ...defaultPolicyWizardValues, name: "Annual Leave" };

/**
 * A save refused for its name — another policy has it (TOP00004) — is shown under the Name field, with
 * the wizard back on the step that has it. Until the walk of 2026-10-30 the edit page caught the
 * refusal itself and showed a card that slid away before anybody read it.
 */
describe("PolicyWizardModal — a refused name", () => {
  it("goes back to Basics and says it under Name", async () => {
    const onSubmit = jest.fn().mockRejectedValue(
      new PolicyActionError(
        {
          status: ActionStatus.ERROR,
          code: "TOP00004",
          errorMessage: "A policy with this name already exists.",
          fieldErrors: { name: "A policy with this name already exists." },
        },
        "fallback",
      ),
    );
    render(
      <PolicyWizardModal isOpen mode="edit" initialValues={values} onSubmitAction={onSubmit} onCancelAction={jest.fn()} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Review/ }));
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => expect(screen.getByText("A policy with this name already exists.")).toBeInTheDocument());
    expect(screen.getByLabelText("Name")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText(/Step 1 of/)).toBeInTheDocument();
  });

  it("keeps any other refusal in the form's footer", async () => {
    const onSubmit = jest.fn().mockRejectedValue(new Error("Somebody saved this policy since you opened it."));
    render(
      <PolicyWizardModal isOpen mode="edit" initialValues={values} onSubmitAction={onSubmit} onCancelAction={jest.fn()} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Review/ }));
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() =>
      expect(screen.getByText("Somebody saved this policy since you opened it.")).toBeInTheDocument(),
    );
    expect(screen.getByText(/Step 12 of/)).toBeInTheDocument();
  });
});
