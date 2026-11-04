import { backendTunnelHeaders } from "@/config/backendTunnel";

describe("backendTunnelHeaders (temporary, the ngrok tunnel)", () => {
  it("asks ngrok to skip its warning page when the backend is behind ngrok", () => {
    expect(backendTunnelHeaders("https://resilient-phoney-sputter.ngrok-free.dev")).toEqual({
      "ngrok-skip-browser-warning": "1",
    });
    expect(backendTunnelHeaders("https://abc.ngrok-free.app/")).toEqual({
      "ngrok-skip-browser-warning": "1",
    });
    expect(backendTunnelHeaders("https://abc.ngrok.io")).toEqual({
      "ngrok-skip-browser-warning": "1",
    });
  });

  it("sends nothing for any other backend", () => {
    expect(backendTunnelHeaders("http://localhost:8081")).toEqual({});
    expect(backendTunnelHeaders("http://192.168.1.15:8081")).toEqual({});
    expect(backendTunnelHeaders("https://api.ngrok-free.dev.example.com")).toEqual({});
    expect(backendTunnelHeaders("")).toEqual({});
    expect(backendTunnelHeaders("not a url")).toEqual({});
  });
});
