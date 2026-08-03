export interface CompanyCalendarUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  avatarUrl: string | null;
  status: string;
}

export interface CompanyCalendarHoliday {
  userId: string;
  id: string;
  name: string;
  date: string;
  calendarId: string;
  calendarName: string | null;
}

export interface CompanyCalendarPage {
  users: CompanyCalendarUser[];
  nextCursor: string | null;
  holidays: CompanyCalendarHoliday[];
}
