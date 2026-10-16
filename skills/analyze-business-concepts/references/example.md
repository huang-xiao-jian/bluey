# Flight Offer

## Prerequisite Dependencies (Optional)

- [Flight Segment](./virtual-path/FLT-SEG-01.md)
- [Sellable Product](./virtual-path/PROD-SALE-01.md)

## 1. Definition

At a specific point in time, a **Flight Offer** is a **sellable combination** presented by the sales system to a traveler. It contains specific flight information, fare class, real-time pricing, and ancillary benefits. It is the direct basis on which the traveler places an order.

## 2. Key Attributes

- **ID:** The unique identifier for this offer, used to lock the price when the order is placed.
- **Flight Number:** The operating airline's flight identifier (for example, `CA6532`).
- **Fare Class Code:** The combination of the physical cabin (for example, economy class) and the booking class (for example, V class).
- **Total Selling Price:** The final amount payable, including the base fare, passenger facility charge, fuel surcharge, and taxes.
- **Validity Period:** The period for which the offer is locked (for example, 15 minutes).

## 3. Rules and Constraints

1. **Business Identification Constraint:** The ID uniquely identifies a **Flight Offer** and is used to lock its price when an order is placed.
2. **Aggregation Constraint:** The Total Selling Price equals the sum of the base fare, passenger facility charge, fuel surcharge, and taxes.
3. **Timeliness Constraint:** A **Flight Offer** is valid only for its defined Validity Period (for example, 15 minutes). An expired offer cannot be used to place an order.
4. **Conditional Existence Constraint:** Generating a **Flight Offer** does not consume actual inventory. A seat hold can be requested from the inventory and fare center only after the traveler submits an order and validation succeeds.
5. **Conditional Value Constraint:** Every option in a generated **Flight Offer** must comply with the traveler's eligibility (for example, student fares or military priority) and the organization's travel policy (for example, an out-of-policy cabin).
6. **Statistical Constraint:** A **Flight Offer** aggregates between `[1,5]` **Flight Segments**.
7. **Value Domain Constraint:** A **Flight Offer** may contain a nonstop flight or a connecting itinerary operated by the same airline; it cannot contain an interline connection combination.

## 4. Relationships

- **Aggregation:** This concept aggregates between `[1,5]` **Flight Segments**.
- **Generalization:** This concept is a specialization of **Sellable Product**.
