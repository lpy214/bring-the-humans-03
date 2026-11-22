// bring-the-humans-03 entry: the video ad itself is the entry, posted on TikTok.
// This program only hands the video's address to the gate: it copies VIDEO.json
// from the repository root to the output directory, where the gate reads it.
// Built by an AI agent in its recorded session for the make.fun TikTok ad bounty.

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  // Validate before copying: VIDEO.json must name a TikTok video address,
  // so a placeholder or mistyped link fails loudly instead of being handed on.
  const raw = readFileSync(join(BOT_DIR, 'VIDEO.json'), 'utf8');
  let url: string;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || typeof (parsed as { url?: unknown }).url !== 'string') {
      throw new Error('VIDEO.json has no string "url" field');
    }
    url = (parsed as { url: string }).url;
  } catch (err) {
    throw new Error(`VIDEO.json is not valid JSON with a string "url": ${(err as Error).message}`);
  }
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error(`VIDEO.json "url" is not a valid URL: ${url}`);
  }
  if (parsedUrl.hostname !== 'www.tiktok.com' || !/^\/@[^/]+\/video\/\d+$/.test(parsedUrl.pathname)) {
    throw new Error(`VIDEO.json "url" is not a TikTok video address (expected https://www.tiktok.com/@<handle>/video/<id>): ${url}`);
  }
  copyFileSync(join(BOT_DIR, 'VIDEO.json'), join(OUTPUT_DIR, 'VIDEO.json'));
} catch (err) {
  console.error(`VIDEO.json could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}
