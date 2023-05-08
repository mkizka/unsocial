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
        source: "/@:username",
        destination: "/users/@:username",
      },
    ];
  },
};
export default config;
