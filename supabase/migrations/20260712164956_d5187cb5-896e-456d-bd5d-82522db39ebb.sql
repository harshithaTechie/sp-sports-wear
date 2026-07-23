UPDATE public.categories SET sort_order = 7 WHERE slug = 'flags';
UPDATE public.products SET sleeve_types = array_remove(sleeve_types, 'Raglan') WHERE 'Raglan' = ANY(sleeve_types);
UPDATE public.products SET sleeve_types = array_remove(sleeve_types, 'Raglan Sleeve') WHERE 'Raglan Sleeve' = ANY(sleeve_types);