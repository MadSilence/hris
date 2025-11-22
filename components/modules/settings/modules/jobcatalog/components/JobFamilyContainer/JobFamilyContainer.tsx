"use client";

import styles from "./JobFamilyContainer.module.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Kebab from "@/components/ui/Kebab/Kebab";
import { Button } from "@/components/ui/Button";
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
// import { useJobFamily } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useJobFamily";
import { useDeleteJobFamilyAction } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useDeleteJobFamilyActon";
import { useRenameJobFamilyAction } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useRenameJobFamilyAction";
import type { JobFamily } from "@/models/job";

// @ts-ignore
export default function JobFamilyContainer() {
  const [isCreateJobFamilyModalOpen, setIsCreateJobFamilyModalOpen] =
    useState(false);
  const [isDeleteJobFamilyModalOpen, setIsDeleteJobFamilyModalOpen] =
    useState(false);
  const [isRenameJobFamilyModalOpen, setIsRenameJobFamilyModalOpen] =
    useState(false);
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuWrapRef = useRef<HTMLDivElement>(null);

  const createJobFamilyAction = useCreateJobFamilyAction();
  // const createJobAction = useCreateJobAction();
  const deleteJobFamilyAction = useDeleteJobFamilyAction();
  const renameJobFamilyAction = useRenameJobFamilyAction();

  const [jobFamilies, setJobFamilies] = useState<JobFamily[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");

  // 🔧 ВРЕМЕННЫЕ ФЕЙКОВЫЕ ДАННЫЕ ВМЕСТО API
  useEffect(() => {
    const fakeJobFamilies: JobFamily[] = [
      {
        id: "engineering",
        name: "Engineering",
        isSystem: true,
        jobs: [],
      },
      {
        id: "product",
        name: "Product Management",
        isSystem: false,
        jobs: [],
      },
      {
        id: "hr",
        name: "Human Resources",
        isSystem: false,
        jobs: [],
      },
    ];

    setJobFamilies(fakeJobFamilies);
    setSelectedId((prev) =>
      prev && fakeJobFamilies.some((f) => f.id === prev)
        ? prev
        : fakeJobFamilies[0]?.id ?? ""
    );
  }, []);

  // 🚫 Больше не дергаем useJobFamily, пока смотрим только UI
  // const {
  //   data: fetchedJobFamilies,
  //   isLoading: loading,
  //   error,
  // } = useJobFamily();

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

  const selected = useMemo(
    () => jobFamilies.find((f) => f.id === selectedId) ?? jobFamilies[0],
    [jobFamilies, selectedId]
  );

  useEffect(() => {
    const status = createJobFamilyAction.data?.status;
    if (status === ActionStatus.SUCCESS || status === ActionStatus.ERROR) {
      setIsCreateJobFamilyModalOpen(false);
    }
  }, [createJobFamilyAction.data?.status]);

  // useEffect(() => {
  //   const status = createJobAction.data?.status;
  //   if (status === ActionStatus.SUCCESS || status === ActionStatus.ERROR) {
  //     setIsCreateJobModalOpen(false);
  //   }
  // }, [createJobAction.data?.status]);

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
          jobFamilies={jobFamilies}
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
              className={styles.addButton}
              onClick={() => setIsCreateJobModalOpen(true)}
            >
              Add Job
            </Button>
            <Button
              className={styles.kebabButton}
              onClick={() => setMenuOpen((v) => !v)}
              variant="ghost"
            >
              <Kebab
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="JobFamily actions"
              />
            </Button>

            {menuOpen && (
              <div
                className={styles.menu}
                role="menu"
                aria-label="JobFamily actions"
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

        {/* Временно вместо JobsContainer */}
        <p>Here will be jobs container</p>
      </main>

      <CreateJobFamilyModal
        isOpen={isCreateJobFamilyModalOpen}
        isLoading={createJobFamilyAction.isPending}
        onConfirm={(formValues) => {
          // пока экшен оставляем как есть, но можно дополнительно мутировать локальный стейт,
          // если захочешь видеть изменения сразу
          createJobFamilyAction.mutate({ name: formValues.name });
        }}
        onRequestClose={() => setIsCreateJobFamilyModalOpen(false)}
      />

      <DeleteJobFamilyModal
        isOpen={isDeleteJobFamilyModalOpen}
        isLoading={deleteJobFamilyAction.isPending}
        onConfirm={() => {
          // экшен не трогаем
          deleteJobFamilyAction.mutate({ id: selected.id });
        }}
        onRequestClose={() => setIsDeleteJobFamilyModalOpen(false)}
        jobFamily={selected}
      />

      <RenameJobFamilyModal
        isOpen={isRenameJobFamilyModalOpen}
        isLoading={renameJobFamilyAction.isPending}
        onConfirm={(formValues) => {
          // экшен не трогаем
          renameJobFamilyAction.mutate({
            id: selected.id,
            name: formValues.name,
          });
        }}
        onRequestClose={() => setIsRenameJobFamilyModalOpen(false)}
      />
    </div>
  );
}
