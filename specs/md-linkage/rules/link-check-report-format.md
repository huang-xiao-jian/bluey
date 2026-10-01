# Link Check Report Rules

These rules define the raw link check report produced after a successful link check. The raw report is a business result for subsequent delivery, presentation, storage, and other processes.

## Data Model

The following TypeScript type definitions describe the structure of a raw link check report. The field names are report field names used externally; this is the only section in this document that uses TypeScript.

```ts
/** The file scope actually covered by this check. Paths are relative to the project root. */
interface LinkCheckScope {
  files: string[];
}

/** The raw result produced by one link check. */
interface LinkCheckReport {
  scope: LinkCheckScope;
  deadLinks: DeadLinkRecord[];
}
```

## Field Descriptions

- **Check scope**: The set of files actually covered by this check.

- **Dead link records**: All dead link records produced by this check. Every record must comply with the [Dead Link Record Reporting Rules](dead-link-record-format.md).

## Business Rules

- A raw link check report records only the check scope and dead link records. Subsequent processing derives information such as the total number of dead links, conclusions, grouping, sorting, and summaries.

- Generate a raw link check report only when link checking completes successfully. If link checking does not complete successfully, discard the result and do not generate a raw link check report.
