/**
 * Where signing out goes: `/login` on the host the person is on, which on a company's address is that
 * company's own login page. Wrapped so tests can observe it: jsdom's location is read-only.
 */
export const signOutNavigation = {
  toLogin() {
    window.location.assign("/login");
  },
};
