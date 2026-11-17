# Profile maintenance guide

## Repository structure

- `README.md`: public-facing profile, technology stack, projects, and contact links
- `assets/readme/`: local decorative and project spotlight SVGs
- `scripts/`: zero-dependency content integrity checks
- `tests/`: test cases for the checks
- `.github/workflows/readme-integrity.yml`: checks on profile updates
- `.github/workflows/snake.yml`: scheduled contribution illustration generation

## Updating a project

Confirm the repository exists, check its visibility, and describe only functionality supported by public documentation. Preserve the URL exactly; project names may not match repository slugs. Private repositories should never be described as openly browseable.

## Updating an image

Keep readable fallback titles and descriptions inside SVGs. Provide a nonanimated appearance and use `prefers-reduced-motion` handling. Avoid embedded scripts, external references, and third-party tracking pixels.

## Release checklist

1. Run `npm run check`.
2. Verify every new link and inspect Markdown rendering in GitHub.
3. Review the GitHub Actions result on the exact commit.
4. Confirm the default branch contains the commit SHA; branch-local commits alone do not update a profile.
5. Do not mistake an SVG counter, contribution-graph snapshot, or delayed third-party widget for a Git commit count.
