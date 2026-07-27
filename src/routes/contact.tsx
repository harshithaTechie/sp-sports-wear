import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { Section } from "@/components/site/Section";
import { loadSiteSettings, type SiteSettings } from "@/lib/site.settings";
import { formatQuoteMessage, generateOrderId, waLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact SP Sports Wear — Andhra Pradesh, India" },
      { name: "description", content: "Get in touch with SP Sports Wear. Phone, WhatsApp, email and address for custom sportswear enquiries." },
      { property: "og:title", content: "Contact SP Sports Wear" },
      { property: "og:description", content: "Reach us on WhatsApp, phone or email for custom sportswear enquiries." },
    ],
  }),
  component: Contact,
});

const ADDRESS =
  "Door No. 1-233-2, Koti Centre, Gullapalli (Arumbaka Village), Cherukupalli Mandal, Bapatla District, Andhra Pradesh, India";
const MAP_QUERY = encodeURIComponent("Gullapalli Arumbaka Cherukupalli Bapatla Andhra Pradesh");

function Contact() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [f, setF] = useState({ name: "", phone: "", email: "", subject: "", message: "" });

  useEffect(() => {
    loadSiteSettings().then(setSettings).catch((err) => console.error(err));
  }, []);

  function set<K extends keyof typeof f>(k: K, v: string) {
    setF((prev) => ({ ...prev, [k]: v }));
  }
  const resolvedPhone = settings?.phone_number?.trim() || null;
  const resolvedWhatsapp = settings?.whatsapp_number?.trim() || settings?.phone_number?.trim() || null;
  const resolvedEmail = settings?.email_address?.trim() || null;
  const phoneNumberDisplay = resolvedPhone ? `+${resolvedPhone.replace(/\D/g, "")}` : null;
  const whatsappNumberDisplay = resolvedWhatsapp ? `+${resolvedWhatsapp.replace(/\D/g, "")}` : null;
  const phoneHref = resolvedPhone ? `tel:+${resolvedPhone.replace(/\D/g, "")}` : undefined;
  const whatsappHref = resolvedWhatsapp ? `https://wa.me/${resolvedWhatsapp.replace(/\D/g, "")}` : undefined;
  const emailHref = resolvedEmail ? `mailto:${resolvedEmail}` : undefined;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name || !f.phone) return;
    const id = generateOrderId();
    const msg = formatQuoteMessage({
      "Enquiry Type": "Contact Form",
      "Ref ID": id,
      Name: f.name,
      Phone: f.phone,
      Email: f.email,
      Subject: f.subject,
      Message: f.message,
    });
    if (resolvedWhatsapp) {
      window.open(waLink(msg, resolvedWhatsapp.replace(/\D/g, "")), "_blank");
    }
    navigate({ to: "/thank-you", search: { id } });
  }

  return (
    <>
      <section className="bg-navy text-white">
        <div className="container-x py-12 sm:py-14 md:py-20">
          <span className="eyebrow text-orange">Contact</span>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl font-bold text-balance">Let's build your team's next kit.</h1>
          <p className="mt-4 max-w-2xl text-white/75 text-sm sm:text-base">
            Reach us on WhatsApp for the fastest response, or send us an enquiry — our team
            typically replies within a few hours.
          </p>
        </div>
      </section>

      <Section>
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-4">
            {[
              { icon: MapPin, title: "Visit Us", value: ADDRESS, href: null as string | null },
              ...(resolvedPhone
                ? [{ icon: Phone, title: "Call Us", value: phoneNumberDisplay!, href: phoneHref! }]
                : []),
              ...(resolvedWhatsapp
                ? [{ icon: MessageCircle, title: "WhatsApp", value: whatsappNumberDisplay!, href: whatsappHref! }]
                : []),
              ...(resolvedEmail
                ? [{ icon: Mail, title: "Email", value: resolvedEmail, href: emailHref! }]
                : []),
              { icon: Clock, title: "Business Hours", value: "Mon – Sat · 9:00 AM to 8:00 PM", href: null },
            ].map((c) => (
              <div key={c.title} className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/5 text-secondary shrink-0">
                  <c.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-primary">{c.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground break-words">
                    {c.href ? (
                      <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="hover:text-orange transition-colors">{c.value}</a>
                    ) : c.value}
                  </div>
                </div>
              </div>
            ))}
            {resolvedWhatsapp ? (
              <a
                href={waLink("Hi SP Sports Wear!", resolvedWhatsapp.replace(/\D/g, ""))}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl bg-whatsapp text-white p-4 font-semibold shadow-elevated hover:brightness-110 transition"
              >
                <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
              </a>
            ) : null}
          </div>

          <form onSubmit={submit} className="lg:col-span-3 grid gap-4 rounded-2xl border border-border bg-card p-6 md:p-8 shadow-card md:grid-cols-2">
            <Field label="Name *"><input required value={f.name} onChange={(e) => set("name", e.target.value)} className="input" /></Field>
            <Field label="Phone / WhatsApp *"><input required value={f.phone} onChange={(e) => set("phone", e.target.value)} className="input" /></Field>
            <Field label="Email"><input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} className="input" /></Field>
            <Field label="Subject"><input value={f.subject} onChange={(e) => set("subject", e.target.value)} className="input" /></Field>
            <label className="md:col-span-2 flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-primary">Your Message</span>
              <textarea value={f.message} onChange={(e) => set("message", e.target.value)} rows={5} className="input py-2" />
            </label>
            <button type="submit" className="md:col-span-2 inline-flex items-center justify-center gap-2 rounded-md bg-accent-gradient px-6 py-3.5 text-sm font-semibold text-white shadow-glow hover:brightness-110 transition">
              <MessageCircle className="h-4 w-4" /> Send Enquiry
            </button>
          </form>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-border">
          <iframe
            title="SP Sports Wear location"
            src={`https://www.google.com/maps?q=${MAP_QUERY}&output=embed`}
            width="100%"
            height="400"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full"
          />
        </div>
      </Section>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-primary">{label}</span>
      {children}
    </label>
  );
}
