import { ForgotPasswordContainer } from "@/components/modules/passwordReset";
import { companyAuthBrand } from "@/api/modules/companyAddress";

/** `/login/forgot` on a company's address (sign-in-password F1, F2). */
export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage() {
  const { brand } = await companyAuthBrand();
  return <ForgotPasswordContainer brand={brand} />;
}
