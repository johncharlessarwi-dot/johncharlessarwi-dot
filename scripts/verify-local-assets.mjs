import { existsSync, readFileSync } from "node:fs";
import { resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("../", import.meta.url)));

/** Extract local assets used by Markdown images, links and HTML img tags. */
export function localAssetPaths(readme) {
  const urls = [
    ...[...readme.matchAll(/!\[[^\]]*\]\((assets\/[^)\s]+)\)/g)].map(m => m[1]),
    ...[...readme.matchAll(/\]\((assets\/[^)\s]+)\)/g)].map(m => m[1]),
    ...[...readme.matchAll(/<(?:img|a)\b[^>]*\b(?:src|href)="(assets\/[^"]+)"/gi)].map(m => m[1]),
  ];
  return [...new Set(urls)].sort();
}

export function checkLocalAssets(readme, root = ROOT, exists = existsSync) {
  const failures = [];
  if (!readme.trim()) failures.push("README.md must not be empty");
  const base = resolve(root);
  for (const asset of localAssetPaths(readme)) {
    let decoded;
    try { decoded = decodeURIComponent(asset.split(/[?#]/)[0]); }
    catch { failures.push("Invalid URL encoding: " + asset); continue; }
    const absolute = resolve(base, decoded);
    if (!absolute.startsWith(base + sep) || !exists(absolute)) {
      failures.push("Missing or unsafe local asset: " + asset);
    }
  }
  return failures;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const readme = readFileSync(resolve(ROOT, "README.md"), "utf8");
  const failures = checkLocalAssets(readme);
  if (failures.length) {
    for (const failure of failures) console.error(failure);
    process.exitCode = 1;
  } else {
    console.log("README local assets verified.");
  }
}
