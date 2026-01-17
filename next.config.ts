import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    output: 'export',
    distDir: 'out',
    assetPrefix: './',
    basePath: '',
    trailingSlash: true,
    images: { unoptimized: true }
};

export default nextConfig;
