import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Section } from "@/components/site/Section";
import { submitDealerRequest } from "@/lib/dealer.functions";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { formatQuoteMessage, generateOrderId, waLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/dealer-registration")({
  head: () => ({
    meta: [
      { title: "Dealer Registration — SP Sports Wear" },
      { name: "description", content: "Become an SP Sports Wear dealer or distributor. Register your business to unlock reseller pricing and priority support." },
      { property: "og:title", content: "Become a Dealer — SP Sports Wear" },
      { property: "og:description", content: "Dealer & distributor partnerships across India." },
    ],
  }),
  component: Dealer,
});

function Dealer() {
  const navigate = useNavigate();
  const settings = useSiteSettings();
  const [f, setF] = useState({
    business: "",
    gst: "",
    contact: "",
    phone: "",
    email: "",
    city: "",
    state: "",
    experience: "",
    notes: "",
  });

  function set<K extends keyof typeof f>(k: K, v: string) {
    setF((prev) => ({ ...prev, [k]: v }));
  }

  const resolvedWhatsapp = settings?.whatsapp_number?.trim() || settings?.phone_number?.trim() || "919701052073";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.business || !f.phone) return;
    try {
      await submitDealerRequest({
        data: {
          business: f.business,
          gst: f.gst,
          contact: f.contact,
          phone: f.phone,
          email: f.email,
          city: f.city,
          state: f.state,
          experience: f.experience,
          notes: f.notes,
        },
      });
    } catch {
      // still open WhatsApp even if DB save fails
    }
    const orderId = generateOrderId();
    const msg = formatQuoteMessage({
      "Enquiry Type": "Dealer Registration",
      "Ref ID": orderId,
      "Business Name": f.business,
      GST: f.gst,
      "Contact Person": f.contact,
      Phone: f.phone,
      Email: f.email,
      City: f.city,
      State: f.state,
      Experience: f.experience,
      Notes: f.notes,
    });
    window.open(waLink(msg, resolvedWhatsapp.replace(/\D/g, "")), "_blank");
    navigate({ to: "/thank-you", search: { id: orderId } });
  }

  return (
    <>
      <section className="bg-hero-gradient text-white">
        <div className="container-x py-14 md:py-20 grid gap-8 md:grid-cols-2 items-center">
          <div>
            <span className="eyebrow text-orange">Partner With Us</span>
            <h1 className="mt-3 font-display text-4xl md:text-5xl font-bold">
              Become an SP Sports Wear dealer.
            </h1>
            <p className="mt-4 text-white/80 max-w-xl">
              Grow your sportswear business with reseller pricing, marketing support and
              priority production for your team clients.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-white/85">
              <li>· Attractive reseller margins</li>
              <li>· Marketing catalogs & samples</li>
              <li>· Dedicated production coordinator</li>
              <li>· Andhra Pradesh & Telangana territory support</li>

            </ul>
          </div>
          <div className="hidden md:flex justify-end">
            <div className="grid h-40 w-40 place-items-center rounded-full bg-white/10 backdrop-blur border border-white/20">
              <Building2 className="h-16 w-16 text-orange" />
            </div>
          </div>
        </div>
      </section>

      <Section eyebrow="Dealer Application" title="Tell us about your business.">
        <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-border bg-card p-6 md:p-8 shadow-card md:grid-cols-2">
          <Field label="Business Name *"><input required value={f.business} onChange={(e) => set("business", e.target.value)} className="input" /></Field>
          <Field label="GST Number"><input value={f.gst} onChange={(e) => set("gst", e.target.value)} className="input" /></Field>
          <Field label="Contact Person"><input value={f.contact} onChange={(e) => set("contact", e.target.value)} className="input" /></Field>
          <Field label="Phone / WhatsApp *"><input required value={f.phone} onChange={(e) => set("phone", e.target.value)} className="input" /></Field>
          <Field label="Email"><input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} className="input" /></Field>
          <Field label="City"><input value={f.city} onChange={(e) => set("city", e.target.value)} className="input" /></Field>
          <Field label="State"><input value={f.state} onChange={(e) => set("state", e.target.value)} className="input" /></Field>
          <Field label="Years in Sportswear / Retail"><input value={f.experience} onChange={(e) => set("experience", e.target.value)} className="input" /></Field>
          <label className="md:col-span-2 flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-primary">Anything else we should know?</span>
            <textarea value={f.notes} onChange={(e) => set("notes", e.target.value)} rows={4} className="input py-2" />
          </label>
          <button type="submit" className="md:col-span-2 mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-accent-gradient px-6 py-3.5 text-sm font-semibold text-white shadow-glow hover:brightness-110 transition">
            <MessageCircle className="h-4 w-4" /> Submit Application
          </button>
        </form>
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
