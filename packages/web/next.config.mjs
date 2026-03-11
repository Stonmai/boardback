import withSerwist from "@serwist/next";

const withPWA = withSerwist({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  scope: "/",
  reloadOnOnline: true,
  // Precache the root HTML so the app works offline from the very first visit
  // without needing an extra online reload after SW installation
  additionalPrecacheEntries: [{ url: "/", revision: null }],
});

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withPWA(nextConfig);
