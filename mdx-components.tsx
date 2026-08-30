import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";
import Link from "next/link";

/**
 * Global MDX element → component map. Required by `@next/mdx` in the App Router
 * (MDX won't render without this file). Styles every entry's body in the
 * sage-green design system. Local overrides can still be passed per-page.
 */
const components: MDXComponents = {
  h1: (props: ComponentPropsWithoutRef<"h1">) => (
    <h1
      className="mt-12 mb-4 text-2xl font-medium tracking-[-0.02em] text-oxley-300 first:mt-0"
      {...props}
    />
  ),
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2
      className="mt-10 mb-3 text-lg font-medium tracking-[-0.01em] text-oxley-300"
      {...props}
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="mt-8 mb-2 text-base font-medium text-oxley-300" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="my-4 text-base leading-[1.7] text-body" {...props} />
  ),
  a: ({ href = "#", ...props }: ComponentPropsWithoutRef<"a">) => {
    const external = href.startsWith("http");
    const className =
      "text-oxley-300 underline decoration-oxley-700 underline-offset-[3px] transition-colors hover:decoration-oxley-300";
    return external ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        {...props}
      />
    ) : (
      <Link href={href} className={className} {...props} />
    );
  },
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul
      className="my-4 list-disc space-y-1.5 pl-5 text-base leading-[1.7] text-body marker:text-oxley-700"
      {...props}
    />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol
      className="my-4 list-decimal space-y-1.5 pl-5 text-base leading-[1.7] text-body marker:text-oxley-700"
      {...props}
    />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => (
    <li className="pl-1" {...props} />
  ),
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-medium text-oxley-300" {...props} />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="my-6 border-l border-oxley-700 pl-4 text-body italic"
      {...props}
    />
  ),
  hr: (props: ComponentPropsWithoutRef<"hr">) => (
    <hr className="my-10 border-0 border-t border-oxley-700/40" {...props} />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code
      className="rounded bg-oxley-700/15 px-1.5 py-0.5 font-mono text-[0.85em] text-oxley-300"
      {...props}
    />
  ),
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      className="my-6 overflow-x-auto rounded-lg bg-oxley-700/10 p-4 font-mono text-sm leading-relaxed text-body [&>code]:bg-transparent [&>code]:p-0"
      {...props}
    />
  ),
  img: ({ alt = "", ...props }: ComponentPropsWithoutRef<"img">) => (
    // Content images have no intrinsic dimensions, so a plain lazy <img> is the
    // robust choice here (next/image is used for the fixed-size card covers).
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      loading="lazy"
      className="my-6 w-full rounded-lg"
      {...props}
    />
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
