"use client";

import { FC, useEffect, useState } from "react";
import { Ellipsis } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/public/desact/src/components/ui/dropdown-menu";
import {
  CreateJobFamilyModal
} from "@/components/modules/settings/modules/jobcatalog/components/JobFamilyContainer/components/CreateJobFamilyModal";
import {
  DeleteJobFamilyModal
} from "@/components/modules/settings/modules/jobcatalog/components/JobFamilyContainer/components/DeleteJobFamilyModal";
import {
  RenameJobFamilyModal
} from "@/components/modules/settings/modules/jobcatalog/components/JobFamilyContainer/components/RenameJobFamilyModal";
import { ActionStatus } from "@/components/models/ActionStatus";
import { JobFamilyList } from "@/components/modules/settings/modules/jobcatalog/components/JobFamilyList";
import {
  useCreateJobFamilyAction
} from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useCreateJobFamilyAction/useCreateJobFamilyAction";
import { useDeleteJobFamilyAction } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useDeleteJobFamilyActon";
import { useRenameJobFamilyAction } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useRenameJobFamilyAction";
import { JobFamily } from "@/models/job";

type JobFamilyProps = {
  jobFamilies: JobFamily[] | null | undefined;
};

export const JobFamilyComponent: FC<JobFamilyProps> = ({ jobFamilies }) => {
  const list = jobFamilies ?? [];

  const [selectedId, setSelectedId] = useState("");
  const [isCreateJobFamilyModalOpen, setIsCreateJobFamilyModalOpen] = useState(false);
  const [isDeleteJobFamilyModalOpen, setIsDeleteJobFamilyModalOpen] = useState(false);
  const [isRenameJobFamilyModalOpen, setIsRenameJobFamilyModalOpen] = useState(false);
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);

  const createJobFamilyAction = useCreateJobFamilyAction();
  const deleteJobFamilyAction = useDeleteJobFamilyAction();
  const renameJobFamilyAction = useRenameJobFamilyAction();

  useEffect(() => {
    if (!list.length) {
      setSelectedId("");
      return;
    }

    const exists = list.some((item) => item.id === selectedId);
    if (!exists) {
      setSelectedId(list[0].id);
    }
  }, [list, selectedId]);

  const selected =
    list.length > 0
      ? list.find((item) => item.id === selectedId) ?? list[0]
      : null;

  useEffect(() => {
    const status = createJobFamilyAction.data?.status;
    if (status === ActionStatus.SUCCESS || status === ActionStatus.ERROR) {
      setIsCreateJobFamilyModalOpen(false);
    }
  }, [createJobFamilyAction.data?.status]);

  useEffect(() => {
    const status = deleteJobFamilyAction.data?.status;
    if (status === ActionStatus.SUCCESS || status === ActionStatus.ERROR) {
      setIsDeleteJobFamilyModalOpen(false);
    }
  }, [deleteJobFamilyAction.data?.status]);

  useEffect(() => {
    const status = renameJobFamilyAction.data?.status;
    if (status === ActionStatus.SUCCESS || status === ActionStatus.ERROR) {
      setIsRenameJobFamilyModalOpen(false);
    }
  }, [renameJobFamilyAction.data?.status]);

  return (
    <div className="grid min-h-svh grid-cols-[280px_minmax(0,1fr)] gap-6 bg-[var(--color-bg-primary)] p-4">
      <aside className="min-h-0 overflow-auto">
        <JobFamilyList
          jobFamilies={list}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onCreate={() => setIsCreateJobFamilyModalOpen(true)}
        />
      </aside>

      <main className="min-h-0 overflow-auto p-3">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <h1 className="truncate text-2xl font-semibold text-[var(--color-text-primary)]">
              {selected?.name ?? "Jobs"}
            </h1>

            {selected?.isSystem ? (
              <span className="whitespace-nowrap rounded-full bg-brown-50 px-2 py-1 text-sm text-[var(--color-text-tertiary)]">
                Preset Job Family
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsCreateJobModalOpen(true)}
              disabled={!selected}
            >
              Add Job
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={!selected}
                  aria-label="Job family actions"
                >
                  <Ellipsis className="h-4 w-4"/>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsRenameJobFamilyModalOpen(true)}>
                  Rename Job Family
                </DropdownMenuItem>

                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setIsDeleteJobFamilyModalOpen(true)}
                >
                  Delete Job Family
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <p className="text-sm text-[var(--color-text-tertiary)]">
          Here will be jobs container
        </p>
      </main>

      <CreateJobFamilyModal
        isOpen={isCreateJobFamilyModalOpen}
        isLoading={createJobFamilyAction.isPending}
        onConfirmAction={(formValues) => {
          createJobFamilyAction.mutate({ name: formValues.name });
        }}
        onRequestCloseAction={() => setIsCreateJobFamilyModalOpen(false)}
      />

      <DeleteJobFamilyModal
        isOpen={isDeleteJobFamilyModalOpen}
        isLoading={deleteJobFamilyAction.isPending}
        onConfirmAction={() => {
          if (!selected) return;
          deleteJobFamilyAction.mutate({ id: selected.id });
        }}
        onRequestCloseAction={() => setIsDeleteJobFamilyModalOpen(false)}
        jobFamily={selected}
      />

      <RenameJobFamilyModal
        isOpen={isRenameJobFamilyModalOpen}
        isLoading={renameJobFamilyAction.isPending}
        onConfirmAction={(formValues) => {
          if (!selected) return;
          renameJobFamilyAction.mutate({
            id: selected.id,
            name: formValues.name,
          });
        }}
        onRequestCloseAction={() => setIsRenameJobFamilyModalOpen(false)}
      />
    </div>
  );
};
