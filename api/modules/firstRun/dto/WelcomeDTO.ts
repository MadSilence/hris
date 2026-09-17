import type { FieldDTO } from "@/models/user/fields";

/**
 * What the welcome has to ask this person, and what it already knows.
 *
 * `fields` is what the backend decided they may fill in about themselves — their own custom
 * attributes, and nothing from the organization or employment groups. It is allowed to be empty:
 * with the default roles as shipped, an ordinary employee may view their own attributes and edit
 * none of them, and the first step is then the photo alone.
 */
export type WelcomeDTO = {
  fields: FieldDTO[];
  /** Already-stored values, keyed by field id, so what HR typed shows up filled. */
  values: Record<string, unknown>;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  completed: boolean;
  /**
   * There is still something worth doing on it — no photo, or a field of their own left blank.
   *
   * Separate from `completed` because skipping is an answer: the gate must never fire again, but
   * "you never added a photo" stays true, and that is what the user menu offers a way back for.
   */
  outstanding: boolean;
};
