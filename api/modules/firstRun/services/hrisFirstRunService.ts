import { cookies } from "next/headers";
import { decodeJwt } from "jose";
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
  /** This person has never been shown the welcome — and it is them, not somebody acting as them. */
  welcomeNeeded: boolean;
  /** The session is an impersonation: the actor is looking through somebody else's eyes. */
  impersonating: boolean;
};

/**
 * Whether the session cookie says it is an impersonation — the `imp` claim, decoded on this server.
 *
 * Not a security check (`decodeJwt` verifies nothing; the backend refuses to complete a welcome
 * under impersonation on its own). It decides where somebody lands: the welcome belongs to the person
 * it greets, so an actor is never sent into it, and cannot spend it for them by pressing Skip.
 */
const isImpersonatingSession = async (): Promise<boolean> => {
  try {
    const token = (await cookies()).get("access_token")?.value;
    return token ? Boolean((decodeJwt(token) as { imp?: boolean }).imp) : false;
  } catch {
    return false;
  }
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
    const impersonating = await isImpersonatingSession();

    return {
      setupNeeded: setup.status === "fulfilled" && setup.value.status !== "COMPLETED",
      welcomeNeeded:
        !impersonating && settings.status === "fulfilled" && settings.value.welcomeCompletedAt === null,
      impersonating,
    };
  }
}

export const hrisFirstRunService = new HrisFirstRunService();
