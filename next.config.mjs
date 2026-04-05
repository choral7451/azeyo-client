/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "azeyo-storage.s3.ap-northeast-2.amazonaws.com",
        pathname: "/prod/**",
      },
    ],
  },
};

export default nextConfig;
