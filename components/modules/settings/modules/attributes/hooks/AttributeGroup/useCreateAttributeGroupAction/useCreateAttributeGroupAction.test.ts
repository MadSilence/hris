import { act, renderHook } from '@testing-library/react';
import { useMutation } from '@tanstack/react-query';
import {
  createAttributeGroupAction,
  CreateAttributeGroupActionInput
} from "../../../actions/AttributeGroup/createGroupAction";
import { useInvalidateAttributeGroupsQuery } from "@/components/modules/settings/modules/attributes/hooks/AttributeGroup/useAttributeGroups";
import { useCreateAttributeGroupAction } from "./useCreateAttributeGroupAction";

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
}));
// Both paths were wrong: no `@/` prefix, and the modules live under AttributeGroup/ — jest resolved
// neither, so the suite died before running.
jest.mock('@/components/modules/settings/modules/attributes/actions/AttributeGroup/createGroupAction', () => ({
  createAttributeGroupAction: jest.fn(),
}));
jest.mock('@/components/modules/settings/modules/attributes/hooks/AttributeGroup/useAttributeGroups', () => ({
  useInvalidateAttributeGroupsQuery: jest.fn(),
}));

describe('useCreateAttributeGroupAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls createAttributeGroupAction and runs revalidation on success', async () => {
    const mockPayload: CreateAttributeGroupActionInput = { name: 'Test name' };
    const mockRevalidate = jest.fn();
    (useInvalidateAttributeGroupsQuery as jest.Mock).mockReturnValue(mockRevalidate);
    (createAttributeGroupAction as jest.Mock).mockResolvedValue({ id: '1' });

    let capturedOpts: any;
    (useMutation as jest.Mock).mockImplementation((opts: any) => {
      capturedOpts = opts;
      return { mutate: jest.fn(), mutateAsync: opts.mutationFn };
    });

    renderHook(() => useCreateAttributeGroupAction());

    await act(async () => {
      await capturedOpts.mutationFn(mockPayload);
    });

    expect(createAttributeGroupAction).toHaveBeenCalledWith(mockPayload);

    capturedOpts.onSuccess?.();
    expect(mockRevalidate).toHaveBeenCalled();
  });
});
