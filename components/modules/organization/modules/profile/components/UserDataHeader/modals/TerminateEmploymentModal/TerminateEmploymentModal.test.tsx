import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TerminateEmploymentModal } from "./TerminateEmploymentModal";

jest.mock("@/components/providers/AppDataProvider", () => ({
  useAppDataContext: () => ({ internalApiClient: { get: jest.fn(() => new Promise(() => undefined)) } }),
}));
jest.mock("./LeaverDecisionsStep", () => ({ ...jest.requireActual("./LeaverDecisionsStep"), LeaverDecisionsStep: () => null }));

const open = (onConfirmAction = jest.fn()) => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <TerminateEmploymentModal isOpen userId="u1" fullName="Hazel Garcia" onCancelAction={jest.fn()} onConfirmAction={onConfirmAction} />
    </QueryClientProvider>,
  );
  return onConfirmAction;
};

// WALK_QUESTIONS § 36 (a): whether the leave is regrettable is decided in the Terminate dialog, or the rate stays zero.
describe("TerminateEmploymentModal", () => {
  it("sends that the loss is regrettable when it is switched on", () => {
    const onConfirm = open();
    fireEvent.click(screen.getByRole("switch", { name: "Regrettable loss" }));
    fireEvent.submit(screen.getByRole("switch", { name: "Regrettable loss" }).closest("form")!);
    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ regrettable: true }));
  });

  it("is not regrettable unless somebody says so", () => {
    const onConfirm = open();
    fireEvent.submit(screen.getByRole("switch", { name: "Regrettable loss" }).closest("form")!);
    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ regrettable: false }));
  });
});
