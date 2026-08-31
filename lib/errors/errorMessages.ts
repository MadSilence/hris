import { ApiError } from "@/components/clients/exceptions";

/**
 * What a person reads when something is refused.
 *
 * The key is the backend's error code, not its message: `message` is technical English written for
 * a developer and a log ("Document folder name not changed") and is never rendered. Looking text up
 * by code is also what makes a second language possible later — the dictionary is the only place a
 * user-facing string for an error exists.
 *
 * The dictionary will always lag behind the backend: someone adds a code in Java and forgets the
 * entry here. That is expected, not a fault — see `messageForCode` for what happens then.
 *
 * Adding an error: `DECISIONS.md` -> "Как заводится новая ошибка".
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // Raised on this side only: the request never became an HTTP exchange, so the backend has no
  // code for it. See BACKEND_UNAVAILABLE_CODE in components/clients/exceptions.
  E00503: "We could not reach the server. Check your connection and try again.",

  // CommonBusinessError
  E00405: "That action is not available here.",

  // OfficeBusinessError — added 2026-08-27 when offices stopped answering with the generic
  // validation error (finding S-1 of the first smoke run).
  O00001: "That office could not be found.",
  O00002: "An office needs a name.",
  O00003: "An office with this name already exists.",
  O00004: "Built-in offices cannot be deleted.",
  O00005: "Built-in offices cannot be changed.",
  O00006: "This office is already archived.",
  O00007: "This office is already active.",
  O00008: "An archived office cannot be changed. Restore it first.",

  // AssignmentEngineBusinessError
  ASGN002: "That item could not be found in this company.",
  ASGN003: "Assignment rule not found",
  ASGN004: "Nobody matched the target you chose.",
  ASGN006: "effectiveTo must be on or after effectiveFrom",
  ASGN007: "This kind of target is not supported yet. Pick people, a department, a team, or the whole company.",
  ASGN009: "An assignment for this target is already running. Wait for it to finish.",

  // AttributeBusinessError
  AT00001: "An attribute with this name already exists.",
  AT00002: "Built-in attributes cannot be deleted.",
  AT00003: "That is already the attribute name.",
  AT00004: "This attribute type does not use options.",
  AT00005: "A select attribute needs at least one option.",
  AT00008: "The validation pattern is not a valid regular expression",
  AT00009: "Built-in attributes cannot be changed.",

  // AttributeValueBusinessError

  // AuthBusinessError
  AUTH00001: "That email and password do not match an account.",

  // AvatarBusinessError
  A00001: "Avatar upload request is invalid",
  A00002: "Avatar file is empty",
  A00003: "Avatar file name is missing",
  A00004: "Avatar file is too large",
  A00005: "Avatar file type is not allowed",
  A00006: "The photo could not be uploaded. Please try again.",
  A00007: "The photo could not be deleted. Please try again.",
  A00008: "Avatar not found",
  A00009: "You do not have access to this photo.",

  // BulkEditBusinessError
  BE0005: "Provide either userIds or a segment",

  // CommonBusinessError
  E00000: "Something went wrong on our side. Please try again.",
  E00001: "Something went wrong on our side. Please try again.",
  E00403: "You do not have permission to do this.",
  E00404: "We could not find that. It may have been deleted.",
  E99999: "Something went wrong on our side. Please try again.",

  // CompanyAppearanceBusinessError
  CA00001: "Invalid brand color (expected #rrggbb)",
  CA00002: "Login headline is too long (max 120 characters)",
  CA00003: "Login subheadline is too long (max 240 characters)",
  CA00004: "Invalid login image upload request",
  CA00005: "Login image file is empty",
  CA00006: "Login image file name is missing",
  CA00007: "Login image is too large (max 10 MB)",
  CA00008: "Login image type is not allowed (png, jpeg or webp)",
  CA00009: "Login image not found",
  CA00010: "The image could not be uploaded. Please try again.",
  CA00011: "You do not have access to company appearance settings.",

  // CompanyBusinessError
  C00001: "That company could not be found.",
  C00002: "You need to accept the terms to continue.",
  C00003: "A company with this name already exists.",
  C00004: "Company name is required",

  // CompanyLogoBusinessError
  CL00001: "Company logo upload request is invalid",
  CL00002: "Company logo file is empty",
  CL00003: "Company logo file name is missing",
  CL00004: "Company logo file is too large",
  CL00005: "Company logo file type is not allowed",
  CL00006: "The logo could not be uploaded. Please try again.",
  CL00007: "The logo could not be deleted. Please try again.",
  CL00008: "Company logo not found",
  CL00009: "You do not have access to the company logo.",

  // CompanySettingsBusinessError
  CS00001: "That is not a valid time zone.",
  CS00002: "Pick at least one working day.",
  CS00003: "Invalid working day (expected a day-of-week name)",
  CS00004: "Invalid week start day (expected a day-of-week name)",

  // DepartmentBusinessError
  DEPT001: "Department not found",
  DEPT002: "Department name is required",
  DEPT003: "A department with this name already exists.",
  DEPT004: "Parent department not found",
  DEPT005: "Parent must be a department",
  DEPT006: "That would create a loop in the department tree.",
  DEPT007: "A department cannot be its own parent.",
  DEPT008: "Access denied to department",
  DEPT009: "This department is already archived.",
  DEPT010: "This department is already active.",
  DEPT011: "Maximum department hierarchy depth of 10 exceeded",
  DEPT012: "An archived department cannot be changed. Restore it first.",
  DEPT013: "Move target department not found",
  DEPT014: "People cannot be moved into an archived department.",

  // DocumentBusinessError
  D00001: "Document not found",
  D00002: "This document is already in the trash.",
  D00003: "You do not have access to this document.",
  D00004: "The file could not be uploaded. Please try again.",
  D00005: "The file could not be downloaded. Please try again.",
  D00006: "The file could not be deleted. Please try again.",
  D00007: "That file is empty.",
  D00008: "Uploaded file name is missing",
  D00009: "That file is too large.",
  D00010: "That file type is not allowed.",
  D00011: "Invalid document upload request",
  D00012: "Document is already starred",
  D00013: "Document star not found",
  D00014: "Document folder not found",
  D00015: "Document folder name is missing",
  D00016: "A folder with this name already exists here.",
  D00017: "This folder still has files in it. Empty it first.",
  D00018: "Invalid parent folder",
  D00019: "Invalid target folder for document move",
  D00020: "That is already the folder name.",
  D00021: "You do not have access to this folder.",
  D00022: "Document category not found",
  D00023: "Document category name is missing",
  D00024: "A category with this name already exists.",
  D00025: "You do not have access to this category.",
  D00026: "Built-in categories cannot be deleted.",
  D00027: "This category is still applied to documents. Remove it from them first.",
  D00028: "That is already the category name.",

  // EmployeeTimeOffBalanceBusinessError
  ETOBB00001: "Employee time off balance not found",
  ETOBB00002: "Time off policy assignment not found",
  ETOBB00003: "User not found in this company",
  ETOBB00004: "A balance cannot be created for an assignment that has ended.",
  ETOBB00005: "A balance already exists for this assignment and year.",
  ETOBB00006: "Year must be between 1900 and 2100",
  ETOBB00007: "Balance amounts must be non-negative",
  ETOBB00008: "Adjustment amount must be non-zero",
  ETOBB00009: "Adjustment reason is required",

  // GroupBusinessError
  G00001: "A group with this name already exists.",
  G00002: "This group cannot be deleted.",
  G00003: "That is already the group name.",
  G00004: "Built-in groups cannot be changed.",

  // JobBusinessError
  J00001: "A position with this name and level already exists in this family.",
  J00002: "Built-in positions cannot be deleted.",
  J00003: "That code is already used by another position.",
  J00004: "This position is already archived.",
  J00005: "Job is not archived",
  J00006: "An archived position cannot be assigned. Restore it first.",
  JF00001: "Provided job family name already exists",
  JF00002: "Built-in job families cannot be deleted.",
  JF00003: "Job family is already archived",
  JF00004: "Job family is not archived",
  JF00005: "An archived job family cannot take new positions.",
  JG00001: "Provided job level group name already exists",
  JG00002: "Built-in tracks cannot be deleted.",
  JL00001: "Provided job level name already exists",
  JL00002: "Built-in levels cannot be deleted.",
  JL00004: "The reorder request must list exactly the levels of this group",

  // LeaveTypeBusinessError
  LTY00001: "Leave type not found",
  LTY00002: "Leave type name is missing",
  LTY00003: "A leave type with this name already exists.",
  LTY00004: "This leave type is already archived.",
  LTY00005: "An archived leave type cannot be changed.",
  LTY00006: "Leave type is not active",

  // LegalEntityBusinessError
  LE00001: "A legal entity with this name already exists.",
  LE00002: "Built-in legal entities cannot be deleted.",

  // PublicHolidayBusinessError
  PH00001: "Public holiday not found",
  PH00002: "Public holiday name is missing",
  PH00003: "A holiday on this date already exists in the calendar.",
  PH00004: "Access denied to public holiday",
  PH00005: "That is already the holiday name.",
  PH00006: "Public holiday date is missing",
  PH00007: "Public holiday date must be in the same year as calendar",
  PH00008: "Holidays cannot be changed in an archived calendar.",
  PH00009: "Public holiday end date must be on or after the start date",
  PH00010: "This holiday overlaps another one in the calendar.",

  // PublicHolidayCalendarBusinessError
  PHC00001: "Public holiday calendar not found",
  PHC00002: "Public holiday calendar name is missing",
  PHC00003: "A calendar with this name already exists.",
  PHC00004: "Access denied to public holiday calendar",
  PHC00005: "That is already the calendar name.",
  PHC00006: "This calendar is already archived.",
  PHC00007: "Public holiday calendar is already active",
  PHC00008: "Public holiday calendar is already inactive",
  PHC00009: "Public holiday calendar year is missing",
  PHC00010: "Public holiday calendar year is invalid",
  PHC00011: "An archived calendar cannot be changed. Restore it first.",
  PHC00012: "Public holiday calendar source type is missing",
  PHC00013: "Public holiday calendar is not linked to a source",
  PHC00014: "This year already has holidays. Clear them before filling it again.",

  // PublicHolidayTemplateBusinessError
  PHT00001: "Public holiday template not found",
  PHT00002: "Public holiday template provider is not supported",
  PHT00003: "Public holiday template does not support requested year",
  PHT00004: "The holiday template could not be loaded. Please try again.",
  PHT00005: "The holiday template could not be imported. Please try again.",

  // RoleAccessBusinessError
  RA00005: "Permissions of a built-in role cannot be changed.",

  // RoleBusinessError
  R00001: "A role with this name already exists.",
  R00002: "Nothing to update — the role is unchanged.",
  R00003: "This role cannot be deleted.",
  R00004: "The default role cannot be removed from a person.",
  R00005: "This is the last System Owner — give the role to someone else first",
  R00006: "This role cannot be archived.",
  R00007: "This role is already archived.",
  R00008: "This role is not archived.",
  R00009: "An archived role cannot be assigned. Restore it first.",

  // RoleFieldAccessBusinessError
  RF00005: "Field access of a built-in role cannot be changed.",

  // SegmentBusinessError

  // StorageBusinessError
  S00001: "Stored file not found",
  S00002: "The file could not be saved. Please try again.",
  S00003: "The file could not be read. Please try again.",
  S00004: "The file could not be deleted. Please try again.",
  S00005: "File storage is not set up correctly. Contact your administrator.",

  // TeamBusinessError
  TEAM001: "Team not found",
  TEAM002: "Team name is required",
  TEAM003: "A team with this name already exists.",
  TEAM004: "Parent team not found",
  TEAM005: "Parent must be a team",
  TEAM006: "That would create a loop in the team tree.",
  TEAM007: "A team cannot be its own parent.",
  TEAM008: "Access denied to team",
  TEAM009: "This team is already archived.",
  TEAM010: "This team is already active.",
  TEAM011: "Maximum team hierarchy depth of 10 exceeded",
  TEAM012: "An archived team cannot be changed. Restore it first.",
  TEAM013: "Move target team not found",
  TEAM014: "People cannot be moved into an archived team.",
  TEAM015: "User is not a member of this team",

  // TimeOffPolicyAccrualBusinessError
  TOPAC001: "Time off policy not found",
  TOPAC002: "Archived time off policy accrual cannot be modified",
  TOPAC003: "Accrual amount and cap must be non-negative",

  // TimeOffPolicyApprovalSettingsBusinessError
  TOPAS00001: "At least one approver is required",
  TOPAS00002: "Duplicate approval order values are not allowed",
  TOPAS00003: "approverUserId is required for SPECIFIC_USER approver type",
  TOPAS00004: "approverUserId must be null for MANAGER approver type",
  TOPAS00005: "approvalOrderStrict can only be true when allApprovalsRequired is true",
  TOPAS00006: "Approval settings cannot be modified on an archived policy",
  TOPAS00007: "approvalOrder is required and must be a positive integer",

  // TimeOffPolicyAssignmentBusinessError
  TOPAA00001: "Time off policy assignment not found",
  TOPAA00002: "This person already has an active assignment for this policy.",
  TOPAA00003: "Time off policy assignment is already ended",
  TOPAA00004: "effectiveFrom is required",
  TOPAA00005: "effectiveTo must be on or after effectiveFrom",
  TOPAA00006: "User not found in this company",
  TOPAA00007: "An archived policy cannot be assigned.",

  // TimeOffPolicyBlackoutBusinessError
  TOPB0001: "Time off policy not found",
  TOPB0002: "Archived time off policy blackouts cannot be modified",
  TOPB0003: "Blackout start and end dates are required",
  TOPB0004: "Blackout end date must be on or after the start date",

  // TimeOffPolicyBusinessError
  TOP00001: "Time off policy not found",
  TOP00002: "Time off policy name is missing",
  TOP00003: "Time off policy display name is missing",
  TOP00004: "A policy with this name already exists.",
  TOP00005: "Access denied to time off policy",
  TOP00006: "That is already the policy name.",
  TOP00007: "This policy is already archived.",
  TOP00008: "Time off policy is already active",
  TOP00009: "An archived policy cannot be changed. Restore it first.",
  TOP00010: "Time off policy quota is invalid",
  TOP00011: "Time off policy renewal settings are invalid",
  TOP00012: "Time off policy carryover settings are invalid",
  TOP00013: "This policy is assigned to people, so it cannot be deleted. End the assignments first.",

  // TimeOffPolicyCoverageBusinessError
  TOPC0001: "Time off policy not found",
  TOPC0002: "Archived time off policy coverage cannot be modified",
  TOPC0003: "A non-negative max-users-away value is required when coverage is enabled",

  // TimeOffPolicyEligibilityBusinessError
  TOPE0001: "Time off policy not found",
  TOPE0002: "Archived time off policy eligibility cannot be modified",
  TOPE0003: "A non-negative delay value is required when eligibility is enabled",

  // TimeOffPolicyRequestRulesBusinessError
  TORR0001: "Archived time off policy rules cannot be modified",
  TORR0002: "Certificate duration threshold is required for FROM_DURATION",
  TORR0003: "Default notice days are required when notice is enabled",
  TORR0004: "Past limit days are required when past requests are allowed",
  TORR0005: "Request rules contain an invalid value",
  TORR0006: "Minimum duration per request cannot exceed the maximum",

  // TimeOffPolicyTenureBusinessError
  TOPT0001: "Time off policy not found",
  TOPT0002: "Archived time off policy tenure rules cannot be modified",
  TOPT0003: "Each tenure rule needs non-negative years of service and bonus days",
  TOPT0004: "Tenure rules must have distinct years-of-service tiers",

  // TimeOffRequestBusinessError
  TORQ00001: "Time off request not found",
  TORQ00002: "Time off policy assignment not found",
  TORQ00003: "This assignment has ended, so no more requests can be submitted against it.",
  TORQ00004: "Time off policy not found",
  TORQ00005: "This policy is archived, so no more requests can be submitted against it.",
  TORQ00006: "Time off balance not found for this assignment and year",
  TORQ00007: "The end date has to be on or after the start date.",
  TORQ00008: "A request has to stay within one calendar year.",
  TORQ00009: "There is not enough balance left for these dates.",
  TORQ00010: "You already have a pending request that overlaps these dates.",
  TORQ00011: "Only pending requests can be cancelled, approved or rejected.",
  TORQ00012: "You do not have permission to cancel this request.",
  TORQ00013: "You do not have permission to do this.",
  TORQ00014: "That would push the used balance below zero.",
  TORQ00015: "A reason is required to reject a request.",
  TORQ00016: "You do not have permission to approve or reject this request.",
  TORQ00017: "You cannot approve your own request.",
  TORQ00018: "The dates you picked contain no working days for this policy.",
  TORQ00019: "This request is shorter than the policy allows.",
  TORQ00020: "This request is longer than the policy allows.",
  TORQ00021: "This would go over the maximum time off allowed per year for this policy.",
  TORQ00022: "This request does not give the advance notice the policy requires.",
  TORQ00023: "This policy does not allow requests for past dates.",
  TORQ00024: "The start date is further in the past than this policy allows.",
  TORQ00025: "This request is too close to another one. The policy requires a gap between requests.",
  TORQ00026: "An earlier approval step still needs to be completed.",
  TORQ00027: "You have already approved this request.",
  TORQ00028: "These dates fall inside a blackout period for this policy.",
  TORQ00029: "Too many people are already away during these dates.",
  TORQ00030: "You are not eligible for this policy yet — the waiting period has not passed.",

  // UserBusinessError
  U00001: "Someone with this email already exists.",
  U00002: "User not found",
  U00003: "That manager could not be found.",
  U00004: "A person cannot report to themselves.",
  U00005: "That would create a reporting loop.",
  U00006: "Unknown user status",
  U00007: "This person is already terminated.",
  U00008: "Unknown termination reason",

  // UserDepartmentBusinessError
  UDEPT001: "User not found",
  UDEPT002: "User is not assigned to this department",

  // UserTeamBusinessError
  UTEAM001: "User not found",
  UTEAM002: "User is not a member of this team",

  // ValidationBusinessError
  V00001: "Some of the details are not valid. Check the highlighted fields.",
};

/**
 * Codes whose backend message carries values filled in at throw time ("Unknown attribute: {0}").
 * The parameters are not sent separately, so a fixed entry above would lose the part that matters.
 * Until they travel with the response, these keep the server's text.
 *
 * Debt, not design — recorded in TECH_DEBT.md.
 */
export const SERVER_TEXT_CODES = new Set<string>([
  "ASGN001",
  "ASGN005",
  "ASGN008",
  "AT00006",
  "AT00007",
  "AV0001",
  "AV0002",
  "AV0003",
  "AV0004",
  "AV0005",
  "AV0006",
  "AV0007",
  "AV0008",
  "AV0009",
  "AV0010",
  "AV0011",
  "AV0012",
  "AV0013",
  "AV0014",
  "AV0015",
  "AV0016",
  "AV0017",
  "AV0018",
  "BE0001",
  "BE0002",
  "BE0003",
  "BE0004",
  "BE0006",
  "BE0007",
  "JL00003",
  "RA00001",
  "RA00002",
  "RA00003",
  "RA00004",
  "RA00006",
  "RA00007",
  "RF00001",
  "RF00002",
  "RF00003",
  "RF00004",
  "SG00001",
  "SG00002",
]);

/** Shown when the code has no entry and the server sent nothing usable. */
export const FALLBACK_ERROR_MESSAGE = "An error occurred. Please try again.";

/**
 * The user-facing text for a failure.
 *
 * Order matters: the dictionary wins, then the server's own words for the parameterised codes, then
 * the generic sentence. The code itself is not appended here — the card and the inline error render
 * it separately, in small type, so support has something to match on.
 */
export const messageForCode = (code?: string, serverMessage?: string): string => {
  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  if (code && SERVER_TEXT_CODES.has(code) && serverMessage) return serverMessage;
  return FALLBACK_ERROR_MESSAGE;
};

/**
 * The same decision, straight from a caught error.
 *
 * Two kinds of error arrive here and they need opposite treatment:
 *
 * - an `ApiError` still carries the backend's technical wording, so the code decides the text;
 * - anything else on the client has almost always come back through a mutation hook, which throws
 *   `new Error(result.errorMessage)` — and that message was *already* resolved by `toActionError`.
 *   Sending it through the dictionary again would find no code and replace good text with the
 *   generic sentence. That is exactly what happened in the first smoke run: the reason travelled
 *   all the way from Java and was thrown away at the last step.
 *
 * The remaining gap is that a plain `Error` loses `code` and `requestId` on the way through the
 * hook, so a card built from one cannot show a reference. Fixing that means the hooks carrying the
 * envelope instead of flattening it — recorded in TECH_DEBT.md.
 */
export const messageForError = (error: unknown): string => {
  if (error instanceof ApiError) return messageForCode(error.code, error.message);
  if (error instanceof Error && error.message.trim()) return error.message;
  return FALLBACK_ERROR_MESSAGE;
};
