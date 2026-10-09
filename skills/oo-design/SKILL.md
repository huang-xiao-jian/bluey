---
name: oo-design
description: Use when deriving a conceptual object-oriented design from one or more Use Case Specifications supplied directly or referenced by another input.
---

# Object-Oriented Design

Turn requirements into a conceptual design of classes, responsibilities, and collaborators. Use CRC cards as the working model, EBC analysis to seed candidates, and scenario role play to verify the design.

## Inputs and Boundary

Require one or more Use Case Specifications, supplied directly or referenced by another input. Use broader requirements only to locate or contextualize those specifications. Treat missing, ambiguous, or contradictory behavior as a requirement gap rather than inventing it.

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
- Use the exact Use Case Specification title as each sequence-diagram subsection heading and link its source immediately below the heading.
- Include only workflow categories defined by the source: Primary Workflow, Alternate Workflow, and Exception Workflow. Treat a generic Business Workflow as Primary Workflow.
- Create a separate, complete sequence diagram for every distinct start-to-end path. Do not combine routes with `alt`, `else`, `opt`, `loop`, or `par`.
- Declare only the actors and CRC classes used by a path, and label participants with CRC class names only.
- Prefix every message or note with its source identifier and express business intentions rather than implementation calls.
- At a requirement gap, show defined behavior up to the gap and add a concise blocking note.

## Workflow

1. Extract actors, use cases, workflows, rules, preconditions, outcomes, and constraints from every supplied or referenced Use Case Specification. Record each specification's source.
2. Seed EBC candidates from the requirements.
3. Develop the model through CRC cards. Each card contains exactly: role, concise purpose, responsibilities expressed as outcomes or decisions, and collaborators as class names or `None`.
4. Role-play every complete scenario path from its initiating actor to its terminal outcome. Diagnose each failure as:
   - a **design gap** to resolve by revising classes, responsibilities, or collaborations;
   - a **requirement gap** to mark at the affected interaction and leave blocked; or
   - an **implementation concern** to defer without exposing it in the artifact.
5. Repeat affected role plays after design changes until every defined path succeeds or is blocked by a requirement gap.
6. Read the output template, derive its UML and sequence diagrams from the verified CRC model, then synchronize classes, collaborators, responsibilities, interactions, and source references.

## Output

- [Output template](assets/template.md)
- [Complete output example](references/output-example.md)

Generate every design from the output template. Do not alter or optimize its structure without authorization. Read the complete example when drafting or checking how the template should be populated.

## Validation

Confirm that:

- each class has one role, each responsibility one owner, and every named collaborator its own CRC card;
- every cross-layer collaboration obeys the EBC direction, every same-layer collaboration is supported by a requirement, and any control delegation is justified;
- every Use Case Specification and defined scenario path is covered or explicitly blocked by a requirement gap;
- every CRC class appears in the UML diagram and every sequence participant has a CRC card;
- every collaborator and responsibility is reflected in the diagrams, including blocked items;
- names and roles are consistent across all artifacts;
- every Mermaid block is valid; and
- the final artifact contains only the four required sections and no implementation design, candidate lists, traceability matrices, diagnostic notes, or validation rules.
