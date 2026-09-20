import type { NextConfig } from "next";

console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'setat' : 'LIPSĂ');
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'setat' : 'LIPSĂ');

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
