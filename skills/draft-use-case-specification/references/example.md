# Book a Flight

## Actors

- **Primary Actor**: Traveler
- **Supporting Actors**: Payment System, Airline Inventory System

## Brief Description

The traveler searches for available flights, selects a flight, enters passenger details, and receives a valid ticket after payment is completed.

## Preconditions

1. The airline inventory system is available.

## Business Workflow

```mermaid
flowchart TD
    N1[Traveler enters origin, destination, travel date, and fare class] --> N2{Are flights available?}
    N2 -- Yes --> N3[System searches for and displays available flights]
    N2 -- No --> N4[System informs the traveler that no flights are available for the selected date] --> N5[Suggest changing the date or choosing a nearby airport] --> N6[Use case ends]
    N3 --> N7[Traveler selects a flight and fare class]
    N7 --> N8[System displays the price breakdown: fare, passenger facility charge, and fuel surcharge]
    N8 --> N9[Traveler enters passenger details: name, identity-document number, and contact information]
    N9 --> N10{Are passenger details valid?}
    N10 -- Yes --> N11[System validates passenger details and holds the seat temporarily for 15 minutes]
    N10 -- No --> N12[System displays the specific error] --> N13[Return to N9 to amend the details]
    N11 --> N14[Traveler selects ancillary services: seat selection, meal, or baggage allowance]
    N14 --> N15[System calculates the final order amount and applies membership discounts or coupons]
    N15 --> N16[Traveler confirms the order and submits payment]
    N16 --> N17{Is payment successful?}
    N17 -- Yes --> N18[System issues the ticket through the airline inventory system]
    N17 -- No --> N19[System informs the traveler that payment failed and retains the order in Pending Payment] --> N20{Retry payment within 15 minutes?}
    N20 -- Yes --> N16
    N20 -- No --> N21[System cancels the order automatically and releases the seat] --> N22[Use case ends]
    N18 --> N23{Is ticket issuance successful?}
    N23 -- Yes --> N24[System sends a ticketing notification with flight number, time, seat number, and e-ticket number] --> N25[Use case succeeds]
    N23 -- No --> N26[System starts an automatic refund] --> N27[Notify the traveler that ticketing failed and payment will be refunded to the original method in one to three business days] --> N28[Use case ends]
```

## Postconditions

**Success scenario:**

1. An order number is generated and the order status is "Ticketed".
2. The airline inventory system deducts the corresponding seat inventory.
3. The traveler receives a ticketing notification by SMS or email.
4. The payment system completes the charge.

**Failure scenario:**

1. No order is generated and no seat inventory is deducted.
2. If payment has been collected, a refund to the original payment method is initiated.

## Business Rules

- **Temporary seat-hold period**: The temporary seat hold lasts 15 minutes and is released automatically when it expires (node N11).
- **Payment-timeout rule**: If payment is not completed within 15 minutes, the order is cancelled automatically (node N17).
- **Flight-search restriction**: Display only flights with seats available for sale (node N2).
- **Order-flight restriction**: Every passenger in the same order must select the same flight (node N7).
- **Identity-document purchase limit**: The same identity-document number may purchase only one economy-class ticket on the same flight (node N11).
- **Passenger-information validation**: The name must match the identity-document number, and the identity-document number format must be valid (node N9).
- **Information-change constraint**: Passenger and flight information cannot be changed after the order is submitted (node N16).
- **Child and infant pricing**: A child fare for ages 2–12 is 50% of the adult full fare; an infant fare for children under 2 is 10% (node N8).
- **Promotion-combination restriction**: Membership discounts and coupons cannot be used together (node N15).
- **Special-meal booking**: Special meals, such as vegetarian or halal meals, must be requested at least 24 hours in advance (node N14).

## Special Requirements

- **Performance**: Flight-search response time ≤ 2 seconds; payment-callback processing ≤ 5 seconds.
- **Security**: Encrypt passenger identity-document information at rest; payment processing complies with PCI DSS.
- **Availability**: System availability ≥ 99.9%.

## Extension Points

- N14: Future support for cabin upgrades and lounge reservations.
- N24: Future support for airline-app notifications, WeChat service notifications, and other channels.
