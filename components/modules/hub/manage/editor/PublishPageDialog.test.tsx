import { act, fireEvent, render, screen } from "@testing-library/react";
import { buildPublishRequest, defaultAgreeBy, PublishPageDialog } from "./PublishPageDialog";

const base = { firstPublish: false, showChoice: true, choice: "ASK_AGAIN" as const, points: [" New limits ", ""], agreeBy: "2026-11-26", mustRead: true, draftAgreeBy: "2026-11-20" };

describe("buildPublishRequest", () => {
  it("asks everyone again: a new version with the points and its own Agree by", () => {
    expect(buildPublishRequest(base)).toEqual({ kind: "NEW_VERSION", whatChanged: ["New limits"], agreeBy: "2026-11-26" });
  });

  it("a small fix keeps agreements: no points, no date", () => {
    expect(buildPublishRequest({ ...base, choice: "FIX" })).toEqual({ kind: "FIX", whatChanged: [], agreeBy: null });
  });

  it("a first publish has no points and no choice, and takes the draft's Agree by", () => {
    expect(buildPublishRequest({ ...base, firstPublish: true, showChoice: false })).toEqual({ kind: "NEW_VERSION", whatChanged: [], agreeBy: "2026-11-20" });
  });

  it("a reference page asks nobody", () => {
    expect(buildPublishRequest({ ...base, showChoice: false, mustRead: false })).toEqual({ kind: "NEW_VERSION", whatChanged: ["New limits"], agreeBy: null });
  });

  it("defaults Agree by to two weeks from today", () => {
    expect(defaultAgreeBy(new Date(2026, 10, 12))).toBe("2026-11-26");
  });
});

describe("PublishPageDialog", () => {
  const renderDialog = (props: Partial<React.ComponentProps<typeof PublishPageDialog>> = {}) => {
    const onPublish = jest.fn(() => Promise.resolve());
    render(
      <PublishPageDialog
        open
        onOpenChange={jest.fn()}
        nextVersion={4}
        firstPublish={false}
        mustRead
        everAgreed
        draftAgreeBy={null}
        onPublish={onPublish}
        {...props}
      />,
    );
    return onPublish;
  };

  it("offers the two choices, asking again by default", () => {
    renderDialog();
    expect(screen.getByRole("radio", { name: /Ask everyone to agree again/ })).toBeChecked();
    expect(screen.getByRole("radio", { name: /Small fix, keep agreements/ })).not.toBeChecked();
    expect(screen.getByText("What changed")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Publish version 4" })).toBeInTheDocument();
    expect(screen.queryByText(/Drafted by AI/)).not.toBeInTheDocument();
  });

  it("a small fix hides the points and publishes as a fix", async () => {
    const onPublish = renderDialog();
    fireEvent.click(screen.getByRole("radio", { name: /Small fix, keep agreements/ }));
    expect(screen.queryByText("What changed")).not.toBeInTheDocument();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Publish fix" })));
    expect(onPublish).toHaveBeenCalledWith({ kind: "FIX", whatChanged: [], agreeBy: null });
  });

  it("has no choice for a page nobody agreed to", () => {
    renderDialog({ everAgreed: false });
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  });

  it("stays open and says the draft is saved when publishing fails", async () => {
    const onOpenChange = jest.fn();
    render(
      <PublishPageDialog
        open
        onOpenChange={onOpenChange}
        nextVersion={2}
        firstPublish={false}
        mustRead={false}
        everAgreed={false}
        draftAgreeBy={null}
        onPublish={() => Promise.reject(new Error("down"))}
      />,
    );
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Publish version 2" })));
    expect(screen.getByRole("alert")).toHaveTextContent("Couldn't publish. Your draft is saved.");
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});

describe("buildPublishRequest — a must-read page with no date yet", () => {
  it("sends the date the dialog asked for instead of none", () => {
    const req = buildPublishRequest({
      firstPublish: true, showChoice: false, choice: "ASK_AGAIN", points: [""], agreeBy: "2026-12-01",
      mustRead: true, draftAgreeBy: null,
    });
    expect(req.agreeBy).toBe("2026-12-01");
  });

  it("keeps the page's own date when it has one", () => {
    const req = buildPublishRequest({
      firstPublish: true, showChoice: false, choice: "ASK_AGAIN", points: [""], agreeBy: "2026-12-01",
      mustRead: true, draftAgreeBy: "2026-11-30",
    });
    expect(req.agreeBy).toBe("2026-11-30");
  });
});
