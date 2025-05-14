// eslint-disable-next-line @typescript-eslint/no-require-imports
const createNextIntlPlugin = require('next-intl/plugin');
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'imgbb.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co.com',
      },
    ],
  },
  /* config options here */
};

export default withNextIntl(nextConfig);
