import { HomeContainer } from "@/components/modules/home";

/**
 * Home. It stays at `/dashboard` — `APP_HOME`, the sidebar, `/403` and the end of the welcome all point here —
 * and its heading is the greeting (sitting 2, H1). It replaced a demo page from the purchased UI kit; the kit's
 * dashboard widgets are left untouched in the vendored tree and are imported nowhere.
 */
export default function HomePage() {
  return <HomeContainer />;
}
