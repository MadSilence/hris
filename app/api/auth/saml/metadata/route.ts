import { type NextRequest } from "next/server";
import { ssoService } from "@/api/modules/sso";
import publicConfig from "@/config/publicConfig";
import { parseHost, requestHost } from "@/lib/companyAddress";

/** Our SAML entity descriptor for this company — the address the IdP's setup screen asks for. */
export const GET = async (req: NextRequest) => {
  const host = parseHost(requestHost(req.headers), publicConfig.web.rootDomain);
  if (host.kind !== "company") return new Response("Not found", { status: 404 });
  const upstream = await ssoService.samlMetadata(host.subdomain);
  return new Response(await upstream.text(), { headers: { "Content-Type": "application/samlmetadata+xml" } });
};
