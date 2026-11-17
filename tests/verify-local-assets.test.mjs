import test from "node:test";
import assert from "node:assert/strict";
import { checkLocalAssets, localAssetPaths } from "../scripts/verify-local-assets.mjs";

test("finds HTML and Markdown local assets without duplicates", () => {
  assert.deepEqual(localAssetPaths('<img src="assets/readme/a.svg" alt="A"> ![A](assets/readme/a.svg) [B](assets/readme/b.svg)'), [
    "assets/readme/a.svg", "assets/readme/b.svg",
  ]);
});

test("allows existing asset paths", () => {
  assert.deepEqual(checkLocalAssets('![A](assets/readme/a.svg)', "/demo", path => path === "/demo/assets/readme/a.svg"), []);
});

test("reports missing local assets", () => {
  assert.match(checkLocalAssets('![A](assets/readme/missing.svg)', "/demo", () => false)[0], /Missing or unsafe/);
});

test("blocks percent-encoded directory traversal", () => {
  assert.match(checkLocalAssets('![A](assets/%2e%2e/%2e%2e/private.txt)', "/demo", () => true)[0], /unsafe/);
});

test("rejects an empty README", () => {
  assert.ok(checkLocalAssets(" \n ", "/demo", () => true).length);
});

test("rejects malformed percent encoding", () => {
  assert.match(checkLocalAssets('![A](assets/readme/%GG.svg)', "/demo", () => true)[0], /Invalid URL encoding/);
});
