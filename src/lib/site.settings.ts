import { supabase } from "@/integrations/supabase/client";

export const SITE_SETTINGS_KEYS = [
  "business_name",
  "business_tagline",
  "business_logo",
  "phone_number",
  "whatsapp_number",
  "email_address",
  "business_address",
  "google_maps_url",
  "facebook_url",
  "instagram_url",
  "youtube_url",
] as const;

export type SiteSettingsKey = (typeof SITE_SETTINGS_KEYS)[number];

export type SiteSettings = {
  business_name: string | null;
  business_tagline: string | null;
  business_logo: string | null;
  phone_number: string | null;
  whatsapp_number: string | null;
  email_address: string | null;
  business_address: string | null;
  google_maps_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  business_name: null,
  business_tagline: null,
  business_logo: null,
  phone_number: null,
  whatsapp_number: null,
  email_address: null,
  business_address: null,
  google_maps_url: null,
  facebook_url: null,
  instagram_url: null,
  youtube_url: null,
};

export function parseSiteSettings(rows: Array<{ key: string; content: string | null; image_url: string | null }>): SiteSettings {
  const settings: Record<string, string | null> = {
    business_name: null,
    business_tagline: null,
    business_logo: null,
    phone_number: null,
    whatsapp_number: null,
    email_address: null,
    business_address: null,
    google_maps_url: null,
    facebook_url: null,
    instagram_url: null,
    youtube_url: null,
  };

  for (const row of rows ?? []) {
    if (row.key === "business_logo") {
      settings[row.key] = row.image_url ?? null;
    } else {
      settings[row.key] = row.content ?? null;
    }
  }

  return settings as SiteSettings;
}

export async function loadSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from("site_content")
    .select("key, content, image_url")
    .in("key", SITE_SETTINGS_KEYS as readonly string[]);

  if (error) {
    throw new Error(error.message);
  }

  return parseSiteSettings(data ?? []);
}
