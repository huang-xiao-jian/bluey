# Use Mermaid to Express the Business Workflow in Use-Case Specifications

## Context

Traditional use-case specifications describe the Business Workflow in separate textual sections. This causes information duplication and makes branching logic difficult to understand. Introducing Mermaid requires a revised approach to representing the Business Workflow.

## Decision

**Adopt Mermaid as the sole standard for expressing the Business Workflow in use-case specifications.**

Core conventions:

1. **Use Mermaid diagrams as the primary workflow representation**
   - Every use-case specification must use a Mermaid flowchart to describe its Business Workflow.
   - Workflow nodes must retain identifiers for direct references in business rules.
2. **Remove standalone textual flow sections**
   - Do not separately write sections such as "basic flow" and "alternative flow."

## Consequences

- **Positive**: Documentation is more concise, maintenance costs decrease, and readability improves.
- **Negative**: Team members must become familiar with Mermaid syntax.

## Alternatives

1. Retain textual flow sections and add a Mermaid diagram → duplicate information and double the maintenance effort.
2. Retain only textual flow sections → branching logic is difficult to read.
