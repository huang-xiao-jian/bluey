# Business Conceptual Data Model Constraints (Case Study)

## Attribute-Level Constraints

- **Value Domain Constraint**: Quotation status $\in$ {Draft, Submitted, Expired, Voided, Closed-Won}.

- **Type/Precision Constraint**: The quotation amount must be a positive number with two decimal places; the validity duration must be a positive integer in minutes.

- **Format Constraint**: The quotation number must comply with the pattern "Q + 8-digit date + 4-digit sequence number", such as Q202610150001.

- **Null Value Constraint**: Quotation number, customer ID, creation time, and status cannot be null; remarks and void reason can be null.

- **Default Value Constraint**: The creation time defaults to the generation timestamp; the status defaults to "Draft"; the validity duration defaults to 10 minutes.

## Identification Constraints

- **Business Identification Constraint**: The quotation number uniquely identifies a quotation instance.

- **Composite Identification Constraint**: If multiple versions are allowed, "Quotation Number + Version Number" jointly provide unique identification.

- **Non-Null Identification Constraint**: A quotation must contain at least one unique identifier.

## Intra-Tuple Cross-Attribute Constraints

- **Comparison Constraint**: Quotation closing time $\geq$ Creation time; Quotation amount $\geq$ 0.

- **Conditional Existence Constraint**: When the status is "Voided", the void reason must have a value; when the status is "Closed-Won", the closing time must have a value.

- **Conditional Value Constraint**: When the quotation type is "Framework Agreement", the agreement number must have a value; when the quotation type is "Standard Quotation", the agreement number should not have a value.

- **Conditional Derivation Constraint**: The quotation closing time is jointly determined by the creation time and the validity duration, i.e., Closing Time = Creation Time + Validity Duration.

## Inter-Instance Constraints

- **Uniqueness Constraint**: For the same customer and the same product combination, there cannot exist two quotations with the status "Submitted" and not yet expired at the same time.

- **Statistical Constraint**: The number of quotations in "Submitted" status for the same customer cannot exceed 5.

- **Aggregation Constraint**: Total quotation amount = Sum of all quotation line amounts.

## Subtype Constraints

- **Subtype Mutually Exclusive Constraint**: A quotation is either a "Standard Quotation" or a "Framework Agreement Quotation", and cannot belong to both simultaneously.

- **Subtype Completeness Constraint**: A quotation must belong to a defined subtype; unclassified quotations cannot exist.

- **Subtype Identification Constraint**: The subtype is determined by the "Quotation Type" attribute, whose value is taken from {Standard Quotation, Framework Agreement}.

## State Constraints

- **State Enumeration Constraint**: The status can only take one of {Draft, Submitted, Expired, Voided, Closed-Won}.

- **State Transition Constraint**: Such as "The status can only follow preset paths and cannot change arbitrarily".

- **State Mutually Exclusive Constraint**: Such as "Can only be in a single state at any given moment".

- **State Derivation Constraint**: When "Current Time $\geq$ Quotation Closing Time", the status should be "Expired".

## Instance-Level Constraints

- **Timeliness Constraint**: The quotation is valid for 10 minutes from creation, with the validity interval being "Creation Time, Creation Time + 10 minutes".

- **Visibility/Validity Determination Constraint**: Quotations with a status of "Expired" or "Voided" do not participate in valid quotation queries; only quotations with a status of "Submitted" and whose current time falls within the validity interval are considered valid instances.
