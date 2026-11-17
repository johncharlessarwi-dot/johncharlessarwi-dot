import test from "node:test";
import assert from "node:assert/strict";
import { checkHtmlImageAlts, checkLocalSvg } from "../scripts/verify-accessibility.mjs";

const svg = '<svg role="img"><title id="title">Sample card</title><desc id="desc">Sample content</desc><circle cx="3" cy="3" r="3"/></svg>';

test("accepts labelled HTML images and labelled SVG", () => {
  assert.deepEqual(checkHtmlImageAlts('<img src="x.svg" alt="Design overview" />'), []);
  assert.deepEqual(checkLocalSvg(svg), []);
});

test("rejects images without meaningful alt attributes", () => {
  assert.equal(checkHtmlImageAlts('<img src="x.svg"/>').length, 1);
  assert.equal(checkHtmlImageAlts('![](./x.svg)').length, 1);
});

test("allows explicitly decorative image alternatives", () => {
  assert.deepEqual(checkHtmlImageAlts('<img src="ornament.svg" alt="" />'), []);
});

test("requires a title and descriptive text in SVGs", () => {
  const issues = checkLocalSvg('<svg role="img"><rect width="10" height="10"/></svg>');
  assert.equal(issues.length, 2);
});

test("rejects inline scripts and active event handlers", () => {
  assert.ok(checkLocalSvg(svg.replace("</svg>", '<script>alert(1)</script></svg>')).some(s => s.includes("not permitted")));
  assert.ok(checkLocalSvg(svg.replace("<svg ", '<svg onload="alert(1)" ')).some(s => s.includes("not permitted")));
});

test("requires reduced-motion handling for SVG animations", () => {
  assert.ok(checkLocalSvg(svg.replace("</svg>", '<animate attributeName="opacity" dur="2s"/></svg>')).some(s => s.includes("reduced-motion")));
  assert.deepEqual(checkLocalSvg(svg.replace("</svg>", '<animate attributeName="opacity" dur="2s"/><style>@media(prefers-reduced-motion:reduce){animate{display:none}}</style></svg>')), []);
});
