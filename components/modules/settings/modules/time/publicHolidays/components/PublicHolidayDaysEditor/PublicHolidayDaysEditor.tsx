"use client";

import { FC } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { DatePicker } from "@/components/ui/DatePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/public/desact/src/components/ui/select";
import { PublicHolidayDayPart } from "@/api/modules/publicHolidays/holidays/dto";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/public/desact/src/components/ui/table";

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

const FieldError: FC<{ message?: string }> = ({ message }) =>
  message ? <p className="mt-1 text-xs text-destructive">{message}</p> : null;

/**
 * Rows read as a table, not as a wall of boxes: every field hides its border until you point at it
 * (or focus it — you still have to see where you are typing). Invalid fields keep their border, or
 * the error message below would have nothing to point at.
 */
const QUIET_FIELD =
  "border-transparent bg-transparent hover:border-brown-300 focus-visible:border-ring " +
  // The date field hands focus to its popover, so the border needs the open state to hold on to.
  "data-[state=open]:border-brown-400 aria-invalid:border-destructive data-[invalid]:border-destructive";

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
        <table className="w-full caption-bottom table-fixed text-sm">
          {/* The caller owns the scroll container, so the header can stick to its top. */}
          <TableHeader className="[&_tr]:border-brown-200 sticky top-0 z-10 bg-white">
            <TableRow>
              <TableHead className="w-44">Date</TableHead>
              <TableHead className="w-44">End Date</TableHead>
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
                <TableRow key={holiday.localId} className="border-brown-100 align-top">
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
                    <FieldError message={rowErrors?.holidayDate} />
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
                    <FieldError message={rowErrors?.endDate} />
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
                    <FieldError message={rowErrors?.name} />
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
                      className="text-[var(--color-text-tertiary)] hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
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
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={handleAdd}
        className="mt-2"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Holiday Day
      </Button>
    </div>
  );
};
