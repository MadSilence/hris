"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import type {
  CompanySetupDTO,
  SetupCountryDTO,
  UserSettingsDTO,
  WelcomeDTO,
} from "@/api/modules/firstRun/dto";

export const COMPANY_SETUP_QK = ["COMPANY_SETUP"];
export const SETUP_COUNTRIES_QK = ["SETUP_COUNTRIES"];
export const USER_SETTINGS_QK = ["USER_SETTINGS"];
export const WELCOME_QK = ["WELCOME"];

/**
 * Where the company's setup stands.
 *
 * `poll` turns it into the progress screen's clock: while the seeding runs there is nothing to push
 * the answer, so the screen asks. Two seconds is fast enough that a step change is not missed and
 * slow enough that a hundred and fifty people are not seeded under a request every 200ms.
 */
export const useCompanySetup = (poll = false) => {
  const { internalApiClient } = useAppDataContext();

  return useQuery<CompanySetupDTO>({
    queryKey: COMPANY_SETUP_QK,
    queryFn: () => internalApiClient.get<CompanySetupDTO>("/company-setup"),
    refetchInterval: poll ? 2000 : false,
  });
};

/** The countries the setup can offer, and what each would set. They do not change while you look. */
export const useSetupCountries = () => {
  const { internalApiClient } = useAppDataContext();

  return useQuery<SetupCountryDTO[]>({
    queryKey: SETUP_COUNTRIES_QK,
    queryFn: () => internalApiClient.get<SetupCountryDTO[]>("/company-setup/countries"),
    staleTime: Infinity,
  });
};

/** The signed-in person's own preferences. */
export const useUserSettings = () => {
  const { internalApiClient } = useAppDataContext();

  return useQuery<UserSettingsDTO>({
    queryKey: USER_SETTINGS_QK,
    queryFn: () => internalApiClient.get<UserSettingsDTO>("/me/settings"),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * What the welcome should ask this person, and what it already knows about them.
 *
 * Held for five minutes because the app shell reads it on every full page load, for one boolean —
 * whether to offer *Finish Your Profile* — while the answer behind it is the whole field-access map
 * for this person. The welcome screen itself invalidates the key when a photo lands.
 */
export const useWelcome = () => {
  const { internalApiClient } = useAppDataContext();

  return useQuery<WelcomeDTO>({
    queryKey: WELCOME_QK,
    queryFn: () => internalApiClient.get<WelcomeDTO>("/me/welcome"),
    staleTime: 5 * 60 * 1000,
  });
};
