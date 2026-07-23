CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    description text,
    image_url text,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    description text,
    short_description text,
    moq integer DEFAULT 10,
    image_url text,
    featured boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.gallery_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    category text,
    image_url text NOT NULL,
    description text,
    client_name text,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.testimonials (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    role text,
    quote text NOT NULL,
    rating integer DEFAULT 5,
    avatar_url text,
    approved boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.site_content (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text NOT NULL UNIQUE,
    section text,
    title text,
    content text,
    image_url text,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id text NOT NULL UNIQUE,
    customer_name text NOT NULL,
    customer_email text,
    customer_phone text NOT NULL,
    customer_whatsapp text,
    organization text,
    status text DEFAULT 'quotation_received',
    total_amount numeric(12,2),
    notes text,
    logo_url text,
    delivery_address text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
    product_name text NOT NULL,
    quantity integer NOT NULL DEFAULT 1,
    unit_price numeric(12,2),
    total_price numeric(12,2),
    size_breakup jsonb,
    customization jsonb,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.order_status_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    status text NOT NULL,
    notes text,
    created_by text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.quotations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id text NOT NULL UNIQUE,
    customer_name text NOT NULL,
    customer_email text,
    customer_phone text NOT NULL,
    customer_whatsapp text,
    organization text,
    product_type text,
    fabric text,
    print_type text,
    quantity integer,
    unit_price numeric(12,2),
    total_amount numeric(12,2),
    gst_amount numeric(12,2),
    grand_total numeric(12,2),
    shipping_cost numeric(12,2),
    discount_amount numeric(12,2),
    status text DEFAULT 'pending',
    notes text,
    logo_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.dealer_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text,
    phone text NOT NULL,
    city text,
    state text,
    business_name text,
    business_type text,
    experience text,
    message text,
    status text DEFAULT 'new',
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.contact_inquiries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text,
    phone text,
    subject text,
    message text NOT NULL,
    status text DEFAULT 'new',
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.generate_order_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  yearmonth text;
  candidate text;
  exists_check boolean;
BEGIN
  yearmonth := to_char(now(), 'YYYYMM');
  LOOP
    candidate := 'SP-' || yearmonth || '-' || lpad(floor(random() * 10000)::text, 4, '0');
    SELECT EXISTS(SELECT 1 FROM public.orders WHERE order_id = candidate) INTO exists_check;
    EXIT WHEN NOT exists_check;
  END LOOP;
  RETURN candidate;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_quotation_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  yearmonth text;
  candidate text;
  exists_check boolean;
BEGIN
  yearmonth := to_char(now(), 'YYYYMM');
  LOOP
    candidate := 'QT-' || yearmonth || '-' || lpad(floor(random() * 10000)::text, 4, '0');
    SELECT EXISTS(SELECT 1 FROM public.quotations WHERE quotation_id = candidate) INTO exists_check;
    EXIT WHEN NOT exists_check;
  END LOOP;
  RETURN candidate;
END;
$$;

GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;

GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

GRANT SELECT ON public.gallery_items TO anon;
GRANT SELECT ON public.gallery_items TO authenticated;
GRANT ALL ON public.gallery_items TO service_role;

GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;

GRANT SELECT ON public.site_content TO anon;
GRANT SELECT ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;

GRANT ALL ON public.orders TO service_role;

GRANT ALL ON public.order_items TO service_role;

GRANT ALL ON public.order_status_events TO service_role;

GRANT ALL ON public.quotations TO service_role;

GRANT ALL ON public.dealer_requests TO service_role;

GRANT ALL ON public.contact_inquiries TO service_role;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read gallery" ON public.gallery_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read approved testimonials" ON public.testimonials FOR SELECT TO anon, authenticated USING (approved = true);
CREATE POLICY "Public read site content" ON public.site_content FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins manage orders" ON public.orders FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage order items" ON public.order_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage order status events" ON public.order_status_events FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage quotations" ON public.quotations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage dealer requests" ON public.dealer_requests FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage contact inquiries" ON public.contact_inquiries FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage testimonials" ON public.testimonials FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage site content" ON public.site_content FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Allow public logo uploads" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'logos');
CREATE POLICY "Allow authenticated logo uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'logos');
CREATE POLICY "Allow public logo reads" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'logos');
CREATE POLICY "Allow authenticated logo reads" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'logos');