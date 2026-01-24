import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
	reactStrictMode: false,
	// Optimize imports for smaller bundles
	experimental: {
		optimizePackageImports: [
			"lucide-react",
			"@radix-ui/react-dialog",
			"@radix-ui/react-dropdown-menu",
			"@radix-ui/react-popover",
			"@radix-ui/react-tabs",
			"@radix-ui/react-tooltip",
			"framer-motion",
			"date-fns",
		],
	},
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "X-Frame-Options",
						value: "DENY",
					},
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "Referrer-Policy",
						value: "origin-when-cross-origin",
					},
					{
						key: "Strict-Transport-Security",
						value: "max-age=31536000; includeSubDomains",
					},
				],
			},
			// Cache static assets for 1 year
			{
				source: "/images/(.*)",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable",
					},
				],
			},
			{
				source: "/_next/static/(.*)",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable",
					},
				],
			},
		];
	},
	images: {
		// Allow images from Supabase Storage
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**.supabase.co",
				pathname: "/storage/v1/object/public/**",
			},
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
		],
		// Modern image formats (WebP, AVIF)
		formats: ["image/avif", "image/webp"],
		// Device sizes for responsive images
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		// Image sizes for different breakpoints
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
	},
	// Specialist optimization trigger
};

export default withNextIntl(nextConfig);
