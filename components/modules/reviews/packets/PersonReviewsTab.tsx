"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Skeleton } from "@/components/desact/skeleton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useDateFormatter } from "@/lib/date";
import { usePersonReviews } from "@/components/modules/reviews/hooks";
import { PacketStatusBadge } from "@/components/modules/reviews/shared/ReviewBadges";

/**
 * A person's reviews by cycle, with the final rating (REVIEWS_DESIGN.md § 12.6). The person sees those shared with
 * them, their manager in a cycle sees that cycle's, a reader with the result right sees all — the backend decides.
 */
export function PersonReviewsTab({ userId }: { userId: string }) {
  const t = useTranslations("reviews");
  const formatDisplayDate = useDateFormatter();
  const reviews = usePersonReviews(userId);
  if (reviews.error) return <div className="px-8"><ErrorState error={reviews.error} /></div>;
  if (!reviews.data) return <div className="px-8"><Skeleton className="h-40 w-full rounded-popover" aria-busy="true" /></div>;
  if (reviews.data.length === 0) {
    return (
      <div className="px-8">
        <EmptyState scene="reviews-and-one-on-ones" title={t("personTab.empty.title")}
          description={t("personTab.empty.description")} />
      </div>
    );
  }
  return (
    <ul className="space-y-2 px-8">
      {reviews.data.map((p) => (
        <li key={p.participantId}>
          <Link href={`/reviews/packets/${p.participantId}`}
            className="flex flex-wrap items-center gap-3 rounded-card border border-divider bg-card px-5 py-3 no-underline hover:border-divider hover:bg-subtle/40">
            <span className="font-medium text-primary">{p.cycleName}</span>
            <PacketStatusBadge status={p.status} />
            {p.finalRating != null && (
              <span className="text-body text-tertiary">
                {p.finalRatingLabel
                  ? t("packetLine.ratingWithLabel", { rating: p.finalRating, label: p.finalRatingLabel })
                  : t("packetLine.rating", { rating: p.finalRating })}
              </span>
            )}
            <span className="ml-auto text-hint text-tertiary">
              {p.sharedAt ? t("packetLine.shared", { date: formatDisplayDate(p.sharedAt, { style: "medium" }) }) : t("packetLine.notShared")}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
