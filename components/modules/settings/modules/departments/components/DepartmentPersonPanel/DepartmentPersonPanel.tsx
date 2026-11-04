"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft02Icon, LinkSquare02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/desact/avatar";
import {
  personDisplayName,
  personInitials,
} from "@/components/modules/settings/modules/departments/utils/personDisplay";
import type { DepartmentPerson } from "@/models/departments";

type Props = {
  person: DepartmentPerson;
  departmentName: string | null;
  onBack: () => void;
};

export function DepartmentPersonPanel({ person, departmentName, onBack }: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-5 p-6">
      <button
        type="button"
        onClick={onBack}
        className="flex w-fit items-center gap-1.5 text-body text-tertiary hover:text-primary"
      >
        <Icon icon={ArrowLeft02Icon} size="sm" />
        Back
      </button>

      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12 flex-none">
          {person.avatarUrl && <AvatarImage src={person.avatarUrl} alt="" />}
          <AvatarFallback>{personInitials(person)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-section-title text-primary">
            {personDisplayName(person)}
          </h2>
          {person.jobName && <p className="truncate text-body text-tertiary">{person.jobName}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="mb-1 text-hint font-semibold text-tertiary">
            Department
          </h3>
          <p className="text-body text-secondary">{departmentName ?? "No department"}</p>
        </div>

        <div>
          <h3 className="mb-1 text-hint font-semibold text-tertiary">
            Email
          </h3>
          <p className="truncate text-body text-secondary">{person.email}</p>
        </div>

        <div>
          <h3 className="mb-1 text-hint font-semibold text-tertiary">
            Status
          </h3>
          <p className="text-body text-secondary">{person.status}</p>
        </div>
      </div>

      <Link
        href={`/organization/people/${person.id}/personal`}
        className="flex w-fit items-center gap-1.5 text-body text-accent-text underline-offset-4 hover:underline"
      >
        Open profile
        <Icon icon={LinkSquare02Icon} size="sm" />
      </Link>
    </div>
  );
}
