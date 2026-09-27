# Logical Model Consistency Evaluation Checklist

---

## Scoring

There are five equally weighted evaluation dimensions, each worth 20 points.

| Dimension | Evaluation Focus |
| --- | --- |
| 1. Entity Completeness | Entity-definition clarity, attribute completeness, and isolated-entity detection |
| 2. Relationship Validity | Cardinality reasonableness, direction clarity, and semantic completeness |
| 3. Constraint Consistency | Business-rule conflict detection and attribute-constraint reasonableness |
| 4. Lifecycle Logic | Closed state flow and precondition feasibility |
| 5. Terminology Consistency | Naming consistency and abstraction-level consistency |

---

## 1. Entity Completeness

### Checkpoint 1.1: Is every entity clearly defined?

- **Pass criteria**: Every entity name is a business concept (for example, "Order," "User," or "Product") with a clear business meaning.
- **Fail criteria**: An entity name is a technical term (for example, "Table 1," "data_A," or "Entity_01") or is blank, making its business meaning unclear.

### Checkpoint 1.2: Does every entity have at least two attributes?

- **Pass criteria**: Every entity defines at least two attributes with clear business meanings, and each attribute name conveys its business purpose.
- **Fail criteria**: An entity defines only zero or one attribute, or its attribute names have no business meaning (for example, "field1," "data," or "info").

### Checkpoint 1.3: Are there any isolated entities?

- **Pass criteria**: Every entity has a relationship with at least one other entity; no entity is completely isolated.
- **Fail criteria**: An entity has no relationship with any other entity, so its role in the business scenario cannot be explained.

---

## 2. Relationship Validity

### Checkpoint 2.1: Does cardinality match business expectations?

- **Pass criteria**: Relationship cardinality (1:1, 1:N, or M:N) is consistent with the business description and business expectations.
- **Fail criteria**: Cardinality conflicts with the business semantics (for example, the description states that an order can contain multiple products, but the Order-to-Product relationship is defined as 1:1).

### Checkpoint 2.2: Is relationship direction clear?

- **Pass criteria**: The ownership/dependency direction or bidirectional nature of each relationship is clear, so it is possible to determine who owns or references whom.
- **Fail criteria**: A relationship is ambiguous: its ownership/dependency or directional semantics cannot be determined (for example, it only says "Entity A and Entity B are related" without specifying the direction).

### Checkpoint 2.3: Does every relationship have a business-semantic name?

- **Pass criteria**: Every relationship has a clear business-semantic name (for example, "contains," "belongs to," "creates," or "is assigned to") that accurately describes the relationship between entities.
- **Fail criteria**: A relationship uses only vague wording such as "is related to" or "has a connection with," without a specific business-semantic name.

---

## 3. Constraint Consistency

### Checkpoint 3.1: Do any business rules contradict each other?

- **Pass criteria**: Business rules do not conflict; every rule can hold at the same time without contradiction.
- **Fail criteria**: Rule A directly contradicts Rule B (for example, Rule A requires an order to be paid before shipment, while Rule B allows an unpaid order to be shipped).

### Checkpoint 3.2: Do attribute constraints conflict with the business description?

- **Pass criteria**: Attribute enumerations and value ranges align with the business semantics; no restriction conflicts with the business description.
- **Fail criteria**: An attribute constraint conflicts with the business description (for example, an Age attribute permits negative values, or a Priority enumeration includes an undefined "Urgent" level).

---

## 4. Lifecycle Logic

### Checkpoint 4.1: Do state transitions form a closed state flow?

- **Pass criteria**: Every non-terminal state has a defined subsequent transition path to a terminal state, terminal states are irreversible, and no dead-end state exists.
- **Fail criteria**: A dead-end state exists (for example, a state has no outgoing transition), or state transitions form a non-terminating infinite loop.

### Checkpoint 4.2: Are state-change preconditions feasible?

- **Pass criteria**: Every state-change precondition is supported by an entity or attribute in the model and can be verified.
- **Fail criteria**: A state change depends on an external condition that the model does not define (for example, shipment requires available inventory, but the model defines neither an Inventory entity nor an inventory attribute).

---

## 5. Terminology Consistency

### Checkpoint 5.1: Does each concept use consistent terminology?

- **Pass criteria**: The same business concept uses the same term in all entities, without synonymous alternatives.
- **Fail criteria**: The same concept uses different terms in different entities (for example, a User entity uses "phone number" while an Order entity uses "contact number" for the same concept).

### Checkpoint 5.2: Is the abstraction level consistent?

- **Pass criteria**: All entities and attributes are described at the same abstraction level as business concepts, without implementation details mixed in.
- **Fail criteria**: High-level business concepts are mixed with low-level technical fields (for example, "User ID (auto-increment primary key)" or "VARCHAR(50)" appears alongside "Order Amount" and "Created At" as attributes).
