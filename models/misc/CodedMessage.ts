/**
 * A sentence the backend composed, sent as a code the frontend words (I18N_DESIGN.md rule 1). Mirrors
 * `com.example.common.i18n.CodedMessage`: `code` is an enum constant's name, `params` are named and already text.
 * It travels beside the English the DTO still carries; a screen that does not know a code shows that English.
 */
export type CodedMessage = {
  code: string;
  params: Record<string, string>;
};
