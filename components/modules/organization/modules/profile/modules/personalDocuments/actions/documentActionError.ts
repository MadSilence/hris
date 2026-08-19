import { BadRequestError, ForbiddenError } from "@/components/clients/exceptions";

/**
 * Business refusals carry a message worth showing: "Document folder is not empty" tells the user
 * exactly what to do, while the generic "please try again" invites them to retry something that can
 * never succeed. Infrastructure failures keep the generic wording — their details are for the log.
 */
export const documentActionErrorMessage = (error: unknown, fallback: string): string => {
  const isBusinessRefusal = error instanceof BadRequestError || error instanceof ForbiddenError;

  if (isBusinessRefusal && error.message) {
    return error.message;
  }

  return fallback;
};
