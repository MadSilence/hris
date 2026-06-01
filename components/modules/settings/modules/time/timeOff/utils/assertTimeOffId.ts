export const assertTimeOffId = (id: string, fieldName: string): void => {
  if (!id || id === "undefined") {
    throw new Error(`Missing required Time Off ID: ${fieldName}`);
  }
};
