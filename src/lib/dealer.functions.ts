import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  business: z.string().min(1),
  gst: z.string().optional().or(z.literal("")),
  contact: z.string().optional().or(z.literal("")),
  phone: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  experience: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export const submitDealerRequest = createServerFn({ method: "POST" })
  .validator((data) => schema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin.from("dealer_requests").insert({
      name: data.contact || data.business,
      phone: data.phone,
      email: data.email || null,
      business_name: data.business,
      city: data.city || null,
      state: data.state || null,
      experience: data.experience || null,
      message: data.notes || null,
    });

    if (error) throw new Error(error.message);
    return { success: true };
  });
