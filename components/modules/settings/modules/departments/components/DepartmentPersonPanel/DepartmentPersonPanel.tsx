"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/public/desact/src/components/ui/avatar";
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
        className="flex w-fit items-center gap-1.5 text-sm text-brown-500 hover:text-brown-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12 flex-none">
          {person.avatarUrl && <AvatarImage src={person.avatarUrl} alt="" />}
          <AvatarFallback>{personInitials(person)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold text-brown-900">
            {personDisplayName(person)}
          </h2>
          {person.jobName && <p className="truncate text-sm text-brown-500">{person.jobName}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-brown-400">
            Department
          </h3>
          <p className="text-sm text-brown-700">{departmentName ?? "No department"}</p>
        </div>

        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-brown-400">
            Email
          </h3>
          <p className="truncate text-sm text-brown-700">{person.email}</p>
        </div>

        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-brown-400">
            Status
          </h3>
          <p className="text-sm text-brown-700">{person.status}</p>
        </div>
      </div>

      <Link
        href={`/organization/people/${person.id}/personal`}
        className="flex w-fit items-center gap-1.5 text-sm text-brown-600 underline-offset-2 hover:text-brown-900 hover:underline"
      >
        Open profile
        <ExternalLink className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
