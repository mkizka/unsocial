// @ts-check
/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  distDir: process.env.E2E_DIST_DIR,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // https://jotai.org/docs/tools/swc
    swcPlugins: [["@swc-jotai/react-refresh", {}]],
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
