
-- Extend products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS short_description text,
  ADD COLUMN IF NOT EXISTS sport_type text,
  ADD COLUMN IF NOT EXISTS fabric text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS sizes text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS colors text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS collar_types text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS sleeve_types text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS products_set_updated_at ON public.products;
CREATE TRIGGER products_set_updated_at BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Reset categories to the 6 canonical ones
DELETE FROM public.categories;
INSERT INTO public.categories (name, slug, sort_order) VALUES
  ('Jerseys', 'jerseys', 1),
  ('Tracksuits', 'tracksuits', 2),
  ('Shorts', 'shorts', 3),
  ('Lowers', 'lowers', 4),
  ('Sleeveless T-Shirts', 'sleeveless-tshirts', 5),
  ('Caps', 'caps', 6);

-- Ensure anon can read active products (policy already public read; keep grants)
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.categories TO anon;
