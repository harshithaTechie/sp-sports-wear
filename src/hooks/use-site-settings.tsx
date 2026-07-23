import { useEffect, useState } from "react";
import { loadSiteSettings, type SiteSettings } from "@/lib/site.settings";

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    loadSiteSettings().then(setSettings).catch((err) => {
      console.error("Failed to load site settings:", err);
    });
  }, []);

  return settings;
}
