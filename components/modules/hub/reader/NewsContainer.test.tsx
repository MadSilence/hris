import { render, screen } from "@testing-library/react";
import type { PostCard } from "@/models/hub";
import { NewsContainer } from "./NewsContainer";

const pinnedPost = { id: "p1", title: "Office closed on Friday", pinned: true } as unknown as PostCard;
let scope: "ALL" | "FOR_ME" = "FOR_ME";
let listed: PostCard[] = [];

jest.mock("../hooks", () => ({
  useHubPosts: () => ({
    data: { pages: [{ items: listed }] },
    isLoading: false,
    isError: false,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: jest.fn(),
    refetch: jest.fn(),
  }),
  useHubHome: () => ({ data: { pinned: pinnedPost } }),
}));
jest.mock("./HomeParts", () => ({ useFeedScope: () => [scope, jest.fn()] }));
jest.mock("./HubHomeContainer", () => ({ FeedScopeSwitch: () => null }));
jest.mock("../shared", () => ({
  ...jest.requireActual("../shared"),
  PinnedPost: ({ post }: { post: PostCard }) => <div>pinned: {post.title}</div>,
  NewsRow: ({ post }: { post: PostCard }) => <li>row: {post.title}</li>,
}));

// WALK_QUESTIONS § 34 (a): the pinned post — written to everyone — stays on top of All news under "For me" too.
describe("NewsContainer", () => {
  beforeEach(() => {
    listed = [];
  });

  it("keeps the pinned post on top under For me, though the list holds only what is written to the reader", () => {
    scope = "FOR_ME";
    render(<NewsContainer />);
    expect(screen.getByText("pinned: Office closed on Friday")).toBeInTheDocument();
  });

  it("shows the pinned post once under Everyone, from the list itself", () => {
    scope = "ALL";
    listed = [pinnedPost];
    render(<NewsContainer />);
    expect(screen.getAllByText(/Office closed on Friday/)).toHaveLength(1);
  });
});
