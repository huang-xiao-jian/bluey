---
name: analyze-business-rules
description: Transform fragmented or ambiguous rule descriptions into clear, structured business rules. Use for business requirements analysis, business-rule governance, or requests to organize business rules, layer rules, or model constraints.
---

# Business Rule Analysis

## Input

The user must provide a clear requirements document. Its format is unrestricted and may be a use-case analysis, user story, workflow definition, or similar material.

| Condition | Handling strategy |
| --- | --- |
| The input document contains no business description | Decline the task and ask the user for material related to business rules. |
| The input document contains fewer than 100 words | Decline the task and ask the user for a more detailed requirements document. |
| The input document is ambiguous | Decline the task and ask the user to provide a clearer requirements description. Do not infer missing details. |

---

## Scope Boundaries

- **Excludes interaction-layer constraints**: Pure interaction behavior, such as requiring a second confirmation before deletion, is not a business rule.
- **Excludes external constraints**: External constraints, such as laws and regulations, are out of scope unless the business has incorporated them into the system's internal logic.

---

## Four-Layer Constraint Model

### 1. Structural Constraints — Define What a Business Object Is

The lowest-level static constraints. They belong to the definition of a business concept, travel with that concept, and are not shared.

**Includes three categories:**

- **Attribute constraints**: Restrictions on an individual attribute. For example, a title must not exceed 40 characters, an amount must not be negative, or an identity-document number must match a format.
- **Relationship constraints**: References and dependencies between objects. For example, an order must reference a valid user ID, or all employees must be removed before a department is deleted.
- **State constraints**: The states and transition paths in an object's lifecycle. Express these with a Mermaid state diagram.

**Example:**

```mermaid
stateDiagram-v2
    [*] --> todo
    todo --> in-progress
    in-progress --> completed
    in-progress --> cancelled
    cancelled --> todo
    completed --> todo
```

---

### 2. Behavioral Constraints — Define Whether an Action May Be Performed

These constrain the triggering and execution of business actions. They are dynamic validations that span objects and concepts.

**Typical scenarios:**

- **Precondition validation**: For example, a user must have no balance or outstanding loan before closing an account; creating a calendar event must validate time conflicts.
- **Authorization validation**: For example, only a department manager may approve that department's expense report.
- **Postcondition validation**: For example, a task cannot be deleted when another task references it as a prerequisite; a product may participate in only one promotion at a time.

---

### 3. Derivation Constraints — Define How Criteria Change Dynamically

Derive new rules or conclusions dynamically from known facts, allowing the system to adapt to complex conditions.

**Typical scenarios:**

- **Dynamic threshold derivation**: A VIP customer has a lower free-shipping threshold than a standard customer.
- **Attribute derivation**: Derive a supplier rating from batch pass rates and delivery timeliness; derive a material's remaining shelf life from storage temperature.
- **Adaptive rules**: For a monthly recurrence, if the target month has no corresponding date (for example, January 31 → February), automatically use the last day of that month.

---

### 4. Resource Constraints — Define System Capacity

These arise from the system's physical or logical limits and set the ceiling for business operations.

**Typical scenarios:**

- **Capacity constraints**: A user may have no more than 500 tasks.
- **Rate constraints**: API rate limiting; process no more than 1,000 orders per second.
- **Quota constraints**: A user may send no more than 10 SMS messages per day; a department's monthly expense-reimbursement quota must not exceed 50,000.

---

## Workflow

When organizing business rules, follow these steps:

1. **Validate the input**: Check whether the input meets the requirements. If it does not, decline the task and explain why.
2. **Identify business concepts**: List the core business objects in the system (for example, tasks, orders, and users).
3. **Populate each constraint layer**:
   - For each business concept, document its structural constraints (attributes, relationships, and state machine). Use a Mermaid state diagram for the state machine.
   - Identify actions spanning concepts and document their behavioral constraints.
   - Identify scenarios requiring dynamic evaluation and document their derivation constraints.
   - Identify system-capacity boundaries and document their resource constraints.
4. **Produce structured output**: Organize the output by the four-layer model. Use a structured list, favor Mermaid state diagrams for state descriptions, and add natural-language explanations where needed.

---

## Reference Example

[Example input](./references/material.md) --> [Example output](./references/artifact.md)
