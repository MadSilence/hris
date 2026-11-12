/**
 * The English catalogue — the source of every key (technical_documentation/I18N.md § 4.1).
 *
 * One file per area; a new file is registered here and in `messages/ru/index.ts`. Its shape is the type of
 * every key in the application (`global.d.ts`), so a key that is not here does not compile.
 */
import common from "./common.json";
import navigation from "./navigation.json";
import errors from "./errors.json";
import auth from "./auth.json";
import firstRun from "./firstRun.json";
import home from "./home.json";
import search from "./search.json";
import notifications from "./notifications.json";
import timeOff from "./timeOff.json";
import calendar from "./calendar.json";
import attendance from "./attendance.json";
import organization from "./organization.json";
import access from "./access.json";
import lifecycle from "./lifecycle.json";
import automations from "./automations.json";
import automationsList from "./automationsList.json";
import automationsEditor from "./automationsEditor.json";
import automationsSettings from "./automationsSettings.json";
import automationsRuns from "./automationsRuns.json";
import reviews from "./reviews.json";
import settings from "./settings.json";
import peopleImport from "./peopleImport.json";
import structure from "./structure.json";
import hub from "./hub.json";

const en = {
  common,
  navigation,
  errors,
  auth,
  firstRun,
  home,
  search,
  notifications,
  timeOff,
  calendar,
  attendance,
  organization,
  access,
  lifecycle,
  automations,
  automationsList,
  automationsEditor,
  automationsSettings,
  automationsRuns,
  reviews,
  settings,
  peopleImport,
  structure,
  hub,
};

export default en;
