const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const envPath = path.join(process.cwd(), '.env');
const envRaw = fs.readFileSync(envPath, 'utf8');
const env = Object.fromEntries(
  envRaw
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^(.*?)=(.*)$/);
      if (!m) return null;
      return [m[1], m[2].replace(/^"|"$/g, '')];
    })
    .filter(Boolean),
);
const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const anon = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY;
if (!url || !anon) {
  console.error('Missing url or anon key', {url, anon});
  process.exit(1);
}
console.log('url', url);
console.log('anon prefix', anon.slice(0, 12));
const supabase = createClient(url, anon);
(async () => {
  const categories = await supabase.from('categories').select('id,name,slug').order('sort_order',{ascending:true});
  console.log('categories error', categories.error);
  console.log('categories count', categories.data?.length);
  console.log('categories sample', categories.data?.slice(0,5));
  const products = await supabase.from('products').select('id,name,slug,category_id').order('created_at',{ascending:false});
  console.log('products error', products.error);
  console.log('products count', products.data?.length);
  console.log('products sample', products.data?.slice(0,5));
})();