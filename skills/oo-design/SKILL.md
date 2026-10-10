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

- Use EBC analysis, treating Entity, Boundary, and Control candidates as hypotheses. Keep the smallest set that assigns every required responsibility coherently; merge overlapping candidates and split mixed responsibilities.
- Apply EBC dependency direction between layers:
  - `Actors` --> `Driving Boundary` --> `Control` --> `Entity`
  - `Control` --> `Driven Boundary`
- Classify each Boundary as `Boundary(Driving Port)` or `Boundary(Driven Port)`.
- Put business decisions with the Entity that owns the relevant knowledge. Use Controls for cross-object coordination, alternatives, compensation, and multi-participant transitions.
- Choose relationships, multiplicity, and lifecycle ownership only when supported by source evidence.
- Follow the [Class naming guidelines](assets/naming-guideline.md) for every EBC candidate and CRC class. Keep each selected name consistent across CRC cards and diagrams.

## Workflow

1. Build a working Path inventory. For every Workflow Source, extract its actors, complete ordered Paths, rules, preconditions, terminal outcomes, and constraints. Preserve supplied Workflow Titles, Path names, and Source Labels; assign neutral labels only when they are absent. Mark missing, ambiguous, or contradictory behavior as a Requirement Gap at the affected interaction.
2. Seed EBC candidates from the Path inventory. For each candidate, identify the required behavior that justifies it and its provisional Entity, Boundary, or Control role. Merge candidates that represent the same domain responsibility and split candidates that mix unrelated responsibilities. After its provisional role is clear, name each surviving candidate using the Class naming guidelines.
3. Build the working CRC model. Give every class one role, cohesive responsibilities expressed as outcomes or decisions, and only the collaborators required to perform them. Assign every required responsibility one owner and check every proposed cross-layer collaboration against the EBC dependency direction before role play.
4. Role-play every Path end to end, starting with its initiating actor and continuing to its terminal outcome. For each Path, record the classes, responsibilities, and collaborations exercised and whether the Path reached its outcome or stopped. Classify each stopping point as:
   - a **Design Gap** when the CRC model cannot perform defined behavior;
   - a **Requirement Gap** when the source does not define coherent behavior at that interaction.

   Record an **Implementation Concern** when an issue belongs below the conceptual-design boundary, defer it, and continue the conceptual role play; it does not stop a Path or require a CRC revision.

5. Resolve Design Gaps through a regression role-play loop:
   1. Revise the CRC model before replaying. Add, remove, merge, or split classes when necessary; name every new or renamed class using the Class naming guidelines; and update roles, purposes, responsibilities, collaborators, and supported relationships while preserving the smallest coherent design. Recheck single responsibility ownership and EBC dependency direction after each revision.
   2. Identify every affected Path. A Path is affected when it exercises any added, removed, merged, split, or otherwise changed class, role, responsibility, collaboration, or relationship, even if that Path previously succeeded.
   3. Replay each affected Path end to end from its initiating actor against the revised CRC model. Do not resume at the changed interaction or rely on a result produced by an older model.
   4. Classify new stops using step 4, revise the model for each new Design Gap, recompute the affected Paths, and repeat.
   5. End the loop only when every defined Path has a current result against the final CRC model: it reaches its terminal outcome or stops at a specifically located Requirement Gap.
6. Read the output template and generate the artifact only after the regression loop converges. Derive the UML and sequence diagrams from the final CRC model, then synchronize each class, role, responsibility, collaborator, relationship, interaction, and source reference wherever the template represents it. Represent each Path's terminal outcome or located Requirement Gap in its existing Path explanation and sequence diagram; do not add diagnostic sections.

## Output

- [Output template](assets/template.md)
- [Output example](references/example.md)

## Validation

- [ ] each class has one role, each responsibility one owner, and every named collaborator its own CRC card;
- [ ] every cross-layer collaboration obeys the EBC direction, every same-layer collaboration is supported by a requirement, and any control delegation is justified;
- [ ] every Workflow and defined Path is covered or explicitly blocked by a Requirement Gap;
- [ ] every modeled relationship obeys the standard UML relationship definition
- [ ] every modeled relationship, multiplicity, and ownership claim is supported by source evidence;
- [ ] every class name follows the Class naming guidelines and remains consistent across CRC cards and diagrams;
- [ ] every Requirement Gap is tied to missing, ambiguous, or contradictory source behavior rather than a modeling assumption;
- [ ] the verified model and diagrams agree on classes, names, roles, responsibilities, collaborators, interactions, and Requirement Gaps.
