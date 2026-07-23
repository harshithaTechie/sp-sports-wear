GRANT EXECUTE ON FUNCTION public.generate_order_id() TO anon;
GRANT EXECUTE ON FUNCTION public.generate_quotation_id() TO anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;