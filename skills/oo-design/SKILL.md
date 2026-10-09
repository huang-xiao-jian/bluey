---
name: oo-design
description: Use when deriving a conceptual object-oriented design from input that defines one or more Workflows, regardless of format or notation.
---

# Object-Oriented Design

Turn requirements into a conceptual design of classes, responsibilities, and collaborators. Use CRC cards as the working model, EBC analysis to seed candidates, and scenario role play to verify the design.

## Inputs and Boundary

Require input that defines at least one Workflow. Accept any format or notation from which an ordered Path of behavior can be extracted.

Preserve each Workflow's structure, terminology, Path names, Workflow Title, and Source Identifiers when present. When a Workflow Title or Source Identifier is absent, assign a neutral one only for organization and traceability. Treat missing, ambiguous, or contradictory behavior as a Requirement Gap rather than inventing it. If the input defines no Workflow, stop and request Workflow-bearing requirements.

Stay conceptual. Do not design attributes, method signatures, constructors, source code, database schemas, APIs, framework components, persistence mappings, or transport details.

## Design Rules

- Treat Entity, Boundary, and Control candidates as hypotheses. Keep the smallest set that assigns every required responsibility coherently; merge overlapping candidates and split mixed responsibilities.
- Classify each boundary as `Boundary --> Driving Port` or `Boundary --> Driven Port` on its CRC card. These are roles, not class-name suffixes or implementation interfaces.
- Apply EBC direction to collaborations between layers: actors use driving boundaries, driving boundaries invoke controls, controls coordinate entities, and controls invoke driven boundaries for external capabilities. EBC does not constrain collaborations within the same layer; allow them when the requirements justify them and cohesion remains clear. Entities must not know boundaries or controls, and boundaries must not collaborate directly with entities. Avoid cycles and control-to-control collaboration unless delegating a cohesive sub-use-case.
- Put business decisions with the entity that owns the relevant knowledge. Use controls for cross-object coordination, alternatives, compensation, and multi-participant transitions.
- Use consistent domain names across CRC cards and diagrams. Avoid technical names and generic suffixes such as `Service`, `Manager`, `Helper`, `Utility`, `Processor`, or `Handler` unless the full term is established domain vocabulary.

## Diagram Rules

- Include every CRC class in the UML diagram with its EBC stereotype, boundary-role note, and labeled relationships. Omit attributes, methods, visibility, responsibilities, and implementation interfaces.
- Use the weakest relationship justified by the requirements. Add multiplicity or lifecycle ownership only when supported by source evidence. Split an unreadable model into cohesive Mermaid blocks without adding per-diagram headings.
- Use the source's Workflow Title as each sequence-diagram subsection heading. When a Workflow is untitled, assign a neutral Workflow Title. Identify its Workflow Source immediately below the heading: link Referenced Input and use a descriptive Source Label for Direct Input.
- Preserve Path names defined by the Workflow Source. When Paths are unnamed, assign neutral names that distinguish them without adding behavioral meaning.
- Create a separate, complete sequence diagram for every distinct start-to-end Path. Do not combine routes with `alt`, `else`, `opt`, `loop`, or `par`.
- Declare only the actors and CRC classes used by a Path, and label participants with CRC class names only.
- Prefix every message or note with its Source Identifier. When the Workflow Source has no Source Identifiers, assign stable neutral Source Identifiers for traceability. Express business intentions rather than implementation calls.
- At a Requirement Gap, show defined behavior up to the gap and add a concise blocking note.

## Workflow

1. Extract every Workflow and its actors, ordered Paths, rules, preconditions, outcomes, and constraints from Direct Input or Referenced Input. Record each Workflow Source, preserving Source Labels when present and assigning neutral Source Labels when absent.
2. Seed EBC candidates from the requirements.
3. Develop the model through CRC cards. Each card contains exactly: role, concise purpose, responsibilities expressed as outcomes or decisions, and collaborators as class names or `None`.
4. Role-play every complete scenario Path from its initiating actor to its terminal outcome. Diagnose each failure as:
   - a **design gap** to resolve by revising classes, responsibilities, or collaborations;
   - a **Requirement Gap** to mark at the affected interaction and leave blocked; or
   - an **implementation concern** to defer without exposing it in the artifact.
5. Repeat affected role plays after design changes until every defined Path succeeds or is blocked by a Requirement Gap.
6. Read the output template, derive its UML and sequence diagrams from the verified CRC model, then synchronize classes, collaborators, responsibilities, interactions, and source references.

## Output

- [Output template](assets/template.md)
- [Complete output example](references/example.md)

Generate every design from the output template. Do not alter or optimize its structure without authorization. Read the complete example when drafting or checking how the template should be populated.

## Validation

Confirm that:

- each class has one role, each responsibility one owner, and every named collaborator its own CRC card;
- every cross-layer collaboration obeys the EBC direction, every same-layer collaboration is supported by a requirement, and any control delegation is justified;
- every Workflow and defined Path is covered or explicitly blocked by a Requirement Gap;
- every CRC class appears in the UML diagram and every sequence participant has a CRC card;
- every collaborator and responsibility is reflected in the diagrams, including blocked items;
- names and roles are consistent across all artifacts;
- every Mermaid block is valid; and
- the final artifact contains only the four required sections and no implementation design, candidate lists, traceability matrices, diagnostic notes, or validation rules.
