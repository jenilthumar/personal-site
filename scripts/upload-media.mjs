// Uploads everything under ./media to Vercel Blob, preserving relative paths as
// pathnames (e.g. media/work/foo.jpg → work/foo.jpg). Re-running overwrites, so
// URLs stay stable.
//
// Run:  pnpm upload-media
//
// Requires in .env.local (see .env.example):
//   BLOB_READ_WRITE_TOKEN
// The script prints NEXT_PUBLIC_MEDIA_BASE_URL for you to add.

import { put } from "@vercel/blob";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  console.error("✗ Missing BLOB_READ_WRITE_TOKEN.");
  console.error(
    "  Add it to .env.local (see .env.example). Create a Blob store at\n" +
      "  https://vercel.com/dashboard → Storage → Create → Blob, then copy the token.",
  );
  process.exit(1);
}

const MEDIA_DIR = path.join(process.cwd(), "media");

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    console.error(
      "✗ No ./media directory found. Put your originals in ./media\n" +
        "  (e.g. media/work/foo.jpg) — it's gitignored and is the source for uploads.",
    );
    process.exit(1);
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile() && !entry.name.startsWith(".")) yield full;
  }
}

let count = 0;
let base = null;
for await (const file of walk(MEDIA_DIR)) {
  const key = path.relative(MEDIA_DIR, file).split(path.sep).join("/");
  const body = await readFile(file);
  // Content type is inferred from the pathname extension. Stable path (no random
  // suffix) so the public URL stays the same across re-uploads.
  const blob = await put(key, body, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    token,
  });
  if (!base) base = new URL(blob.url).origin;
  console.log(`  ✓ ${key}  →  ${blob.url}`);
  count++;
}

console.log(`\nUploaded ${count} file(s) to Vercel Blob.`);
if (base) {
  console.log(
    "\nAdd this to .env.local (and your Vercel project env), then restart dev:\n" +
      `  NEXT_PUBLIC_MEDIA_BASE_URL=${base}\n`,
  );
}
