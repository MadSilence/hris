import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { resolveBackendAssetUrl } from "@/api/modules/users/mappers/userMapper/resolveBackendAssetUrl";
import type {
  WelcomeDTO,
  CompanySetupDTO,
  CompanySetupSubmitRequest,
  SetupCountryDTO,
  UpdateUserSettingsRequest,
  UserSettingsDTO,
} from "@/api/modules/firstRun/dto";

/**
 * The two reads the app shell makes before it renders anything, and the writes behind them.
 *
 * One client for two backend areas because they answer one question — *is this session's first run
 * over* — and the gate asks both together on every app page. Splitting them would mean two modules
 * whose only caller is the same function.
 */
export class HrisApiFirstRunClient {
  public async getCompanySetup(): Promise<CompanySetupDTO> {
    return hrisApiClient.get<CompanySetupDTO>("/company-setup");
  }

  public async getSetupCountries(): Promise<SetupCountryDTO[]> {
    return hrisApiClient.get<SetupCountryDTO[]>("/company-setup/countries");
  }

  public async submitCompanySetup(body: CompanySetupSubmitRequest): Promise<CompanySetupDTO> {
    return hrisApiClient.post<CompanySetupDTO>("/company-setup", { ...body });
  }

  /**
   * The welcome, with the photo's address made absolute.
   *
   * <p>The backend answers `/uploads/<key>` — a path on **its** origin, not on this one. Returned
   * as-is it resolves against the company's own host, where nothing serves it, so the `<img>` 404s
   * and the avatar quietly falls back to initials: the upload worked, the preview never appeared.
   * Every other avatar in the product goes through this same resolver; this one was the exception.
   */
  public async getWelcome(): Promise<WelcomeDTO> {
    const dto = await hrisApiClient.get<WelcomeDTO>("/me/welcome");
    return { ...dto, avatarUrl: resolveBackendAssetUrl(dto.avatarUrl) };
  }

  public async getUserSettings(): Promise<UserSettingsDTO> {
    return hrisApiClient.get<UserSettingsDTO>("/me/settings");
  }

  public async updateUserSettings(body: UpdateUserSettingsRequest): Promise<UserSettingsDTO> {
    return hrisApiClient.put<UserSettingsDTO, UpdateUserSettingsRequest>("/me/settings", body);
  }

  /** Who a QR upload link belongs to. Peeked, never spent: opening the page is not using it. */
  public async resolveAvatarUploadToken(token: string): Promise<{ firstName: string | null; lastName: string | null }> {
    return hrisApiClient.post<{ firstName: string | null; lastName: string | null }>(
      "/public/avatar/view",
      { token },
    );
  }

  public async uploadAvatarByToken(form: FormData): Promise<{ id: string }> {
    return hrisApiClient.postForm<{ id: string }>("/public/avatar/upload", form);
  }

  public async completeWelcome(): Promise<void> {
    await hrisApiClient.post<void>("/me/welcome/complete", {});
  }
}

export const hrisApiFirstRunClient = new HrisApiFirstRunClient();
