import { render, screen } from "@testing-library/react";
import { ApiError } from "@/components/clients/exceptions";
import { PostContainer } from "./PostContainer";

jest.mock("../hooks", () => ({
  useHubPost: () => ({
    data: undefined,
    isLoading: false,
    isError: true,
    error: new ApiError("walk", { status: 500, code: "E00500" }),
    refetch: jest.fn(),
  }),
}));

// U1 (company hub fixes): a post that fails to load shows the hub's own state — its title and Try again — not the
// generic "This didn't load" with a second line and the error's code (walk of 2026-11-19).
describe("PostContainer", () => {
  it("says the news could not load, with Try again and no code", () => {
    render(<PostContainer id="p1" />);
    expect(screen.getByText("Couldn't load the news")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    expect(screen.queryByText("E00500")).not.toBeInTheDocument();
  });
});
