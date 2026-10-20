# Thinking-Process Document Template

> This document records the complete analysis trail from the use-case specification to the candidate classes, including each step's derivation and decision rationale.
> The thinking-process document is an optional deliverable used to record the reasoning behind design decisions.

---

## Document Information

- **Use-Case Name:** [Use-case name]
- **Document Version:** [Version number]
- **Authoring Date:** [Date]

## Step 1: Extract Nouns

### Candidate Nouns

| Candidate Noun | Recognized Business Meaning | Independent Existence | Lifecycle | Conclusion |
| -------------- | :-------------------------: | :-------------------: | :-------: | ---------- |
| [Candidate 1]  |                             |                       |           |            |
| [Candidate 2]  |                             |                       |           |            |

### Confirmed Candidate Classes

1. **[Class Name 1]:** [Reason for confirmation]
2. **[Class Name 2]:** [Reason for confirmation]

## Step 2: Identify Verbs

### Extracted Verbs

| Verb     | Business Function | Candidate Class |
| -------- | ----------------- | --------------- |
| [Verb 1] | [Function]        | [Class Name]    |
| [Verb 2] | [Function]        | [Class Name]    |

### Functional Clustering Results

1. **[Class Name 1]:** [Responsibility description]
2. **[Class Name 2]:** [Responsibility description]

## Step 3: Assign Responsibilities

### Responsibility Questions for Key Actions

| Action     | Question   | Responsible Class | Responsibility |
| ---------- | ---------- | ----------------- | -------------- |
| [Action 1] | [Question] | [Class Name]      | [Responsibility] |

### Additional Coordination Classes

- **[Class Name]:** [Responsibility description]

## Step 4: Handle Exceptions

### Exception Scenarios

| Exception Scenario | Removal Test | Business-Stakeholder Involvement Test | Conclusion |
| ------------------ | :----------: | :-----------------------------------: | ---------- |
| [Exception 1]      |              |                                       |            |

### Exception Responsibility Assignment

**Exception 1: [Exception Name]**

- Observer: [Class Name]
- Decision-maker: [Class Name]
- Executor: [Class Name]

### Additional Exception-Handling Classes

- **[Class Name]:** [Responsibility description]

### Relationship Between the Exception Flow and Main Flow

- Main flow: [Flow description]
- Exception flow: [Exception description]

## Step 5: Refine Boundaries

### Functional-Boundary Categories

| Category           | Class        | Functional Role |
| ------------------ | ------------ | --------------- |
| Decision class     | [Class Name] | [Role]          |
| Execution class    | [Class Name] | [Role]          |
| Coordination class | [Class Name] | [Role]          |

### Hierarchical Boundaries

**Use-case level:**

- [Class Name] — [Responsibility]

**Subprocess level:**

- [Class Name] — [Responsibility]

## Final Candidate-Class List

| No. | Class Name   | Responsibility   | Collaborators   |
| --- | ------------ | ---------------- | --------------- |
| 1   | [Class Name] | [Responsibility] | [Collaborators] |
