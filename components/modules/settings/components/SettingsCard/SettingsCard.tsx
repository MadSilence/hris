"use client";

import Link from "next/link";
import { Card } from "@/components/desact/card";
import { Separator } from "@/components/desact/separator";
import { LinkSquare02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import React from "react";

export type SettingsLinkItem = {
  label: string;
  href: string;
  external?: boolean;
};

export interface SettingsCardProps {
  title: string;
  icon?: React.ReactNode;
  items: SettingsLinkItem[];
}

const SettingsCard = ({
  title,
  icon,
  items,
}: SettingsCardProps) => {
  const headingId = React.useId();

  return (
    <Card
      className="h-full p-6 grid gap-2 content-start"
      role="region"
      aria-labelledby={headingId}
    >
      <div className="flex items-center gap-4">
        {icon ? (
          <span
            className="inline-grid place-items-center w-8 h-8 rounded-control bg-mist text-tertiary"
            aria-hidden
          >
            {icon}
          </span>
        ) : null}

        <h2 id={headingId} className="text-body font-semibold">
          {title}
        </h2>
      </div>

      <div className="grid content-start">
        {items.map((it, idx) => {
          const row = (
            <div
              className="group flex items-center justify-between px-2.5 py-1.5 rounded-control hover:bg-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring transition-colors cursor-pointer"
            >
              <div className="text-body no-underline">
                {it.label}
              </div>

              {it.external ? (
                <Icon icon={LinkSquare02Icon} size="sm" className="text-tertiary opacity-70 group-hover:opacity-100" />
              ) : null}
            </div>
          );

          return (
            <div key={it.href} className="grid">
              {it.external ? (
                <a
                  href={it.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-control no-underline hover:no-underline"
                >
                  {row}
                </a>
              ) : (
                <Link
                  href={it.href}
                  className="rounded-control no-underline hover:no-underline"
                >
                  {row}
                </Link>
              )}

              {idx < items.length - 1 ? (
                <Separator className="my-0.5"/>
              ) : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default SettingsCard;
