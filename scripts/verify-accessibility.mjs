import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("../", import.meta.url)));

export function checkHtmlImageAlts(readme) {
  const issues = [];
  const tags = [...readme.matchAll(/<img\b[^>]*>/gi)];
  for (const [index, match] of tags.entries()) {
    if (!/\balt\s*=\s*(?:"[^"]*"|'[^']*')/i.test(match[0])) {
      issues.push("HTML image " + (index + 1) + " has no alt attribute");
    }
  }
  for (const match of readme.matchAll(/!\[\s*\]\([^)]+\)/g)) {
    issues.push("Markdown image has empty alternative text: " + match[0].slice(0, 80));
  }
  return issues;
}

export function checkLocalSvg(svg, filename = "image.svg") {
  const issues = [];
  if (!/<svg\b[^>]*\brole="img"/i.test(svg)) issues.push(filename + ": missing image role");
  if (!/<title\b[^>]*>[^<]+<\/title>/i.test(svg)) issues.push(filename + ": missing accessible title");
  if (!/<desc\b[^>]*>[^<]+<\/desc>/i.test(svg)) issues.push(filename + ": missing accessible description");
  if (/<(?:script|foreignObject)\b/i.test(svg) || /\bon(?:load|error|click)\s*=/i.test(svg)) {
    issues.push(filename + ": executable or active content not permitted");
  }
  if (/<animate(?:Transform|Motion)?\b/i.test(svg) && !/prefers-reduced-motion/i.test(svg)) {
    issues.push(filename + ": motion without reduced-motion handling");
  }
  return issues;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const readme = readFileSync(resolve(ROOT, "README.md"), "utf8");
  const errors = checkHtmlImageAlts(readme);
  const directory = resolve(ROOT, "assets/readme");
  for (const filename of readdirSync(directory).filter(name => name.endsWith(".svg"))) {
    errors.push(...checkLocalSvg(readFileSync(resolve(directory, filename), "utf8"), filename));
  }
  if (errors.length) {
    for (const issue of errors) console.error(issue);
    process.exitCode = 1;
  } else {
    console.log("README image alternatives and local SVG accessibility verified.");
  }
}
