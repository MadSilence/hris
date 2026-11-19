import { redirect } from "next/navigation";

/**
 * `<root>/signup/verify` — B2, "Check your email". The address being proved lives in the page, never in the URL, so
 * opening this address on its own (a reload, a bookmark) starts again at B1.
 */
export default function SignupVerifyPage(): never {
  redirect("/signup");
}
