# Link Check Report

## Prerequities

- [Link Check Delegation](./LinkCheckDelegation.md)
- [Link Check Scope](./LinkCheckScope.md)
- [Resolved Specification Link](./ResolvedSpecificationLink.md)

## 1. Definition

A **Link Check Report** is the raw check result of one completed **Link Check Delegation**.

## 2. Key Attributes

- **Check Delegation:**
- **Check Scope:**
- **Dead Resolved Specification Links:**

### 3.1 Data Model

```ts
interface LinkCheckReport {
  delegation: LinkCheckDelegation;
  scope: LinkCheckScope;
  deadLinks: DeadResolvedSpecificationLink[];
}
```

## 3. Rules and Constraints

None!

## 4. Relationships

- **Association:** A **Link Check Report** is the result of one successfully
  completed **Link Check Delegation**.
- **Aggregation:** A **Link Check Report** contains one **Link Check Scope**
  without changing its contents.
- **Aggregation:** A **Link Check Report** aggregates zero or more dead
  **Resolved Specification Link** variants without changing their contents.
