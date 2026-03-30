/** @type {import("next").NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/:path*',
          destination: 'https://boost-sell-speed.lovable.app/:path*',
        },
      ],
    };
  },
};

module.exports = nextConfig;
