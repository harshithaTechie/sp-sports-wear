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

    // Get field config for this product
    const fieldConfig = getProductFieldConfig(data.product);

    // Build customization object with only relevant fields
    const customization: Record<string, any> = {};
    
    if (fieldConfig.showColor) {
      customization.color = data.color;
    }
    if (fieldConfig.showCollar) {
      customization.collar = data.collar;
    }
    if (fieldConfig.showSleeve) {
      customization.sleeve = data.sleeve;
    }
    if (fieldConfig.showFabric) {
      customization.fabric = data.fabric;
    }
    if (fieldConfig.showSponsor && data.sponsor) {
      customization.sponsor = data.sponsor;
    }
    if (fieldConfig.showPlayers && data.players) {
      customization.players = data.players;
    }

    await supabaseAdmin.from("order_items").insert({
      order_id: order.id,
      product_name: data.product,
      quantity: totalQty,
      size_breakup: data.sizes,
      customization: Object.keys(customization).length > 0 ? customization : null,
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

// Normalize phone number by removing all non-digit characters
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export const trackOrder = createServerFn({ method: "POST" })
  .validator((data) => trackSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Normalize the input phone number
    const normalizedPhone = normalizePhone(data.phone);

    // Check if the input is a quotation ID (starts with QT-) or order ID (starts with SP-)
    const isQuotationId = data.orderId.toUpperCase().startsWith("QT-");

    if (isQuotationId) {
      // Handle quotation ID tracking
      const { data: quotation, error: quoteError } = await supabaseAdmin
        .from("quotations")
        .select("id, quotation_id, status, customer_phone, customer_whatsapp")
        .ilike("quotation_id", data.orderId)
        .maybeSingle();

      if (quoteError || !quotation) {
        console.error('Quotation lookup failed:', quoteError);
        return null;
      }

      // Verify phone number matches
      const quotePhoneMatch =
        quotation.customer_phone === data.phone ||
        quotation.customer_phone === normalizedPhone ||
        quotation.customer_whatsapp === data.phone ||
        quotation.customer_whatsapp === normalizedPhone;

      if (!quotePhoneMatch) {
        console.error('Phone mismatch:', { quotationPhone: quotation.customer_phone, inputPhone: data.phone });
        return null;
      }

      // If quotation is still pending, return special response
      if (quotation.status === "pending") {
        return {
          isPendingQuotation: true,
          quotationId: quotation.quotation_id,
          status: quotation.status
        };
      }

      // If quotation is approved, find the linked order
      if (quotation.status === "approved") {
        const { data: order, error: orderError } = await supabaseAdmin
          .from("orders")
          .select("id, order_id, status, created_at, quotation_id")
          .eq("quotation_id", quotation.quotation_id)
          .maybeSingle() as any;

        if (orderError || !order) {
          console.error('Order lookup failed for quotation:', orderError);
          console.error('Looking for order with quotation_id:', quotation.quotation_id);
          return null;
        }

        const { data: events } = await supabaseAdmin
          .from("order_status_events")
          .select("status, notes, created_at")
          .eq("order_id", order.id)
          .order("created_at", { ascending: true });

        return { order, events: events || [] };
      }

      // For other statuses (quoted, rejected, in_progress), return null
      return null;
    }

    // Handle order ID tracking (existing logic)
    let { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id, order_id, status, created_at, quotation_id")
      .eq("order_id", data.orderId)
      .eq("customer_phone", data.phone)
      .single();

    // If exact match fails, try with normalized phone number
    if (error || !order) {
      const { data: normalizedOrder, error: normalizedError } = await supabaseAdmin
        .from("orders")
        .select("id, order_id, status, created_at, quotation_id")
        .eq("order_id", data.orderId)
        .or(`customer_phone.eq.${normalizedPhone},customer_whatsapp.eq.${normalizedPhone},customer_phone.eq.${data.phone},customer_whatsapp.eq.${data.phone}`)
        .maybeSingle() as any;

      if (!normalizedError && normalizedOrder) {
        order = normalizedOrder;
        error = null;
      }
    }

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
  designId: z.string().uuid().nullable().optional(),
  });

// Define which fields are relevant for each product type
const PRODUCT_FIELD_CONFIG = {
  // Jerseys: All customization fields
  "Jerseys": {
    showColor: true,
    showCollar: true,
    showSleeve: true,
    showFabric: true,
    showSponsor: true,
    showPlayers: true,
  },
  // Tracksuits: Color, Fabric, Sponsor, Players (no collar/sleeve)
  "Tracksuits": {
    showColor: true,
    showCollar: false,
    showSleeve: false,
    showFabric: true,
    showSponsor: true,
    showPlayers: true,
  },
  // Shorts: Color, Fabric, Sponsor, Players (no collar/sleeve)
  "Shorts": {
    showColor: true,
    showCollar: false,
    showSleeve: false,
    showFabric: true,
    showSponsor: true,
    showPlayers: true,
  },
  // Lowers: Color, Fabric, Sponsor, Players (no collar/sleeve)
  "Lowers": {
    showColor: true,
    showCollar: false,
    showSleeve: false,
    showFabric: true,
    showSponsor: true,
    showPlayers: true,
  },
  // Sleeveless T-Shirts: Color, Fabric, Sponsor, Players (no collar/sleeve)
  "Sleeveless T-Shirts": {
    showColor: true,
    showCollar: false,
    showSleeve: false,
    showFabric: true,
    showSponsor: true,
    showPlayers: true,
  },
  // Caps: Only quantity and logo (no color, collar, sleeve, fabric, sponsor, players)
  "Caps": {
    showColor: false,
    showCollar: false,
    showSleeve: false,
    showFabric: false,
    showSponsor: false,
    showPlayers: false,
  },
  // Flags: Only quantity and logo (no color, collar, sleeve, fabric, sponsor, players)
  "Flags": {
    showColor: false,
    showCollar: false,
    showSleeve: false,
    showFabric: false,
    showSponsor: false,
    showPlayers: false,
  },
};

// Get field config for a product, defaulting to full customization
function getProductFieldConfig(productName: string) {
  // Handle Jersey collections (e.g., "Jerseys — Schools & Colleges")
  const baseProduct = productName.split(" — ")[0];
  return PRODUCT_FIELD_CONFIG[baseProduct as keyof typeof PRODUCT_FIELD_CONFIG] || {
    showColor: true,
    showCollar: true,
    showSleeve: true,
    showFabric: true,
    showSponsor: true,
    showPlayers: true,
  };
}

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

    // Get field config for this product
    const fieldConfig = getProductFieldConfig(data.product);

    // Build notes array with only relevant fields
    const notesParts = [
      `Product: ${data.product}`,
      `Size Breakup: ${sizeBreakup}`,
      `Total Quantity: ${totalQty} pcs`,
    ];

    // Only include color if relevant for this product
    if (fieldConfig.showColor) {
      notesParts.push(`Color: ${data.color}`);
    }

    // Only include collar if relevant for this product
    if (fieldConfig.showCollar) {
      notesParts.push(`Collar: ${data.collar}`);
    }

    // Only include sleeve if relevant for this product
    if (fieldConfig.showSleeve) {
      notesParts.push(`Sleeve: ${data.sleeve}`);
    }

    // Only include fabric if relevant for this product
    if (fieldConfig.showFabric) {
      notesParts.push(`Fabric: ${data.fabric}`);
    }

    // Only include sponsor if relevant for this product
    if (fieldConfig.showSponsor && data.sponsor) {
      notesParts.push(`Sponsors: ${data.sponsor}`);
    }

    // Only include players if relevant for this product
    if (fieldConfig.showPlayers && data.players) {
      notesParts.push(`Players: ${data.players}`);
    }

    // Always include team name if provided
    if (data.teamName) {
      notesParts.push(`Team Name: ${data.teamName}`);
    }

    // Always include additional notes if provided
    if (data.notes) {
      notesParts.push(`Additional Notes: ${data.notes}`);
    }

    const formattedNotes = notesParts.join("\n");

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
        design_id: data.designId,
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
