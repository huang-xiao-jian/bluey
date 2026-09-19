# Flight Offer

## Prerequisite Dependencies

- [Flight Segment](./virtual-path/FLT-SEG-01.md)
- [Sellable Product](./virtual-path/PROD-SALE-01.md)

## 1. Business Definition

At a specific point in time, a **Flight Offer** is a **sellable combination** presented by the sales system to a traveler. It contains specific flight information, fare class, real-time pricing, and ancillary benefits. It is the direct basis on which the traveler places an order.

## 2. Synonyms and Aliases

- Offer
- Sellable Flight Segment
- Fare Combination

## 3. Key Attributes

- ID: The unique identifier for this offer, used to lock the price when the order is placed.
- Flight Number: The operating airline's flight identifier (for example, `CA6532`).
- Fare Class Code: The combination of the physical cabin (for example, economy class) and the booking class (for example, V class).
- Total Selling Price: The final amount payable, including the base fare, passenger facility charge, fuel surcharge, and taxes.
- Validity Period: The period for which the offer is locked (for example, 15 minutes).

## 4. Business Rules and Constraints

1. **Price-lock rule**: A **Flight Offer** has a defined validity period. An order must never be placed against an expired offer.
2. **Inventory-hold rule**: Generating a **Flight Offer** does not consume actual inventory. Request a seat hold from the inventory and fare center only after the traveler submits the order and validation succeeds.
3. **Eligibility filtering**: When a **Flight Offer** is generated, automatically filter out options that do not comply with the traveler's eligibility (for example, student fares or military priority) or the organization's travel policy (for example, an out-of-policy cabin).

## 5. Relationships

- **Aggregation**: This concept aggregates between `[1,5]` **Flight Segments**.
- **Generalization**: This concept is a specialization of **Sellable Product**.

## 6. Scope Boundaries

- **Includes**: Nonstop flights and connecting itineraries operated by the same airline.
- **Excludes**: Interline connection combinations.
