"use client";

import { FC, useMemo, useState } from "react";
import { ChevronsDownUp, ChevronsUpDown, Download, Plus, Search } from "lucide-react";

import { Input } from "@/public/desact/src/components/ui/input";
import { Button } from "@/public/desact/src/components/ui/button";
import { Badge } from "@/public/desact/src/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/public/desact/src/components/ui/accordion";
import { ExportDataModal } from "@/components/modules/settings/shared/ExportDataModal/ExportDataModal";
import { JobFamily } from "@/models/job";

type JobFamilyProps = {
  jobFamilies: JobFamily[] | null | undefined;
};

const GRID = "grid grid-cols-[minmax(0,1fr)_160px_150px_150px_160px] items-center gap-4";

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

export const JobFamilyComponent: FC<JobFamilyProps> = ({ jobFamilies }) => {
  const all = jobFamilies ?? [];

  const [query, setQuery] = useState("");
  const [openIds, setOpenIds] = useState<string[]>(() => all.map((f) => f.id));
  const [isExportOpen, setIsExportOpen] = useState(false);

  const needle = query.trim().toLowerCase();

  const families = useMemo(() => {
    if (!needle) return all;

    return all
      .map((family) => {
        const familyMatches = family.name.toLowerCase().includes(needle);
        const jobs = familyMatches
          ? family.jobs
          : family.jobs.filter(
              (job) =>
                job.name.toLowerCase().includes(needle) ||
                (job.level?.name ?? "").toLowerCase().includes(needle),
            );

        return { ...family, jobs };
      })
      .filter((family) => family.name.toLowerCase().includes(needle) || family.jobs.length > 0);
  }, [all, needle]);

  const allOpen = families.length > 0 && openIds.length >= families.length;
  const toggleAll = () => setOpenIds(allOpen ? [] : families.map((f) => f.id));

  return (
    // Fixed top region (search + column header) stays put; only the list below scrolls.
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-400"/>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search jobs"
            className="pl-9 w-[260px] h-9"
            inputMode="search"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-1.5 text-brown-600"
            onClick={toggleAll}
            disabled={families.length === 0}
          >
            {allOpen ? <ChevronsDownUp className="h-4 w-4"/> : <ChevronsUpDown className="h-4 w-4"/>}
            {allOpen ? "Collapse all" : "Expand all"}
          </Button>

          <Button
            size="icon"
            variant="outline"
            className="h-9 w-9"
            onClick={() => setIsExportOpen(true)}
            aria-label="Export job catalog"
          >
            <Download className="h-4 w-4"/>
          </Button>
        </div>
      </div>

      <div className="max-h-[calc(100svh-380px)] overflow-y-auto pr-1">
        <div className={`${GRID} sticky top-0 z-10 bg-white px-3 pb-2 pt-1 text-sm font-medium text-foreground`}>
          <div>Name</div>
          <div>Level</div>
          <div>Assigned People</div>
          <div>Added on</div>
          <div>Added by</div>
        </div>

        <div className="space-y-4 pt-2">
        {families.length > 0 && (
          <Accordion type="multiple" value={openIds} onValueChange={setOpenIds} className="w-full space-y-4">
            {families.map((family) => (
              <AccordionItem key={family.id} value={family.id} className="border-b-0">
                <AccordionTrigger className="rounded-md bg-brown-50 px-3 py-2.5 text-sm font-semibold uppercase tracking-wide text-brown-700 hover:no-underline">
                  <span className="flex items-center gap-2">
                    {family.name}
                    <span className="normal-case tracking-normal text-brown-400">
                      ({family.jobs.length})
                    </span>
                    {family.isSystem ? (
                      <Badge variant="secondary" className="font-normal normal-case tracking-normal">
                        Preset
                      </Badge>
                    ) : null}
                  </span>
                </AccordionTrigger>

                <AccordionContent>
                  <div className="pb-2">
                    {family.jobs.map((job, index) => (
                      <div
                        key={job.id}
                        className={`${GRID} px-3 py-2 ${
                          index < family.jobs.length - 1 ? "border-b border-brown-100" : ""
                        }`}
                      >
                        <div className="min-w-0">
                          <span className="inline-flex items-center gap-2">
                            <span className="truncate text-sm font-medium text-foreground">
                              {job.name}
                            </span>
                            {job.isSystem ? (
                              <Badge variant="secondary" className="font-normal">
                                Preset
                              </Badge>
                            ) : null}
                          </span>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          {job.level?.name ?? "—"}
                        </div>

                        {/* Placeholder until JOB assignments land. */}
                        <div className="text-sm text-muted-foreground">—</div>

                        <div className="text-sm text-muted-foreground">
                          {formatDate(job.createdAt)}
                        </div>

                        {/* createdBy is a UUID today — name resolution comes with the backend. */}
                        <div className="text-sm text-muted-foreground">—</div>
                      </div>
                    ))}

                    {/* Add-job affordance as a dashed trailing row (inert for now). */}
                    <button
                      type="button"
                      className="flex w-full items-center gap-1.5 rounded-md border border-dashed border-brown-300 px-3 py-2 text-sm text-brown-600 hover:bg-brown-50"
                    >
                      <Plus className="h-4 w-4"/>
                      Add Job
                    </button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        {/* Add-family affordance as a dashed light-brown block at the very bottom (inert for now). */}
        <button
          type="button"
          className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-brown-300 bg-brown-50/60 py-3 text-sm font-medium text-brown-600 hover:bg-brown-50"
        >
          <Plus className="h-4 w-4"/>
          Add Job Family
        </button>
        </div>
      </div>

      {/* UI-only for now — no backend export wiring yet. */}
      <ExportDataModal
        isOpen={isExportOpen}
        title="Export job catalog"
        description="Export all job families with their jobs."
        includedText="Includes every job family with its jobs and assigned levels."
        onCancelAction={() => setIsExportOpen(false)}
        onConfirmAction={() => setIsExportOpen(false)}
      />
    </div>
  );
};
