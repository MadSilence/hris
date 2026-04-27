import { fireEvent, render, screen } from "@testing-library/react";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { useImpersonationContext } from "@/components/providers/ImpersonationProvider/ImpersonationProvider";
import { useStopImpersonation } from "@/components/modules/auth/impersonation/hooks/useStopImpersonation";
import { ImpersonationBanner } from "@/components/modules/auth/impersonation/components/ImpersonationBanner/ImpersonationBanner";

jest.mock("@/components/providers/CurrentUserProvider/CurrentUserProvider", () => ({
  useCurrentUser: jest.fn(),
}));

jest.mock("@/components/providers/ImpersonationProvider/ImpersonationProvider", () => ({
  useImpersonationContext: jest.fn(),
}));

jest.mock("@/components/modules/auth/impersonation/hooks/useStopImpersonation", () => ({
  useStopImpersonation: jest.fn(),
}));

describe("ImpersonationBanner", () => {
  const mutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    jest.mocked(useStopImpersonation).mockReturnValue({
      mutate,
      isPending: false,
    } as any);
  });

  it("does not render when not impersonating", () => {
    jest.mocked(useImpersonationContext).mockReturnValue({
      isImpersonating: false,
    } as any);

    jest.mocked(useCurrentUser).mockReturnValue({
      user: undefined,
    } as any);

    const { container } = render(<ImpersonationBanner/>);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders impersonation user name", () => {
    jest.mocked(useImpersonationContext).mockReturnValue({
      isImpersonating: true,
    } as any);

    jest.mocked(useCurrentUser).mockReturnValue({
      user: {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      },
    } as any);

    render(<ImpersonationBanner/>);

    expect(
      screen.getByText(/You are viewing the app as/i)
    ).toBeInTheDocument();

    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("calls stop impersonation on button click", () => {
    jest.mocked(useImpersonationContext).mockReturnValue({
      isImpersonating: true,
    } as any);

    jest.mocked(useCurrentUser).mockReturnValue({
      user: {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      },
    } as any);

    render(<ImpersonationBanner/>);

    fireEvent.click(screen.getByRole("button", { name: /Stop Impersonation/i }));

    expect(mutate).toHaveBeenCalled();
  });

  it("disables button while pending", () => {
    jest.mocked(useStopImpersonation).mockReturnValue({
      mutate,
      isPending: true,
    } as any);

    jest.mocked(useImpersonationContext).mockReturnValue({
      isImpersonating: true,
    } as any);

    jest.mocked(useCurrentUser).mockReturnValue({
      user: {
        email: "john@example.com",
      },
    } as any);

    render(<ImpersonationBanner/>);

    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByRole("button")).toHaveTextContent("Returning...");
  });
});
