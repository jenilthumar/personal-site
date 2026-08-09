/**
 * Profile / site configuration — the single source of truth for the sidebar
 * and metadata. Edit your name, bio, current role and links here.
 */

export type NavLink = {
  label: string;
  href: string;
};

export const site = {
  /** Shown top-left. The ® is rendered as a superscript mark by the Wordmark. */
  name: "Jenil H.T",
  registered: true,

  bio: "A product and visual designer in Surat. I care about how things look, feel, and behave, and I keep them clean and functional more than loud.",

  /** The opening line on the home page, set large. Third person, unlike the bio. */
  statement:
    "Jenil Thummar is a product and visual designer living in Surat. He cares about how things look, feel, and behave, and he loves to keep them clean and functional while balancing strong aesthetics.",

  /** "Currently designing at …" row. */
  current: {
    label: "Currently designing at",
    company: "Roboto Studio",
    logo: "/roboto-studio.webp",
    url: "https://www.robotostudio.com",
  },

  /** Tenure line, styled in the dimmed token. */
  dateRange: "May[25] ⎯ Present",

  /** Shown in the footer, beside the year. */
  location: "Surat, India",

  /** Bottom-pinned footer navigation. */
  footerNav: [
    { label: "About", href: "/about" },
    { label: "Running", href: "/running" },
    { label: "Contact", href: "/contact" },
  ] satisfies NavLink[],

  /** Used by the Contact page / links. */
  social: [
    { label: "Email", href: "mailto:hello@jenil.example" },
    { label: "Twitter / X", href: "https://x.com/" },
    { label: "Read.cv", href: "https://read.cv/" },
    { label: "LinkedIn", href: "https://www.linkedin.com/" },
  ] satisfies NavLink[],
};
