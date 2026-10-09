# Book a Flight

## Actors

- **Primary Actor:** Traveler
- **Supporting Actors:** Payment System, Airline Inventory System

## Brief Description

The traveler selects an available flight and receives a confirmed booking after payment is approved.

## Preconditions

1. The airline inventory system and payment system are available.

## Primary Workflow

```mermaid
flowchart TD
    P1[Traveler enters origin, destination, and travel date] --> P2[System obtains available flights]
    P2 --> P3[System presents available flights]
    P3 --> P4[Traveler selects a flight and enters passenger details]
    P4 --> P5[System holds one seat]
    P5 --> P6[System presents the total price]
    P6 --> P7[Traveler confirms and submits payment]
    P7 --> P8[Payment System approves payment]
    P8 --> P9[System confirms the booking and consumes the held seat]
    P9 --> P10[System presents the booking confirmation]
```

## Alternate Workflow

```mermaid
flowchart TD
    A1[Traveler enters origin, destination, and travel date] --> A2[Airline Inventory System reports no available flights]
    A2 --> A3[System informs the traveler that no flights are available]
    A3 --> A4[Use case ends]
```

## Exception Workflow

```mermaid
flowchart TD
    E1[Traveler searches and receives available flights] --> E2[Traveler selects a flight and enters passenger details]
    E2 --> E3[System holds one seat and presents the total price]
    E3 --> E4[Traveler confirms, but Payment System declines payment]
    E4 --> E5[System releases the held seat]
    E5 --> E6[System informs the traveler that payment was declined]
    E6 --> E7[Use case ends]
```

## Postconditions

**Success:**

1. A confirmed booking exists.
2. Payment is approved and the held seat is consumed.

**Failure:**

1. No confirmed booking exists.
2. Any held seat is released and no payment is collected.

## Business Rules

- **Available-flight rule:** Present only flights with seats available for sale.
- **Failed-payment rule:** Release the held seat when payment is declined.
