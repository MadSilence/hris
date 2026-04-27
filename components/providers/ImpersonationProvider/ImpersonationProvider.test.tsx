import { render, screen } from "@testing-library/react";
import ImpersonationProvider, { useImpersonationContext, } from "@/components/providers/ImpersonationProvider/ImpersonationProvider";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";

jest.mock("@/components/providers/CurrentUserProvider/CurrentUserProvider", () => ({
  useCurrentUser: jest.fn(),
}));

function Consumer() {
  const value = useImpersonationContext();

  return (
    <div>
      <div data-test="isImpersonating">{String(value.isImpersonating)}</div>
      <div data-test="actorId">{value.actorId}</div>
      <div data-test="subjectId">{value.subjectId}</div>
    </div>
  );
}

describe("ImpersonationProvider", () => {
  it("provides impersonation state from current user", () => {
    jest.mocked(useCurrentUser).mockReturnValue({
      impersonating: true,
      actorId: "admin-id",
      subjectId: "target-id",
    } as any);

    render(
      <ImpersonationProvider>
        <Consumer/>
      </ImpersonationProvider>
    );

    expect(screen.getByTestId("isImpersonating")).toHaveTextContent("true");
    expect(screen.getByTestId("actorId")).toHaveTextContent("admin-id");
    expect(screen.getByTestId("subjectId")).toHaveTextContent("target-id");
  });

  it("throws outside provider", () => {
    jest.spyOn(console, "error").mockImplementation(() => {
    });

    expect(() => render(<Consumer/>)).toThrow(
      "useImpersonationContext must be used inside ImpersonationProvider"
    );

    jest.restoreAllMocks();
  });
});
