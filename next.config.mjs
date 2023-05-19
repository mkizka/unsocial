// @ts-check
/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  experimental: {
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

if (process.env.NODE_ENV != "production") {
  config.images = {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
    ],
  };
}

export default config;
