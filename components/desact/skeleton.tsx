import { cn } from "@/lib/cn";

/*
 * A shape in Mist with a soft shimmer, for a wait of 2 to 10 seconds, laid out like the content it stands
 * for (SPEC § 12). It shimmers, it never pulses; with reduced motion it stands still.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="skeleton" aria-hidden className={cn("shimmer rounded-control", className)} {...props} />;
}

export { Skeleton };
