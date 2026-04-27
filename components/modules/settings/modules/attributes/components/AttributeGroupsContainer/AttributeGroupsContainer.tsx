"use client";

import styles from "./AttributeGroupsContainer.module.css";
import { AttributeGroupList } from "@/components/modules/settings/modules/attributes/components/AttributeGroupsList";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CreateGroupModal } from "../AttributeGroup/CreateGroupModal";
import { useCreateAttributeGroupAction } from "../../hooks/AttributeGroup/useCreateAttributeGroupAction";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useAttributeGroups } from "../../hooks/AttributeGroup/useAttributeGroups";
import { useReorderAttributeGroupAction } from "../../hooks/AttributeGroup/useReorderAttributeGroupAction";
import { applyVerticalReorder, sortBySortOrder } from "../../hooks/utils/useReorderAction";
import Kebab from "@/components/ui/Kebab/Kebab";
import { Button } from "@/public/desact/src/components/ui/button";
import { DeleteGroupModal } from "../AttributeGroup/DeleteGroupModal";
import { AttributeGroup } from "@/models/attribute/AttributeGroup";
import { useDeleteAttributeGroupAction } from "../../hooks/AttributeGroup/useDeleteAttributeGroupAction";
import { useRenameAttributeGroupAction } from "../../hooks/AttributeGroup/useRenameAttributeGroupAction";
import { RenameAttributeGroupModal } from "../AttributeGroup/RenameAttributeGroupModal";
import { AttributesContainer } from "@/components/modules/settings/modules/attributes/components/AttributesContainer";
import { CreateAttributeModal } from "@/components/modules/settings/modules/attributes/components/Attribute/CreateAttributeModal";
import { useCreateAttributeAction } from "@/components/modules/settings/modules/attributes/hooks/Attribute/useCreateAttributeAction";
import { Loader } from "@/components/ui/Loader";

export default function AttributeGroupsContainer() {
  const [isCreateAttributeGroupModalOpen, setIsCreateAttributeGroupModalOpen] = useState(false);
  const [isDeleteAttributeGroupModalOpen, setIsDeleteAttributeGroupModalOpen] = useState(false);
  const [isRenameAttributeGroupModalOpen, setIsRenameAttributeGroupModalOpen] = useState(false);
  const [isCreateAttributeModalOpen, setIsCreateAttributeModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuWrapRef = useRef<HTMLDivElement>(null);

  const createAttributeGroupAction = useCreateAttributeGroupAction();
  const createAttributeAction = useCreateAttributeAction();
  const reorderAttributeGroupAction = useReorderAttributeGroupAction();
  const deleteAttributeGroupAction = useDeleteAttributeGroupAction();
  const renameAttributeGroupAction = useRenameAttributeGroupAction();

  const [groups, setGroups] = useState<AttributeGroup[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");

  const { data: fetchedGroups, isLoading: loading } = useAttributeGroups();

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
    if (!fetchedGroups) return;

    const normalized = sortBySortOrder(fetchedGroups);
    setGroups(normalized);

    if (!selectedId || !normalized.some((g) => g.id === selectedId)) {
      setSelectedId(normalized[0]?.id ?? "");
    }
  }, [fetchedGroups]); // eslint-disable-line react-hooks/exhaustive-deps

  const selected = useMemo(
    () => groups.find((g) => g.id === selectedId) ?? groups[0],
    [groups, selectedId]
  );

  useEffect(() => {
    const status = createAttributeGroupAction.data?.status;
    if (status === ActionStatus.SUCCESS || status === ActionStatus.ERROR) {
      setIsCreateAttributeGroupModalOpen(false);
    }
  }, [createAttributeGroupAction.data?.status]);

  useEffect(() => {
    const status = createAttributeAction.data?.status;
    if (status === ActionStatus.SUCCESS || status === ActionStatus.ERROR) {
      setIsCreateAttributeModalOpen(false);
    }
  }, [createAttributeAction.data?.status]);

  useEffect(() => {
    const status = deleteAttributeGroupAction.data?.status;
    if (status === ActionStatus.SUCCESS || status === ActionStatus.ERROR) {
      setIsDeleteAttributeGroupModalOpen(false);
    }
  }, [deleteAttributeGroupAction.data?.status]);

  useEffect(() => {
    const status = renameAttributeGroupAction.data?.status;
    if (status === ActionStatus.SUCCESS || status === ActionStatus.ERROR) {
      setIsRenameAttributeGroupModalOpen(false);
    }
  }, [renameAttributeGroupAction.data?.status]);

  const onGroupsOrderChange = useCallback(
    (orderedIds: string[]) => {
      const { nextItems, changes } = applyVerticalReorder(groups, orderedIds);
      setGroups(nextItems);

      if (changes.length) {
        reorderAttributeGroupAction.mutate(changes);
      }
    },
    [groups, reorderAttributeGroupAction]
  );

  return loading ? (
    <div className={styles.loaderWrapper}>
      <Loader/>
    </div>
  ) : (
    <div className={styles.layout}>
      <aside className={styles.colf}>
        <AttributeGroupList
          groups={groups}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onCreate={() => setIsCreateAttributeGroupModalOpen(true)}
          onOrderChange={onGroupsOrderChange}
        />
      </aside>

      <main className={styles.cols}>
        <div className={styles.header}>
          <div className={styles.headerPreset}>
            <h1 className={styles.h1}>{selected?.name ?? "Attributes"}</h1>
            {selected?.isSystem && <span className={styles.presetPill}>Preset Section</span>}
          </div>

          <div className={styles.menuWrap} ref={menuWrapRef}>
            <Button onClick={() => setIsCreateAttributeModalOpen(true)}>
              Add Attribute
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <Kebab
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="AttributeGroup actions"
              />
            </Button>

            {menuOpen && (
              <div className={styles.menu} role="menu" aria-label="AttributeGroup actions">
                <button
                  type="button"
                  className={styles.menuItem}
                  role="menuitem"
                  onClick={() => {
                    setIsRenameAttributeGroupModalOpen(true);
                    setMenuOpen(false);
                  }}
                >
                  Rename AttributeGroup
                </button>

                <button
                  type="button"
                  className={`${styles.menuItem} ${styles.danger}`}
                  role="menuitem"
                  onClick={() => {
                    setIsDeleteAttributeGroupModalOpen(true);
                    setMenuOpen(false);
                  }}
                >
                  Delete AttributeGroup
                </button>
              </div>
            )}
          </div>
        </div>

        <AttributesContainer
          isLoading={loading}
          attributes={selected?.attributes ?? []}
        />
      </main>

      <CreateGroupModal
        isOpen={isCreateAttributeGroupModalOpen}
        isLoading={createAttributeGroupAction.isPending}
        onConfirmAction={(formValues) => {
          createAttributeGroupAction.mutate({ name: formValues.name });
        }}
        onRequestCloseAction={() => setIsCreateAttributeGroupModalOpen(false)}
      />

      <CreateAttributeModal
        isOpen={isCreateAttributeModalOpen}
        isLoading={false}
        onConfirmAction={(formValues) => {
          createAttributeAction.mutate({
            name: formValues.name,
            groupId: selected.id,
            type: formValues.type,
            isUnique: formValues.unique,
            decScale: formValues.decScale,
            hideYear: formValues.dateHideYearPublic,
            options: formValues.options,
          });
        }}
        onRequestCloseAction={() => setIsCreateAttributeModalOpen(false)}
      />

      <DeleteGroupModal
        isOpen={isDeleteAttributeGroupModalOpen}
        isLoading={deleteAttributeGroupAction.isPending}
        onConfirmAction={() => deleteAttributeGroupAction.mutate({ id: selected.id })}
        onRequestCloseAction={() => setIsDeleteAttributeGroupModalOpen(false)}
        group={selected}
      />

      <RenameAttributeGroupModal
        isOpen={isRenameAttributeGroupModalOpen}
        isLoading={renameAttributeGroupAction.isPending}
        onConfirmAction={(formValues) => {
          renameAttributeGroupAction.mutate({
            id: selected.id,
            name: formValues.name,
          });
        }}
        onRequestCloseAction={() => setIsRenameAttributeGroupModalOpen(false)}
      />
    </div>
  );
}
