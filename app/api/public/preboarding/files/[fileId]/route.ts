import { hrisApiLifecycleService } from "@/api/modules/lifecycle/services";

type RouteContext = { params: Promise<{ fileId: string }> };

/**
 * A material file for the preboarding page. Bare by design, like the other public passthroughs: nobody is
 * signed in, the token in the body is the credential and Java checks it — the file must be named by one of
 * the token's own tasks. POST so the token stays out of the address and the logs.
 */
export async function POST(req: Request, context: RouteContext) {
  const { fileId } = await context.params;
  let token = "";
  try {
    token = String(((await req.json()) as { token?: unknown }).token ?? "");
  } catch {
    return new Response(null, { status: 400 });
  }
  try {
    const backend = await hrisApiLifecycleService.preboardingFile(token, fileId);
    return new Response(backend.body, {
      status: backend.status,
      headers: {
        "Content-Type": backend.headers.get("content-type") ?? "application/octet-stream",
        "Content-Disposition": backend.headers.get("content-disposition") ?? "attachment",
      },
    });
  } catch {
    // One answer for every refusal, as the page's own link gives: the file is not this link's to hand out.
    return new Response(null, { status: 404 });
  }
}
