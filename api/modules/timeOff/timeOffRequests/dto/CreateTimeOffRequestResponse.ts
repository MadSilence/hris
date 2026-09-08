/**
 * The created request, plus what the person should know about it.
 *
 * A coverage cap set to WARN lets a request through and still wants the person to know which of
 * their days are already thin. Before this the warning was computed on the server, logged and
 * dropped — so choosing WARN was the same as choosing nothing.
 */
export interface CreateTimeOffRequestResponse {
  id: string;
  /** ISO days on which the coverage cap was already reached. Empty in the ordinary case. */
  coverageWarningDays: string[];
}
