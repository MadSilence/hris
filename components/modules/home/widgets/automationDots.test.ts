import { DOTS_PER_DAY, dotsFor } from "./AutomationsWidget";

jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock("@/components/modules/home/hooks", () => ({ useAutomationsWeek: jest.fn() }));
jest.mock("@/components/modules/automations/runs", () => ({ useRunWords: jest.fn() }));
jest.mock("@/components/modules/automations/list", () => ({ automationsHref: {} }));

const day = (done: number, failed: number, skipped = 0) => ({ date: "2026-11-11", done, failed, skipped });

describe("the automations week's dots", () => {
  it("draws one dot per run, and one red dot for one failure (walk of 2026-11-11)", () => {
    expect(dotsFor(day(0, 1))).toEqual({ dots: 1, failedDots: 1 });
    expect(dotsFor(day(2, 0))).toEqual({ dots: 2, failedDots: 0 });
    expect(dotsFor(day(0, 0))).toEqual({ dots: 0, failedDots: 0 });
  });

  it("never scales a day to the busiest one: 35 runs are 35 dots (widgets U2)", () => {
    expect(dotsFor(day(34, 1))).toEqual({ dots: 35, failedDots: 1 });
    expect(dotsFor(day(1, 0))).toEqual({ dots: 1, failedDots: 0 });
  });

  it("draws a day over the limit full, and keeps its failure red", () => {
    expect(dotsFor(day(310, 2))).toEqual({ dots: DOTS_PER_DAY, failedDots: 2 });
  });
});
