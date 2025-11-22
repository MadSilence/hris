import {JwksClient} from "jwks-rsa";
import publicConfig from "@/config/publicConfig";

export const jwksClient = new JwksClient({
    jwksUri: `${publicConfig.auth.issuerUri}`,
    timeout: 10000
})