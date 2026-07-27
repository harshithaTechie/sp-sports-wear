import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Circle, Search, Phone, Calendar, Loader2, Info } from "lucide-react";
import { useState } from "react";
import { Section } from "@/components/site/Section";
import { cn } from "@/lib/utils";
import { trackOrder } from "@/lib/orders.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/track-order")({
  head: () => ({
    meta: [
      { title: "Track Your Order — SP Sports Wear" },
      { name: "description", content: "Track your SP Sports Wear custom order status — from received to shipped." },
      { property: "og:title", content: "Track Order — SP Sports Wear" },
      { property: "og:description", content: "Follow your custom sportswear order in real time." },
    ],
  }),
  component: Track,
});

const STATUS_STAGES = [
  { key: "quotation_received", label: "Quotation Received", desc: "We have received your request and will contact you shortly." },
  { key: "confirmed", label: "Order Confirmed", desc: "Your order has been confirmed and payment has been verified." },
  { key: "in_production", label: "In Production", desc: "Your sportswear is currently being printed and stitched in our factory." },
  { key: "ready_to_ship", label: "Ready to Ship", desc: "Quality checks are complete. Your order is packed and ready for shipping." },
  { key: "shipped", label: "Shipped", desc: "Your order has been dispatched. Transit details will be shared." },
  { key: "delivered", label: "Delivered", desc: "Your order has been delivered. Thank you for choosing SP Sports Wear!" },
];

function Track() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId || !phone) {
      toast.error("Please enter both Order ID and Phone Number");
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await trackOrder({
  data: {
    orderId: orderId.trim(),
    phone: phone.trim(),
  },
});
      setOrderData(res);
      if (!res) {
        toast.error("No order found. Please check your credentials.");
      } else if (res.isPendingQuotation) {
        toast.info("Quotation found - awaiting approval");
      } else {
        toast.success("Order details retrieved");
      }
    } catch (err) {
      toast.error("An error occurred while tracking. Please try again.");
      setOrderData(null);
    } finally {
      setLoading(false);
    }
  }

  const activeIndex = orderData?.order?.status
    ? STATUS_STAGES.findIndex(s => s.key === orderData.order.status)
    : -1;

  const isCancelled = orderData?.order?.status === "cancelled";

  return (
    <>
      <section className="bg-navy text-white">
        <div className="container-x py-14 md:py-20">
          <span className="eyebrow text-orange">Order Tracking</span>
          <h1 className="mt-3 font-display text-4xl md:text-5xl font-bold">Where is my order?</h1>
          <p className="mt-4 max-w-2xl text-white/75">
            Enter your Order ID (e.g. SP-202607-1234) or Quotation ID (e.g. QT-202607-1234) and your registered mobile number to
            see live production status.
          </p>

          <form onSubmit={submit} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
              <input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Order ID or Quotation ID (e.g. SP-202607-1234 or QT-202607-1234)"
                required
                className="w-full h-12 rounded-md bg-white/10 border border-white/20 pl-10 pr-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-orange"
              />
            </div>
            <div className="relative flex-1">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Registered Mobile Number"
                required
                className="w-full h-12 rounded-md bg-white/10 border border-white/20 pl-10 pr-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-orange"
              />
            </div>
            <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-md bg-accent-gradient px-6 py-3 text-sm font-semibold text-white shadow-glow disabled:opacity-50">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Track Order
            </button>
          </form>
        </div>
      </section>

      <Section>
        {loading ? (
          <div className="rounded-2xl border border-border bg-card p-12 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-orange" />
            <span className="text-sm">Fetching order information...</span>
          </div>
        ) : !searched ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
            <Info className="h-8 w-8 text-orange/80" />
            <span>Enter your Order ID and mobile number above to view live status.</span>
          </div>
        ) : !orderData ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-10 text-center text-destructive flex flex-col items-center justify-center gap-2">
            <Info className="h-8 w-8" />
            <span className="font-semibold">No order found matching those credentials</span>
            <span className="text-xs text-muted-foreground max-w-md">Please ensure the Order ID is in the format SP-YYYYMM-XXXX or Quotation ID is in the format QT-YYYYMM-XXXX and the phone number matches what was submitted.</span>
          </div>
        ) : orderData.isPendingQuotation ? (
          <div className="rounded-2xl border border-orange/20 bg-orange/5 p-10 text-center flex flex-col items-center justify-center gap-3">
            <Info className="h-8 w-8 text-orange" />
            <span className="font-semibold text-orange">Quotation Awaiting Approval</span>
            <span className="text-sm text-muted-foreground max-w-md">Your quotation has been received and is awaiting approval. Order tracking will become available once your quotation is approved.</span>
            <div className="mt-2 text-xs text-muted-foreground">
              Quotation ID: {orderData.quotationId}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-6">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Order Ref</div>
                <div className="font-display text-2xl font-bold text-primary">{orderData.order.order_id}</div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Order Date</div>
                <div className="font-semibold text-primary">
                  {orderData.order.created_at ? new Date(orderData.order.created_at).toLocaleDateString() : "—"}
                </div>
              </div>
            </div>

            {isCancelled ? (
              <div className="mt-8 rounded-xl bg-destructive/10 border border-destructive/20 p-5 text-destructive text-sm flex items-center gap-3">
                <Info className="h-5 w-5 shrink-0" />
                <div>
                  <div className="font-bold">This order has been cancelled</div>
                  <div className="text-xs opacity-90 mt-0.5">Please contact customer support for further information.</div>
                </div>
              </div>
            ) : (
              <ol className="mt-8 relative border-l border-border pl-6 ml-4 space-y-8">
                {STATUS_STAGES.map((stage, i) => {
                  const done = i <= activeIndex;
                  const active = i === activeIndex;
                  return (
                    <li key={stage.key} className="relative">
                      {/* Node Bullet */}
                      <span className={cn(
                        "absolute -left-[38px] top-0 grid h-6 w-6 place-items-center rounded-full border bg-card text-white transition-all duration-300",
                        done ? "bg-success border-success" : "border-border text-muted-foreground",
                        active && "bg-accent-gradient border-orange scale-110 shadow-glow"
                      )}>
                        {done ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Circle className="h-2 w-2 fill-current" />
                        )}
                      </span>

                      {/* Content */}
                      <div>
                        <div className={cn(
                          "font-display text-base font-bold",
                          active ? "text-orange" : done ? "text-primary" : "text-muted-foreground"
                        )}>
                          {stage.label}
                        </div>
                        <p className={cn(
                          "text-sm mt-1 max-w-xl",
                          active ? "text-foreground font-medium" : "text-muted-foreground"
                        )}>
                          {stage.desc}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}

            {orderData.events && orderData.events.length > 0 && (
              <div className="mt-12 border-t border-border pt-8">
                <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2 mb-6">
                  <Calendar className="h-5 w-5 text-orange" />
                  Status Update History
                </h3>
                <div className="space-y-6 pl-4 ml-2 border-l border-border">
                  {orderData.events.map((ev: any, idx: number) => (
                    <div key={idx} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-orange" />
                      <div>
                        <div className="text-xs uppercase tracking-wider font-bold text-orange">
                          {ev.status.replace(/_/g, " ")}
                        </div>
                        {ev.notes && <p className="text-sm text-foreground/90 mt-1">{ev.notes}</p>}
                        <span className="text-[10px] text-muted-foreground mt-1.5 block">
                          {new Date(ev.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Section>
    </>
  );
}
