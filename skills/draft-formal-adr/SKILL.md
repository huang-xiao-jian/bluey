---
name: draft-formal-adr
description: Draft a formal architecture decision record or migrate a legacy ADR into the formal ADR format. Use only when the user explicitly requests one of those outcomes.
---

# Draft Formal ADR

## When to Use

- The user explicitly asks to document a decision as a formal ADR.
- The user explicitly asks to migrate, convert, or rewrite a legacy ADR into the formal ADR format.

Do not use this skill for general technical documentation, brainstorming a decision, or evaluating whether a decision is correct.

## Inputs

> A "legacy ADR" is any existing decision record that does not follow the formal structure defined in this skill but is still semantically an ADR.

Use the decision evidence available in the user's request, referenced material, and the current conversation. For a migration, treat the legacy ADR as the source of truth for its existing decision and facts.

The input does not need to provide every ADR section. When the selected decision is clear, use sound technical judgment to complete routine context, likely consequences, and viable alternatives that follow from it. Do not present unconfirmed historical facts, stakeholder intent, measurements, or prior deliberations as facts.

Ask for clarification only when the selected decision cannot be identified, available evidence materially conflicts, or an unresolved gap would change the decision being recorded.

## Workflow

1. Read the [formal ADR template](references/adr-flavor-template.md). Consult the [formal ADR example](references/adr-flavor-example.md) when its level of detail or wording helps resolve presentation choices.
2. Draft a complete ADR using the template and the example's conventions.
3. For a legacy migration, preserve the original decision and all material facts. Reorganize content into the formal sections, remove template guidance, and use careful analytical additions only when they do not alter the decision or claim unsupported history. Flag contradictions that would materially affect the record.
4. Review the draft against the **Review Checklist** section and correct every issue before producing the result.
5. When the user or repository context establishes an ADR destination, save the completed ADR there. Otherwise, return the complete Markdown ADR without creating a file so the user can decide what to do next.

Annotations:

- If an ADR destination exists, it must be available in the current conversation context; use it directly.
- Base the ADR filename on the core decision's semantic title (for example, `cli-first-mcp-architecture.md`).

## Review Checklist

The ADR **MUST** pass **ALL CHECKPOINTS**:

- [ ] The title is a short decision statement.
- [ ] Context identifies the concrete decision drivers.
- [ ] Decision states one selected course of action unambiguously.
- [ ] Consequences distinguish positive impacts from negative risks or costs.
- [ ] Alternatives are viable options with clear rejection reasons.
- [ ] Optional sections appear only when supported by the source material.
- [ ] The document has no template instructions, placeholders, or unsupported factual claims.
