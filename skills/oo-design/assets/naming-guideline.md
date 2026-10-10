# Class Naming Guidelines

## I. General Naming Rules

- Class names must express business concepts, business roles, interaction directions, or dependency capabilities.
- Class names can use `Repository`, `Gateway`, and `Adapter` as suffix, but only within Boundary Layer to express how the system interact with external systems.
- Class names must not directly use business behavior, such as `ProcessOrder` or `CreateOrder`.
- Class names must not use `DTO`, `VO`, `Entity`, `Model`, `Data`, `Util`, `Manager`, `Controller`, or `Service` as class name suffixes or primary semantics.
- Class names must not express technical implementation details, such as `Page`, `Form`, `API`, `Endpoint`, `Table`, `Redis`, or `Kafka`, except when applying the principle of separating abstraction from implementation

## II. Entity Naming

An Entity represents a business thing with an independent business identity, lifecycle, and consistency constraints.

- Use business nouns for naming, if there is a clear business stage or state, it may be used as a modifier.
- Aggregate roots should use the core business noun.
- Child entities or value objects should use dependent business nouns.

| Semantics       | Recommended Name | Prohibited Name                         |
| --------------- | ---------------- | --------------------------------------- |
| Order           | `Order`          | `OrderDTO`, `OrderEntity`, `OrderModel` |
| Order line item | `OrderItem`      | `OrderItemData`, `OrderItemVO`          |
| Leave request   | `LeaveRequest`   | `LeaveRequestVO`                        |
| Order draft     | `OrderDraft`     | `OrderDraftDTO`                         |
| Address         | `Address`        | `AddressVO`                             |
| Money           | `Money`          | `AmountDTO`                             |

## III. Control Naming

A Control represents a business role that assumes scheduling, coordination, or decision-making responsibilities.

- Use personified business role names.
- Express “who is responsible for completing this business responsibility.”
- Suffixes such as `Coordinator`, `Approver`, `Settler`, `Issuer`, `Dispatcher`, and `Assessor` may be used.

| Semantics                  | Recommended Name        | Prohibited Name                    |
| -------------------------- | ----------------------- | ---------------------------------- |
| Coordinate order creation  | `OrderCoordinator`      | `OrderService`, `OrderController`  |
| Approve leave              | `LeaveApprover`         | `LeaveApprovalService`             |
| Settle payment             | `PaymentSettler`        | `PaymentService`, `PaymentManager` |
| Issue invoice              | `InvoiceIssuer`         | `InvoiceController`                |
| Dispatch fulfillment tasks | `FulfillmentDispatcher` | `TaskService`                      |
| Assess risk                | `RiskAssessor`          | `RiskEngine`, `RiskService`        |

## IV. Driving Boundary Naming

A Driving Boundary represents an interaction point through which an external participant drives the system.

- Use the external participant as the subject.
- Express the participant role and its business entry point.
- Terms such as `Agent`, `Console`, `Facade`, and `Interface` may be used.
- Protocol information may only serve as a secondary modifier and must not become the primary semantics.

| Semantics                 | Recommended Name          | Prohibited Name               |
| ------------------------- | ------------------------- | ----------------------------- |
| Customer order entry      | `CustomerOrderAgent`      | `OrderPage`, `OrderAPI`       |
| Operator operation entry  | `OperatorOrderConsole`    | `AdminPage`                   |
| Merchant access entry     | `MerchantFacade`          | `MerchantAPI`                 |
| Partner access            | `PartnerOrderFacade`      | `PartnerWebhook`              |
| User authentication entry | `AuthenticationInterface` | `LoginForm`, `AuthController` |

## V. Driven Boundary Naming

A Driven Boundary represents a point where the system uses external dependencies.

- Use the depended-on system or capability as the subject.
- Express how the system depends on external capabilities.
- `Repository`, `Gateway`, and `Adapter` are allowed.
- `Persistence`, `Provider`, `Publisher`, and `Interface` may also be used.
- Do not use `Client`, `Util`, `Helper`, or `DAO` as the primary semantics.

| Semantics                        | Recommended Name                                   | Prohibited Name         |
| -------------------------------- | -------------------------------------------------- | ----------------------- |
| Order persistence                | `OrderRepository` or `OrderPersistence`            | `OrderDAO`, `OrderData` |
| Payment system capability        | `PaymentGateway` or `PaymentSystemInterface`       | `PaymentClient`         |
| Logistics fulfillment capability | `LogisticsAdapter` or `LogisticsProviderInterface` | `ShippingClient`        |
| Pricing cache capability         | `PricingCache`                                     | `RedisClient`           |
| Order event publishing           | `OrderEventPublisher`                              | `KafkaProducer`         |
| User identity lookup             | `UserIdentityProvider`                             | `UserClient`            |
