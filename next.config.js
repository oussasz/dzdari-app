/** @type {import('next').NextConfig} */
const withNextIntl = require("next-intl/plugin")("./i18n/request.ts");

const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**",
        port: "",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "**",
        port: "",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "**",
        port: "",
      },
    ],
  },
};

module.exports = withNextIntl(nextConfig);
