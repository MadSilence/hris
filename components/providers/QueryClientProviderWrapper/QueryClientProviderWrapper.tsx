"use client";

import React from "react";
import { focusManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiError } from "@/components/clients/exceptions";

type QueryClientProviderWrapperProps = {
  children: React.ReactNode;
};

/*
 * A background tab is not a paused one (decided 2026-10-27, SWEEP Q6). react-query stops retrying a
 * failed read, and stops every poll that does not opt in, while the window is not focused — so "You can
 * keep this open, it finishes on its own" stopped in a background tab, and a read that failed once stayed
 * failed until somebody looked. Refetching *on* focus is already off (below), so the only thing focus
 * still decided was this pause. Polls are few and slow here (the unread count every 45 s; job progress
 * only while a job runs).
 */
focusManager.setEventListener(() => () => {});
focusManager.setFocused(true);

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
