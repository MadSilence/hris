import { render } from "@testing-library/react";

import { PeoplePicker } from "./PeoplePicker";
import type { Segment } from "@/models/segment/Segment";

const resolved: Segment[] = [];

jest.mock("@/components/audience/hooks/useSegmentResolve", () => ({
  useSegmentResolve: (segment: Segment) => {
    resolved.push(segment);
    return { items: [], total: 0, hasNextPage: false, isFetchingNextPage: false, fetchNextPage: jest.fn() };
  },
}));

jest.mock("@/components/auth/useAccess", () => ({
  useAccess: () => ({ access: { systemOwner: true } }),
}));

beforeAll(() => {
  Object.defineProperty(global, "ResizeObserver", {
    writable: true,
    configurable: true,
    value: class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  });
});

beforeEach(() => {
  resolved.length = 0;
});

const props = {
  fields: [],
  filters: [],
  onFiltersChange: jest.fn(),
  isSelected: () => false,
  onToggle: jest.fn(),
};

const lastSegment = () => resolved[resolved.length - 1];

describe("PeoplePicker", () => {
  it("searches employees only until somebody widens it", () => {
    render(<PeoplePicker {...props} />);

    // A draft is not an employee: picking from people means picking from people who work here.
    expect(lastSegment().drafts).toBe("EXCLUDE");
  });

  it("widens to people who have not arrived when it widens to people who have left", () => {
    render(<PeoplePicker {...props} includeInactive onIncludeInactiveChange={jest.fn()} />);

    // One switch, both directions: "not an employee today" covers the leaver and the draft, and the
    // picker is exactly where an account is set up before the first day.
    expect(lastSegment().drafts).toBe("INCLUDE");
    expect(lastSegment().includeInactive).toBe(true);
  });
});
