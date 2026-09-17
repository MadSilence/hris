/**
 * What the filters offer, served by the backend rather than restated here.
 *
 * <p>The two cannot drift: an action the product can write but the catalogue does not list would be a
 * row the filter can never find.
 */
export type ActivityCatalog = {
  modules: { code: string; label: string }[];
  actions: { code: string; label: string; module: string; entity: string | null; verb: string | null }[];
  verbs: { code: string; label: string }[];
};
