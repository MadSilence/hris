import type { PublicHolidayTemplate, PublicHolidayTemplatePreview } from "@/models/publicHolidays/template";

export class PublicHolidayTemplatesService {
  public async list(): Promise<PublicHolidayTemplate[]> {
    const res = await fetch("/api/public-holiday-templates", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to load public holiday templates");
    }

    return res.json();
  }

  public async getById(id: string): Promise<PublicHolidayTemplate> {
    const res = await fetch(`/api/public-holiday-templates/${id}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to load public holiday template");
    }

    return res.json();
  }

  public async preview(
    id: string,
    year: number
  ): Promise<PublicHolidayTemplatePreview> {
    const res = await fetch(`/api/public-holiday-templates/${id}/preview`, {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ year }),
    });

    if (!res.ok) {
      throw new Error("Failed to preview public holiday template");
    }

    return res.json();
  }
}

export const publicHolidayTemplatesService =
  new PublicHolidayTemplatesService();
