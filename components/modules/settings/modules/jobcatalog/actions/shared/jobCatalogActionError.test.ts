import { BadRequestError, ForbiddenError } from "@/components/clients/exceptions";
import { jobCatalogErrorMessage } from "./jobCatalogActionError";

const FALLBACK = "An error occurred while creating a job. Please try again.";

describe("jobCatalogErrorMessage", () => {
  it("passes a business rule from Java through to the user", () => {
    const error = new BadRequestError("Provided job code is already used by another job");

    expect(jobCatalogErrorMessage(error, FALLBACK)).toBe(
      "Provided job code is already used by another job",
    );
  });

  it("falls back for failures the user cannot act on", () => {
    expect(jobCatalogErrorMessage(new ForbiddenError("Forbidden"), FALLBACK)).toBe(FALLBACK);
    expect(jobCatalogErrorMessage(new Error("boom"), FALLBACK)).toBe(FALLBACK);
    expect(jobCatalogErrorMessage(undefined, FALLBACK)).toBe(FALLBACK);
  });

  it("falls back when the bad request carries no message", () => {
    expect(jobCatalogErrorMessage(new BadRequestError(""), FALLBACK)).toBe(FALLBACK);
  });
});
