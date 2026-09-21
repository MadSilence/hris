"use client";

import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/public/desact/src/components/ui/dialog";
import { Label } from "@/public/desact/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/public/desact/src/components/ui/select";
import { FormError } from "@/components/feedback/FormError";
import { SearchableSelect, type SearchableOption } from "@/components/ui/SearchableSelect";
import { ExportDataForm, type ExportDataFormValues } from "@/components/modules/settings/shared/ExportDataModal/ExportDataForm";
import { triggerExportDownload } from "@/components/modules/settings/shared/ExportDataModal/triggerExportDownload";
import { UserPickerField, type PickedUser } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import { useDepartmentTree } from "@/components/modules/settings/modules/departments/hooks/useDepartmentTree/useDepartmentTree";
import { useTeamTree } from "@/components/modules/settings/modules/teams/hooks/useTeamTree/useTeamTree";
import { messageForError } from "@/lib/errors/errorMessages";
import type { AttendanceExportTarget } from "@/models/attendance";
import { formatMonthLabel } from "@/components/modules/attendance/timesheet/month";

type TargetType = AttendanceExportTarget["type"];

type Props = {
  isOpen: boolean;
  /** `yyyy-MM` — the month on screen. */
  month: string;
  /** The person on screen, offered first. */
  person: PickedUser;
  /** Whether the caller's scope reaches anybody else; without it only the person on screen is offered. */
  canExportOthers: boolean;
  onCloseAction: () => void;
};

type TreeNode = { id: string; name: string; children?: TreeNode[] };

const flatten = (nodes: TreeNode[], depth = 0): SearchableOption[] =>
  nodes.flatMap((node) => [
    { value: node.id, label: `${"  ".repeat(depth)}${node.name}`, keywords: node.name },
    ...flatten(node.children ?? [], depth + 1),
  ]);

const TeamSelect: React.FC<{ value: string | null; onChange: (id: string | null) => void }> = ({ value, onChange }) => {
  const { data = [], isLoading } = useTeamTree(false);
  const options = useMemo(() => flatten(data as TreeNode[]), [data]);
  return (
    <SearchableSelect id="attendance-export-team" options={options} value={value} onChange={onChange}
                      placeholder={isLoading ? "Loading…" : "Select a team"}/>
  );
};

const DepartmentSelect: React.FC<{ value: string | null; onChange: (id: string | null) => void }> = ({ value, onChange }) => {
  const { data = [], isLoading } = useDepartmentTree(false);
  const options = useMemo(() => flatten(data as TreeNode[]), [data]);
  return (
    <SearchableSelect id="attendance-export-department" options={options} value={value} onChange={onChange}
                      placeholder={isLoading ? "Loading…" : "Select a department"}/>
  );
};

/**
 * Export a month of timesheets for a person, a team, a department or the company.
 *
 * Which rows actually leave is the backend's decision — people the caller may both read and export —
 * so this dialog cannot count them honestly and the button says "Export" and nothing more
 * (EXPORT.md: "the plain verb where it cannot").
 */
export const ExportTimesheetsModal: React.FC<Props> = ({ isOpen, month, person, canExportOthers, onCloseAction }) => {
  const [type, setType] = useState<TargetType>("person");
  const [pickedPerson, setPickedPerson] = useState<PickedUser | null>(person);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const target: AttendanceExportTarget | null =
    type === "person" ? (pickedPerson ? { type, userId: pickedPerson.id } : null)
      : type === "team" ? (teamId ? { type, teamId } : null)
        : type === "department" ? (departmentId ? { type, departmentId } : null)
          : { type: "company" };

  const close = () => {
    if (loading) return;
    setError(null);
    onCloseAction();
  };

  const submit = async (values: ExportDataFormValues) => {
    if (!target) {
      setError("Choose what to export.");
      return;
    }
    const params: Record<string, string> = { month };
    if (target.type === "person") params.userId = target.userId;
    if (target.type === "team") params.teamId = target.teamId;
    if (target.type === "department") params.departmentId = target.departmentId;
    if (target.type === "company") params.company = "true";

    setLoading(true);
    setError(null);
    try {
      await triggerExportDownload("/api/attendance/export", values.format, params);
      onCloseAction();
    } catch (caught) {
      // The card has already been shown by the download helper; the dialog keeps the reason too.
      setError(messageForError(caught));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) close(); }}>
      <DialogContent hideClose className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Export Timesheets</DialogTitle>
          <DialogDescription>
            Hours recorded in {formatMonthLabel(month)}, with a summary per person and every recorded day.
          </DialogDescription>
        </DialogHeader>

        <FormError message={error}/>

        <div className="space-y-4">
          {canExportOthers && (
            <div className="space-y-2">
              <Label htmlFor="attendance-export-type">Export For</Label>
              <Select value={type} onValueChange={(value) => setType(value as TargetType)}>
                <SelectTrigger id="attendance-export-type" className="w-full">
                  <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="person">A Person</SelectItem>
                  <SelectItem value="team">A Team</SelectItem>
                  <SelectItem value="department">A Department</SelectItem>
                  <SelectItem value="company">Everyone I Can See</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {type === "person" && canExportOthers && (
            <div className="space-y-2">
              <Label htmlFor="attendance-export-person">Person</Label>
              <UserPickerField id="attendance-export-person" value={pickedPerson} onChange={setPickedPerson}/>
            </div>
          )}
          {type === "team" && (
            <div className="space-y-2">
              <Label htmlFor="attendance-export-team">Team</Label>
              <TeamSelect value={teamId} onChange={setTeamId}/>
            </div>
          )}
          {type === "department" && (
            <div className="space-y-2">
              <Label htmlFor="attendance-export-department">Department</Label>
              <DepartmentSelect value={departmentId} onChange={setDepartmentId}/>
            </div>
          )}

          <ExportDataForm
            isLoading={loading}
            includedText={
              "Summary sheet: recorded hours, days recorded, working days, leave days, days missing and scheduled hours per person, with each person's status. "
              + "Days sheet: every recorded day with its hours, description and who recorded it. People outside your access are left out."
            }
            onCancelAction={close}
            onSubmitAction={submit}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
