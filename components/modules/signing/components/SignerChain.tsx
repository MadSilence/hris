"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Tick02Icon, UserIcon } from "@hugeicons/core-free-icons";

import { Avatar, AvatarFallback } from "@/components/desact/avatar";
import { Icon } from "@/components/desact/icon";
import { cn } from "@/lib/cn";
import type { EnvelopeSignerDTO } from "@/api/modules/signing/dto";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "—";

/**
 * "Who signs" (documents-signing G02, G09): numbered steps joined by a line, the people of one step stacked, "You" in
 * the accent. A guest's page never shows another signer's email — the backend leaves it out.
 */
export function SignerChain({ signers, youId }: { signers: EnvelopeSignerDTO[]; youId: string | null }) {
  const t = useTranslations("signing");
  const steps = React.useMemo(() => {
    const byOrder = new Map<number, EnvelopeSignerDTO[]>();
    for (const s of [...signers].sort((a, b) => a.order - b.order)) {
      byOrder.set(s.order, [...(byOrder.get(s.order) ?? []), s]);
    }
    return [...byOrder.entries()];
  }, [signers]);

  return (
    <ol className="flex flex-col">
      {steps.map(([order, people], i) => (
        <li key={order} className="relative flex gap-3 pb-4 last:pb-0">
          {i < steps.length - 1 && <span aria-hidden className="absolute left-2.5 top-6 h-[calc(100%-1rem)] w-px bg-divider" />}
          <span className="relative z-10 flex size-5 shrink-0 items-center justify-center rounded-pill border border-strong bg-card text-hint text-secondary">
            {i + 1}
          </span>
          <ul className="flex flex-col gap-2">
            {people.map((s) => {
              const you = youId !== null && s.id === youId;
              return (
                <li key={s.id} className="flex items-center gap-2">
                  <Avatar className="size-[22px]">
                    <AvatarFallback name={s.isGuest ? null : s.name}>
                      {s.isGuest ? <Icon icon={UserIcon} size="sm" /> : initials(s.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className={cn("text-body", you ? "font-medium text-accent-text" : "text-primary")}>
                    {you ? t("screen.you") : s.name}
                  </span>
                  {s.status === "SIGNED" && <Icon icon={Tick02Icon} size="sm" className="text-status-approved-text" />}
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ol>
  );
}
