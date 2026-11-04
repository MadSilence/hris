"use client";

import { FC } from "react";
import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { DatePicker } from "@/components/ui/DatePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/desact/select";
import { PublicHolidayDayPart } from "@/api/modules/publicHolidays/holidays/dto";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/desact/table";
import { FieldError } from "@/components/desact/field-error";

export type DraftHoliday = {
  localId: string;
  id?: string;
  name: string;
  holidayDate: string;
  /** Inclusive end of the span. Empty → single-day (treated as == holidayDate). */
  endDate: string;
  /**
   * A half day is always "work the morning, leave at lunch", so no direction is stored. How it is
   * deducted from a leave balance is still open — PUBLIC_HOLIDAYS_DESIGN.md §8 T2.
   */
  dayPart?: PublicHolidayDayPart;
  /** Set for a day that came from a provider; carried so a save does not orphan it from its source. */
  sourceEventId?: string | null;
};

export type DraftHolidayErrors = Record<
  string,
  { name?: string; holidayDate?: string; endDate?: string }
>;

type Props = {
  holidays: DraftHoliday[];
  onChange: (holidays: DraftHoliday[]) => void;
  errors?: DraftHolidayErrors;
  disabled?: boolean;
};

/**
 * Rows read as a table, not as a wall of boxes: every field hides its border until you point at it
 * (or focus it — you still have to see where you are typing). Invalid fields keep their border, or
 * the error message below would have nothing to point at.
 */
const QUIET_FIELD =
  "border-transparent bg-transparent hover:border-field focus-visible:border-accent " +
  // The date field hands focus to its popover, so the border needs the open state to hold on to.
  "data-[state=open]:border-strong aria-invalid:border-danger data-[invalid]:border-danger";

export const PublicHolidayDaysEditor: FC<Props> = ({
  holidays,
  onChange,
  errors = {},
  disabled = false,
}) => {
  const handleAdd = () => {
    onChange([
      ...holidays,
      {
        localId: crypto.randomUUID(),
        name: "",
        holidayDate: "",
        endDate: "",
        dayPart: PublicHolidayDayPart.FullDay,
      },
    ]);
  };

  const handleChange = (
    localId: string,
    field: "name" | "holidayDate" | "endDate" | "dayPart",
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
        <table className="w-full caption-bottom table-fixed text-body">
          {/* The caller owns the scroll container, so the header can stick to its top. */}
          <TableHeader className="[&_tr]:border-divider sticky top-0 z-10 bg-card">
            <TableRow>
              <TableHead className="w-44">Date</TableHead>
              <TableHead className="w-44">End date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="w-32">Length</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {holidays.map((holiday) => {
              const rowErrors = errors[holiday.localId];

              return (
                <TableRow key={holiday.localId} className="border-divider align-top">
                  <TableCell className="py-1.5 pr-2">
                    <DatePicker
                      value={holiday.holidayDate}
                      onChange={(next) => handleChange(holiday.localId, "holidayDate", next)}
                      disabled={disabled}
                      clearable={false}
                      placeholder="Pick a date"
                      ariaLabel="Date"
                      invalid={!!rowErrors?.holidayDate}
                      className={QUIET_FIELD}
                    />
                    <FieldError>{rowErrors?.holidayDate}</FieldError>
                  </TableCell>

                  <TableCell className="py-1.5 pr-2">
                    <DatePicker
                      value={holiday.endDate}
                      min={holiday.holidayDate || undefined}
                      onChange={(next) => handleChange(holiday.localId, "endDate", next)}
                      disabled={disabled}
                      ariaLabel="End date"
                      invalid={!!rowErrors?.endDate}
                      className={QUIET_FIELD}
                    />
                    <FieldError>{rowErrors?.endDate}</FieldError>
                  </TableCell>

                  <TableCell className="py-1.5 pr-2">
                    <Input
                      value={holiday.name}
                      onChange={(e) =>
                        handleChange(holiday.localId, "name", e.currentTarget.value)
                      }
                      disabled={disabled}
                      aria-label="Holiday name"
                      aria-invalid={!!rowErrors?.name}
                      className={QUIET_FIELD}
                    />
                    <FieldError>{rowErrors?.name}</FieldError>
                  </TableCell>

                  <TableCell className="py-1.5 pr-2">
                    <Select
                      value={holiday.dayPart ?? PublicHolidayDayPart.FullDay}
                      onValueChange={(next) => handleChange(holiday.localId, "dayPart", next)}
                      disabled={disabled}
                    >
                      <SelectTrigger aria-label="Length" className={QUIET_FIELD}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PublicHolidayDayPart.FullDay}>Full day</SelectItem>
                        <SelectItem value={PublicHolidayDayPart.HalfDay}>Half day</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell className="py-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={disabled}
                      onClick={() => handleRemove(holiday.localId)}
                      aria-label="Remove holiday"
                      className="text-tertiary hover:text-danger-text"
                    >
                      <Icon icon={Delete02Icon} size="sm" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </table>
      )}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={disabled}
        onClick={handleAdd}
        className="mt-2"
      >
        <Icon icon={Add01Icon} size="sm" />
        Add holiday day
      </Button>
    </div>
  );
};
