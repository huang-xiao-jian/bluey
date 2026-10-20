# Detailed Naming Conventions

## Core Principle

A class name must convey business meaning clearly enough that a person without a technical background can infer the class's business function from its name.

## Naming Rules

### Use a Business Role as the Suffix for an Acting Subject

The suffix should describe a business role rather than a technical implementation. For example:

- `-Scheduler`: Coordinates a business workflow.
- `-Checker`: Determines eligibility or evaluates conditions.
- `-Cleaner`: Cleans up an environment.
- `-Calculator`: Calculates amounts or numeric values.
- `-Drafter`: Drafts content.

### Do Not Use Purely Technical Suffixes That Do Not Reveal a Business Function

Do not use these suffixes in class names: `Service`, `Manager`, `Controller`, `Component`, or `Bean`.

Evaluation rule: after removing the prefix, does the suffix itself carry business meaning? If not, the name is technology-oriented and must be replaced.

### Let Business Semantics Decide Ambiguous Cases

Some naming suffixes are ambiguous. Resolve them according to business semantics, using this core criterion: can the business function be inferred from the name?

Special cases:

- `Handler` / `Processor`: Although these terms can sound technical, they are allowed when the prefix makes the business function clear. For example, `RefundExceptionHandler` clearly indicates that it handles refund exceptions.
- `Scheduler`: In a workflow-orchestration context, `Scheduler` describes the business role responsible for coordinating the workflow. It carries sufficient business meaning and is allowed.
