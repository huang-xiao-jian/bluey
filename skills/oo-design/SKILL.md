---
name: oo-design
description: Use when deriving a conceptual object-oriented design from input that defines one or more Workflows, regardless of format or notation.
---

# Object-Oriented Design

Turn requirements into a conceptual design of classes, responsibilities, and collaborators. Use CRC cards as the working model, EBC analysis to seed candidates, and scenario role play to verify the design.

## Principles

Stay conceptual. Do not design attributes, method signatures, constructors, source code, database schemas, APIs or transport details.

## Inputs

Require input that defines at least one Workflow. Accept any format or notation from which an ordered Path of behavior can be extracted.

Preserve each Workflow's structure, terminology, Path names, and Workflow Title when present. Treat missing, ambiguous, or contradictory behavior as a Requirement Gap rather than inventing it.

**If the input defines no Workflow, stop and request Workflow-bearing requirements.**

## Design Rules

- Use BEC analysis, treat Entity, Boundary, and Control candidates as hypotheses. Assigns every required responsibility coherently; merge overlapping candidates and split mixed responsibilities.
- Apply EBC dependency direction between layers:
  - `Actors` --> `Driving Boundary` --> `Control` --> `Entity`
  - `Control` --> `Driven Boundary`
- Classify each Boundary as `Boundary --> Driving Port` or `Boundary --> Driven Port` on its CRC card.

## Diagram Rules

### Class Diagram

- Include Every CRC class in the UML diagram with its EBC stereotype, boundary-role note, and labeled relationships.
- Omit attributes, methods, visibility, responsibilities, and implementation interfaces.
- Use the standard relationship justified by the requirements. Add multiplicity or lifecycle ownership only when supported by source evidence. - Split an unreadable model into cohesive Mermaid blocks without adding per-diagram headings.

### Sequence Diagram

- Use the source's Workflow Title as each sequence-diagram subsection heading. When a Workflow is untitled, assign a neutral Workflow Title.
- Preserve Path names defined by the Workflow Source. When Paths are unnamed, assign neutral names that distinguish them without adding behavioral meaning.
- Immediately below each Path heading, explain the scenario in one concise business-focused paragraph. State the relevant precondition or trigger, the behavior being exercised, and the terminal outcome without narrating implementation details or merely repeating the diagram messages.
- Create a separate, complete sequence diagram for every distinct start-to-end Path. Do not combine routes with `alt`, `else`, `opt`, `loop`, or `par`.
- Declare only the actors and CRC classes used by a Path, and label participants with CRC class names only.
- Express every message and note as a plain business intention. Do not prefix diagram text with source identifiers, step numbers, or synthetic trace labels.

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
- every Path has a concise business explanation immediately before its sequence diagram;
- every CRC class appears in the UML diagram and every sequence participant has a CRC card;
- every collaborator and responsibility is reflected in the diagrams, including blocked items;
- names and roles are consistent across all artifacts;
- sequence messages and notes contain business intentions without source-ID or trace-label prefixes;
- every Mermaid block is valid; and
- the final artifact contains only the four required sections and no implementation design, candidate lists, traceability matrices, diagnostic notes, or validation rules.
