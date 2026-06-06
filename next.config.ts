import type { NextConfig } from "next";
import createMDX from "@next/mdx";

// Allow next/image to optimize media served from Vercel Blob — the public blob
// domain, plus a custom domain when NEXT_PUBLIC_MEDIA_BASE_URL is one.
const remotePatterns = [
  { protocol: "https" as const, hostname: "*.public.blob.vercel-storage.com" },
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
  images: { remotePatterns },
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
