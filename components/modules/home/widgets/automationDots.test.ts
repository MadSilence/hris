import { dotsFor } from "./AutomationsWidget";

jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock("@/components/modules/home/hooks", () => ({ useAutomationsWeek: jest.fn() }));
jest.mock("@/components/modules/automations/runs", () => ({ useRunWords: jest.fn() }));
jest.mock("@/components/modules/automations/list", () => ({ automationsHref: {} }));

const day = (done: number, failed: number, skipped = 0) => ({ date: "2026-11-11", done, failed, skipped });

describe("the automations week's dots", () => {
  it("draws one dot per run, and one red dot for one failure (walk of 2026-11-11)", () => {
    expect(dotsFor(day(0, 1), 2)).toEqual({ dots: 1, failedDots: 1 });
    expect(dotsFor(day(2, 0), 2)).toEqual({ dots: 2, failedDots: 0 });
    expect(dotsFor(day(0, 0), 2)).toEqual({ dots: 0, failedDots: 0 });
  });

  it("scales only a week busier than a column holds, and keeps a failure visible", () => {
    expect(dotsFor(day(35, 1), 36)).toEqual({ dots: 8, failedDots: 1 });
    expect(dotsFor(day(1, 0), 36)).toEqual({ dots: 1, failedDots: 0 });
  });
});
