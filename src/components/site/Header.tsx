import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Phone, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { waLink } from "@/lib/whatsapp";
import { useSiteSettings } from "@/hooks/use-site-settings";
import spLogo from "@/assets/sp-logo-square.png";


const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/products", label: "Designs" },
  { to: "/gallery", label: "Design Collection" },
  { to: "/track-order", label: "Track Order" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const settings = useSiteSettings();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const phone = settings?.phone_number?.trim() || null;
  const resolvedWhatsapp = settings?.whatsapp_number?.trim() || settings?.phone_number?.trim() || null;
  const digits = phone?.replace(/\D/g, "");

 const phoneLink = digits
   ? `tel:${digits.startsWith("91") ? "+" + digits : "+91" + digits}`
   : undefined;
  const whatsappLink = resolvedWhatsapp
    ? waLink("Hi SP Sports Wear, I'd like to enquire about custom jerseys.", resolvedWhatsapp.replace(/\D/g, ""))
    : undefined;
  const logoSrc = settings?.business_logo || spLogo;
  const businessName = settings?.business_name || "SP Sports Wear";
  const tagline = settings?.business_tagline || "Premium Sportswear Manufacturer";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-lg">
      {/* Top strip */}
      <div className="bg-navy text-navy-foreground text-xs">
        <div className="container-x flex h-9 items-center justify-between">
          <span className="hidden sm:block opacity-90">
            Manufacturing custom sportswear across India — MOQ 10 pieces
          </span>
          <div className="flex items-center gap-4 ml-auto">
            {phone ? (
              <a href={phoneLink} className="flex items-center gap-1.5 hover:text-orange transition-colors">
                <Phone className="h-3.5 w-3.5" />
                {phone}
              </a>
            ) : null}
            {whatsappLink ? (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline text-orange font-medium"
              >
                Chat on WhatsApp →
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div className="container-x flex h-[72px] md:h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <img
            src={logoSrc}
            alt={`${businessName} logo`}
            className="h-10 w-10 md:h-12 md:w-12 object-contain bg-transparent"
          />
          <div className="leading-tight">
            <div className="font-display text-base md:text-lg font-bold text-primary">{businessName}</div>
            <div className="text-[11px] font-medium text-orange mt-0.5">Cherukupalli</div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mt-1.5">
              {tagline}
            </div>
          </div>
        </Link>


        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((n) => {
            const active = pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  active
                    ? "text-primary bg-muted"
                    : "text-foreground/75 hover:text-primary hover:bg-muted",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <Link
            to="/customize"
            className="inline-flex items-center rounded-md bg-accent-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-glow hover:brightness-110 transition"
          >
            Request Quote
          </Link>
        </div>

        <button
          className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-md border border-border"
          aria-label="Open menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="container-x py-3 flex flex-col">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "py-2.5 text-sm font-medium",
                  pathname === n.to ? "text-primary" : "text-foreground/80",
                )}
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/customize"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex justify-center rounded-md bg-accent-gradient px-4 py-3 text-sm font-semibold text-white"
            >
              Request Quote
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
