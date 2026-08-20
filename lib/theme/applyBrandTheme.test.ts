import { applyBrandTheme } from "@/lib/theme/applyBrandTheme";

const brandStyle = () => document.head.querySelector<HTMLStyleElement>("style[data-brand-theme]");

describe("applyBrandTheme", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
  });

  it("creates the style element when the company had no brand colour", () => {
    applyBrandTheme("#2563eb");

    expect(brandStyle()?.textContent).toContain("--brown-600:");
  });

  it("rewrites the element the server rendered rather than adding a second one", () => {
    const server = document.createElement("style");
    server.setAttribute("data-brand-theme", "");
    server.textContent = "html:root{--brown-600:#111111}";
    document.head.appendChild(server);

    applyBrandTheme("#16a34a");

    expect(document.head.querySelectorAll("style[data-brand-theme]")).toHaveLength(1);
    expect(brandStyle()).toBe(server);
    expect(server.textContent).not.toContain("#111111");
  });

  it("removes the element when the colour is cleared, so globals.css takes over", () => {
    applyBrandTheme("#2563eb");
    expect(brandStyle()).not.toBeNull();

    applyBrandTheme(null);

    expect(brandStyle()).toBeNull();
  });

  it("removes the element for an unusable colour instead of leaving a stale palette", () => {
    applyBrandTheme("#2563eb");

    applyBrandTheme("not-a-colour");

    expect(brandStyle()).toBeNull();
  });
});
