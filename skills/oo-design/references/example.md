# Object-Oriented Design: Book a Flight

## 1. Workflow Coverage

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

## 4. Workflow Sequence Diagrams

### Book a Flight

**Workflow Source:** [Book a Flight](book-a-flight-use-case.md)

#### Primary Workflow

The traveler finds an available flight, provides passenger details, and completes an approved payment, after which the held seat is consumed and the booking is confirmed.

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

    Traveler->>Submission: Enter search criteria
    Submission->>Booking: Coordinate flight search
    Booking->>Catalog: Find available flights
    Catalog->>Inventory: Request available inventory
    Inventory-->>Catalog: Available flights
    Catalog-->>Booking: Report available flights
    Booking-->>Submission: Provide available flights
    Submission-->>Traveler: Present available flights
    Traveler->>Submission: Select flight and enter passenger details
    Submission->>Booking: Coordinate selection
    Booking->>Journey: Preserve selected flight and price
    Booking->>Order: Preserve passenger and journey details
    Order->>Journey: Record selected journey
    Booking->>Catalog: Hold one seat
    Catalog->>Inventory: Request seat hold
    Inventory-->>Catalog: Seat held
    Catalog-->>Booking: Confirm seat hold
    Booking-->>Submission: Provide total price
    Submission-->>Traveler: Present total price
    Traveler->>Submission: Confirm and submit payment
    Submission->>Booking: Coordinate payment
    Booking->>Payment: Request authorization
    Payment->>PaymentSystem: Submit payment
    PaymentSystem-->>Payment: Payment approved
    Payment-->>Booking: Report approval
    Booking->>Catalog: Consume held seat
    Catalog->>Inventory: Consume inventory
    Booking->>Order: Confirm booking
    Booking-->>Submission: Provide booking confirmation
    Submission-->>Traveler: Present booking confirmation
```

#### Alternate Workflow

The traveler's search returns no available flights, so the system reports the lack of availability and the booking attempt ends without a selection.

```mermaid
sequenceDiagram
    autonumber
    actor Traveler
    participant Submission as BookingSubmission
    participant Booking as FlightBooking
    participant Catalog as FlightCatalog
    actor Inventory as Airline Inventory System

    Traveler->>Submission: Enter search criteria
    Submission->>Booking: Coordinate flight search
    Booking->>Catalog: Find available flights
    Catalog->>Inventory: Request available inventory
    Inventory-->>Catalog: No available flights
    Catalog-->>Booking: Report no availability
    Booking-->>Submission: Provide no-flight outcome
    Submission-->>Traveler: Inform traveler
    Note over Traveler,Booking: Use case ends
```

#### Exception Workflow

The traveler selects an available flight and a seat is held, but payment is declined, so the held seat is released and the traveler is informed that the booking did not complete.

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

    Traveler->>Submission: Enter search criteria
    Submission->>Booking: Coordinate flight search
    Booking->>Catalog: Find available flights
    Catalog->>Inventory: Request available inventory
    Inventory-->>Catalog: Available flights
    Catalog-->>Booking: Report available flights
    Booking-->>Submission: Provide available flights
    Submission-->>Traveler: Present available flights
    Traveler->>Submission: Select flight and enter passenger details
    Submission->>Booking: Coordinate selection
    Booking->>Journey: Preserve selected flight and price
    Booking->>Order: Preserve passenger and journey details
    Order->>Journey: Record selected journey
    Booking->>Catalog: Hold one seat
    Catalog->>Inventory: Request seat hold
    Inventory-->>Catalog: Seat held
    Catalog-->>Booking: Confirm seat hold
    Booking-->>Submission: Provide total price
    Submission-->>Traveler: Present total price
    Traveler->>Submission: Confirm and submit payment
    Submission->>Booking: Coordinate payment
    Booking->>Payment: Request authorization
    Payment->>PaymentSystem: Submit payment
    PaymentSystem-->>Payment: Payment declined
    Payment-->>Booking: Report decline
    Booking->>Catalog: Release held seat
    Catalog->>Inventory: Release inventory
    Booking-->>Submission: Provide payment-declined outcome
    Submission-->>Traveler: Inform traveler
    Note over Traveler,Booking: Use case ends
```
