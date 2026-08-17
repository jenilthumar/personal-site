import type { NextConfig } from "next";
import createMDX from "@next/mdx";

// Allow next/image to optimize media served from Vercel Blob — the public blob
// domain, plus a custom domain when NEXT_PUBLIC_MEDIA_BASE_URL is one.
const remotePatterns = [
  { protocol: "https" as const, hostname: "*.public.blob.vercel-storage.com" },
  // YouTube thumbnails, used as the poster for a photography item's film.
  { protocol: "https" as const, hostname: "i.ytimg.com" },
];
const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
if (mediaBase) {
  try {
    const { hostname } = new URL(mediaBase);
    if (hostname && !hostname.endsWith(".public.blob.vercel-storage.com")) {
      remotePatterns.push({ protocol: "https" as const, hostname });
    }
  } catch {
    // ignore a malformed NEXT_PUBLIC_MEDIA_BASE_URL
  }
}

const nextConfig: NextConfig = {
  // Let .md / .mdx files act as pages and be imported as components.
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  // 90 is the site-wide floor, 100 for photography (see lib/media.ts). The
  // optimizer 400s on any quality not listed here.
  images: { remotePatterns, qualities: [90, 100] },
  // React's <ViewTransition> pairs the home feed's cover with the case study's
  // hero across the navigation. See app/globals.css for the timing.
  experimental: { viewTransition: true },
};

const withMDX = createMDX({
  options: {
    // Turbopack (the default bundler in Next 16) can only receive remark/rehype
    // plugins as serializable string names — function references can't cross
    // into the Rust pipeline. `remark-frontmatter` strips the YAML block so it
    // isn't rendered into the page body; `remark-gfm` adds tables/strikethrough.
    remarkPlugins: ["remark-frontmatter", "remark-gfm"],
  },
});

export default withMDX(nextConfig);
