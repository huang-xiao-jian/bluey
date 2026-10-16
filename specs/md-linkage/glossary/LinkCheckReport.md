# Link Check Report

## Prerequities

- [Link Check Delegation](./LinkCheckDelegation.md)
- [Link Check Scope](./LinkCheckScope.md)
- [Dead Link Record](./DeadLinkRecord.md)

## 1. Definition

A **Link Check Report** is the raw check result of one completed **Link Check Delegation**.

## 2. Synonyms and Aliases

- Raw link check report
- Dead link report
- Check result

## 3. Key Attributes

- **Check Delegation:**
- **Check Scope:**
- **Dead Link Records:**

### 3.1 Data Model

```ts
interface LinkCheckReport {
  delegation: LinkCheckDelegation;
  scope: LinkCheckScope;
  deadLinks: DeadLinkRecord[];
}
```

## 4. Rules and Constraints

None!

## 5. Relationships

- **Association:** A **Link Check Report** is the result of one successfully
  completed **Link Check Delegation**.
- **Aggregation:** A **Link Check Report** contains one **Link Check Scope**
  without changing its contents.
- **Aggregation:** A **Link Check Report** aggregates zero or more **Dead Link Records** without changing their contents.
