import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Turbopack/webpack from bundling these Node.js packages.
  // pdfkit and nodemailer rely on __dirname for internal file resolution
  // (e.g. pdfkit loads Helvetica.afm from its own data/ folder).
  // Bundling them breaks __dirname so paths point to C:\ROOT instead of
  // the real node_modules — this keeps them as native require() calls.
  serverExternalPackages: ['pdfkit', 'nodemailer'],
};

export default nextConfig;
