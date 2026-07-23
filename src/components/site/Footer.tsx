import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Youtube } from "lucide-react";
import { WHATSAPP_CATALOG_PRIMARY, WHATSAPP_CATALOG_SECONDARY } from "@/lib/whatsapp";
import { loadSiteSettings, type SiteSettings } from "@/lib/site.settings";
import spLogo from "@/assets/sp-logo.png";


export function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    loadSiteSettings()
      .then(setSettings)
      .catch((err) => console.error(err));
  }, []);

  const logoSrc = settings?.business_logo || spLogo;
  const businessName = settings?.business_name || "SP Sports Wear";
  const businessTagline = settings?.business_tagline || "Custom Manufacturing";
  const address = settings?.business_address ||
    "Door No. 1-233-2, Koti Centre, Gullapalli (Arumbaka Village), Cherukupalli Mandal, Bapatla District, Andhra Pradesh, India";
  const email = settings?.email_address?.trim() || null;
  const phone = settings?.phone_number?.trim() || null;
  const whatsapp = settings?.whatsapp_number?.trim() || settings?.phone_number?.trim() || null;
  const phoneLink = phone ? `tel:+${phone.replace(/\D/g, "")}` : undefined;
  const whatsappLink = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, "")}` : undefined;
  const mapsLink = settings?.google_maps_url || "#";
  const facebookLink = settings?.facebook_url || "https://www.facebook.com/share/1L84KS34DJ/";
  const instagramLink = settings?.instagram_url || "https://www.instagram.com/sp_sports_wear__cherukupalli";
  const youtubeLink = settings?.youtube_url || "https://www.youtube.com/@chandrasekharseelam2864";
  const emailHref = email ? `mailto:${email}` : undefined;

  return (
    <footer className="bg-navy text-navy-foreground">
      <div className="container-x pt-16 pb-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <img
                src={logoSrc}
                alt={`${businessName} logo`}
                className="h-12 w-12 object-contain bg-white/95 rounded-lg p-1"
              />
              <div>
                <div className="font-display text-lg font-bold">{businessName}</div>
                <div className="text-[10px] uppercase tracking-widest text-white/60">
                  {businessTagline}
                </div>
              </div>
            </div>
            <p className="mt-5 text-sm text-white/75 max-w-xs">
              Premium custom sportswear manufactured in • Andhra Pradesh & Telangana for schools, colleges, clubs,
              academies, corporates, tournaments and events.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a aria-label="Facebook" href={facebookLink} target="_blank" rel="noopener noreferrer" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-orange transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a aria-label="Instagram" href={instagramLink} target="_blank" rel="noopener noreferrer" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-orange transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a aria-label="YouTube" href={youtubeLink} target="_blank" rel="noopener noreferrer" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-orange transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
              {email ? (
                <a aria-label="Email" href={emailHref} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-orange transition-colors">
                  <Mail className="h-4 w-4" />
                </a>
              ) : null}
              {whatsappLink ? (
                <a aria-label="WhatsApp" href={whatsappLink} target="_blank" rel="noopener noreferrer" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-orange transition-colors">
                  <MessageCircle className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Quick Links</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/75">
              <li><Link to="/products" className="hover:text-orange transition-colors">Designs</Link></li>
              <li><Link to="/customize" className="hover:text-orange transition-colors">Customize Jersey</Link></li>
              <li><Link to="/gallery" className="hover:text-orange transition-colors">Design Collection</Link></li>
              <li><Link to="/previous-works" className="hover:text-orange transition-colors">Previous Work</Link></li>
              <li><Link to="/dealer-registration" className="hover:text-orange transition-colors">Dealer Registration</Link></li>
              <li><Link to="/track-order" className="hover:text-orange transition-colors">Track Order</Link></li>
              <li><Link to="/about" className="hover:text-orange transition-colors">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Catalogs</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/75">
              <li>
                <a href={WHATSAPP_CATALOG_PRIMARY} target="_blank" rel="noreferrer" className="hover:text-orange transition-colors">
                  WhatsApp Catalog 1
                </a>
              </li>
              <li>
                <a href={WHATSAPP_CATALOG_SECONDARY} target="_blank" rel="noreferrer" className="hover:text-orange transition-colors">
                  WhatsApp Catalog 2
                </a>
              </li>
              <li><Link to="/contact" className="hover:text-orange transition-colors">Bulk Enquiry</Link></li>
              <li><a href="#" className="hover:text-orange transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-orange transition-colors">Terms & Conditions</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Contact</h4>
            <ul className="mt-4 space-y-3 text-sm text-white/75">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-orange" />
                <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="hover:text-orange transition-colors">
                  {address}
                </a>
              </li>
              {phone ? (
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-orange" />
                  <a href={phoneLink} className="hover:text-orange transition-colors">
                    {phone}
                  </a>
                </li>
              ) : null}
              {email ? (
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-orange shrink-0" />
                  <a href={emailHref} className="hover:text-orange transition-colors break-all">
                    {email}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/60">
          <p>© {new Date().getFullYear()} {businessName}. All rights reserved.</p>
          <p>Custom sportswear manufacturers · Made in India</p>
        </div>
      </div>
    </footer>
  );
}
