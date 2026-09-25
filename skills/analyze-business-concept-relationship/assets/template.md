# Concept Relationships

## Purpose

> Explain the objectives of this document in brief

<!--
Example:

This document maps the relationships among the concepts in the [requirement](./requirement.md).
It is a navigation and modelling aid, not a replacement for the canonical glossary definitions.
-->

## Prerequisite

> The authoritative source of the list of relationship types

<!--
Example:

- [Relationship Mandatory](./docs/concept-relationships.md) The mandatory vocabulary for **Relationship Name**
-->

## Concepts in Scope

> List all the involved business concepts, and ensure each link to the **Concept Description Document**

<!--
Format:

- [Concept](refer the original concept description file)

Example:

- [Workspace](./glossary/workspace.md)
- [Rule Factor](./glossary/rule-factor.md)
-->

> List all the associations and follow the same structure.

<!--
Format:

### {Concept 1} -- {Concept 2}

**{Relationship Type}.** {Brief description about the relationship}

**Relationship Constraints:**

- {The Concept 1....}

Example:

### Workspace -- Workspace Version

**Aggregation.** A Workspace organizes its Workspace Versions.

**Relationship Constraints:**

- One Workspace organizes zero or more Workspace Versions.
- Each Workspace Version belongs to one Workspace.

### Workspace Version -- Workspace Rule

**Composition.** A Workspace Version contains its Workspace Rules.

**Relationship Constraints:**

- A Workspace Version contains zero or more Workspace Rules, each local to that version.
- A Workspace Version must contain at least one Workspace Rule before release.
-->
