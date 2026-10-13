# Link Check Request

## Prerequisite Dependencies

- [Link Check Report](./LinkCheckReport.md)

## 1. Business Definition

A **Link Check Request** describes one requested examination of Markdown files for dead links. It establishes the project boundary, selects the starting files, identifies files that must not be traversed, and determines whether the check remains within the starting set or follows eligible Markdown references.

## 2. Synonyms and Aliases

- Check request
- Dead link check request

## 3. Key Attributes

- **Project Root:** The absolute directory that bounds file selection, recursive traversal, and the file identities recorded in the result.
- **Include Selectors:** A non-empty collection of literal paths and glob expressions whose valid Markdown matches form the starting file set.
- **Exclude Selectors:** An optional collection of literal paths and glob expressions that removes files from the starting set and prevents recursive traversal into matching files.
- **Check Mode:** Indicates whether the check covers only the starting file set (`shallow`) or also follows eligible local Markdown references (`recursive`).

### 3.1 Data Model

```ts
type LinkCheckMode = "shallow" | "recursive";

interface LinkCheckRequest {
  projectRoot: string;
  include: string[];
  exclude?: string[];
  mode: LinkCheckMode;
}
```

## 4. Business Rules and Constraints

1. Every **Link Check Request** has exactly one project root. The root must resolve to an existing directory and remains fixed throughout the check.
2. A CLI entry point uses its current working directory as the default project root. An explicit CLI project root overrides that default and is resolved against the current working directory before the request is created.
3. An MCP entry point requires an absolute project root in every request and never substitutes the server's current working directory.
4. Selectors use `/` as the path separator. Relative selectors are resolved from the project root. An absolute selector is accepted only when its literal path or glob search base is inside the project root.
5. Every selected file must remain inside the project root after filesystem path resolution, including resolution through symbolic links.
6. Each include selector is resolved independently. A selector outside the project root, a missing literal file, a literal non-Markdown file, a glob with no Markdown matches, or an invalid glob is a non-fatal scope issue in the **Link Check Report**.
7. A selector issue preserves the original selector and uses one stable reason: `selector-outside-project-root`, `literal-file-not-found`, `literal-file-not-markdown`, `glob-no-match`, or `invalid-glob`.
8. A problem with one include selector does not prevent usable selectors from contributing files. When no files are selected, the check continues with an empty scope and produces a report.
9. Duplicate selector matches contribute one starting file. Each problematic selector still contributes its own scope issue.
10. Glob selectors support `*`, `**`, `?`, and character classes. A metacharacter may be escaped when it is part of a literal file name. Only `.md` files can become check targets.
11. Exclude selectors use the same syntax and project-root base as include selectors. An omitted or empty exclude collection excludes nothing. When exclusions remove every valid include match, the report has an empty file scope and no scope issue for that outcome.
12. In `shallow` mode, only starting files are checked. Links in those files are still validated relative to their source file, including links whose targets are outside the project root, but linked files are not added to the check scope.
13. In `recursive` mode, traversal follows existing local `.md` targets that remain inside the project root and are not excluded. Traversal has no depth limit. A target outside the project root or an excluded target may still be validated as a link, but its contents are not checked.
14. The checked files and every dead link record's `location.filePath` are identified by paths relative to the resolved project root. Linked targets that are only validated do not appear in the checked-file scope.

## 5. Relationships

- **Association:** One **Link Check Request** initiates one link check and is associated with at most one **Link Check Report**. A report is absent only when the request cannot establish a valid project context or the check cannot produce a trustworthy result.

## 6. Scope Boundaries

- **Includes:** Project context, starting-file selection, exclusions, selector issues, and shallow or recursive traversal intent.
- **Excludes:** Link-validation rules, report presentation, report storage, and derived report summaries.
