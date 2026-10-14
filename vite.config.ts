// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Hard-pin the Nitro target to Vercel so production builds (local + Vercel CI)
  // always emit the Vercel Build Output API under `.vercel/output`. Without this the
  // wrapper falls back to its `cloudflare-module` default. Inside a Lovable build the
  // preset is pinned by `LOVABLE_NITRO_PRESET`, so this only affects self-hosted builds.
  nitro: { preset: "vercel" },
});
