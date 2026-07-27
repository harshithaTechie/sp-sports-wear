-- Add quotation_id column to orders table to link approved quotations to orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS quotation_id text;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_quotation_id ON public.orders(quotation_id);
