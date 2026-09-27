---
name: evaluate-logical-model
description: Use only when the user explicitly asks to evaluate the quality of a business logical model
---

# Business Logical Model Evaluation

## Core Principles

1. **Decoupling**: Do not force the user's description into a relational-table mindset. Focus on business entities, semantic relationships, and lifecycles rather than foreign keys or physical storage.
2. **Incomplete inputs**: The user's input may be only an initial concept. Identify missing information as "requires clarification" in the report instead of making assumptions.
3. **Evaluate without modifying**: The output must be an evaluation report. Do not rewrite or modify the user's original model.

## Reference Files

- [Logical Model Evaluation Criteria](./references/criteria.md), which define the detailed evaluation dimensions and criteria
- [Logical Model Rating Criteria](./references/grade.md), which define the final rating criteria
- [Reference Examples](./references/example.md), which provide positive and negative examples evaluated for logical-model consistency
- [Output Template](./assets/template.md)

## Input

- **Format**: A natural-language description of a business model
- **Minimum threshold**: At least 3 entities, with at least 2 attributes per entity.

## Evaluation Scope

- Internal consistency of each entity
- Consistency of relationships between entities

## Workflow

1. **Parse the input**: Extract business entities, attributes, relationships, and business rules from the user's description.
2. **Validate the input**: Check whether the input meets the minimum threshold. If it does not, issue a **Do Not Pass** report and briefly explain why.
3. **Load the evaluation criteria**: Read the **Logical Model Evaluation Criteria** for detailed dimensions and decision criteria.
4. **Evaluate each item**: Reason through every checkpoint against the evaluation criteria.
5. **Load the rating criteria**: Read the **Logical Model Rating Criteria** for the final rating rules.
6. **Assign an overall rating**: Determine the final rating from the evaluation results.
7. **Load the output template**: Read `assets/template.md` for the report format.
8. **Generate the final report**: Produce the report in the template's format.

### Special Note

When the final rating is **Pass With Reservations**, explicitly identify the issues and provide recommendations. For example:

> "The model's core structure is consistent, its entities are clearly defined, and its relationships are reasonable. However, terminology is inconsistent (for example, 'mobile number' and 'contact phone' are used interchangeably), and some relationship semantics are ambiguous. Resolve these issues before proceeding to physical modeling."
