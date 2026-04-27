"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./JobFamily.module.css";
import Kebab from "@/components/ui/Kebab/Kebab";
import { Button } from "@/public/desact/src/components/ui/button";
import {
  CreateJobFamilyModal,
} from "@/components/modules/settings/modules/jobcatalog/components/JobFamilyContainer/components/CreateJobFamilyModal";
import {
  DeleteJobFamilyModal,
} from "@/components/modules/settings/modules/jobcatalog/components/JobFamilyContainer/components/DeleteJobFamilyModal";
import {
  RenameJobFamilyModal,
} from "@/components/modules/settings/modules/jobcatalog/components/JobFamilyContainer/components/RenameJobFamilyModal";
import { ActionStatus } from "@/components/models/ActionStatus";
import { JobFamilyList } from "@/components/modules/settings/modules/jobcatalog/components/JobFamilyList";
import {
  useCreateJobFamilyAction,
} from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useCreateJobFamilyAction/useCreateJobFamilyAction";
import { useDeleteJobFamilyAction } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useDeleteJobFamilyActon";
import { useRenameJobFamilyAction } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useRenameJobFamilyAction";
import { JobFamily } from "@/models/job";

type JobFamilyProps = {
  jobFamilies: JobFamily[] | null | undefined;
};

export const JobFamilyComponent: React.FC<JobFamilyProps> = ({ jobFamilies }) => {
  const list = jobFamilies ?? [];

  const [selectedId, setSelectedId] = useState<string>("");
  const [isCreateJobFamilyModalOpen, setIsCreateJobFamilyModalOpen] = useState(false);
  const [isDeleteJobFamilyModalOpen, setIsDeleteJobFamilyModalOpen] = useState(false);
  const [isRenameJobFamilyModalOpen, setIsRenameJobFamilyModalOpen] = useState(false);
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuWrapRef = useRef<HTMLDivElement>(null);

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
    if (!menuOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (menuWrapRef.current && !menuWrapRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        e.preventDefault();
        (document.activeElement as HTMLElement)?.blur();
      }
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

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
    <div className={styles.layout}>
      <aside className={styles.colf}>
        <JobFamilyList
          jobFamilies={list}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onCreate={() => setIsCreateJobFamilyModalOpen(true)}
        />
      </aside>

      <main className={styles.cols}>
        <div className={styles.header}>
          <div className={styles.headerPreset}>
            <h1 className={styles.h1}>{selected?.name ?? "Jobs"}</h1>
            {selected?.isSystem && (
              <span className={styles.presetPill}>Preset Job Family</span>
            )}
          </div>

          <div className={styles.menuWrap} ref={menuWrapRef}>
            <Button
              onClick={() => setIsCreateJobModalOpen(true)}
              disabled={!selected}
            >
              Add Job
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen((v) => !v)}
              disabled={!selected}
            >
              <Kebab
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="JobFamilyComponent actions"
              />
            </Button>

            {menuOpen && selected && (
              <div
                className={styles.menu}
                role="menu"
                aria-label="JobFamilyComponent actions"
              >
                <button
                  type="button"
                  className={styles.menuItem}
                  role="menuitem"
                  onClick={() => {
                    setIsRenameJobFamilyModalOpen(true);
                    setMenuOpen(false);
                  }}
                >
                  Rename Job Family
                </button>

                <button
                  type="button"
                  className={`${styles.menuItem} ${styles.danger}`}
                  role="menuitem"
                  onClick={() => {
                    setIsDeleteJobFamilyModalOpen(true);
                    setMenuOpen(false);
                  }}
                >
                  Delete Job Family
                </button>
              </div>
            )}
          </div>
        </div>

        <p>Here will be jobs container</p>
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
