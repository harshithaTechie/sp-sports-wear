-- Allow authenticated admin users to manage gallery items.
-- Existing row-level security is enabled for gallery_items, but only SELECT was permitted.
CREATE POLICY "Admins manage gallery items" ON public.gallery_items
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
