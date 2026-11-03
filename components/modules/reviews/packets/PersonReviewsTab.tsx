"use client";

import React from "react";
import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { formatDisplayDate } from "@/lib/date";
import { usePersonReviews } from "@/components/modules/reviews/hooks";
import { PacketStatusBadge } from "@/components/modules/reviews/shared/ReviewBadges";

/**
 * A person's reviews by cycle, with the final rating (REVIEWS_DESIGN.md § 12.6). The person sees those shared with
 * them, their manager in a cycle sees that cycle's, a reader with the result right sees all — the backend decides.
 */
export function PersonReviewsTab({ userId }: { userId: string }) {
  const reviews = usePersonReviews(userId);
  if (reviews.error) return <div className="px-8"><ErrorState error={reviews.error} /></div>;
  if (!reviews.data) return <div className="px-8"><Skeleton className="h-40 w-full rounded-xl" aria-busy="true" /></div>;
  if (reviews.data.length === 0) {
    return (
      <div className="px-8">
        <EmptyState icon={<ClipboardCheck className="h-6 w-6" />} title="No reviews"
          description="Reviews from performance review cycles appear here once there is one you can read." />
      </div>
    );
  }
  return (
    <ul className="space-y-2 px-8">
      {reviews.data.map((p) => (
        <li key={p.participantId}>
          <Link href={`/reviews/packets/${p.participantId}`}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-brown-100 bg-white px-5 py-3 no-underline hover:border-brown-200 hover:bg-brown-50/40">
            <span className="font-medium text-brown-900">{p.cycleName}</span>
            <PacketStatusBadge status={p.status} />
            {p.finalRating != null && (
              <span className="text-sm text-muted-foreground">Rating {p.finalRating}{p.finalRatingLabel ? ` · ${p.finalRatingLabel}` : ""}</span>
            )}
            <span className="ml-auto text-xs text-muted-foreground">
              {p.sharedAt ? `Shared ${formatDisplayDate(p.sharedAt, { style: "medium" })}` : "Not shared yet"}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
