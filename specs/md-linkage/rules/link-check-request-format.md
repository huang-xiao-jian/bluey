# Link Check Request Rules

These rules define the input to one link check. CLI and MCP entry points translate their arguments into the same request. They obtain the project root separately from the request fields.

## Data Model

The following TypeScript definitions describe the request. Field names are the request field names used externally; this is the only section in this document that uses TypeScript.

```ts
/** How far a check proceeds beyond the files selected by include. */
type LinkCheckMode = 'shallow' | 'recursive';

interface LinkCheckRequest {
  /** Required file selectors; each entry is a literal path or glob expression. */
  include: string[];
  /** File selectors to remove from the check scope. */
  exclude?: string[];
  /** Whether to check only selected files or follow their local Markdown links. */
  mode: LinkCheckMode;
}
```

## Field Descriptions

- **Include**: A non-empty list of file selectors. A selector without glob metacharacters is a literal file path; a selector with glob metacharacters is a glob expression. Match every selector relative to the project root. The union of matches forms the starting file set.

- **Exclude**: File selectors with the same syntax and base as `include`. Remove their matches from the starting set and, in recursive mode, from files discovered through links. An omitted or empty list excludes nothing.

- **Mode**: `shallow` checks only the starting set. `recursive` also checks existing local Markdown files reachable by following links from checked files, without a depth limit.

## Project Context

- Resolve one `projectRoot` for each check. The same root rules apply to `shallow` and `recursive` requests. Do not infer the root from `include` matches or discovered link targets.

- **CLI:** Use the process's current working directory as the project root by default. An optional `--project-root` argument overrides it; resolve a relative value against the current working directory.

- **MCP:** Require `projectRoot` as an argument to every link-check tool call. It must be an absolute path. The server does not use its own working directory as a default.

- For either entry point, the resolved root must be an existing directory. Use its resolved filesystem path when determining whether a file is inside the project. The root stays fixed for that check.

## Selection Rules

- Selectors use `/` as the path separator and are relative to `projectRoot`. Reject absolute selectors and selectors that resolve outside the root. A literal selector must name an existing Markdown file. A glob may match zero or more Markdown files; a request whose final starting set is empty fails before detection. Duplicate matches are checked once.

- A glob can select files at any directory depth, so no separate scan directory, file extension filter, or collection request field is needed. Glob metacharacters follow standard glob syntax (`*`, `**`, `?`, and character classes); escape a metacharacter to use it in a literal file name. Selection includes only `.md` and `.mdx` files. Other files are never check targets.

- In `shallow` mode, check only selected files. Links in those files are validated relative to the source file, including links whose target lies outside `projectRoot`; those targets are not added to the check scope.

- In `recursive` mode, `projectRoot` also bounds traversal. Follow only existing local `.md` and `.mdx` link targets whose resolved filesystem paths remain inside the root and are not matched by `exclude`. This also prevents a symlink from expanding the check outside the project. Validate a link to a target outside the root, but do not check that target's contents. An excluded file can still be validated as a link target; it is simply not added to the check scope.

- For either mode, `scope.files` and every dead link record's `sourceFile` are paths relative to the resolved `projectRoot`. Only checked files appear in `scope.files`; linked targets that are merely validated do not. Return no report when request validation, selection, or detection fails.

## JSON Examples

Check two specific files and every Markdown file in a folder, except drafts:

```json
{
  "include": ["specs/md-linkage/spec.md", "specs/md-linkage/rules/*.md", "specs/md-linkage/stories/**/*.md"],
  "exclude": ["specs/md-linkage/stories/draft.md", "specs/**/archive/**"],
  "mode": "shallow"
}
```

Follow local Markdown links from one starting file:

```json
{
  "include": ["specs/md-linkage/spec.md"],
  "mode": "recursive"
}
```

For MCP, the tool call supplies `projectRoot` alongside the request fields:

```json
{
  "projectRoot": "/workspace/bluey",
  "include": ["specs/md-linkage/spec.md"],
  "mode": "recursive"
}
```
