import type { AuthBrand } from "@/components/modules/auth/layout";
import LoginContainer, { type SharedProvider } from "@/components/modules/auth/components/LoginContainer";
import type { PublicSso } from "@/api/modules/sso/ssoService";

/**
 * A company's own login page (sign-in-company-login): the everyday base in the company's look — its colour, logo and
 * name on the pane — and the ways in its settings allow. Server-rendered whole: nothing on it repaints after the first
 * frame (COMPANY_ADDRESSES.md § 4). The company cannot change the heading or set a background (DECISIONS.md K1).
 */
type Props = {
  brand: Extract<AuthBrand, { kind: "company" }>;
  sso: PublicSso | null;
  providers: SharedProvider[];
  returnTo: string;
  notice: "passwordChanged" | "loggedOut" | "codeOtherBrowser" | "codeExpired" | null;
  failure: { kind: "sso" } | { kind: "provider"; provider: SharedProvider } | null;
  changeCompanyHref: string;
};

export default function CompanyLoginScreen(props: Props) {
  return <LoginContainer {...props} />;
}
