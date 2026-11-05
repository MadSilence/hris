import { translatorFor } from "@/test/nextIntl";
import { setupStepKey } from "./setupStep";

const t = translatorFor("firstRun");
const words = (step: string | null, stepCode: string | null | undefined) => {
  const key = setupStepKey(step, stepCode);
  return key ? t(`setup.building.steps.${key}`) : step;
};

describe("the setup step on the progress screen", () => {
  it("words the step from its code", () => {
    expect(words("Building your public holiday calendar", "HOLIDAYS")).toBe("Building your public holiday calendar");
    expect(words(null, "EXAMPLE_DATA")).toBe("Creating your example company");
    expect(words("anything", "FINISHING")).toBe("Almost there");
  });

  it("falls back to the English sentence when the code is unknown or absent", () => {
    expect(words("Setting your time zone and working week", undefined)).toBe("Setting your time zone and working week");
    expect(setupStepKey("Setting your time zone and working week", "SOMETHING_NEW")).toBe("localization");
    expect(words("Calling the provider", "SOMETHING_NEW")).toBe("Calling the provider");
    expect(words(null, null)).toBe("Getting started");
  });
});
