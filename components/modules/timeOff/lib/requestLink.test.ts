import { requestIdOf, requestOnHome } from "./requestLink";

describe("a link to a time off request (AQ-12 b)", () => {
  it("lands on Home with the request open when there is no page it was on", () => {
    expect(requestOnHome("req-1")).toBe("/dashboard?leaveRequest=req-1");
  });

  it("reads the request out of a link, and nothing out of any other", () => {
    expect(requestIdOf("/dashboard?leaveRequest=req-1")).toBe("req-1");
    expect(requestIdOf("/calendar?view=x&leaveRequest=req-2")).toBe("req-2");
    // A document request's own `?request=` (R7) is not a leave request.
    expect(requestIdOf("/organization/people/u1/documents?request=t1")).toBeNull();
    expect(requestIdOf("/inbox")).toBeNull();
    expect(requestIdOf(null)).toBeNull();
  });
});
