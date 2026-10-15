# Conceptual Data Model Constraints

## Attribute-Level Constraints

Constrains the legal values of an individual attribute itself.

- **Value Domain Constraint**: Attribute values must belong to a defined legal set, such as "Environment $\in$ {Development Environment, Test Environment, Production Environment}".

- **Type/Precision/Unit Constraint**: Such as "Amount retains two decimal places" or "Quantity is a positive integer".

- **Format Constraint**: Such as "Code must comply with the prefix + date + sequence number pattern".

- **Null Value Constraint**: Such as "Name cannot be null" or "Remarks can be null".

- **Default Value Constraint**: Such as "Creation time defaults to the generation timestamp".

## Identification Constraints

Constrains how to uniquely identify an instance of this concept.

- **Business Identification Constraint**: Such as "Quotation number uniquely identifies a quotation".

- **Composite Identification Constraint**: Such as "Customer ID + Quotation Date + Sequence Number jointly provide unique identification".

- **Non-Null Identification Constraint**: Such as "Quotation must contain at least one unique identifier".

## Intra-Tuple Cross-Attribute Constraints

The linkage relationships among multiple attributes within the same internal instance.

- **Comparison Constraint**: Such as "Closing time $\geq$ Creation time" or "Discount price $\le$ Original price".

- **Conditional Existence Constraint**: Such as "When the status is 'Refunded', the refund amount must have a value".

- **Conditional Value Constraint**: Such as "When the customer type is 'Enterprise', the 'Customer' must be selected from enterprise users registered in the system".

- **Conditional Derivation Constraint**: Such as "When the customer provides an 'ID card number', the corresponding age is automatically calculated".

## Inter-Instance Constraints

Static restrictions between different instances of the same concept, as well as static restrictions between instances of different concepts.

- **Uniqueness Constraint**: Such as "The same customer and the same product cannot have two valid quotations simultaneously".

- **Statistical Constraint**: Such as "The number of valid quotations for a customer does not exceed 100".

- **Aggregation Constraint**: Such as "Total quotation amount = Sum of all quotation sub-item amounts".

## Subtype Constraints

Constrains the classification structure of "what type it is" within a concept, without involving state changes.

- **Subtype Mutually Exclusive Constraint**: Such as "A quotation is either a standard quotation or an enterprise framework agreement quotation, and cannot belong to both simultaneously".

- **Subtype Completeness Constraint**: Such as "A quotation must belong to a defined subtype".

- **Subtype Identification Constraint**: Such as "Quotation type is determined by the 'Quotation Type' attribute".

## State Constraints

Constrains "what state it is in" within a concept, without involving process actions.

- **State Enumeration Constraint**: Such as "Status can only take values from a defined set of states".

- **State Transition Constraint**: Such as "Status can only follow preset paths and cannot change arbitrarily".

- **State Mutually Exclusive Constraint**: Such as "Can only be in a single state at any given moment".

- **State Derivation Constraint**: Such as "When the current time exceeds the closing time, the status should be 'Expired'".

## Instance-Level Constraints

Constrains static conditions of a single instance regarding time, visibility, or validity, divided into three non-overlapping dimensions:

- **Timeliness Constraint**: Defines the valid time window of an instance. Such as "Quotations are valid for 10 minutes from creation".

- **Visibility Constraint**: Defines whether an instance can be perceived. Such as "Expired quotations are invisible to users and visible only to internal personnel".
