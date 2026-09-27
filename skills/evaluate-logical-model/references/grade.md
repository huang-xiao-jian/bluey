# Logical Model Consistency Ratings

The available ratings are:

- Pass Without Reservations
- Pass With Reservations
- Do Not Pass

## Pass Without Reservations

Every defined checkpoint passes, with no issues identified.

## Pass With Reservations

Both of the following conditions must be met:

1. **Few failed checkpoints**: Fewer than 3 checkpoints fail.
2. **No critical defects**: The failed checkpoints do not include critical issues in the following dimensions:
   - Relationship logic contradiction (for example, cardinality fundamentally conflicts with the business description)
   - Lifecycle deadlock (for example, a state transition has a dead end with no exit)
   - Conflicting constraints (for example, two rules directly contradict each other, making the model inconsistent)

### Typical Scenarios

- Terminology is inconsistent (for example, "mobile number" and "contact phone" are mixed), while the core entity structure and relationships are correct.
- An individual attribute definition is missing (for example, an entity lacks a noncritical attribute), but it does not affect the model's overall consistency.
- A relationship semantic name is imprecise (for example, "related to" is used instead of a specific business verb), while cardinality and direction are correct.

## Do Not Pass

Any of the following conditions is met:

- Failed checkpoints: 3 or more
- Critical defect: present (relationship contradiction, lifecycle deadlock, or constraint conflict)
- Scope of impact: a core structural issue that affects model usability
