import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = 'https://gvgqdelxrpzoxivkxnfe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2Z3FkZWx4cnB6b3hpdmt4bmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNDA0OTQsImV4cCI6MjA5MTgxNjQ5NH0.wPcIO7KBf6ifAh01X-MSCgdMZ09I2pebmrwwNc1wjqM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
