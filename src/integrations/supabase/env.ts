export function getSupabaseUrl(): string {
  const url =
    typeof window !== 'undefined'
      ? import.meta.env.VITE_SUPABASE_URL
      : process.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;

  if (!url) {
    throw new Error(
      'Missing Supabase environment variable: SUPABASE_URL or VITE_SUPABASE_URL',
    );
  }

  return url;
}

export function getSupabasePublishableKey(): string {
  const key =
    typeof window !== 'undefined'
      ? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY
      : process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY ||
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!key) {
    throw new Error(
      'Missing Supabase environment variable: SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_PUBLISHABLE_KEY',
    );
  }

  return key;
}

export function getSupabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error('Missing Supabase environment variable: SUPABASE_SERVICE_ROLE_KEY');
  }

  return key;
}
