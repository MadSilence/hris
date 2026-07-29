"use client";

import React from "react";
import { Plus } from "lucide-react";

type Props = {
  onClick: () => void;
};

export const JobLevelAddCard: React.FC<Props> = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Add job level group"
      className="flex h-full min-h-[360px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-brown-300 bg-brown-50/40 p-6 text-center transition-colors hover:border-brown-400 hover:bg-brown-50"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-dashed border-brown-300 text-brown-600">
        <Plus className="h-5 w-5"/>
      </span>

      <span className="text-sm font-semibold text-brown-700">Add Job Group</span>

      <span className="max-w-[220px] text-xs text-muted-foreground">
        Create a new career track and define the levels employees can progress through.
      </span>
    </button>
  );
};
