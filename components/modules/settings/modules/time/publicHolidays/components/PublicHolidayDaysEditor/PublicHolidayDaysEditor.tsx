"use client";

import { FC } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";

export type DraftHoliday = {
  localId: string;
  id?: string;
  name: string;
  holidayDate: string;
};

export type DraftHolidayErrors = Record<
  string,
  { name?: string; holidayDate?: string }
>;

type Props = {
  holidays: DraftHoliday[];
  onChange: (holidays: DraftHoliday[]) => void;
  errors?: DraftHolidayErrors;
  disabled?: boolean;
};

export const PublicHolidayDaysEditor: FC<Props> = ({
  holidays,
  onChange,
  errors = {},
  disabled = false,
}) => {
  const handleAdd = () => {
    onChange([
      ...holidays,
      { localId: crypto.randomUUID(), name: "", holidayDate: "" },
    ]);
  };

  const handleChange = (
    localId: string,
    field: "name" | "holidayDate",
    value: string,
  ) => {
    onChange(
      holidays.map((h) =>
        h.localId === localId ? { ...h, [field]: value } : h,
      ),
    );
  };

  const handleRemove = (localId: string) => {
    onChange(holidays.filter((h) => h.localId !== localId));
  };

  return (
    <div className="space-y-2">
      {holidays.length > 0 && (
        <div className="space-y-2">
          {holidays.map((holiday) => {
            const rowErrors = errors[holiday.localId];
            return (
              <div key={holiday.localId} className="space-y-1">
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={holiday.holidayDate}
                    onChange={(e) =>
                      handleChange(holiday.localId, "holidayDate", e.currentTarget.value)
                    }
                    disabled={disabled}
                    aria-invalid={!!rowErrors?.holidayDate}
                    className="w-44 shrink-0"
                  />
                  <Input
                    value={holiday.name}
                    onChange={(e) =>
                      handleChange(holiday.localId, "name", e.currentTarget.value)
                    }
                    placeholder="Holiday name"
                    disabled={disabled}
                    aria-invalid={!!rowErrors?.name}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={disabled}
                    onClick={() => handleRemove(holiday.localId)}
                    aria-label="Remove holiday"
                    className="shrink-0 text-[var(--color-text-tertiary)] hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {(rowErrors?.holidayDate || rowErrors?.name) && (
                  <div className="flex gap-2 pl-2 text-xs text-destructive">
                    {rowErrors?.holidayDate && (
                      <span>{rowErrors.holidayDate}</span>
                    )}
                    {rowErrors?.name && <span>{rowErrors.name}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={handleAdd}
        className="mt-2"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add holiday day
      </Button>
    </div>
  );
};
