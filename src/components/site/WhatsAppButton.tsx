import { waLink } from "@/lib/whatsapp";
import { useSiteSettings } from "@/hooks/use-site-settings";

export function WhatsAppButton() {
  const settings = useSiteSettings();
  const whatsappNumber = settings?.whatsapp_number?.trim() || settings?.phone_number?.trim() || "919701052073";
  const whatsappPhone = whatsappNumber.replace(/\D/g, "");

  return (
    <a
      href={waLink("Hi SP Sports Wear, I'd like to know more about custom jerseys.", whatsappPhone)}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-whatsapp px-4 py-3 md:px-5 md:py-3.5 text-white shadow-elevated hover:scale-105 transition-transform"
    >
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-6 w-6 fill-current">
        <path d="M19.11 17.29c-.28-.14-1.66-.82-1.92-.91-.26-.09-.45-.14-.63.14-.19.28-.72.91-.88 1.1-.16.19-.32.21-.6.07-.28-.14-1.18-.43-2.24-1.38-.83-.74-1.38-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.32.42-.48.14-.16.19-.28.28-.46.09-.19.05-.35-.02-.49-.07-.14-.63-1.52-.86-2.08-.23-.55-.46-.47-.63-.48h-.54c-.19 0-.49.07-.75.35s-.98.96-.98 2.34.99 2.71 1.13 2.9c.14.19 1.98 3.02 4.79 4.24.67.29 1.19.46 1.6.59.67.21 1.28.18 1.77.11.54-.08 1.66-.68 1.9-1.34.24-.66.24-1.22.17-1.34-.07-.12-.26-.19-.54-.33Z" />
        <path d="M27.16 4.87A15.87 15.87 0 0 0 4.05 25.9l-2 7.29 7.47-1.96A15.87 15.87 0 1 0 27.16 4.87Zm-11.14 24.4a13.2 13.2 0 0 1-6.72-1.84l-.48-.29-4.44 1.17 1.18-4.32-.31-.5a13.2 13.2 0 1 1 10.77 5.78Z" />
      </svg>
      <span className="text-sm font-semibold whitespace-nowrap">Chat with Us</span>
    </a>
  );
}
