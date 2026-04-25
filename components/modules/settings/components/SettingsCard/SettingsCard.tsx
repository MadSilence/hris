"use client";

import Link from "next/link";
import { Card } from "@/public/desact/src/components/ui/card";
import { Separator } from "@/public/desact/src/components/ui/separator";
import { ExternalLink } from "lucide-react";
import React from "react";

export type SettingsLinkItem = {
  label: string;
  href: string;
  external?: boolean
};

export interface SettingsCardProps {
  title: string;
  icon?: React.ReactNode;
  items: SettingsLinkItem[];
}

const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  icon,
  items
}) => {
  const headingId = React.useId();

  return (
    <Card className="p-6 grid gap-2" role="region" aria-labelledby={headingId}>
      <div className="flex items-center gap-4">
        {icon &&
          <span className="inline-grid place-items-center w-8 h-8 rounded-md bg-muted text-muted-foreground" aria-hidden>{icon}</span>}
        <h2 id={headingId} className="text-base font-semibold">{title}</h2>
      </div>

      <div className="grid">
        {items.map((it, idx) => {
          const row = (
            <div
              className="group flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors cursor-pointer">
              <div className="text-sm no-underline">{it.label}</div>
              {it.external ? (
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-70 group-hover:opacity-100" aria-hidden/>
              ) : null}
            </div>
          );
          return (
            <div key={it.href} className="grid">
              {it.external ? (
                <a href={it.href} target="_blank" rel="noopener noreferrer" className="rounded-md no-underline hover:no-underline">
                  {row}
                </a>
              ) : (
                <Link href={it.href} className="rounded-md no-underline hover:no-underline">
                  {row}
                </Link>
              )}
              {idx < items.length - 1 ? <Separator className="my-0.5"/> : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default SettingsCard;
