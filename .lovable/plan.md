
# SP Sports Wear — Build Plan

This is a large project (public marketing site + product catalog + custom jersey designer + quotation ordering + order tracking + full admin dashboard). To keep quality high and avoid a shallow "AI template" feel, I'll build it in **4 phases**. Each phase is shippable on its own — you can review and give feedback between phases.

---

## Phase 1 — Brand foundation + Public site (this turn)

Goal: A polished, trustworthy public website that already looks like a real sportswear manufacturer brand.

**Design system**
- Navy `#0B1F3A`, Royal `#1E40AF`, Orange `#FF6B00`, white base, `#F8FAFC` surfaces, `#1F2937` text — all wired as oklch tokens in `src/styles.css`.
- Poppins (headings) + Inter (body) via `<link>` in root head.
- Custom button variants (hero, cta, outline-on-dark), card, badge, section shells — no ad-hoc color classes in components.
- WhatsApp floating button, sticky nav, premium footer.

**Pages (routes)**
- `/` Home — hero, stat strip, featured categories, process (6 steps), why choose us, clients strip, gallery preview, testimonials, FAQ, CTA band.
- `/about` — story, mission, vision, quality promise.
- `/products` — grid of 16 categories with filter + search (static data for now).
- `/products/$slug` — detail page (gallery, fabric, sizes, colors, MOQ, "Request a Quote" — no prices).
- `/customize` — Custom Jersey Designer form (product, color, collar, sleeve, fabric, sizes, quantity, team/player names, numbers, logo upload, notes, live summary). Submits to WhatsApp with full details.
- `/gallery` — masonry gallery of previous work.
- `/previous-works` — case-study style cards by segment (schools/colleges/clubs/corporate/events).
- `/dealer-registration` — form → WhatsApp.
- `/contact` — map embed, WhatsApp, phone, email, hours, inquiry form.
- `/track-order` — enter Order ID or mobile → timeline UI (Phase 2 wires real data).
- SEO: per-route `head()` with unique title/description/OG, sitemap.xml route, robots.txt.

**Data**: Product catalog + gallery seeded as typed TS data so pages render immediately. Later moved to DB in Phase 2.

**Submissions**: All forms open `https://wa.me/919701052073` with a pre-filled message containing every field. Also stored to DB in Phase 2.

---

## Phase 2 — Lovable Cloud + real order/quotation system

- Enable Lovable Cloud (Postgres + auth + storage).
- Tables: `products`, `categories`, `gallery_items`, `orders`, `order_items`, `dealer_requests`, `contact_inquiries`, `testimonials`, `quotations`, `order_status_events`, `site_content`, `user_roles`.
- Custom Jersey / Product inquiry / Dealer form / Contact form all persist + still fire WhatsApp.
- Auto-generate human Order ID (`SP-YYYYMM-####`).
- Logo upload → Supabase Storage bucket.
- `/track-order` reads real timeline from `order_status_events`.
- Thank-you page after submission.

## Phase 3 — Admin dashboard

- Auth (email/password) + `admin` role via `user_roles` table + `has_role()` RPC (secure pattern — no client-side role storage).
- `/admin` protected via `_authenticated/_admin` layout.
- Sections: Dashboard KPIs, Orders (list + detail + status timeline), Quotation builder (fabric/print/product/shipping/GST/discount → total, send via WhatsApp), Kanban production board (drag-drop across 11 stages), Products CRUD, Categories, Gallery, Reviews (approve), Dealer Requests, Website CMS (hero/about/FAQ/testimonials/contact), Settings.

## Phase 4 — Polish + performance

- Image optimization + lazy loading, code splitting per route, JSON-LD (`Organization`, `Product`), OG images per key page, motion polish (subtle fade/parallax), Lighthouse pass, accessibility sweep.

---

## Technical notes

- Stack: TanStack Start (already set up) + Tailwind v4 + shadcn + TanStack Query. Lovable Cloud (Supabase) added in Phase 2.
- Ordering is **quotation-based** everywhere — no cart, no prices, no checkout.
- WhatsApp numbers used: `+91 97010 52073` and `+91 80085 57844` (catalog links as specified).
- Placeholder imagery: I'll generate a small set of premium sports photography-style images (jersey flatlays, athletes in action, factory/production shots) sized for hero/cards, structured so you can swap in real product photos later by replacing the files.

---

**Proceeding now with Phase 1.** After it's live, tell me to continue and I'll enable Cloud and build Phase 2.
