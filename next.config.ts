import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // Let .md / .mdx files act as pages and be imported as components.
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
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
