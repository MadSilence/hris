/**
 * Module stand-ins for the automations settings' tests — the data hooks the windows read, answering from fixtures:
 *
 *   jest.mock("@/components/hooks/useReferenceOptions", () => jest.requireActual("@/test/automationSettingsMocks").referenceOptions);
 *
 * Plain functions, not `jest.fn()`: the suite runs with `resetMocks`, which would empty a `jest.fn` before each test.
 */
import type { UserRefDTO } from "@/models/segment/Segment";
import type { PublicHolidayCalendar } from "@/models/publicHolidays/calendar";
import type { TimeOffPolicy } from "@/models/timeOff/TimeOffPolicy";
import { automationCatalogFixture, userFieldsFixture } from "@/test/fixtures/automationCatalog";

const REFS: Record<string, { id: string; label: string }[]> = {
  offices: [
    { id: "o-vil", label: "Vilnius" },
    { id: "o-war", label: "Warsaw" },
  ],
  departments: [{ id: "d-eng", label: "Engineering" }],
  teams: [{ id: "t-dev", label: "Developers" }],
  roles: [{ id: "r-hr", label: "HR Admin" }],
  calendars: [{ id: "c-lt", label: "Lithuania" }],
  policies: [{ id: "p-vac", label: "Vacation" }],
};

const noop = () => undefined;

export const referenceOptions = {
  REFERENCE_ENDPOINTS: {},
  useReferenceOptions: (source: string | undefined) => ({
    options: (source && REFS[source]) || [],
    isLoading: false,
    hasEndpoint: true,
  }),
};

export const userFields = {
  USER_FIELDS_QK: ["USER_FIELDS"],
  useUserFields: () => ({ data: userFieldsFixture(), isLoading: false, isError: false, refetch: noop }),
};

export const access = {
  useAccess: () => ({ access: { systemOwner: true }, loading: false }),
};

export const audienceFieldOptions = {
  useAudienceFieldOptions: (source: string) =>
    REFS[source] ? { options: REFS[source], isLoading: false, hasOptions: true } : { options: [], isLoading: false, hasOptions: false },
};

const PEOPLE: UserRefDTO[] = [
  { id: "u-aiste", firstName: "Aistė", lastName: "Jonaitė", email: null, extras: { office: { id: "o-vil", name: "Vilnius" } } },
  { id: "u-marta", firstName: "Marta", lastName: "Nowak", email: null, extras: { office: { id: "o-war", name: "Warsaw" } } },
];

export const segmentResolve = {
  SEGMENT_RESOLVE_QK: "SEGMENT_RESOLVE",
  useSegmentResolve: () => ({
    items: PEOPLE,
    total: PEOPLE.length,
    isLoading: false,
    isError: false,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: () => Promise.resolve(),
    refetch: () => Promise.resolve(),
  }),
};

export const user = {
  useUser: () => ({ data: undefined }),
};

export const userPicker = {
  UserPickerField: () => null,
};

const calendar = (id: string, name: string, sourceCountryCode: string): PublicHolidayCalendar => ({
  id,
  name,
  status: "ACTIVE" as PublicHolidayCalendar["status"],
  sourceType: "MANUAL" as PublicHolidayCalendar["sourceType"],
  sourceExternalId: null,
  sourceCountryCode,
  sourceRegionCode: null,
  sourceLocale: null,
  weekendSubstitution: "NONE" as PublicHolidayCalendar["weekendSubstitution"],
  autoFillEnabled: false,
  archivedAt: null,
  archivedBy: null,
  holidayCount: 0,
  years: [],
});

export const holidayCalendars = {
  usePublicHolidayCalendars: () => ({
    data: [calendar("c-pl", "Poland", "PL"), calendar("c-lt", "Lithuania", "LT")],
    isLoading: false,
    isError: false,
    refetch: noop,
  }),
};

const policy = (id: string, name: string, yearlyQuota: number | null, unlimitedQuota = false) =>
  ({ id, name, yearlyQuota, unlimitedQuota, archivedAt: null }) as TimeOffPolicy;

export const timeOffPolicies = {
  useTimeOffPolicies: () => ({
    data: [policy("p-vac", "Vacation", 26), policy("p-par", "Parental leave", null, true)],
    isLoading: false,
    isError: false,
    refetch: noop,
  }),
};

export const automationHooks = {
  useAutomationCatalog: () => ({ data: automationCatalogFixture(), isLoading: false, isError: false }),
};
