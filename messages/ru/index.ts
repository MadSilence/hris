import type { DeepPartial } from "@/i18n/messages";

/**
 * The Russian catalogue. Partial by type: a key missing here is read from English (`i18n/messages.ts`), and
 * the catalogue test lists what is missing. Machine-translated first, then read by a person (§ 8).
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

const ru: DeepPartial<typeof import("@/messages/en").default> = {
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

export default ru;
