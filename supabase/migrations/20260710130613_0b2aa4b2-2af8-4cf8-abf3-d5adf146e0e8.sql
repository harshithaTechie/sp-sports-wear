
-- Move has_role out of the public (API-exposed) schema
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Recreate all policies referencing has_role to point at private.has_role
DROP POLICY IF EXISTS "Admins manage orders" ON public.orders;
CREATE POLICY "Admins manage orders" ON public.orders FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage testimonials" ON public.testimonials;
CREATE POLICY "Admins manage testimonials" ON public.testimonials FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage site content" ON public.site_content;
CREATE POLICY "Admins manage site content" ON public.site_content FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage contact inquiries" ON public.contact_inquiries;
CREATE POLICY "Admins manage contact inquiries" ON public.contact_inquiries FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage quotations" ON public.quotations;
CREATE POLICY "Admins manage quotations" ON public.quotations FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage dealer requests" ON public.dealer_requests;
CREATE POLICY "Admins manage dealer requests" ON public.dealer_requests FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage order items" ON public.order_items;
CREATE POLICY "Admins manage order items" ON public.order_items FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage order status events" ON public.order_status_events;
CREATE POLICY "Admins manage order status events" ON public.order_status_events FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

-- Remove the API-exposed public.has_role so it cannot be RPC-called by anon/authenticated
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- Prevent self-assignment of roles as defence-in-depth on user_roles
CREATE OR REPLACE FUNCTION private.prevent_role_self_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.user_id = auth.uid() THEN
    RAISE EXCEPTION 'Users cannot assign or modify roles for themselves';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_self_assignment ON public.user_roles;
CREATE TRIGGER trg_prevent_role_self_assignment
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION private.prevent_role_self_assignment();

-- Orders / order_items / order_status_events: revoke anon grants; server writes use service role
REVOKE ALL ON public.orders FROM anon;
REVOKE ALL ON public.order_items FROM anon;
REVOKE ALL ON public.order_status_events FROM anon;
REVOKE ALL ON public.dealer_requests FROM anon;
REVOKE ALL ON public.contact_inquiries FROM anon;

-- Explicit restrictive-style clarity: no SELECT policy exists for anon/authenticated (only admin ALL applies)
COMMENT ON TABLE public.orders IS 'Orders are readable only by admins (via has_role) and writable only via server functions using the service role.';

-- Storage: lock down the logos bucket
DROP POLICY IF EXISTS "Allow public logo reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public logo uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated logo reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated logo uploads" ON storage.objects;

CREATE POLICY "Admins read logos" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'logos' AND private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins upload logos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'logos' AND private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update logos" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'logos' AND private.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'logos' AND private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete logos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'logos' AND private.has_role(auth.uid(), 'admin'));
