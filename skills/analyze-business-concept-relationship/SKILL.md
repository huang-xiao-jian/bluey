---
name: analyze-business-concept-relationship
description: >
  Extract and organize the relationships among Business Concepts and Use Case Specifications into a structured relationship description document. When
  user need to draft relationships explictly
---

# analyze-business-concept-relationship

## Purpose

Identify the relationships among **Concept Descriptions** and **Use Case Specifications**, and produce a structured relationship description document.

## When to Use

- The user needs to identify relationships among business concepts.
- The user needs a structured business concept relationship description document.

### Non-Purpose

This skill **MUSTN't** DO:

- Discover new business concepts.
- Redefine business concepts.
- Invent entirely new relationships among business concepts.

## Workflow

1. Find and understand the project's definition of **relationship types**.
2. Read the requirements document and identify the **business concept description files**, **use case specification files**, and **business-critical reference files**.
3. Extract relationship clues from the business concept descriptions.
4. Extract relationship clues from the use case specifications.
5. Match business concepts from the relationship clues and establish the relationships between them. For each relationship, specify:
   1. The relationship description.
   2. The relationship type.
   3. The relationship cardinality (for example, `1:1` or `1:N`).
   4. Relationship-specific business constraints (e.g. a _Project_ may establish at most 10 _Branches_).
6. Derive the following from the relationship clues:
   1. **Conflict identification:** descriptions of the same relationship differ between business concept descriptions and use case specifications.
   2. **Relationship type recommendations:** when a relationship type is unclear, recommend a classification based on context and explain why.
   3. **Implicit constraint derivation:** infer constraints implied by the semantics of the relationship type.
   4. **Missing relationship alerts:** flag concepts that do not participate in any relationship as potentially missing relationships.
7. Populate the template structure, generate, and save the **business concept relationship document**.
8. Output the derived information directly.

### Exception Handling

- If the definition of **relationship types** cannot be obtained, terminate the workflow immediately.

## Execution Constraints

### Required Rules

1. **The relationship is authoritative:** relationship type names and semantics must follow the relationship type definitions.
2. **Concept definitions are out of scope:** concept definitions are maintained in the glossary. This document maps relationships only and must not repeat concept definitions.
3. **Constraints are an inherent part of relationships:** constraints in a relationship description are not "annotation information"; they are the natural expression of the relationship type in its business context.
4. **Do not include stochastic information in the document body:** output all inferences, recommendations, and conflict identifications only in the AI response, not in the generated document body.

### Prohibited Actions

1. **Do not discover new business concepts:** process only existing concepts; do **not** identify or define new ones.
2. **Do not selectively omit relationships:** retain every extracted relationship in full; do **not** omit one because it seems unimportant.
3. **Do not assume relationship types:** when the relationship type between business concepts cannot be confirmed, mark it as "relationship type to be confirmed" in the derived recommendations rather than guessing and writing it into the document.

## Output Constraints

- Derived information (such as relationship conflict identification, relationship type revisions, and implicit constraint guesses) must be **output directly in the AI response** and must never appear anywhere in the document.
- Structure the generated document according to the structural guidance and examples in [template.md](./assets/template.md).

### Template Notes

- **Relationship Constraints** means rules that arise from the relationship itself, rather than ordinary business rule constraints.
