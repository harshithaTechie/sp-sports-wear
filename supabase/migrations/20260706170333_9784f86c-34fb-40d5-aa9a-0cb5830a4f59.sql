CREATE SEQUENCE IF NOT EXISTS public.order_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS public.quotation_id_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_order_id()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN 'SP-' || to_char(now(), 'YYYYMM') || '-' || lpad(nextval('public.order_id_seq')::text, 4, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_quotation_id()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN 'QT-' || to_char(now(), 'YYYYMM') || '-' || lpad(nextval('public.quotation_id_seq')::text, 4, '0');
END;
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.generate_order_id() FROM anon;
REVOKE EXECUTE ON FUNCTION public.generate_quotation_id() FROM anon;