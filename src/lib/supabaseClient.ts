import { createClient } from "@supabase/supabase-js";

// Cast import.meta to any to safely fetch env variables across type environments
const meta = import.meta as any;

const supabaseUrl = 
  meta.env?.VITE_SUPABASE_URL ||
  meta.env?.NEXT_PUBLIC_SUPABASE_URL ||
  "https://vsggnechqtuyknekebmf.supabase.co";

const supabaseAnonKey = 
  meta.env?.VITE_SUPABASE_ANON_KEY ||
  meta.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_HsOeEfZkGh2elTo2ZWYGZw_trhuU9A3";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
