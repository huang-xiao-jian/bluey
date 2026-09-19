---
name: draft-use-case-specification
description: Draft a structured use-case specification from business requirements. Use when users request a use-case specification, requirements specification, or system use-case document.
---

# Draft Use-Case Specification

## When to Use

- The user explicitly asks to write a use-case specification for a feature.
- The user provides a business-requirements description that must be converted into a structured use-case specification.

## Input

The user must provide a clear requirements document. Its format is unrestricted and may be a use-case analysis, user story, workflow definition, or similar material.

| Condition | Handling strategy |
| :-- | :-- |
| The input document contains no business description | Decline the task and ask the user for material related to business rules. |
| The input document is ambiguous | Decline the task and ask the user to provide a clearer requirements description. Do not infer missing details. |

## Workflow

### 1. Understand the Requirements

Extract the following information from the requirements description:

1. **Use-case name**
2. **Actors**
3. **Business goal**

| Condition | Handling strategy |
| :-- | :-- |
| The input document is too ambiguous to extract key information | Decline the task and require a clearer requirements description. Do not invent missing details. |

### 2. Read the Key ADR

- [Using Mermaid for workflows](./adr/mermaid.md)

### 3. Draft the Use-Case Specification

Follow use-case analysis best practices. Complete each section using the structure in [the use-case template](assets/template.md).

### 4. Verify Against the Checklist

Before returning the result, check every item below and correct any nonconformance:

- [ ] Are the preconditions verifiable?
- [ ] Does the workflow cover the main success scenario, alternative scenarios, and exception scenarios?
- [ ] Does every workflow node have an identifier?
- [ ] Do business rules reference workflow nodes by identifier?
- [ ] Do the postconditions state the resulting system state clearly?
- [ ] Is terminology consistent throughout?

## Output Convention

Generate every use-case specification from the template. Do not alter or optimize the template without authorization.
