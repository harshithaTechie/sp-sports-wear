export const WHATSAPP_PRIMARY = "919701052073";
export const WHATSAPP_SECONDARY = "918008557844";
export const WHATSAPP_CATALOG_PRIMARY = "https://wa.me/c/919701052073";
export const WHATSAPP_CATALOG_SECONDARY = "https://wa.me/c/918008557844";

export function waLink(text: string, phone: string = WHATSAPP_PRIMARY): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function formatQuoteMessage(fields: Record<string, string | number | undefined>): string {
  const lines = ["*New Enquiry — SP Sports Wear*", ""];
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined || v === "" || v === null) continue;
    lines.push(`• *${k}:* ${v}`);
  }
  lines.push("", "Sent from spsportswear.com");
  return lines.join("\n");
}

export function generateOrderId(): string {
  const d = new Date();
  const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SP-${ym}-${rand}`;
}

