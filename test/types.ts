/**
 * The react-query options object a hook hands to `useQuery` / `useMutation`, captured in tests so the
 * callbacks inside it can be invoked directly.
 *
 * Every member is declared present even though a given hook only passes some: tests capture the
 * options of one specific hook and then call the one callback that hook is about, so an optional
 * signature would only add a non-null assertion at every call site. If a hook stops passing the
 * callback a test invokes, the test fails at runtime — which is the failure you want anyway.
 *
 * Arguments are `unknown` rather than typed per hook: the tests assert on what the callback *does*
 * (which service it calls, what it invalidates), not on its signature.
 */
export type CapturedReactQueryOptions = {
  queryKey?: unknown;
  queryFn: (...args: unknown[]) => unknown;
  mutationFn: (...args: unknown[]) => unknown;
  onSuccess: (...args: unknown[]) => unknown;
};

/**
 * A test double that fills in only the fields the test cares about.
 *
 * Replaces `{ ... } as any` at mock boundaries. Unlike `any` it still checks the fields you *do*
 * write against the real type, so a renamed field breaks the test instead of silently mocking a
 * property nothing reads.
 */
// `NoInfer` keeps the argument from driving inference, so `T` comes from where the result is
// used — the mock's real return type — instead of from the literal being passed in.
export const partialMock = <T>(value: NoInfer<Partial<T>>): T => value as T;

/**
 * The props a form test double reads from the real form it stands in for.
 *
 * Deliberately has no index signature: reaching for a prop that is not listed here should fail to
 * compile, which is what makes the double honest about what it depends on.
 */
export type MockedFormProps = {
  isLoading?: boolean;
  submitText?: string;
  // Required, because the double itself invokes them to simulate the user finishing the form.
  onSubmitAction: (...args: unknown[]) => void;
  onCancelAction: () => void;
  onDirtyChangeAction?: (dirty: boolean) => void;
};
