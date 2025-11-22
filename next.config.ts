import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule: { test: { test: (arg0: string) => any; }; }) => rule.test?.test?.(".svg"));
    if (fileLoaderRule) fileLoaderRule.exclude = /\.svg$/i;

    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            titleProp: true,
            svgo: true,
            icon: true,
          },
        },
      ],
    });

    return config;
  },
};

export default nextConfig;
