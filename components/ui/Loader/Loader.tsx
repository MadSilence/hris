import { NodRing } from "@/components/desact/nod";
import { cn } from "@/lib/cn";

/*
 * Waiting in place (SPEC § 12): nothing under 300 ms, one nodding ring in the accent up to two seconds, a
 * skeleton shaped like the content after that. Never a spinner or three dots, and never the whole screen for
 * a single save — only the content area loads, the sidebar stays.
 */
export function Loader({ label, className }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex flex-1 items-center justify-center py-12", className)}>
      <NodRing size="lg" label={label} />
    </div>
  );
}
