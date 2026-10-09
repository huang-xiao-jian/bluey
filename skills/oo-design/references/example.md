# Object-Oriented Design: Book a Flight

## 1. Use-Case Coverage

- [Book a Flight](book-a-flight-use-case.md)

## 2. CRC Model

### BookingSubmission

- **Role:** Boundary --> Driving Port.
- **Purpose:** Represent the traveler's interaction with flight booking.
- **Responsibilities:** Receive search, selection, passenger, confirmation, and payment stimuli; present available flights, prices, and booking outcomes.
- **Collaborators:** `FlightBooking`.

### FlightBooking

- **Role:** Control.
- **Purpose:** Coordinate the Book a Flight use case.
- **Responsibilities:** Coordinate flight search, selection, seat holding, payment, booking confirmation, and seat release.
- **Collaborators:** `BookingSubmission`, `FlightCatalog`, `JourneySelection`, `BookingOrder`, `PaymentProvider`.

### FlightCatalog

- **Role:** Boundary --> Driven Port.
- **Purpose:** Represent the airline inventory capabilities used during booking.
- **Responsibilities:** Find available flights; hold, consume, and release seat inventory.
- **Collaborators:** `FlightBooking`.

### JourneySelection

- **Role:** Entity.
- **Purpose:** Represent the flight selected by the traveler.
- **Responsibilities:** Preserve the selected flight and its price.
- **Collaborators:** None.

### BookingOrder

- **Role:** Entity.
- **Purpose:** Represent the traveler's booking.
- **Responsibilities:** Preserve passenger and journey details; become confirmed only after payment approval.
- **Collaborators:** `JourneySelection`.

### PaymentProvider

- **Role:** Boundary --> Driven Port.
- **Purpose:** Represent payment authorization supplied by the external payment system.
- **Responsibilities:** Request payment authorization and report approval or decline.
- **Collaborators:** `FlightBooking`.

## 3. UML Class Diagram

```mermaid
classDiagram
    direction LR

    class BookingSubmission {
        <<Boundary>>
    }
    note for BookingSubmission "Role: Boundary --> Driving Port"

    class FlightBooking {
        <<Control>>
    }
    class FlightCatalog {
        <<Boundary>>
    }
    note for FlightCatalog "Role: Boundary --> Driven Port"

    class JourneySelection {
        <<Entity>>
    }
    class BookingOrder {
        <<Entity>>
    }
    class PaymentProvider {
        <<Boundary>>
    }
    note for PaymentProvider "Role: Boundary --> Driven Port"

    BookingSubmission ..> FlightBooking : initiates booking
    FlightBooking ..> FlightCatalog : requests inventory actions
    FlightBooking ..> JourneySelection : coordinates selection
    FlightBooking ..> BookingOrder : coordinates confirmation
    FlightBooking ..> PaymentProvider : requests authorization
    BookingOrder --> JourneySelection : records selected journey
```

## 4. Use-Case Sequence Diagrams

### Book a Flight

**Use Case Specification:** [Book a Flight](book-a-flight-use-case.md)

#### Primary Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Traveler
    participant Submission as BookingSubmission
    participant Booking as FlightBooking
    participant Catalog as FlightCatalog
    actor Inventory as Airline Inventory System
    participant Journey as JourneySelection
    participant Order as BookingOrder
    participant Payment as PaymentProvider
    actor PaymentSystem as Payment System

    Traveler->>Submission: P1 Enter search criteria
    Submission->>Booking: P1 Coordinate flight search
    Booking->>Catalog: P2 Find available flights
    Catalog->>Inventory: P2 Request available inventory
    Inventory-->>Catalog: P2 Available flights
    Catalog-->>Booking: P2 Report available flights
    Booking-->>Submission: P3 Provide available flights
    Submission-->>Traveler: P3 Present available flights
    Traveler->>Submission: P4 Select flight and enter passenger details
    Submission->>Booking: P4 Coordinate selection
    Booking->>Journey: P4 Preserve selected flight and price
    Booking->>Order: P4 Preserve passenger and journey details
    Order->>Journey: P4 Record selected journey
    Booking->>Catalog: P5 Hold one seat
    Catalog->>Inventory: P5 Request seat hold
    Inventory-->>Catalog: P5 Seat held
    Catalog-->>Booking: P5 Confirm seat hold
    Booking-->>Submission: P6 Provide total price
    Submission-->>Traveler: P6 Present total price
    Traveler->>Submission: P7 Confirm and submit payment
    Submission->>Booking: P7 Coordinate payment
    Booking->>Payment: P7 Request authorization
    Payment->>PaymentSystem: P7 Submit payment
    PaymentSystem-->>Payment: P8 Payment approved
    Payment-->>Booking: P8 Report approval
    Booking->>Catalog: P9 Consume held seat
    Catalog->>Inventory: P9 Consume inventory
    Booking->>Order: P9 Confirm booking
    Booking-->>Submission: P10 Provide booking confirmation
    Submission-->>Traveler: P10 Present booking confirmation
```

#### Alternate Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Traveler
    participant Submission as BookingSubmission
    participant Booking as FlightBooking
    participant Catalog as FlightCatalog
    actor Inventory as Airline Inventory System

    Traveler->>Submission: A1 Enter search criteria
    Submission->>Booking: A1 Coordinate flight search
    Booking->>Catalog: A2 Find available flights
    Catalog->>Inventory: A2 Request available inventory
    Inventory-->>Catalog: A2 No available flights
    Catalog-->>Booking: A2 Report no availability
    Booking-->>Submission: A3 Provide no-flight outcome
    Submission-->>Traveler: A3 Inform traveler
    Note over Traveler,Booking: A4 Use case ends
```

#### Exception Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Traveler
    participant Submission as BookingSubmission
    participant Booking as FlightBooking
    participant Catalog as FlightCatalog
    actor Inventory as Airline Inventory System
    participant Journey as JourneySelection
    participant Order as BookingOrder
    participant Payment as PaymentProvider
    actor PaymentSystem as Payment System

    Traveler->>Submission: E1 Enter search criteria
    Submission->>Booking: E1 Coordinate flight search
    Booking->>Catalog: E1 Find available flights
    Catalog->>Inventory: E1 Request available inventory
    Inventory-->>Catalog: E1 Available flights
    Catalog-->>Booking: E1 Report available flights
    Booking-->>Submission: E1 Provide available flights
    Submission-->>Traveler: E1 Present available flights
    Traveler->>Submission: E2 Select flight and enter passenger details
    Submission->>Booking: E2 Coordinate selection
    Booking->>Journey: E2 Preserve selected flight and price
    Booking->>Order: E2 Preserve passenger and journey details
    Order->>Journey: E2 Record selected journey
    Booking->>Catalog: E3 Hold one seat
    Catalog->>Inventory: E3 Request seat hold
    Inventory-->>Catalog: E3 Seat held
    Catalog-->>Booking: E3 Confirm seat hold
    Booking-->>Submission: E3 Provide total price
    Submission-->>Traveler: E3 Present total price
    Traveler->>Submission: E4 Confirm and submit payment
    Submission->>Booking: E4 Coordinate payment
    Booking->>Payment: E4 Request authorization
    Payment->>PaymentSystem: E4 Submit payment
    PaymentSystem-->>Payment: E4 Payment declined
    Payment-->>Booking: E4 Report decline
    Booking->>Catalog: E5 Release held seat
    Catalog->>Inventory: E5 Release inventory
    Booking-->>Submission: E6 Provide payment-declined outcome
    Submission-->>Traveler: E6 Inform traveler
    Note over Traveler,Booking: E7 Use case ends
```
