"use client";

import { Suspense } from "react";

import ConfirmTrialContainer from "@/components/modules/trial/components/SetPasswordContainer/ConfirmTrialContainer";

export default function ConfirmTrialPage() {
  // The container reads the invite token from the query string, which needs a boundary to prerender.
  return (
    <Suspense fallback={null}>
      <ConfirmTrialContainer />
    </Suspense>
  );
}
