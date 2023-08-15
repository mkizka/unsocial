// @ts-check
/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  output: "standalone",
  experimental: {
    instrumentationHook: true,
    serverActions: true,
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
