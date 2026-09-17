import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CompanyAddressStep, {
  CompanyAddressStepMessages,
} from "@/components/modules/companyAddress/components/CompanyAddressStep";

const web = { scheme: "http", rootDomain: "localhost:3000" };

describe("CompanyAddressStep", () => {
  it("shows the address as it is typed and goes straight to that company's login", async () => {
    const user = userEvent.setup();
    const navigate = jest.fn();
    render(<CompanyAddressStep web={web} rememberedSubdomain={null} navigate={navigate} />);

    await user.type(screen.getByLabelText(/company address/i), "Acme Corp");

    expect(screen.getByText("acme-corp.localhost:3000")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(navigate).toHaveBeenCalledWith("http://acme-corp.localhost:3000/login");
    // Kept on the root for the next visit: locally the address remembered after signing in cannot reach it.
    expect(document.cookie).toContain("last_company_typed=acme-corp");
  });

  it("asks for an address rather than going nowhere", async () => {
    const user = userEvent.setup();
    const navigate = jest.fn();
    render(<CompanyAddressStep web={web} rememberedSubdomain={null} navigate={navigate} />);

    await user.type(screen.getByLabelText(/company address/i), "---");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(navigate).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(CompanyAddressStepMessages.Required);
  });

  it("offers the remembered company and never follows it on its own", async () => {
    const user = userEvent.setup();
    const navigate = jest.fn();
    render(<CompanyAddressStep web={web} rememberedSubdomain="acme" navigate={navigate} />);

    expect(navigate).not.toHaveBeenCalled();
    expect(screen.queryByLabelText(/company address/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Continue to acme.localhost:3000" }));
    expect(navigate).toHaveBeenCalledWith("http://acme.localhost:3000/login");
  });

  it("lets somebody with a remembered company choose another", async () => {
    const user = userEvent.setup();
    render(<CompanyAddressStep web={web} rememberedSubdomain="acme" navigate={jest.fn()} />);

    await user.click(screen.getByRole("button", { name: "Use another company" }));

    expect(screen.getByLabelText(/company address/i)).toBeInTheDocument();
  });

  it("points to finding an address and to the trial", () => {
    render(<CompanyAddressStep web={web} rememberedSubdomain={null} navigate={jest.fn()} />);

    expect(screen.getByRole("link", { name: /don't know your company address/i })).toHaveAttribute("href", "/find-company");
    expect(screen.getByRole("link", { name: /start a free trial/i })).toHaveAttribute("href", "/trial");
  });
});
