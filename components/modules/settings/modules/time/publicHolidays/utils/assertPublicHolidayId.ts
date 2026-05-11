export const assertPublicHolidayId = (value: string, fieldName: string) => {
  if (!value || value === "undefined") {
    throw new Error(`${fieldName} is required`);
  }
};
