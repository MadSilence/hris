export enum AttributeType {
  TEXT = "TEXT",
  LONG_TEXT = "LONG_TEXT",
  SELECT = "SELECT",
  // STATUS was removed 2026-08-15: a duplicate of SELECT that stored its option as a raw string.
  // The system `sys:status` field is now a SELECT carrying the USER_STATUSES vocabulary.
  PERSON = "PERSON",
  CHECKBOX = "CHECKBOX",
  NUMBER = "NUMBER",
  MULTI_SELECT = "MULTI_SELECT",
  DATE = "DATE",
  EMAIL = "EMAIL",
  URL = "URL",
  PHONE = "PHONE",
  COUNTRY = "COUNTRY",
  LANGUAGE = "LANGUAGE",
  TIMEZONE = "TIMEZONE",
  CURRENCY = "CURRENCY",
  OBJECT = "OBJECT",
  ADDRESS = "ADDRESS",
  MONEY = "MONEY",
}

