// @ts-check
/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  output: "standalone",
  distDir: process.env.E2E_DIST_DIR,
  images: {
    unoptimized: true,
  },
  experimental: {
    instrumentationHook: true,
    // https://jotai.org/docs/tools/swc
    swcPlugins: [["@swc-jotai/react-refresh", {}]],
    logging: {
      level: "verbose",
    },
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

export default config;
