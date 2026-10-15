# [Concept Name]

## Prerequisite Dependencies (Optional)

> List the business concepts this concept depends on. When referring to a listed concept later, use its bold name without repeating the link.

<!--
Format:

- [Concept Name](file-path)

Example:

- [Workspace](./workspace.md)
-->

## 1. Definition

> Define the business concept, its purpose, and the business value it represents.

<!--
Format:

Concise prose describing the concept in business terms.

Example:

A Workspace is a bounded area in which a team organizes and manages related rules.
-->

## 2. Synonyms and Aliases

> List names that stakeholders use interchangeably for this concept.

<!--
Format:

- {Synonym or alias}

Example:

- Project Space
-->

## 3. Key Attributes

> List business characteristics of the concept. Do not include technical implementation details.

<!--
Format:

- **{Attribute Name}:** {Semantic meaning and constraints}

Example:

- **Status:** Indicates whether the Workspace is active or archived.
-->

### 3.1 Data Model (Optional)

> Define the TypeScript data model only when a technical visualization is essential to understand the concept.
> Use enum for limited values instead of literal
> Avoid inheritance unless necessary
> Add proper comment and example to gain better readability

<!--
Format:

```ts
interface {ConceptName} {
  {property}: {Type};
}
```

```json
{
  {property}: {Type}
}

Example:

```ts
enum WorkspaceStatus {
  Active = 'active',
  Archived = 'archived'
}

interface Workspace {
  id: string;
  status: "active" | "archived";
}
```

```json
{
  "id": "001",
  "status": "active"
}
```
-->

## 4. Rules and Constraints

> State the rules that govern how the concept may be created, changed, or used.

<!--
Format:

1. {Business rule}
2. ...

Example:

1. An archived Workspace cannot accept new Workspace Versions.
-->

## 5. Relationships

> Describe this concept's relationships to other business concepts using the authoritative relationship vocabulary.

<!--
Format:

- **{Relationship Type}:** {Related concept and relationship description}

Example:

- **Composition:** A Workspace contains its Workspace Versions.
-->
