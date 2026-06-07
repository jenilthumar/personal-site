<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Writing copy

Prose you generate or rewrite for this site is AI-generated content, and it should not read like it. Before any copy is treated as done, run it through the **humanizer** skill at `.claude/skills/humanizer/` (or `/humanizer`) and apply the rewrite. Don't just note that you could.

This covers case-study copy in `content/**/*.mdx`, the page copy under `app/(site)/(prose)/`, and the bio and labels in `lib/site.ts`. The skill strips the usual AI tells: em dashes, forced rule-of-three, "testament / landscape / showcasing" vocabulary, negative parallelisms, generic upbeat conclusions. Vary the rhythm and keep real, specific detail so it reads like a person wrote it.
