import { ActionStatus } from "@/components/models/ActionStatus";
import { toActionError, withActionError } from "@/lib/errors/withActionError";
import { FALLBACK_ERROR_MESSAGE } from "@/lib/errors/errorMessages";
import {
  BackendUnavailableError,
  ConflictError,
  ServerError,
  ValidationError,
} from "@/components/clients/exceptions";

describe("toActionError", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("turns a domain refusal into the dictionary text plus its code", () => {
    const result = toActionError(
      new ConflictError("Document folder is not empty", { code: "D00017", status: 409 }),
    );

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage: "This folder still has files in it. Empty it first.",
      code: "D00017",
      fieldErrors: undefined,
      requestId: undefined,
    });
  });

  it("passes fieldErrors through so the message can sit next to its field", () => {
    const fieldErrors = { "holidays[3]": 'Overlaps "Christmas"' };
    const result = toActionError(
      new ValidationError("Validation error.", { code: "V00001", status: 422, fieldErrors }),
    );

    expect(result.fieldErrors).toEqual(fieldErrors);
  });

  it("carries the request id for a failure nobody expected", () => {
    const result = toActionError(
      new ServerError("Unspecified error", { code: "E00000", status: 500, requestId: "req-7" }),
    );

    expect(result.requestId).toBe("req-7");
  });

  it("carries no request id when the backend was never reached", () => {
    const result = toActionError(new BackendUnavailableError("connect ECONNREFUSED"));

    expect(result.requestId).toBeUndefined();
  });

  it("falls back for an error that never came from the API", () => {
    const result = toActionError(new Error("boom"));

    expect(result).toEqual({ status: ActionStatus.ERROR, errorMessage: FALLBACK_ERROR_MESSAGE });
  });
});

describe("withActionError", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns SUCCESS with what the body resolved to", async () => {
    const action = withActionError(async (id: string) => ({ id }));

    await expect(action("42")).resolves.toEqual({
      status: ActionStatus.SUCCESS,
      data: { id: "42" },
    });
  });

  it("passes every argument through", async () => {
    const body = jest.fn().mockResolvedValue(undefined);
    const action = withActionError(body as (a: string, b: number) => Promise<void>);

    await action("a", 2);

    expect(body).toHaveBeenCalledWith("a", 2);
  });

  it("catches whatever the body throws", async () => {
    const action = withActionError(async () => {
      throw new ConflictError("Role name already exists", { code: "R00001", status: 409 });
    });

    await expect(action()).resolves.toMatchObject({
      status: ActionStatus.ERROR,
      code: "R00001",
      errorMessage: "A role with this name already exists.",
    });
  });
});

describe("the field-bound message", () => {
  const boundError = (code: string, message: string) =>
    new ConflictError(message, { status: 409, code, fieldErrors: { name: message } });

  it("puts the dictionary's words under the field, not the backend's", () => {
    const result = toActionError(boundError("JF00001", "Provided job family name already exists"));

    expect(result.fieldErrors).toEqual({
      name: "A job family with this name already exists.",
    });
  });

  it("leaves a map the backend built deliberately alone", () => {
    const error = new ConflictError("Overlapping dates", {
      status: 409,
      code: "PH00003",
      fieldErrors: { "2026-01-01": "Overlaps New Year", "2026-05-01": "Overlaps Labour Day" },
    });

    expect(toActionError(error).fieldErrors).toEqual({
      "2026-01-01": "Overlaps New Year",
      "2026-05-01": "Overlaps Labour Day",
    });
  });

  it("leaves bean validation alone — it has no code to look up", () => {
    const error = new ValidationError("must not be blank", {
      status: 422,
      fieldErrors: { building: "must not be blank" },
    });

    expect(toActionError(error).fieldErrors).toEqual({ building: "must not be blank" });
  });
});
