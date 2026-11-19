import * as React from "react";
import { render, screen } from "@testing-library/react";
import { SetUpTwoStepContainer } from "./SetUpTwoStepContainer";
import { useAuthService } from "@/components/modules/auth/hooks/useAuthService";
import { partialMock } from "@/test/types";

jest.mock("@/components/modules/auth/hooks/useAuthService");
jest.mock("qrcode", () => ({ __esModule: true, default: { toDataURL: () => Promise.resolve("data:image/png;base64,") } }));

const enrolAtSignInStart = jest.fn();
const service = partialMock<ReturnType<typeof useAuthService>>({ enrolAtSignInStart });

beforeEach(() => {
  enrolAtSignInStart.mockReset();
  enrolAtSignInStart.mockResolvedValue({ otpauthUri: "otpauth://totp/x?secret=AAAA", secret: "AAAABBBB" });
  jest.mocked(useAuthService).mockReturnValue(service);
});

// D4: every start makes a new secret on the server. Two starts left the page showing a key the server no longer held, and
// every right code was refused (walk of 2026-11-19).
describe("SetUpTwoStepContainer (D4)", () => {
  it("starts the set-up once, though React runs the effect twice", async () => {
    render(
      <React.StrictMode>
        <SetUpTwoStepContainer brand={{ kind: "noddo" }} returnTo="/welcome" />
      </React.StrictMode>,
    );
    expect(await screen.findByRole("heading", { name: "Set up two-step login" })).toBeInTheDocument();
    expect(enrolAtSignInStart).toHaveBeenCalledTimes(1);
  });
});
