import { withSentryConfig } from "@sentry/nextjs";

// @ts-check
/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  output: "standalone",
  distDir: process.env.E2E_DIST_DIR,
  experimental: {
    serverComponentsExternalPackages: ["jsonld"],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        // https://github.com/vercel/next.js/issues/24288
        source: "/:username(@.*)",
        destination: "/users/:username",
      },
    ];
  },
};

export default withSentryConfig(
  config,
  {
    silent: false,
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors.
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  },
);
