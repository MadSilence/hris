import { act, fireEvent, render, screen } from "@testing-library/react";
import { ActionStatus } from "@/components/models/ActionStatus";
import { emptyPostDraft, validatePost, validateSchedule } from "./postDraft";
import { PostForm } from "./PostEditorDialog";
import { saveHubPostAction } from "../../actions";
import { Dialog, DialogContent } from "@/components/desact/dialog";

jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("../../actions", () => ({ saveHubPostAction: jest.fn() }));
jest.mock("../../document", () => ({
  PostEditor: ({ onChange }: { onChange: (body: string) => void }) => (
    <textarea aria-label="Text body" onChange={(e) => onChange(JSON.stringify({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: e.target.value }] }] }))} />
  ),
}));
jest.mock("./CoverField", () => ({ CoverField: () => <div /> }));
jest.mock("../audience", () => ({ AudienceDialog: () => null }));
jest.mock("../../hooks", () => ({
  unwrapHub: jest.requireActual("../../hooks/useHubMutation").unwrapHub,
  useInvalidateHub: () => jest.fn(),
  useAudienceResolve: () => ({ data: { total: 12, people: [], label: "EVERYONE" }, isFetching: false }),
  usePostEdit: () => ({ data: undefined, isLoading: false }),
}));
jest.mock("@/components/auth", () => ({ useCanAccess: () => true }));
jest.mock("@/components/providers/CompanyDataProvider/CompanyDataProvider", () => ({
  useCompanyData: () => ({ company: { name: "Acme" } }),
}));

const save = saveHubPostAction as jest.MockedFunction<typeof saveHubPostAction>;

const renderForm = () => {
  const onClose = jest.fn();
  render(
    <Dialog open>
      <DialogContent>
        <PostForm postId={null} initial={emptyPostDraft()} status={null} pinnedElsewhereTitle={null} onClose={onClose} />
      </DialogContent>
    </Dialog>,
  );
  return onClose;
};

describe("New post (CM05)", () => {
  it("needs a title on Publish and on Save draft, and sends nothing without one", async () => {
    renderForm();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Publish" })));
    expect(screen.getByText("Add a title")).toBeInTheDocument();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Save draft" })));
    expect(save).not.toHaveBeenCalled();
  });

  it("publishes with a title and closes", async () => {
    save.mockResolvedValue({ status: ActionStatus.SUCCESS, data: { id: "p1" } });
    const onClose = renderForm();
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "🎉 Winter party" } });
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Publish" })));
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ id: null, then: "PUBLISH", write: expect.objectContaining({ title: "🎉 Winter party", showOnHome: false }) }));
    expect(onClose).toHaveBeenCalled();
  });

  it("asks before throwing away what was written", () => {
    const onClose = renderForm();
    fireEvent.change(screen.getByLabelText("Text body"), { target: { value: "Tickets are open" } });
    fireEvent.keyDown(screen.getByLabelText("Title"), { key: "Escape" });
    expect(screen.getByText("Discard this post?")).toBeInTheDocument();
    expect(screen.getByText("What you wrote will be lost.")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Discard" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("closes at once when nothing was written", () => {
    const onClose = renderForm();
    fireEvent.keyDown(screen.getByLabelText("Title"), { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
});

describe("the post's rules", () => {
  it("a title is the one required field", () => {
    expect(validatePost({ ...emptyPostDraft(), title: "  " })).toEqual({ title: "required" });
    expect(validatePost({ ...emptyPostDraft(), title: "Hi" })).toEqual({});
  });

  it("a schedule needs a date and time in the future", () => {
    const now = new Date(2026, 10, 12, 10, 0);
    expect(validateSchedule("", "09:00", now)).toBe("required");
    expect(validateSchedule("2026-11-12", "09:00", now)).toBe("past");
    expect(validateSchedule("2026-11-13", "09:00", now)).toBeUndefined();
  });
});
