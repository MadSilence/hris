import { useTranslations } from "next-intl";
import { formatDayAmount } from "@/models/timeOff/formatDayAmount";
import { TimeOffPolicyCountingMode, TimeOffPolicyUnit } from "@/api/modules/timeOff/timeOffPolicies/dto";
import type { TimeOffPolicy } from "@/models/timeOff";

/** The unit a policy's length is said in: hours, working days, or days (the `leave` catalogue's `unit` select). */
export type LeaveUnit = "hours" | "working" | "days";

export const unitOf = (
  policy: Pick<TimeOffPolicy, "unit" | "countingMode"> | null | undefined,
  /** The server's word for this one request, when it has one (the duration preview, the decision context). */
  workingDays?: boolean,
): LeaveUnit => {
  if (policy?.unit === TimeOffPolicyUnit.Hours) return "hours";
  if (workingDays ?? policy?.countingMode === TimeOffPolicyCountingMode.WorkingDays) return "working";
  return "days";
};

/**
 * The unit of one request's length: the request's own counting method when it carries one (B5 — "5 working days" or
 * "5 days"), else the policy's.
 */
export const requestUnitOf = (
  policy: Pick<TimeOffPolicy, "unit" | "countingMode"> | null | undefined,
  countingMode: TimeOffPolicyCountingMode | `${TimeOffPolicyCountingMode}` | null | undefined,
): LeaveUnit => unitOf(policy, countingMode ? countingMode === TimeOffPolicyCountingMode.WorkingDays : undefined);

/** A balance counts hours or days — never "working" days, which is how a request's length is said. */
export const balanceUnit = (unit: LeaveUnit): "hours" | "days" => (unit === "hours" ? "hours" : "days");

type LeaveT = ReturnType<typeof useTranslations<"leave">>;

/** "5 days", "3 working days", "−1 day" — the number as written, the plural chosen on its size. */
export const lengthOf = (t: LeaveT, value: number, unit: LeaveUnit, sign: "" | "−" | "+" = "") =>
  t("amount", { unit, count: Math.abs(value), amount: `${sign}${formatDayAmount(Math.abs(value))}` });

/** A signed change: "+25 days", "−5 days". */
export const signedLengthOf = (t: LeaveT, value: number, unit: LeaveUnit) =>
  lengthOf(t, value, unit, value < 0 ? "−" : "+");
