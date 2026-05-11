export const PUBLIC_HOLIDAYS_QUERY_KEY = "publicHolidays";

export const getPublicHolidayCalendarsQueryKey = () => [
  PUBLIC_HOLIDAYS_QUERY_KEY,
  "calendars",
];

export const getPublicHolidayCalendarQueryKey = (calendarId: string) => [
  PUBLIC_HOLIDAYS_QUERY_KEY,
  "calendars",
  calendarId,
];

export const getPublicHolidaysQueryKey = (calendarId: string) => [
  PUBLIC_HOLIDAYS_QUERY_KEY,
  "calendars",
  calendarId,
  "holidays",
];

export const getPublicHolidayTemplatesQueryKey = () => [
  PUBLIC_HOLIDAYS_QUERY_KEY,
  "templates",
];

export const getPublicHolidayTemplateQueryKey = (templateId: string) => [
  PUBLIC_HOLIDAYS_QUERY_KEY,
  "templates",
  templateId,
];

export const getPublicHolidayTemplatePreviewQueryKey = (
  templateId: string,
  year: number
) => [
  PUBLIC_HOLIDAYS_QUERY_KEY,
  "templates",
  templateId,
  "preview",
  year,
];
