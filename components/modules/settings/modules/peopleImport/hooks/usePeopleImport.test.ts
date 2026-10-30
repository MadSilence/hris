import type { CapturedReactQueryOptions } from "@/test/types";
import { renderHook } from "@testing-library/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  PeopleImportActionError,
  useUpdatePeopleImport,
} from "@/components/modules/settings/modules/peopleImport/hooks/usePeopleImport";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
  useQuery: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock("@/components/providers/AppDataProvider", () => ({
  useAppDataContext: jest.fn(),
}));

jest.mock("@/components/modules/settings/modules/peopleImport/actions", () => ({
  updatePeopleImportAction: jest.fn(),
}));

type StepOptions = CapturedReactQueryOptions & { onError: (...args: unknown[]) => unknown };

/** I-B4: a step refused because somebody else saved first reloads the import instead of leaving the page stale. */
describe("useUpdatePeopleImport", () => {
  let captured!: StepOptions;
  const invalidateQueries = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useQueryClient as jest.Mock).mockReturnValue({ invalidateQueries, setQueryData: jest.fn() });
    (useMutation as jest.Mock).mockImplementation((opts: StepOptions) => {
      captured = opts;
      return {};
    });
    renderHook(() => useUpdatePeopleImport());
  });

  it("reloads the import when the page was stale", () => {
    captured.onError(new PeopleImportActionError({ status: ActionStatus.ERROR, code: "IMP00113" }));

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["PEOPLE_IMPORT"] });
  });

  it("leaves the page as it is for any other refusal", () => {
    captured.onError(new PeopleImportActionError({ status: ActionStatus.ERROR, code: "IMP00114" }));

    expect(invalidateQueries).not.toHaveBeenCalled();
  });
});
