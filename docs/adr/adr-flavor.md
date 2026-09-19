# ADR Authoring Convention

## Context

Architecture decisions are core assets in a project's evolution and require traceable records. The absence of a common format results in inconsistent `ADR` structures, higher reading costs, a more difficult onboarding experience, and lost decision context. A standard template is required to make architecture decisions consistent and well documented.

## Decision

**Adopt a common ADR template and authoring convention as the standard format for every ADR in this project.**

Core conventions:

1. **File-naming convention**
   - Use the exact format `{short-english-title}.md`. The title uses lowercase English words separated by hyphens, for example, `use-mermaid-for-flow.md`.
2. **File location**
   - Store `ADR` documents in `docs/adr/` at the project root by default.
   - Do not store `ADR` documents elsewhere in the project unless the user explicitly specifies another location.
3. **Document structure**
   - Include these sections in this exact order: **Context**, **Decision**, **Consequences**, and **Alternatives**.
   - The **Reversal Conditions** and **Decision Confidence** sections are optional.
   - The **Consequences** section may contain an optional **Example Comparison** subsection.
4. **Section-writing requirements**
   - **Context**: Clearly describe the business or technical background that triggered the decision and the current pain points.
   - **Decision**: State the core decision unambiguously; expand on the details for complex situations.
   - **Consequences**: Describe the decision's impact on the project in **Positive** and **Negative** dimensions.
   - **Example Comparison**: Compare the situation before and after the decision.
   - **Alternatives**: List options that were considered but rejected, with a brief reason for rejecting each.
   - **Reversal Conditions**: Define clearly which changed conditions require the decision to be reevaluated.
   - **Decision Confidence**: Record the team's confidence in the decision.

References:

- [ADR example](./references/adr-flavor-example.md)
- [ADR template](./references/adr-flavor-template.md)

## Consequences

- **Positive**: A consistent format reduces the cost of reading and understanding ADRs, preserves traceable decision history, accelerates onboarding, and enables automated ADR-consistency checks during code review.
- **Negative**: Initial learning is required, and the format constraints may limit expression in some exceptional situations.

## Alternatives

1. Do not standardize the format; allow each team to decide → creates inconsistent formats and high reading costs.
2. Manage ADRs in wiki pages → version control and change-history tracing become difficult.
3. Use a dedicated ADR tool, such as `adr-tools` → adds a dependency that is excessive for a small project.
