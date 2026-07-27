import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { Check, Loader2, MessageCircle, Upload, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Section } from "@/components/site/Section";
import { submitQuotationRequest } from "@/lib/orders.functions";
import { uploadFileServer } from "@/lib/upload.functions";
import { getProductBySlug } from "@/lib/catalog.functions";

export const Route = createFileRoute("/customize")({
  validateSearch: (search: Record<string, unknown>) => ({
    designSlug: typeof search.designSlug === "string" ? search.designSlug : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Custom Jersey Designer — SP Sports Wear" },
      {
        name: "description",
        content:
          "Design your own custom jersey — pick product, colors, collar, sleeves, fabric, sizes and quantity. Submit and get a quotation through the contact details you provide.",
      },
      { property: "og:title", content: "Custom Jersey Designer" },
      { property: "og:description", content: "Build your team kit and get a custom quote." },
    ],
  }),
  component: Customize,
});

const CATEGORIES = [
  "Jerseys",
  "Tracksuits",
  "Shorts",
  "Lowers",
  "Sleeveless T-Shirts",
  "Caps",
  "Flags",
] as const;
const JERSEY_COLLECTIONS = ["Schools & Colleges", "Players & Teams", "Events (Festivals)"] as const;
const COLLARS = ["Round Neck", "V Neck", "Polo Collar", "Chinese Neck"];
const SLEEVES = ["Half Sleeve", "Full Sleeve", "Sleeveless"];
const FABRICS = [
  "Micro Polyester",
  "Honeycomb",
  "Lycra",
  "Poly Cotton",
  "IP",
  "Dot Net",
  "Nirmal Net",
  "Rebug Net",
  "Matte",
  "Selena",
  "VR Net",
];
type ProductCategory = (typeof CATEGORIES)[number];
const PRODUCT_SIZE_OPTIONS: Record<ProductCategory, readonly string[]> = {
  Jerseys: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
  Tracksuits: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
  Shorts: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
  Lowers: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
  "Sleeveless T-Shirts": ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
  Caps: ["Kids", "Adult", "Free Size"],
  Flags: ["2x3 ft", "3x5 ft", "4x6 ft", "Custom Size"],
};

function createSizeMap(sizeLabels: readonly string[]) {
  return Object.fromEntries(sizeLabels.map((size) => [size, 0])) as Record<string, number>;
}

function Customize() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/customize" });
  const [selectedDesign, setSelectedDesign] = useState<any>(null);
  const [loadingDesign, setLoadingDesign] = useState(false);
  const [product, setProduct] = useState<ProductCategory>(CATEGORIES[0]);
  const [jerseyCollection, setJerseyCollection] = useState<string>(JERSEY_COLLECTIONS[0]);
  const [color, setColor] = useState("Navy Blue");
  const [collar, setCollar] = useState(COLLARS[0]);
  const [sleeve, setSleeve] = useState(SLEEVES[0]);
  const [fabric, setFabric] = useState(FABRICS[0]);
  const [sizes, setSizes] = useState<Record<string, number>>(() => createSizeMap(PRODUCT_SIZE_OPTIONS[CATEGORIES[0]]));
  const [teamName, setTeamName] = useState("");
  const [players, setPlayers] = useState("");
  const [sponsor, setSponsor] = useState("");
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [email, setEmail] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [logoName, setLogoName] = useState("");

  useEffect(() => {
    async function loadDesign() {
      if (search.designSlug) {
        setLoadingDesign(true);
        try {
          const result = await getProductBySlug({ data: { slug: search.designSlug } });
          if (result?.product) {
            setSelectedDesign(result.product);
            // Pre-fill form with design data
            if (result.product.category?.name) {
              const categoryName = result.product.category.name;
              const categoryMatch = CATEGORIES.find(c => 
                categoryName.toLowerCase().includes(c.toLowerCase()) ||
                c.toLowerCase().includes(categoryName.toLowerCase())
              );
              if (categoryMatch) setProduct(categoryMatch as ProductCategory);
            }
            if (result.product.colors?.[0]) setColor(result.product.colors[0]);
            if (result.product.fabric?.[0]) setFabric(result.product.fabric[0]);
            if (result.product.collar_types?.[0]) setCollar(result.product.collar_types[0]);
            if (result.product.sleeve_types?.[0]) setSleeve(result.product.sleeve_types[0]);
          }
        } catch (err) {
          console.error("Failed to load design:", err);
        } finally {
          setLoadingDesign(false);
        }
      }
    }
    loadDesign();
  }, [search.designSlug]);

  async function handleLogoUpload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setLogoName(file.name);
    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(",")[1];
          resolve(base64);
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

      const res = await uploadFileServer({
        data: {
          bucket: "logos",
          fileName: file.name,
          fileType: file.type,
          base64Data,
        },
      });
      setLogoUrl(res.publicUrl);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Logo upload failed");
      setLogoName("");
    } finally {
      setUploading(false);
    }
  }

  const sizeOptions = useMemo(() => PRODUCT_SIZE_OPTIONS[product], [product]);
  const showCollar = product === "Jerseys";
  const showSleeve = product === "Jerseys";
  const showFabric = !["Caps", "Flags"].includes(product);

  useEffect(() => {
    setSizes((prev) => {
      const nextSizes = createSizeMap(sizeOptions);
      sizeOptions.forEach((size) => {
        nextSizes[size] = prev[size] ?? 0;
      });
      return nextSizes;
    });
  }, [sizeOptions]);

  const total = useMemo(
    () => Object.values(sizes).reduce((a, b) => a + (Number(b) || 0), 0),
    [sizes],
  );
  const isMinimumOrder = total >= 10;
  const sanitizedPhone = phone.trim().replace(/[^0-9]/g, "");
  const isPhoneValid = sanitizedPhone.length === 10;
  const showPhoneError = phoneTouched && !isPhoneValid;

  function updateSize(label: string, value: string) {
    const sanitized = value.replace(/[^0-9]/g, "");
    const quantity = sanitized ? parseInt(sanitized, 10) : 0;
    setSizes((prev) => ({ ...prev, [label]: quantity }));
  }

  function handlePhoneInput(value: string) {
    const digits = value.replace(/[^0-9]/g, "").slice(0, 10);
    setPhone(digits);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPhone((prev) => prev.trim());
    setPhoneTouched(true);
    if (total < 10) {
      alert("Minimum order is 10 pieces. Please increase your size quantities.");
      return;
    }
    if (!name) {
      alert("Please share your name.");
      return;
    }
    if (!isPhoneValid) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }
    const productLabel = product === "Jerseys" ? `Jerseys — ${jerseyCollection}` : product;
    try {
      const result = await submitQuotationRequest({
        data: {
          product: productLabel,
          color,
          collar,
          sleeve,
          fabric,
          sizes,
          teamName,
          players,
          sponsor,
          notes,
          name,
          phone,
          email,
          logoUrl,
          designId: selectedDesign?.id ?? null,
        },
      });
      navigate({ to: "/thank-you", search: { id: result.quotationId } });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong saving your order. Please try again.");
    }
  }

  return (
    <>
      <section className="bg-navy text-white">
        <div className="container-x py-12 sm:py-14 md:py-20">
          <span className="eyebrow text-orange">Custom Jersey Designer</span>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl font-bold text-balance">
            Build your kit. Send us the brief.
          </h1>
          <p className="mt-4 max-w-2xl text-white/75 text-sm sm:text-base">
            Configure your product, colors and quantities. Submit the form and our team will review your request and send a quotation to your contact details within 24 hours.
          </p>
        </div>
      </section>

      {/* Selected Design Image */}
      {loadingDesign ? (
        <Section>
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-card">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </div>
        </Section>
      ) : selectedDesign ? (
        <Section>
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-orange">Selected Design</span>
                <h2 className="mt-1 font-display text-lg sm:text-xl font-bold text-primary">{selectedDesign.name}</h2>
                {selectedDesign.category?.name && (
                  <p className="mt-1 text-sm text-muted-foreground">{selectedDesign.category.name}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedDesign(null);
                  navigate({ to: "/customize", search: { designSlug: undefined } });
                }}
                className="p-2 rounded-md hover:bg-surface text-muted-foreground hover:text-foreground transition self-start sm:self-auto"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="aspect-video overflow-hidden rounded-xl bg-surface">
              {selectedDesign.images?.[0] || selectedDesign.image_url ? (
                <img
                  src={selectedDesign.images?.[0] || selectedDesign.image_url}
                  alt={selectedDesign.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  No image available
                </div>
              )}
            </div>
            {selectedDesign.short_description && (
              <p className="mt-4 text-sm text-muted-foreground">{selectedDesign.short_description}</p>
            )}
          </div>
        </Section>
      ) : null}

      <Section>
        <form onSubmit={submit} className="grid gap-6 lg:gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Product */}
            <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-card">
              <h2 className="font-display text-lg font-semibold text-primary">1. Product & Style</h2>
              <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2">
                <Field label="Product">
                  <select value={product} onChange={(e) => setProduct(e.target.value as ProductCategory)} className="input">
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                {product === "Jerseys" && (
                  <Field label="Jersey Collection">
                    <select value={jerseyCollection} onChange={(e) => setJerseyCollection(e.target.value)} className="input">
                      {JERSEY_COLLECTIONS.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                )}
                <Field label="Primary Color">
                  <input value={color} onChange={(e) => setColor(e.target.value)} className="input" />
                </Field>
                {showCollar && (
                  <Field label="Collar">
                    <select value={collar} onChange={(e) => setCollar(e.target.value)} className="input">
                      {COLLARS.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                )}
                {showSleeve && (
                  <Field label="Sleeve">
                    <select value={sleeve} onChange={(e) => setSleeve(e.target.value)} className="input">
                      {SLEEVES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                )}
                {showFabric && (
                  <Field label="Fabric">
                    <select value={fabric} onChange={(e) => setFabric(e.target.value)} className="input">
                      {FABRICS.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                )}
              </div>
            </div>

            {/* Sizes */}
            <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-card">
              <h2 className="font-display text-lg font-semibold text-primary">2. Size Breakup</h2>
              <p className="text-xs text-muted-foreground mt-1">Minimum 10 pieces total.</p>
              <div className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4">
                {sizeOptions.map((s) => (
                  <label key={s} className="flex flex-col items-center gap-1.5 rounded-lg border border-border p-3">
                    <span className="text-xs font-semibold text-muted-foreground">{s}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={sizes[s] ?? 0}
                      onChange={(e) => updateSize(s, e.target.value)}
                      className="w-full text-center rounded-md border border-border bg-background h-11"
                    />
                  </label>
                ))}
              </div>
              <div className="mt-4 rounded-2xl bg-slate-50/80 p-4 text-sm text-slate-700">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">Total Quantity</span>
                  <span className="font-semibold">{total} Pieces</span>
                </div>
                <div className={`mt-2 text-sm ${isMinimumOrder ? "text-emerald-600" : "text-orange-600"}`}>
                  {isMinimumOrder
                    ? "Minimum reached. You can submit your quote request."
                    : "Minimum order is 10 pieces. Please add more quantities."}
                </div>
              </div>
            </div>

            {/* Team info */}
            <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-card">
              <h2 className="font-display text-lg font-semibold text-primary">3. Team & Branding</h2>
              <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2">
                <Field label="Team / Organization Name">
                  <input value={teamName} onChange={(e) => setTeamName(e.target.value)} className="input" />
                </Field>
                <Field label="Sponsor / Logo Names">
                  <input value={sponsor} onChange={(e) => setSponsor(e.target.value)} className="input" />
                </Field>
                <Field label="Player Names & Numbers" hint="e.g. Rahul-7, Priya-11">
                  <textarea value={players} onChange={(e) => setPlayers(e.target.value)} rows={3} className="input py-2" />
                </Field>
                <Field label="Additional Notes">
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="input py-2" />
                </Field>
              </div>
              <div className="mt-4">
                <label className="flex items-center gap-3 rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground cursor-pointer hover:border-secondary">
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-orange" />
                  ) : logoUrl ? (
                    <Check className="h-5 w-5 text-success" />
                  ) : (
                    <Upload className="h-5 w-5" />
                  )}
                  {uploading ? (
                    <span>Uploading {logoName}...</span>
                  ) : logoUrl ? (
                    <span className="text-success font-medium">Logo uploaded: {logoName}</span>
                  ) : (
                    <span>Upload team logo / artwork reference</span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    className="hidden"
                    onChange={(e) => handleLogoUpload(e.target.files?.[0])}
                  />
                </label>
                {logoUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={logoUrl} alt="Uploaded logo" className="h-16 w-16 object-contain rounded border border-border bg-muted p-1" />
                    <button
                      type="button"
                      onClick={() => { setLogoUrl(null); setLogoName(""); }}
                      className="text-xs text-destructive hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Contact */}
            <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-card">
              <h2 className="font-display text-lg font-semibold text-primary">4. Your Contact</h2>
              <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Full Name *">
                  <input required value={name} onChange={(e) => setName(e.target.value)} className="input" />
                </Field>
                <Field label="Phone *">
                  <input
                    required
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => handlePhoneInput(e.target.value)}
                    onBlur={() => setPhoneTouched(true)}
                    className={`input ${showPhoneError ? "border-destructive ring-1 ring-destructive/50" : ""}`}
                  />
                  {showPhoneError && (
                    <p className="mt-2 text-xs text-destructive">Please enter a valid 10-digit mobile number.</p>
                  )}
                </Field>
                <Field label="Email">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
                </Field>
              </div>
            </div>
          </div>

          {/* Summary */}
          <aside className="lg:col-span-1">
            <div className="sticky top-4 sm:top-28 rounded-2xl border border-border bg-navy text-white p-4 sm:p-6 shadow-elevated">
              <div className="eyebrow text-orange">Live Summary</div>
              <h3 className="mt-2 font-display text-lg sm:text-xl font-bold">{product}</h3>
              <dl className="mt-5 space-y-3 text-sm">
                <Row label="Color" value={color} />
                {showCollar && <Row label="Collar" value={collar} />}
                {showSleeve && <Row label="Sleeve" value={sleeve} />}
                {showFabric && <Row label="Fabric" value={fabric} />}
                <Row label="Team" value={teamName || "—"} />
              </dl>
              <div className="mt-5 rounded-lg bg-white/10 p-4">
                <div className="text-xs uppercase tracking-widest text-white/60">Total Quantity</div>
                <div className="mt-1 font-display text-2xl sm:text-3xl font-bold">
                  {total} <span className="text-sm font-normal text-white/60">pcs</span>
                </div>
                {total < 10 && (
                  <div className="mt-2 text-xs text-orange">Minimum 10 pieces required</div>
                )}
              </div>
              <button
                type="submit"
                className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-md bg-accent-gradient px-4 sm:px-6 py-3 sm:py-3.5 text-sm font-semibold text-white shadow-glow hover:brightness-110 transition"
              >
                <MessageCircle className="h-4 w-4" /> Submit Quote Request
              </button>
              <p className="mt-3 text-[11px] text-white/60 text-center">
                No payment required. Our team will send your quotation to the contact details you provide.
              </p>
            </div>
          </aside>
        </form>
      </Section>
    </>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-primary">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-2">
      <dt className="text-white/60">{label}</dt>
      <dd className="font-medium text-white">{value}</dd>
    </div>
  );
}
