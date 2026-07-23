import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { SITE_SETTINGS_KEYS, type SiteSettings } from "@/lib/site.settings";

const siteSettingsSchema = z.record(
  z.enum(SITE_SETTINGS_KEYS as readonly [
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
  ]),
  z.string().nullable(),
);

export const saveSiteSettings = createServerFn({ method: "POST" })
  .validator((data) => siteSettingsSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const operations = Object.entries(data).map(([key, value]) => {
      const payload: Record<string, unknown> = {
        key,
        section: "settings",
        title: key,
        sort_order: 0,
      };

      if (key === "business_logo") {
        payload.image_url = value;
      } else {
        payload.content = value;
      }

      return supabaseAdmin
        .from("site_content")
        .upsert(payload, { onConflict: ["key"] });
    });

    const results = await Promise.all(operations);
    const error = results.find((r) => r.error)?.error;
    if (error) throw new Error(error.message);
    return { success: true };
  });
