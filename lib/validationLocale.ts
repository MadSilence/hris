import { createTranslator } from "next-intl";
import * as yup from "yup";

import { type AppLocale, DEFAULT_LOCALE, languageOf } from "@/i18n/locales";
import { catalogueFor } from "@/i18n/catalogue";
import { formatDisplayDate } from "@/lib/date";

/**
 * Yup's own messages — what a rule written without one (`.min(2)`, `.email()`) shows — in the reader's
 * language, from `common` → `validation.*`. A schema with its own message keeps it.
 *
 * The messages are functions, installed once when this module loads, that read the language when a field is
 * validated: yup copies a rule's default message when the schema is built, so a function is the only form that
 * follows a language chosen later. `LocaleBridge` sets the language on the client; on the server it is never set
 * (one request's language would leak into the next) and validation there reads English.
 *
 * The messages name no field: yup's English put the schema's key first ("email must be a valid email"), and a
 * key is not a word in any language. Every one of them is shown next to its field.
 */
let clientLocale: AppLocale = DEFAULT_LOCALE;

export const setValidationLocale = (locale: AppLocale): void => {
  if (typeof window === "undefined") return;
  clientLocale = locale;
};

const translators = new Map<AppLocale, ReturnType<typeof translatorFor>>();

function translatorFor(locale: AppLocale) {
  return createTranslator({ locale, messages: catalogueFor(locale), namespace: "common" });
}

const t = () => {
  let translator = translators.get(clientLocale);
  if (!translator) {
    translator = translatorFor(clientLocale);
    translators.set(clientLocale, translator);
  }
  return translator;
};

const date = (value: Date | string) => formatDisplayDate(value, { language: languageOf(clientLocale) }) || String(value);

yup.setLocale({
  mixed: {
    default: () => t()("validation.invalid"),
    required: () => t()("validation.required"),
    defined: () => t()("validation.required"),
    notNull: () => t()("validation.required"),
    oneOf: ({ values }) => t()("validation.oneOf", { values: String(values) }),
    notOneOf: ({ values }) => t()("validation.notOneOf", { values: String(values) }),
    notType: ({ type }) =>
      type === "number" ? t()("validation.notNumber") : type === "date" ? t()("validation.notDate") : t()("validation.invalid"),
  },
  string: {
    length: ({ length }) => t()("validation.string.length", { length }),
    min: ({ min }) => t()("validation.string.min", { min }),
    max: ({ max }) => t()("validation.string.max", { max }),
    matches: () => t()("validation.string.matches"),
    email: () => t()("validation.string.email"),
    url: () => t()("validation.string.url"),
    uuid: () => t()("validation.string.uuid"),
  },
  number: {
    min: ({ min }) => t()("validation.number.min", { min }),
    max: ({ max }) => t()("validation.number.max", { max }),
    lessThan: ({ less }) => t()("validation.number.lessThan", { less }),
    moreThan: ({ more }) => t()("validation.number.moreThan", { more }),
    positive: () => t()("validation.number.positive"),
    negative: () => t()("validation.number.negative"),
    integer: () => t()("validation.number.integer"),
  },
  date: {
    min: ({ min }) => t()("validation.date.min", { min: date(min) }),
    max: ({ max }) => t()("validation.date.max", { max: date(max) }),
  },
  array: {
    length: ({ length }) => t()("validation.array.length", { length }),
    min: ({ min }) => t()("validation.array.min", { min }),
    max: ({ max }) => t()("validation.array.max", { max }),
  },
});
