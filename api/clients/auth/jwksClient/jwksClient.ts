import {JwksClient} from "jwks-rsa";
import publicConfig from "@/config/publicConfig";
import {backendTunnelHeaders} from "@/config/backendTunnel";

export const jwksClient = new JwksClient({
    jwksUri: `${publicConfig.auth.issuerUri}`,
    timeout: 10000,
    // TEMPORARY — the ngrok tunnel; remove with config/backendTunnel.ts.
    requestHeaders: backendTunnelHeaders(),
})
