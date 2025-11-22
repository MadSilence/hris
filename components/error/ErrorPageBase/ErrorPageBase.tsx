import React, { useEffect } from "react";
import { useGlobalErrorContext } from "@/components/error/GlobalErrorProvider";

export type ErrorWithDigest = Error & { digest?: string };

type ErrorPageBaseProps = {
  error: ErrorWithDigest;
  removeErrorOnUnmount?: boolean;
  children: React.ReactNode;
};

export const ErrorPageBase: React.FC<ErrorPageBaseProps> = ({
  error,
  removeErrorOnUnmount = false,
  children,
}) => {
  const { addError, removeError } = useGlobalErrorContext();

  useEffect(() => {
    addError(error);

    return removeErrorOnUnmount ? () => removeError(error) : () => null;
  }, []);

  return children;
};
