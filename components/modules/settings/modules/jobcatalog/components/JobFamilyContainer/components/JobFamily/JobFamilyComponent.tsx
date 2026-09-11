"use client";

import { FC, useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Check,
  ChevronsDownUp,
  ChevronsUpDown,
  Copy,
  Download,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { Badge } from "@/public/desact/src/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/public/desact/src/components/ui/accordion";
import { RowAction, RowActionDestructive, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { ExportDataModal } from "@/components/modules/settings/shared/ExportDataModal/ExportDataModal";
import {
  ExportDataFormValues,
  triggerExportDownload,
} from "@/components/modules/settings/shared/ExportDataModal";
import { Job, JobFamily } from "@/models/job";
import { Briefcase } from "lucide-react";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { ListEmptyState } from "@/components/feedback/ListEmptyState";
import { JobFamilySkeleton } from "@/components/modules/settings/modules/jobcatalog/components/JobFamilyContainer/components/JobFamily/JobFamilySkeleton";

export type JobFamilyComponentProps = {
  jobFamilies: JobFamily[] | null | undefined;
  /** The toolbar stays put while the list fills in — only the rows are a skeleton. */
  isLoading?: boolean;
  onCreateFamily: () => void;
  onEditFamily: (family: JobFamily) => void;
  onDuplicateFamily: (family: JobFamily) => void;
  onArchiveFamily: (family: JobFamily) => void;
  onActivateFamily: (family: JobFamily) => void;
  onDeleteFamily: (family: JobFamily) => void;
  onCreateJob: (family: JobFamily) => void;
  onEditJob: (job: Job) => void;
  onDuplicateJob: (job: Job) => void;
  onArchiveJob: (job: Job) => void;
  onActivateJob: (job: Job) => void;
  /** Opens the shared assignment modal on this position. */
  onAssignJob: (job: Job) => void;
  onDeleteJob: (job: Job) => void;
  /** A family to reveal after creation — the list scrolls to it and opens it. */
  focusFamilyId?: string | null;
  onFocusFamilyHandled?: () => void;
};

// The name carries the most text, so it gets twice the share; everything after it is even.
const GRID =
  "grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_48px] items-center gap-4";

export const JobFamilyComponent: FC<JobFamilyComponentProps> = ({
  jobFamilies,
  isLoading = false,
  onCreateFamily,
  onEditFamily,
  onDuplicateFamily,
  onArchiveFamily,
  onActivateFamily,
  onDeleteFamily,
  onCreateJob,
  onEditJob,
  onDuplicateJob,
  onArchiveJob,
  onActivateJob,
  onAssignJob,
  onDeleteJob,
  focusFamilyId,
  onFocusFamilyHandled,
}) => {
  // Stable identity: the fallback [] would otherwise be a new array on every render.
  const all = useMemo(() => jobFamilies ?? [], [jobFamilies]);

  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [openIds, setOpenIds] = useState<string[]>(() => all.map((f) => f.id));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // A new family is sorted in by name, so it can land anywhere — including below the fold. Open it,
  // put it in edit mode (adding positions is what you want next) and scroll it into view.
  useEffect(() => {
    if (!focusFamilyId) return;
    if (!all.some((f) => f.id === focusFamilyId)) return;

    setOpenIds((current) =>
      current.includes(focusFamilyId) ? current : [...current, focusFamilyId],
    );
    setEditingId(focusFamilyId);

    document
      .querySelector(`[data-family-id="${focusFamilyId}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });

    onFocusFamilyHandled?.();
  }, [focusFamilyId, all, onFocusFamilyHandled]);

  const needle = query.trim().toLowerCase();

  const archivedCount = useMemo(() => all.filter((f) => f.archived).length, [all]);

  const families = useMemo(() => {
    // A switch between two views, not a widening of one. Rule:
    // `technical_documentation/ui/ACTIONS_AND_MENUS.md` § 5.
    const inView = all.filter((f) => (showArchived ? f.archived : !f.archived));

    if (!needle) return inView;

    return inView
      .map((family) => {
        const familyMatches = family.name.toLowerCase().includes(needle);
        const jobs = familyMatches
          ? family.jobs
          : family.jobs.filter(
              (job) =>
                job.name.toLowerCase().includes(needle) ||
                (job.code ?? "").toLowerCase().includes(needle) ||
                (job.level?.name ?? "").toLowerCase().includes(needle),
            );

        return { ...family, jobs };
      })
      .filter((family) => family.name.toLowerCase().includes(needle) || family.jobs.length > 0);
  }, [all, needle, showArchived]);

  const allOpen = families.length > 0 && openIds.length >= families.length;
  const toggleAll = () => setOpenIds(allOpen ? [] : families.map((f) => f.id));

  const handleExport = async ({ format }: ExportDataFormValues) => {
    setExportError(null);
    try {
      await triggerExportDownload("/api/job-family/export", format);
      setIsExportOpen(false);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Export failed.");
    }
  };

  return (
    // Fixed top region (search + column header) stays put; only the list below scrolls.
    <div className="flex flex-col gap-4">
      <ListToolbar
        search={{ value: query, onChange: setQuery }}
        archived={{ count: archivedCount, showing: showArchived, onChange: setShowArchived }}
        secondary={
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5 text-brown-600"
              onClick={toggleAll}
              disabled={families.length === 0}
            >
              {allOpen ? <ChevronsDownUp className="h-4 w-4"/> : <ChevronsUpDown className="h-4 w-4"/>}
              {allOpen ? "Collapse All" : "Expand All"}
            </Button>

          <Button
            size="icon"
            variant="outline"
            className="h-9 w-9"
            onClick={() => {
              setExportError(null);
              setIsExportOpen(true);
            }}
            aria-label="Export job catalog"
          >
            <Download className="h-4 w-4"/>
          </Button>
          </>
        }
        primary={
          <PermissionGate resource="JOBS.FAMILY" action="EDIT">
            <Button className="gap-1.5" onClick={onCreateFamily}>
              <Plus className="h-4 w-4"/>
              Add Job Family
            </Button>
          </PermissionGate>
        }
      />

      <div className="-mx-1 max-h-[calc(100svh-380px)] overflow-y-auto px-1">
        <div className={`${GRID} sticky top-0 z-10 bg-white px-3 pb-2 pt-1 text-sm font-medium text-foreground`}>
          <div>Name</div>
          <div>Assigned People</div>
          <div>Code</div>
          <div>Status</div>
          <div>Level</div>
          <div/>
        </div>

        {isLoading && <JobFamilySkeleton/>}

        <div className="space-y-4 pt-2">
          {!isLoading && families.length === 0 && (
            <ListEmptyState
              query={query}
              archivedView={showArchived}
              icon={<Briefcase className="h-7 w-7"/>}
              title="No job families yet"
              description="A job family groups related positions. Add the first one to start building the catalog."
              noResultsHint="Try a different family, position or code."
              archivedDescription="Archived job families will appear here."
              onCreate={onCreateFamily}
              createLabel="Add Job Family"
              createAccess={{ resource: "JOBS.FAMILY" }}
            />
          )}

          {!isLoading && families.length > 0 && (
            <Accordion
              type="multiple"
              value={openIds}
              onValueChange={setOpenIds}
              className="w-full space-y-4"
            >
              {families.map((family) => (
                <FamilySection
                  key={family.id}
                  family={family}
                  editing={editingId === family.id}
                  onToggleEditing={() =>
                    setEditingId((current) => (current === family.id ? null : family.id))
                  }
                  onEditFamily={onEditFamily}
                  onDuplicateFamily={onDuplicateFamily}
                  onArchiveFamily={onArchiveFamily}
                  onActivateFamily={onActivateFamily}
                  onDeleteFamily={onDeleteFamily}
                  onCreateJob={onCreateJob}
                  onEditJob={onEditJob}
                  onDuplicateJob={onDuplicateJob}
                  onArchiveJob={onArchiveJob}
                  onActivateJob={onActivateJob}
                  onAssignJob={onAssignJob}
                  onDeleteJob={onDeleteJob}
                />
              ))}
            </Accordion>
          )}
        </div>
      </div>

      <ExportDataModal
        isOpen={isExportOpen}
        title="Export job catalog"
        description="Export every job family with its positions."
        includedText="Includes family, name, code, level, status, assigned people and description."
        errorMessage={exportError}
        onCancelAction={() => setIsExportOpen(false)}
        onConfirmAction={handleExport}
      />
    </div>
  );
};

// --- Family section --------------------------------------------------------

type FamilySectionProps = {
  family: JobFamily;
  editing: boolean;
  onToggleEditing: () => void;
} & Pick<
  JobFamilyComponentProps,
  | "onEditFamily"
  | "onDuplicateFamily"
  | "onArchiveFamily"
  | "onActivateFamily"
  | "onDeleteFamily"
  | "onCreateJob"
  | "onEditJob"
  | "onDuplicateJob"
  | "onArchiveJob"
  | "onActivateJob"
  | "onAssignJob"
  | "onDeleteJob"
>;

const FamilySection: FC<FamilySectionProps> = ({
  family,
  editing,
  onToggleEditing,
  onEditFamily,
  onDuplicateFamily,
  onArchiveFamily,
  onActivateFamily,
  onDeleteFamily,
  onCreateJob,
  onEditJob,
  onDuplicateJob,
  onArchiveJob,
  onActivateJob,
  onAssignJob,
  onDeleteJob,
}) => (
  <AccordionItem value={family.id} data-family-id={family.id} className="border-b-0">
    <div className="relative">
      <AccordionTrigger
        className={`rounded-md bg-brown-50 px-3 py-2.5 pr-9 text-sm font-semibold uppercase tracking-wide text-brown-700 hover:no-underline ${
          ""
        }`}
      >
        <span className="flex items-center gap-2">
          {family.name}
          <span className="normal-case tracking-normal text-brown-400">({family.jobs.length})</span>
          {family.archived && (
            <Badge variant="secondary" className="font-normal normal-case tracking-normal">
              Archived
            </Badge>
          )}
        </span>
      </AccordionTrigger>

      {/* Family actions live outside the trigger (a button can't nest a button). */}
      <PermissionGate
        anyOf={[
          { resource: "JOBS.FAMILY", action: "EDIT" },
          { resource: "JOBS.FAMILY", action: "MANAGE" },
        ]}
      >
        <div className="absolute right-[54px] top-1/2 flex -translate-y-1/2 items-center">
          {editing ? (
            <>
              <RowActionsMenu label="Family Actions" stopPropagation>
                <PermissionGate resource="JOBS.FAMILY" action="EDIT">
                  <RowAction icon={<Pencil className="h-4 w-4"/>} onClick={() => onEditFamily(family)}>
                    Edit
                  </RowAction>
                  <RowAction icon={<Copy className="h-4 w-4"/>} onClick={() => onDuplicateFamily(family)}>
                    Duplicate
                  </RowAction>
                  {family.archived ? (
                    <RowAction
                      icon={<ArchiveRestore className="h-4 w-4"/>}
                      onClick={() => onActivateFamily(family)}
                    >
                      Unarchive
                    </RowAction>
                  ) : (
                    <RowAction
                      icon={<Archive className="h-4 w-4"/>}
                      onClick={() => onArchiveFamily(family)}
                    >
                      Archive
                    </RowAction>
                  )}
                </PermissionGate>

                <PermissionGate resource="JOBS.FAMILY" action="MANAGE">
                  <RowActionDestructive
                    icon={<Trash2 className="h-4 w-4"/>}
                    onClick={() => onDeleteFamily(family)}
                  >
                    Delete
                  </RowActionDestructive>
                </PermissionGate>
              </RowActionsMenu>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-brown-600 hover:bg-brown-100"
                aria-label="Done editing family"
                title="Done"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleEditing();
                }}
              >
                <Check className="h-4 w-4"/>
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-brown-600 hover:bg-brown-100"
              aria-label="Edit family"
              title="Edit family"
              onClick={(e) => {
                e.stopPropagation();
                onToggleEditing();
              }}
            >
              <Pencil className="h-4 w-4"/>
            </Button>
          )}
        </div>
      </PermissionGate>
    </div>

    <AccordionContent>
      <div className="pb-2">
        {family.jobs.length === 0 && !editing && (
          <div className="mt-2 flex w-full items-center justify-center rounded-md border border-dashed border-brown-300 bg-brown-50/60 px-3 py-2 text-sm text-brown-600">
            No positions in this family yet
          </div>
        )}

        {family.jobs.map((job, index) => (
          <JobRow
            key={job.id}
            job={job}
            notLast={index < family.jobs.length - 1}
            editing={editing}
            onEditJob={onEditJob}
            onDuplicateJob={onDuplicateJob}
            onAssignJob={onAssignJob}
            onArchiveJob={onArchiveJob}
            onActivateJob={onActivateJob}
            onDeleteJob={onDeleteJob}
          />
        ))}

        {/* Add-job affordance (edit mode only) as a dashed trailing row. */}
        {editing && (
          <PermissionGate resource="JOBS.TITLE" action="EDIT">
            <button
              type="button"
              className="mt-2 flex w-full items-center gap-1.5 rounded-md border border-dashed border-brown-300 px-3 py-2 text-sm text-brown-600 hover:bg-brown-50"
              onClick={() => onCreateJob(family)}
            >
              <Plus className="h-4 w-4"/>
              Add Job
            </button>
          </PermissionGate>
        )}
      </div>
    </AccordionContent>
  </AccordionItem>
);

// --- Job row ---------------------------------------------------------------

type JobRowProps = {
  job: Job;
  notLast: boolean;
  editing: boolean;
} & Pick<
  JobFamilyComponentProps,
  "onEditJob" | "onDuplicateJob" | "onArchiveJob" | "onActivateJob" | "onAssignJob" | "onDeleteJob"
>;

const JobRow: FC<JobRowProps> = ({
  job,
  notLast,
  editing,
  onEditJob,
  onDuplicateJob,
  onArchiveJob,
  onActivateJob,
  onAssignJob,
  onDeleteJob,
}) => (
  <div className={notLast ? "border-b border-brown-100" : ""}>
    {/* Archived positions stay in the list, dimmed — hiding them would make the catalogue lie
        about what used to exist. */}
    {/* Not dimmed: the chip says it, and fading a whole row makes its text harder to read for a
        reason that is already on screen. Rule: ui/STATUS_AND_BADGES.md § 2. */}
    <div className={`${GRID} min-h-11 px-3 py-1.5`}>
      <div className="min-w-0">
        <span className="truncate text-sm font-medium text-foreground" title={job.description ?? undefined}>
          {job.name}
        </span>
      </div>

      <div className="text-sm text-muted-foreground">{job.assignedUsersCount}</div>

      <div className="truncate text-sm text-muted-foreground">{job.code}</div>

      <div>
        {job.archived ? (
          <Badge variant="secondary" className="font-normal">
            Archived
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">Active</span>
        )}
      </div>

      <div className="truncate text-sm text-muted-foreground">{job.level?.name}</div>

      <div className="flex items-center justify-end">
        {editing && (
          <PermissionGate
            anyOf={[
              { resource: "JOBS.TITLE", action: "EDIT" },
              { resource: "JOBS.TITLE", action: "MANAGE" },
            ]}
          >
            <RowActionsMenu label="Position Actions">
              <PermissionGate resource="JOBS.TITLE" action="EDIT">
                <RowAction icon={<Pencil className="h-4 w-4"/>} onClick={() => onEditJob(job)}>
                  Edit
                </RowAction>
                <RowAction icon={<Copy className="h-4 w-4"/>} onClick={() => onDuplicateJob(job)}>
                  Duplicate
                </RowAction>

                {/*
                  The engine has had a job adapter and a full set of endpoints \u2014 preview, apply,
                  segment apply with async status \u2014 since it was built, and the catalog offered no
                  way in. The modal is the same one Departments, Teams, Roles and Policies use, so
                  this is one menu item rather than a feature.

                  Not offered on an archived position: the adapter refuses those, and offering an
                  action that is certain to be skipped is the defect this wave exists to remove.
                */}
                {!job.archived && (
                  <RowAction icon={<Users className="h-4 w-4"/>} onClick={() => onAssignJob(job)}>
                    Assign People
                  </RowAction>
                )}

                {job.archived ? (
                  <RowAction
                    icon={<ArchiveRestore className="h-4 w-4"/>}
                    onClick={() => onActivateJob(job)}
                  >
                    Unarchive
                  </RowAction>
                ) : (
                  <RowAction icon={<Archive className="h-4 w-4"/>} onClick={() => onArchiveJob(job)}>
                    Archive
                  </RowAction>
                )}
              </PermissionGate>

              <PermissionGate resource="JOBS.TITLE" action="MANAGE">
                <RowActionDestructive
                  icon={<Trash2 className="h-4 w-4"/>}
                  onClick={() => onDeleteJob(job)}
                >
                  Delete
                </RowActionDestructive>
              </PermissionGate>
            </RowActionsMenu>
          </PermissionGate>
        )}
      </div>
    </div>
  </div>
);
