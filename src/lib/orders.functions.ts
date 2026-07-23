import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const orderSchema = z.object({
  product: z.string(),
  color: z.string(),
  collar: z.string(),
  sleeve: z.string(),
  fabric: z.string(),
  sizes: z.record(z.number()),
  teamName: z.string(),
  players: z.string(),
  sponsor: z.string(),
  notes: z.string(),
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
});

export const submitCustomOrder = createServerFn({ method: "POST" })
  .validator((data) => orderSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const totalQty = Object.values(data.sizes).reduce((a, b) => a + b, 0);

    const { data: generatedId, error: genErr } = await supabaseAdmin.rpc("generate_order_id");
    if (genErr) throw new Error(genErr.message);

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        order_id: generatedId as unknown as string,
        customer_name: data.name,
        customer_phone: data.phone,
        customer_email: data.email || null,
        organization: data.teamName || null,
        notes: data.notes || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!order) throw new Error("Order not created");

    await supabaseAdmin.from("order_items").insert({
      order_id: order.id,
      product_name: data.product,
      quantity: totalQty,
      size_breakup: data.sizes,
      customization: {
        color: data.color,
        collar: data.collar,
        sleeve: data.sleeve,
        fabric: data.fabric,
        players: data.players,
        sponsor: data.sponsor,
      },
    });

    await supabaseAdmin.from("order_status_events").insert({
      order_id: order.id,
      status: "quotation_received",
      notes: "Order submitted via website",
    });

    return { orderId: order.order_id, id: order.id };
  });

const trackSchema = z.object({
  orderId: z.string().min(1),
  phone: z.string().min(1),
});

export const trackOrder = createServerFn({ method: "POST" })
  .validator((data) => trackSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id, order_id, status, created_at")
      .eq("order_id", data.orderId)
      .eq("customer_phone", data.phone)
      .single();

    if (error || !order) return null;

    const { data: events } = await supabaseAdmin
      .from("order_status_events")
      .select("status, notes, created_at")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true });

    return { order, events: events || [] };
  });

const updateQuotationStatusSchema = z.object({
  quoteId: z.string().min(1),
  status: z.enum(["pending", "quoted", "approved", "rejected", "in_progress"]),
});

export const updateQuotationStatus = createServerFn({ method: "POST" })
  .validator((data) => updateQuotationStatusSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { quoteId, status } = data;

    const { data: quotation, error: quoteError } = await supabaseAdmin
      .from("quotations")
      .select(
        "id, quotation_id, customer_name, customer_phone, customer_email, customer_whatsapp, organization, product_type, fabric, quantity, total_amount, notes, logo_url, status"
      )
      .eq("id", quoteId)
      .single();

    if (quoteError || !quotation) {
      throw new Error(quoteError?.message || "Quote not found");
    }

    let createdOrderId: string | null = null;
    let orderToUpdateId: string | null = null;
    let orderCreated = false;

    const { data: existingOrder, error: existingOrderError } = await supabaseAdmin
      .from("orders")
      .select("id, order_id, status")
      .or(
        `quotation_id.eq.${quotation.quotation_id},notes.ilike.%Quotation Reference: ${quotation.quotation_id}%`
      )
      .limit(1)
      .maybeSingle();

    if (existingOrderError) {
      throw new Error(existingOrderError.message);
    }

    const hasOrder = !!existingOrder;

    if (status === "approved") {
      if (hasOrder) {
        createdOrderId = existingOrder.order_id;
        orderToUpdateId = existingOrder.id;

        if (existingOrder.status !== "quotation_received") {
          const { error: statusError } = await supabaseAdmin
            .from("orders")
            .update({ status: "quotation_received" })
            .eq("id", existingOrder.id);
          if (statusError) throw new Error(statusError.message);

          const { error: eventError } = await supabaseAdmin.from("order_status_events").insert({
            order_id: existingOrder.id,
            status: "quotation_received",
            notes: `Order reused for approved quotation ${quotation.quotation_id}`,
          });
          if (eventError) throw new Error(eventError.message);
        }
      } else {
        const { data: generatedId, error: genErr } = await supabaseAdmin.rpc("generate_order_id");
        if (genErr) throw new Error(genErr.message);

        const { data: order, error: orderError } = await supabaseAdmin
          .from("orders")
          .insert({
            order_id: generatedId as unknown as string,
            customer_name: quotation.customer_name,
            customer_phone: quotation.customer_phone,
            customer_email: quotation.customer_email ?? null,
            customer_whatsapp: quotation.customer_whatsapp ?? null,
            organization: quotation.organization ?? null,
            notes: `Quotation Reference: ${quotation.quotation_id}${quotation.notes ? `\n\n${quotation.notes}` : ""}`,
            status: "quotation_received",
            total_amount: quotation.total_amount ?? null,
            logo_url: quotation.logo_url ?? null,
            quotation_id: quotation.quotation_id,
          })
          .select()
          .single();

        if (orderError || !order) {
          throw new Error(orderError?.message || "Order creation failed");
        }

        createdOrderId = order.order_id;
        orderToUpdateId = order.id;
        orderCreated = true;

        const { error: eventError } = await supabaseAdmin.from("order_status_events").insert({
          order_id: order.id,
          status: "quotation_received",
          notes: `Order created from approved quotation ${quotation.quotation_id}`,
        });
        if (eventError) throw new Error(eventError.message);
      }
    }

    if (status === "rejected" && hasOrder) {
      orderToUpdateId = existingOrder.id;
      if (existingOrder.status !== "cancelled") {
        const { error: cancelError } = await supabaseAdmin
          .from("orders")
          .update({ status: "cancelled" })
          .eq("id", existingOrder.id);
        if (cancelError) throw new Error(cancelError.message);

        const { error: eventError } = await supabaseAdmin.from("order_status_events").insert({
          order_id: existingOrder.id,
          status: "cancelled",
          notes: `Order cancelled because quotation ${quotation.quotation_id} was rejected`,
        });
        if (eventError) throw new Error(eventError.message);
      }
    }

    const { error: updateError } = await supabaseAdmin.from("quotations").update({ status }).eq("id", quoteId);
    if (updateError) throw new Error(updateError.message);

    return {
      quoteId,
      status,
      orderCreated,
      orderId: createdOrderId,
      existingOrderId: existingOrder?.order_id ?? null,
    };
  });

const quotationSchema = z.object({
  product: z.string(),
  color: z.string(),
  collar: z.string(),
  sleeve: z.string(),
  fabric: z.string(),
  sizes: z.record(z.number()),
  teamName: z.string(),
  players: z.string(),
  sponsor: z.string(),
  notes: z.string(),
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  logoUrl: z.string().nullable(),
});

export const submitQuotationRequest = createServerFn({ method: "POST" })
  .validator((data) => quotationSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const totalQty = Object.values(data.sizes).reduce((a, b) => a + b, 0);

    const { data: generatedId, error: genErr } = await supabaseAdmin.rpc("generate_quotation_id");
    if (genErr) throw new Error(genErr.message);

    const sizeBreakup = Object.entries(data.sizes)
      .filter(([, v]) => v > 0)
      .map(([s, v]) => `${s}×${v}`)
      .join(", ");

    const formattedNotes = [
      `Product: ${data.product}`,
      `Color: ${data.color}`,
      `Collar: ${data.collar}`,
      `Sleeve: ${data.sleeve}`,
      `Fabric: ${data.fabric}`,
      `Size Breakup: ${sizeBreakup}`,
      `Total Quantity: ${totalQty} pcs`,
      `Team Name: ${data.teamName || "—"}`,
      `Sponsors: ${data.sponsor || "—"}`,
      `Players: ${data.players || "—"}`,
      `Additional Notes: ${data.notes || "—"}`,
    ].join("\n");

    const { data: quotation, error } = await supabaseAdmin
      .from("quotations")
      .insert({
        quotation_id: generatedId as unknown as string,
        customer_name: data.name,
        customer_phone: data.phone,
        customer_email: data.email || null,
        organization: data.teamName || null,
        product_type: data.product,
        fabric: data.fabric,
        quantity: totalQty,
        logo_url: data.logoUrl || null,
        notes: formattedNotes,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!quotation) throw new Error("Quotation request not created");

    return { quotationId: quotation.quotation_id, id: quotation.id };
  });
