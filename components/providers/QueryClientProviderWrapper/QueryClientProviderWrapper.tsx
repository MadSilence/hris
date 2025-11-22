"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

type QueryClientProviderWrapperProps = {
  children: React.ReactNode;
};

const QueryClientProviderWrapper: React.FC<QueryClientProviderWrapperProps> = ({ children }) => {
  const [client] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { refetchOnWindowFocus: false } },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

export default QueryClientProviderWrapper;
