/**
 * Who is signing, and by what right (documents-signing): a person signed in to the company, a guest holding the link
 * from their email, or a new joiner holding their preboarding page's token. Every signing call is made for one.
 */
export type SigningParty =
  | { kind: "member"; envelopeId: string }
  | { kind: "guest"; token: string }
  | { kind: "joiner"; token: string; taskId: string };

export const isSigningParty = (value: unknown): value is SigningParty => {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (v.kind === "member") return typeof v.envelopeId === "string" && v.envelopeId.length > 0;
  if (v.kind === "guest") return typeof v.token === "string" && v.token.length > 0;
  if (v.kind === "joiner") return typeof v.token === "string" && typeof v.taskId === "string";
  return false;
};
