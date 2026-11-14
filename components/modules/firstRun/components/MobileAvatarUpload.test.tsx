import { fireEvent, render, screen } from "@testing-library/react";

import { ActionStatus } from "@/components/models/ActionStatus";
import { MobileAvatarUpload } from "./MobileAvatarUpload";

const upload = jest.fn();
jest.mock("@/components/modules/firstRun/actions", () => ({
  uploadAvatarByTokenAction: (form: FormData) => upload(form),
}));

const pickFile = (container: HTMLElement) => {
  const input = container.querySelector("input[type=file]") as HTMLInputElement;
  fireEvent.change(input, { target: { files: [new File(["x"], "me.jpg", { type: "image/jpeg" })] } });
};

/** first-run-photo P6–P9 on the phone, read through the real catalogue. */
describe("MobileAvatarUpload", () => {
  beforeEach(() => upload.mockReset());

  it("P6 opens the gallery, not the camera: the input asks for an image and has no capture", () => {
    const { container } = render(<MobileAvatarUpload token="t" firstName="Anna" lastName="Pol" company="Acme" />);

    expect(screen.getByRole("heading", { name: "Hi, Anna" })).toBeInTheDocument();
    expect(screen.getByText("Pick a photo for your profile at Acme.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Choose a photo" })).toBeInTheDocument();
    expect(screen.getByText("From your gallery.")).toBeInTheDocument();
    expect(container.querySelector("input[type=file]")).not.toHaveAttribute("capture");
  });

  it("P7 → P8: uploading, then that's your photo", async () => {
    let finish: (v: unknown) => void = () => {};
    upload.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    const { container } = render(<MobileAvatarUpload token="t" firstName="Anna" company="Acme" />);

    pickFile(container);
    expect(screen.getByRole("heading", { name: "Uploading…" })).toBeInTheDocument();

    finish({ status: ActionStatus.SUCCESS });
    expect(await screen.findByRole("heading", { name: "That’s your photo" })).toBeInTheDocument();
  });

  it("P9: a failed upload asks for a new code", async () => {
    upload.mockResolvedValue({ status: ActionStatus.ERROR, errorMessage: "No." });
    const { container } = render(<MobileAvatarUpload token="t" firstName="Anna" company="Acme" />);

    pickFile(container);
    expect(await screen.findByRole("heading", { name: "That didn’t work" })).toBeInTheDocument();
    expect(screen.getByText("Show a new code on your computer and scan it again.")).toBeInTheDocument();
  });
});
