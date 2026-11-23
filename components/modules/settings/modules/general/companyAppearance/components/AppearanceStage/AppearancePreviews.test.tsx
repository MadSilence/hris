import { render, screen } from "@testing-library/react";

import { EmailPreview } from "./AppearancePreviews";

jest.mock("@/components/modules/home/components", () => ({ HomeBand: () => null }));

/*
 * Appearance's email preview is the invitation as the backend writes it (sign-in-emails M2; the owner's R19, A16): the
 * heading in the band, the address as text, "Join Acme", the small print and the footer signed by noddo — with no
 * postal address (AQ-10).
 */
describe("EmailPreview", () => {
  const renderPreview = (background: "COLOR" | "LIGHT" = "COLOR") =>
    render(<EmailPreview companyName="Acme" logoUrl={null} background={background} logoColors={[]} />);

  it("draws the invitation: heading, body, the button and the footer", () => {
    const { container } = renderPreview();

    expect(container.querySelector(".appearance-mail-band .appearance-mail-title")?.textContent).toBe("You’re invitedto join Acme");
    expect(screen.getByText("Join Acme")).toBeInTheDocument();
    expect(screen.getByText("The invitation works once. If you weren’t expecting it, ignore this email.")).toBeInTheDocument();
    expect(screen.getByText("Sent by noddo on behalf of Acme")).toBeInTheDocument();
    expect(screen.getByText("You get this because Acme invited you to noddo.")).toBeInTheDocument();
    expect(container.querySelector(".appearance-mail-code")).toBeNull();
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
