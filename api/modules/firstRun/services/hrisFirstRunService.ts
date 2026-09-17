import { hrisApiFirstRunClient } from "@/api/modules/firstRun/clients";
import type {
  WelcomeDTO,
  CompanySetupDTO,
  CompanySetupSubmitRequest,
  SetupCountryDTO,
  UpdateUserSettingsRequest,
  UserSettingsDTO,
} from "@/api/modules/firstRun/dto";

/** Whether this session still owes the product an answer, and which one. */
export type FirstRunState = {
  /** The owner has not said what this company should start with. */
  setupNeeded: boolean;
  /** This person has never been shown the welcome. */
  welcomeNeeded: boolean;
};

export class HrisFirstRunService {
  public async getCompanySetup(): Promise<CompanySetupDTO> {
    return hrisApiFirstRunClient.getCompanySetup();
  }

  public async getSetupCountries(): Promise<SetupCountryDTO[]> {
    return hrisApiFirstRunClient.getSetupCountries();
  }

  public async submitCompanySetup(body: CompanySetupSubmitRequest): Promise<CompanySetupDTO> {
    return hrisApiFirstRunClient.submitCompanySetup(body);
  }

  public async getWelcome(): Promise<WelcomeDTO> {
    return hrisApiFirstRunClient.getWelcome();
  }

  public async getUserSettings(): Promise<UserSettingsDTO> {
    return hrisApiFirstRunClient.getUserSettings();
  }

  public async updateUserSettings(body: UpdateUserSettingsRequest): Promise<UserSettingsDTO> {
    return hrisApiFirstRunClient.updateUserSettings(body);
  }

  public async resolveAvatarUploadToken(token: string): Promise<{ firstName: string | null; lastName: string | null }> {
    return hrisApiFirstRunClient.resolveAvatarUploadToken(token);
  }

  public async uploadAvatarByToken(form: FormData): Promise<{ id: string }> {
    return hrisApiFirstRunClient.uploadAvatarByToken(form);
  }

  public async completeWelcome(): Promise<void> {
    return hrisApiFirstRunClient.completeWelcome();
  }

  /**
   * The one question the app shell asks before it renders: where does this person belong right now?
   *
   * <p>Both reads go out together — they are independent, and doing them in sequence would put two
   * round trips in front of every page. **Neither is allowed to keep anybody out of the product**:
   * if either call fails, the answer is "no, nothing is owed", because a backend hiccup must not
   * strand somebody on a setup screen they cannot get past. The gate is a redirect, not a security
   * check — what a person may do is still the backend's answer on every request.
   */
  public async getFirstRunState(): Promise<FirstRunState> {
    const [setup, settings] = await Promise.allSettled([
      hrisApiFirstRunClient.getCompanySetup(),
      hrisApiFirstRunClient.getUserSettings(),
    ]);

    return {
      setupNeeded: setup.status === "fulfilled" && setup.value.status !== "COMPLETED",
      welcomeNeeded: settings.status === "fulfilled" && settings.value.welcomeCompletedAt === null,
    };
  }
}

export const hrisFirstRunService = new HrisFirstRunService();
