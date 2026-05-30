import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Type errors should fail the build. Deno edge functions under
    // supabase/functions are excluded from the typecheck via tsconfig.json.
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
