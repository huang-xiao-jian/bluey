---
name: analyze-business-concepts
description: Extract business concepts from business-source material and create business-concept descriptions. Use when users ask to identify or define business concepts, or maintain a glossary.
---

# analyze-business-concepts

## Input

The user must provide a clear document that is strongly related to the business domain.

### Exception Handling

| Condition | Handling strategy |
| :-- | :-- |
| The user provides a technical design document | Decline the task and ask for material related to the business domain. |
| The input document is ambiguous | Decline the task and ask the user to provide a clearer requirements description. Do not infer missing details. |

## Core Principles

1. **Business-focused**: Use natural language and avoid obscure technical concepts so that non-technical stakeholders can understand the description.
2. **Minimum viable content**: A business definition, key attributes, and business rules must all be present.
3. **Single source of truth (SSOT)**: The concept document is the authoritative source for terminology. Definitions in use-case specifications and technical implementations must remain consistent with it.
4. **Reference rather than duplicate**: When referring across concepts, identify the source of the referenced business concept. Do not duplicate attribute definitions in concept documents, to avoid maintaining the same information in multiple places.
5. **Precise relationship descriptions**: Use defined UML relationships rather than simplified natural-language descriptions.

## Resources

- [Business-concept description template](assets/template.md)
- [Business-concept description example](references/example.md)

## Workflow

<!-- The concept-extraction strategy is inclusive and need not be followed rigidly. -->

1. Extract business concepts: Read the user-provided material and identify candidate business concepts using the extraction strategy.
2. Infer relationships: Analyze business-level relationships among the identified concepts.
3. For each business concept:
   - Consult the **business-concept description example** and **business-concept description template** to refine the relevant dimensions.
   - Generate the business-concept description from the **business-concept description template**.
   - Verify that the result satisfies the constraints of the **business-concept description template**.

### Business-Concept Extraction Strategy

- Identify recurring noun terms.
- Identify entities governed by business rules or constraints.
- Extract core participants in processes or use cases.
- Mark entities with a distinct business value or business boundary.

## Output Convention

Generate every business-concept description from the template. Do not alter or optimize the template without authorization.
