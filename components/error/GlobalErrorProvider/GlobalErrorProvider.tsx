"use client";

import React, { createContext, memo, useContext, useMemo, useState } from "react";
import { ErrorWithDigest } from "@/components/error/ErrorPageBase";

type GlobalErrorState = {
  errors: ErrorWithDigest[];
  addError: (error: ErrorWithDigest) => void;
  removeError: (error: ErrorWithDigest) => void;
};

export const GlobalErrorContext = createContext<GlobalErrorState>({} as GlobalErrorState);

type GlobalErrorProviderProps = {
  children: React.ReactNode;
};

const GlobalErrorProvider: React.FC<GlobalErrorProviderProps> = ({ children }) => {
  const [errors, setErrors] = useState<ErrorWithDigest[]>([]);

  const value = useMemo(
    () => ({
      errors,
      addError: (error: ErrorWithDigest) => setErrors((prevState) => [...prevState, error]),
      removeError: (error: ErrorWithDigest) => setErrors((prevState) => getListWithoutProvidedError(prevState, error)),
    }), [errors, setErrors],
  );

  return <GlobalErrorContext.Provider value={value}>{children}</GlobalErrorContext.Provider>;
};

const getListWithoutProvidedError = (errors: ErrorWithDigest[], error: ErrorWithDigest) =>
  errors.filter((e) => e !== error);

export const useGlobalErrorContext = (): GlobalErrorState => useContext(GlobalErrorContext);

export default memo(GlobalErrorProvider);
