import { render, screen } from "@testing-library/react";

import { EmailPreview } from "./AppearancePreviews";

jest.mock("@/components/modules/home/components", () => ({ HomeBand: () => null }));

/*
 * Appearance's email preview is the login-code email as the backend writes it (sign-in-emails M16, SIGN_IN_PLAN A21):
 * the sender line, the heading in the band, the code, the address as text, the footer signed by noddo.
 */
describe("EmailPreview", () => {
  const renderPreview = (background: "COLOR" | "LIGHT" = "COLOR") =>
    render(<EmailPreview companyName="Acme" logoUrl={null} background={background} logoColors={[]} />);

  it("draws the login-code email: sender, subject, heading, code, button and footer", () => {
    const { container } = renderPreview();

    expect(screen.getByText("no-reply@noddo.so")).toBeInTheDocument();
    expect(screen.getByText("482913 is your Acme login code")).toBeInTheDocument();
    expect(container.querySelector(".appearance-mail-band .appearance-mail-title")?.textContent).toBe("Here’s yourlogin code");
    expect(container.querySelector(".appearance-mail-code")?.textContent).toBe("482913");
    expect(screen.getByText("Log in with one click")).toBeInTheDocument();
    expect(screen.getByText("Sent by noddo on behalf of Acme")).toBeInTheDocument();
    expect(screen.getByText("Acme · You get this because you have an account at Acme.")).toBeInTheDocument();
  });

  it("writes the address as text, never as a link", () => {
    const { container } = renderPreview();

    expect(screen.getByText("anna@example.com").tagName).toBe("STRONG");
    expect(container.querySelector("a")).toBeNull();
  });

  it("marks the light background for the stylesheet", () => {
    const { container } = renderPreview("LIGHT");

    expect(container.querySelector(".appearance-mail")).toHaveAttribute("data-background", "light");
  });
});
