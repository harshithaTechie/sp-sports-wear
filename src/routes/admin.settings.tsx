import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { loadSiteSettings, DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/lib/site.settings";
import { saveSiteSettings } from "@/lib/site.settings.functions";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

const urlFields = [
  "google_maps_url",
  "facebook_url",
  "instagram_url",
  "youtube_url",
] as const;

type UrlField = (typeof urlFields)[number];

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7;
}

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function formatPhoneLink(value: string | null) {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits ? `tel:+${digits}` : null;
}

function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadSiteSettings()
      .then((data) => setSettings((prev) => ({ ...prev, ...data })))
      .catch((err) => {
        console.error(err);
        toast.error(err instanceof Error ? err.message : "Failed to load settings");
      })
      .finally(() => setLoading(false));
  }, []);

  function setValue<Key extends keyof SiteSettings>(key: Key, value: SiteSettings[Key]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function validate() {
    const nextErrors: Record<string, string> = {};

    if (settings.email_address && !isValidEmail(settings.email_address)) {
      nextErrors.email_address = "Enter a valid email address.";
    }

    if (settings.phone_number && !isValidPhone(settings.phone_number)) {
      nextErrors.phone_number = "Enter a valid phone number.";
    }

    if (settings.whatsapp_number && !isValidPhone(settings.whatsapp_number)) {
      nextErrors.whatsapp_number = "Enter a valid WhatsApp number.";
    }

    for (const field of urlFields) {
      const value = settings[field];
      if (value && !isValidUrl(value)) {
        nextErrors[field] = "Enter a valid URL.";
      }
    }

    return nextErrors;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted fields before saving.");
      return;
    }

    setSaving(true);

    try {
      await saveSiteSettings({ data: settings });
      toast.success("Settings saved successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage business contact details, branding, and social links from one place.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-border bg-card p-4 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="business_name">Business Name</Label>
              <Input
                id="business_name"
                value={settings.business_name ?? ""}
                onChange={(e) => setValue("business_name", e.target.value || null)}
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="business_tagline">Business Tagline</Label>
              <Input
                id="business_tagline"
                value={settings.business_tagline ?? ""}
                onChange={(e) => setValue("business_tagline", e.target.value || null)}
              />
            </div>
            <div className="space-y-3 sm:col-span-2 lg:col-span-2">
              <Label>Logo Upload</Label>
              <ImageUpload
                bucket="site-logos"
                value={settings.business_logo}
                onChange={(url) => setValue("business_logo", url)}
                label="Logo"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                value={settings.phone_number ?? ""}
                onChange={(e) => setValue("phone_number", e.target.value || null)}
              />
              {errors.phone_number ? <p className="text-sm text-destructive">{errors.phone_number}</p> : null}
            </div>
            <div className="space-y-3">
              <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
              <Input
                id="whatsapp_number"
                value={settings.whatsapp_number ?? ""}
                onChange={(e) => setValue("whatsapp_number", e.target.value || null)}
              />
              {errors.whatsapp_number ? <p className="text-sm text-destructive">{errors.whatsapp_number}</p> : null}
            </div>
            <div className="space-y-3 sm:col-span-2 lg:col-span-2">
              <Label htmlFor="email_address">Email Address</Label>
              <Input
                id="email_address"
                type="email"
                value={settings.email_address ?? ""}
                onChange={(e) => setValue("email_address", e.target.value || null)}
              />
              {errors.email_address ? <p className="text-sm text-destructive">{errors.email_address}</p> : null}
            </div>
            <div className="space-y-3 sm:col-span-2 lg:col-span-2">
              <Label htmlFor="business_address">Business Address</Label>
              <Textarea
                id="business_address"
                rows={4}
                value={settings.business_address ?? ""}
                onChange={(e) => setValue("business_address", e.target.value || null)}
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="google_maps_url">Google Maps URL</Label>
              <Input
                id="google_maps_url"
                value={settings.google_maps_url ?? ""}
                onChange={(e) => setValue("google_maps_url", e.target.value || null)}
              />
              {errors.google_maps_url ? <p className="text-sm text-destructive">{errors.google_maps_url}</p> : null}
            </div>
            <div className="space-y-3">
              <Label htmlFor="facebook_url">Facebook URL</Label>
              <Input
                id="facebook_url"
                value={settings.facebook_url ?? ""}
                onChange={(e) => setValue("facebook_url", e.target.value || null)}
              />
              {errors.facebook_url ? <p className="text-sm text-destructive">{errors.facebook_url}</p> : null}
            </div>
            <div className="space-y-3">
              <Label htmlFor="instagram_url">Instagram URL</Label>
              <Input
                id="instagram_url"
                value={settings.instagram_url ?? ""}
                onChange={(e) => setValue("instagram_url", e.target.value || null)}
              />
              {errors.instagram_url ? <p className="text-sm text-destructive">{errors.instagram_url}</p> : null}
            </div>
            <div className="space-y-3">
              <Label htmlFor="youtube_url">YouTube URL</Label>
              <Input
                id="youtube_url"
                value={settings.youtube_url ?? ""}
                onChange={(e) => setValue("youtube_url", e.target.value || null)}
              />
              {errors.youtube_url ? <p className="text-sm text-destructive">{errors.youtube_url}</p> : null}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button type="submit" disabled={loading || saving}>
              {loading ? "Loading…" : saving ? "Saving…" : "Save Settings"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
