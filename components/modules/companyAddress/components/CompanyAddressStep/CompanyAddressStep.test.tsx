import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CompanyAddressStep from "@/components/modules/companyAddress/components/CompanyAddressStep";

const web = { scheme: "http", rootDomain: "localhost:3000" };

describe("CompanyAddressStep (sign-in-root A1, A2)", () => {
  it("goes straight to that company's login", async () => {
    const user = userEvent.setup();
    const navigate = jest.fn();
    render(<CompanyAddressStep web={web} remembered={null} navigate={navigate} />);

    await user.type(screen.getByLabelText("Company address"), "Acme Corp");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(navigate).toHaveBeenCalledWith("http://acme-corp.localhost:3000/login");
    // Kept on the root for the next visit: locally the address remembered after logging in cannot reach it.
    expect(document.cookie).toContain("last_company_typed=acme-corp");
  });

  it("asks for an address rather than going nowhere", async () => {
    const user = userEvent.setup();
    const navigate = jest.fn();
    render(<CompanyAddressStep web={web} remembered={null} navigate={navigate} />);

    await user.type(screen.getByLabelText("Company address"), "---");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(navigate).not.toHaveBeenCalled();
    expect(screen.getByText("Enter your company address.")).toBeInTheDocument();
  });

  it("offers the remembered company by its name and address, and goes there", async () => {
    const user = userEvent.setup();
    const navigate = jest.fn();
    render(
      <CompanyAddressStep web={web} remembered={{ subdomain: "acme", name: "Acme", logoUrl: null }} navigate={navigate} />,
    );

    expect(screen.getByText("Last time you logged in here:")).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("acme.localhost:3000")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(navigate).toHaveBeenCalledWith("http://acme.localhost:3000/login");
  });

  it("forgets nothing when another company is chosen — it only shows the field", async () => {
    const user = userEvent.setup();
    render(<CompanyAddressStep web={web} remembered={{ subdomain: "acme", name: null, logoUrl: null }} navigate={jest.fn()} />);

    await user.click(screen.getByRole("button", { name: "Use another company" }));

    expect(screen.getByLabelText("Company address")).toBeInTheDocument();
  });

  it("leads a forgotten address to Find your company", () => {
    render(<CompanyAddressStep web={web} remembered={null} navigate={jest.fn()} />);

    expect(screen.getByRole("link", { name: "Forgot company address?" })).toHaveAttribute("href", "/login/find");
  });
});
