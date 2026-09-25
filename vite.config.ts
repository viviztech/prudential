import vinext from "vinext";
import { defineConfig } from "vite";
import hostingConfig from "./.openai/hosting.json";
import { sites } from "./build/sites-vite-plugin";

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  "00000000-0000-4000-8000-000000000000";

const { d1, r2 } = hostingConfig;

const browserEnvDefines = {
  "process.env.__NEXT_APP_NAV_FAIL_HANDLING": "false",
  "process.env.__NEXT_CLIENT_ROUTER_DYNAMIC_STALETIME": "undefined",
  "process.env.__NEXT_CLIENT_ROUTER_STATIC_STALETIME": "undefined",
  "process.env.__NEXT_GESTURE_TRANSITION": "false",
  "process.env.__NEXT_ROUTER_BASEPATH": JSON.stringify(""),
  "process.env.__NEXT_SCROLL_RESTORATION": JSON.stringify("false"),
  "process.env.__NEXT_VERSION": JSON.stringify("vinext"),
  "process.env.__VINEXT_DEPLOYMENT_ID": "undefined",
  "process.env.__VINEXT_HAS_CLIENT_REWRITES": JSON.stringify("false"),
  "process.env.__VINEXT_HAS_PAGES_ROUTER": JSON.stringify("false"),
  "process.env.__VINEXT_PREFETCH_INLINING": JSON.stringify("false"),
  "process.env.__VINEXT_RSC_COMPATIBILITY_ID": "undefined",
  "process.env.__VINEXT_TRAILING_SLASH": JSON.stringify("false"),
  "process.env.NEXT_DEPLOYMENT_ID": "undefined",
};

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";

const localBindingConfig = {
  main: "./worker/index.ts",
  compatibility_flags: ["nodejs_compat"],
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: "site-creator-d1",
          database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: "site-creator-r2",
        },
      ]
    : [],
};

export default defineConfig(async () => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    define: browserEnvDefines,
    optimizeDeps: {
      rolldownOptions: {
        transform: {
          define: browserEnvDefines,
        },
      },
    },
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        config: localBindingConfig,
      }),
    ],
  };
});
