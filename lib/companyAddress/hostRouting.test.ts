import {
  COMPANY_LOGIN_ROUTE,
  LEAVE_FOR_ROOT_ROUTE,
  rootDestination,
  routeForHost,
  safeReturnPath,
} from "@/lib/companyAddress";

const web = { scheme: "http", rootDomain: "localhost:3000" };
const root = { kind: "root" } as const;
const acme = { kind: "company", subdomain: "acme" } as const;
const SIGNED_IN = true;
const SIGNED_OUT = false;

describe("routeForHost — the root", () => {
  it.each(["/", "/login", "/pricing", "/trial", "/trial/confirm", "/find-company", "/about"])(
    "shows %s",
    (path) => {
      expect(routeForHost(root, path, "", SIGNED_OUT)).toEqual({ type: "next" });
    },
  );

  it.each(["/dashboard", "/organization/people", "/settings/general/company", "/invite", "/reset-password",
    "/forgot-password", "/preboarding", COMPANY_LOGIN_ROUTE, LEAVE_FOR_ROOT_ROUTE])(
    "sends %s to step 1, because it belongs to a company — with a session or without",
    (path) => {
      expect(routeForHost(root, path, "", SIGNED_OUT)).toEqual({ type: "redirect", to: "/login" });
      expect(routeForHost(root, path, "", SIGNED_IN)).toEqual({ type: "redirect", to: "/login" });
    },
  );
});

describe("routeForHost — a company's address", () => {
  it("renders the company login at /login, from its own route", () => {
    expect(routeForHost(acme, "/login", "?passwordChanged=1", SIGNED_OUT)).toEqual({
      type: "rewrite",
      pathname: COMPANY_LOGIN_ROUTE,
    });
  });

  it("gives the company login one address", () => {
    expect(routeForHost(acme, COMPANY_LOGIN_ROUTE, "?passwordChanged=1", SIGNED_OUT)).toEqual({
      type: "redirect",
      to: "/login?passwordChanged=1",
    });
  });

  it("opens the app at / for a session, and the login for nobody", () => {
    expect(routeForHost(acme, "/", "", SIGNED_IN)).toEqual({ type: "redirect", to: "/dashboard" });
    expect(routeForHost(acme, "/", "", SIGNED_OUT)).toEqual({ type: "redirect", to: "/login" });
  });

  /*
    Not a redirect: Next turns a middleware Location on its own origin into a relative one, and locally
    the root is that origin — `acme.localhost:3000/pricing` answered `Location: /pricing` in a loop.
  */
  it.each(["/pricing", "/trial/confirm", "/find-company"])("sends %s to the root through a route handler", (path) => {
    const route = routeForHost(acme, path, "?token=x", SIGNED_OUT);

    expect(route).toEqual({ type: "rewrite", pathname: `${LEAVE_FOR_ROOT_ROUTE}${path}` });
    expect(rootDestination(`${LEAVE_FOR_ROOT_ROUTE}${path}`, "?token=x", web)).toBe(`http://localhost:3000${path}?token=x`);
  });

  it.each(["/dashboard", "/organization/people", "/settings/general/company"])("shows %s to a session", (path) => {
    expect(routeForHost(acme, path, "", SIGNED_IN)).toEqual({ type: "next" });
  });

  it("sends somebody signed out to the login before an app page renders, remembering where they were going", () => {
    expect(routeForHost(acme, "/organization/people/42/personal", "?tab=jobs", SIGNED_OUT)).toEqual({
      type: "redirect",
      to: "/login?next=%2Forganization%2Fpeople%2F42%2Fpersonal%3Ftab%3Djobs",
    });
  });

  it.each(["/invite", "/reset-password", "/forgot-password", "/preboarding"])(
    "opens %s without a session — the link in the email is the credential",
    (path) => {
      expect(routeForHost(acme, path, "?token=x", SIGNED_OUT)).toEqual({ type: "next" });
    },
  );
});

it.each(["/api/auth/login", "/403"])("leaves %s alone on either host, with a session or without", (path) => {
  expect(routeForHost(root, path, "", SIGNED_OUT)).toEqual({ type: "next" });
  expect(routeForHost(acme, path, "", SIGNED_OUT)).toEqual({ type: "next" });
});

describe("rootDestination", () => {
  it.each([
    ["/leave-for-root//evil.example", "", "http://localhost:3000/"],
    ["/leave-for-root/dashboard", "", "http://localhost:3000/"],
    ["/leave-for-root", "?x=1", "http://localhost:3000/"],
    ["/somewhere-else/pricing", "", "http://localhost:3000/"],
    ["/leave-for-root/pricing", "?plan=pro", "http://localhost:3000/pricing?plan=pro"],
  ])("sends %j%j to %s and never to another host or a company page", (pathname, search, destination) => {
    expect(rootDestination(pathname, search, web)).toBe(destination);
  });
});

describe("safeReturnPath", () => {
  it.each([
    "/organization/people/42/personal?tab=jobs",
    "/settings/general/company",
    "/calendar#today",
  ])("follows %j, a page of the app on this host", (next) => {
    expect(safeReturnPath(next)).toBe(next);
  });

  it.each([
    [undefined],
    [""],
    ["dashboard"],
    ["//evil.example/dashboard"],
    ["/\\evil.example"],
    ["https://evil.example"],
    ["/\nevil"],
    ["/"],
    ["/login?next=/login"],
    ["/company-login"],
    ["/leave-for-root/pricing"],
    ["/api/users/me"],
    ["/pricing"],
    ["/reset-password?token=x"],
  ])("does not follow %j and opens the app instead", (next) => {
    expect(safeReturnPath(next)).toBe("/dashboard");
  });
});
