# [Short Decision Title]

## Context

> Describe the business or technical background that requires a decision, including the concrete problem or pain points to address.

<!--
Format:

Concise prose describing the context and decision drivers.

Example:

The current deployment process requires manual coordination across teams, which delays urgent fixes and creates inconsistent release records.
-->

## Decision

> State the selected course of action unambiguously. Add a brief explanation only when the decision is complex.

<!--
Format:

**{Core decision.}**

Optional supporting prose for complex decisions.

Example:

**Adopt an automated deployment pipeline for all production services.**

The pipeline will create an auditable release record for every deployment.
-->

## Consequences

> Describe the positive impact of the decision and the risks or costs it introduces.

<!--
Format:

- **Positive:** {Positive impact}
- **Negative:** {Risk or cost}

Example:

- **Positive:** Reduces manual coordination and improves release traceability.
- **Negative:** Requires teams to maintain pipeline configuration.
-->

### Example Comparison (Optional)

> Illustrate the practical effect of the decision when a brief comparison would improve understanding.

<!--
Format:

Use a short explanation or code block to compare the relevant behavior before and after the decision.

Example:

Before: a release coordinator manually records deployment details.

After: the deployment pipeline records the details automatically.
-->

## Alternatives

> List the viable alternatives considered and briefly explain why each was rejected.

<!--
Format:

1. {Alternative} → {Reason for rejection}

Example:

1. Continue manual deployments → Does not address the coordination delay or inconsistent records.
-->

## Reversal Conditions (Optional)

> Define the conditions that would justify revisiting or reversing this decision.

<!--
Format:

1. {Reversal condition} → {Reason for reversal}

Example:

1. The pipeline cannot meet required deployment reliability → Restore the previous process while selecting a replacement approach.
-->
