"use client";

import * as React from "react";
import { ErrorState } from "@/components/feedback/ErrorState";

type Props = {
  children: React.ReactNode;
  /** Rendered instead of the default region-level error state. */
  fallback?: (error: unknown, reset: () => void) => React.ReactNode;
  compact?: boolean;
};

type State = { error: unknown };

/**
 * Catches what a subtree throws while rendering, so one broken widget does not take the page with
 * it. `app/(app)/error.tsx` is the route-level net above this; use this one to keep a failure
 * inside a panel, a tab or a card.
 *
 * React only calls this for errors thrown during render, in a lifecycle, or in a constructor — not
 * for a rejected promise in an event handler. Those go through `withActionError` instead.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = { error: undefined };

  public static getDerivedStateFromError(error: unknown): State {
    return { error };
  }

  public componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  private reset = () => this.setState({ error: undefined });

  public render() {
    const { error } = this.state;
    if (error === undefined) return this.props.children;

    if (this.props.fallback) return this.props.fallback(error, this.reset);

    return <ErrorState error={error} compact={this.props.compact} onRetry={this.reset} />;
  }
}
