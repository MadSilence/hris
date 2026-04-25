export const assertDocumentsUserId = (userId: string) => {
  if (!userId || userId === "undefined") {
    throw new Error("Invalid userId");
  }
};
