import { InternalApiClient } from "@/components/clients/apiClient";

export type StartTrialPayload = {
    email: string;
    firstName: string;
    lastName: string;
    companyName: string;
    consent: boolean;
};

export type ConfirmTrialPayload = {
  token: string | null;
  password: string;
}

export class TrialService {
    constructor(private readonly apiClient: InternalApiClient) {}

    public async startTrial(payload: StartTrialPayload): Promise<Response> {
        return this.apiClient.post<Response>("/auth/register", payload);
    }

    public async confirmTrial(payload: ConfirmTrialPayload): Promise<Response> {
      return this.apiClient.post<Response>("/auth/register/confirm", payload);
    }
}
