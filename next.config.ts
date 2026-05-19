import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
  async redirects() {
    return [
      {
        source: "/tiktok",
        destination: "/?utm_source=tiktok&utm_medium=organic&utm_campaign=guia_cripto&utm_content=bio",
        permanent: false,
      },
      {
        source: "/instagram",
        destination: "/?utm_source=instagram&utm_medium=organic&utm_campaign=guia_cripto&utm_content=bio",
        permanent: false,
      },
      {
        source: "/youtube",
        destination: "/?utm_source=youtube&utm_medium=shorts&utm_campaign=guia_cripto&utm_content=bio",
        permanent: false,
      },
      {
        source: "/linkedin",
        destination: "/?utm_source=linkedin&utm_medium=organic&utm_campaign=guia_cripto&utm_content=post",
        permanent: false,
      },
      {
        source: "/whatsapp",
        destination: "/?utm_source=whatsapp&utm_medium=status&utm_campaign=guia_cripto&utm_content=estado",
        permanent: false,
      },
      {
        source: "/facebook",
        destination: "/?utm_source=facebook&utm_medium=social&utm_campaign=guia_cripto&utm_content=profile_link",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
