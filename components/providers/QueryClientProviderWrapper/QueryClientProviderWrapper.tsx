"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiError } from "@/components/clients/exceptions";

type QueryClientProviderWrapperProps = {
  children: React.ReactNode;
};

const QueryClientProviderWrapper: React.FC<QueryClientProviderWrapperProps> = ({ children }) => {
  const [client] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            /* A refusal is an answer, not a hiccup: retrying a 404 or a 403 three times with backoff
               only delays the state that explains it — a deleted process sat on a blank skeleton for
               ten seconds before saying "Not found". Server faults are still worth retrying. */
            retry: (failureCount, error) => {
              const status = error instanceof ApiError ? error.status : undefined;
              if (status !== undefined && status < 500) return false;
              return failureCount < 3;
            },
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

export default QueryClientProviderWrapper;
