/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      "i.postimg.cc",
      "images.unsplash.com",
      "s3-ap-south-1.amazonaws.com",
      "wk-partners.co.jp",
      "cdn.hashnode.com",
      "github.com",
      "raw.githubusercontent.com",
      "cdn.jsdelivr.net",
      "encrypted-tbn0.gstatic.com",
      "git-scm.com",
      "static.vecteezy.com",
      "www.designyourway.net",
      "thumb.wikimedia.org",
      "static.thenounproject.com",
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
