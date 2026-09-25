# {Use Case Name}

## Actors

> Identify the people, roles, or external parties that initiate or support this use case.

<!--
Format:

- **Primary Actor:** **{Actor}**
- **Supporting Actor:** **{Actor}**

Example:

- **Primary Actor:** **Workspace Administrator**
- **Supporting Actor:** **Rule Service**
-->

## Brief Description

> Summarize the use case's business goal and value in one or two sentences.

<!--
Format:

Concise prose describing the goal and value.

Example:

An administrator creates a Workspace so a team can organize its rule configuration in one place.
-->

## Preconditions

> List the verifiable conditions that must be satisfied before the use case can begin.

<!--
Format:

1. {Condition}

Example:

1. The Workspace Administrator is authorized to create Workspaces.
-->

## Business Workflow

> Describe the normal business flow as ordered, observable steps. Assign stable identifiers to workflow nodes when later rules or extensions reference them.

<!--
Format:

1. **{Node ID}**: {Actor} {Business action}.

Example:

1. **Create Workspace**: Workspace Administrator submits the Workspace name.
2. **Validate Name**: The system confirms that the name is available.
3. **Record Workspace**: The system creates the Workspace.
-->

## Postconditions

> State the conditions the system guarantees when the use case finishes, for both success and failure.

<!--
Format:

**Success scenario:**

1. {Postcondition}

**Failure scenario:**

1. {Postcondition}

Example:

**Success scenario:**

1. A new Workspace is available to the team.

**Failure scenario:**

1. No Workspace is created.
-->

## Business Rules

> State business rules and constraints, referencing the workflow node where each rule applies.

<!--
Format:

- **{Rule Name}**: {Referenced Node}, {Rule Description}

Example:

- **Unique Workspace Name**: Validate Name, The Workspace name must be unique within the organization.
-->

## Special Requirements

> Record non-functional requirements that are material to this use case.

<!--
Format:

- **Performance:** {Requirement}
- **Security:** {Requirement}
- **Availability:** {Requirement}

Example:

- **Performance:** Workspace creation completes within two seconds under normal load.
- **Security:** Only Workspace Administrators may create a Workspace.
- **Availability:** Workspace creation is available whenever the administration service is available.
-->

## Extension Points (Optional)

> Identify workflow nodes that may support future business extensions.

<!--
Format:

- {Referenced Node}: {Extension Description}

Example:

- Validate Name: Support organization-specific naming policies.
-->
