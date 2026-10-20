# The Five-Step Design Workflow

## Step 1: Extract Nouns — Identify Business Entities

Starting from the use-case specification, extract candidate nouns from the use-case name, participants, preconditions, main success scenario, extension scenarios, and business rules.

**Special note:** Represent external systems, such as payment or logistics systems, as abstract participants and explicitly mark them as external participants.

Ask three questions about every noun:

1. Would business stakeholders recognize the concept as carrying business meaning?
2. Can the business concept exist independently?
3. Does the business concept have a lifecycle?

**Evaluation examples:**

- Nouns such as "buyer," "order," "order item," and "refund application" usually have independent business value → candidate classes.
- Concepts such as "reason for requesting a refund" and "requested refund amount" carry business meaning but have no value as independent entities → not independent classes.
- Technology-oriented nouns such as "page," "message," "interface," "request," "response," and "database" → usually not independent classes.

## Step 2: Identify Verbs — Identify Business Functions

Extract verbs from the use-case specification's event flows. An event flow is not a static collection of nouns; it is a sequence of business actions.

For example:

- Validate whether a refund is allowed.
- Calculate the refundable amount.
- Determine the refund path.
- Create a refund application.
- Trigger a risk-control check.
- Route the application to manual review.
- Notify the buyer.

Then group the actions strictly by **business function**, not by technical layer.

**Key evaluation criteria:**

- Does it perform an independent business decision, business policy, or business rule?
- Must it be explained, reused, or replaced independently?
- Does it provide independent value?

If so, consider representing it as a functional class. For example:

- `RefundEligibilityChecker`: Determines refund eligibility.
- `RefundAmountCalculator`: Calculates the actual refund amount.
- `RefundFinancial`: Executes the refund to the user.
- `RefundNotifier`: Notifies the user.

## Step 3: Assign Responsibilities — Connect the Business Workflow

For every action, ask "Who is responsible?" Connect individual actions and concepts into a complete business use case that can deliver the required function. This step ensures that the model describes not only "what exists" but also "how the use case is completed."

For example:

- When the use-case specification says "notify the buyer," continue by asking: **Who triggers the notification? Who drafts its content? Who performs the notification?**
- When it says "trigger a risk-control check," continue by asking: **Who triggers the check? Who performs it? Who receives its result?**
- When it says "route to manual review," continue by asking: **Who triggers the workflow-transition check? Who routes the application into the corresponding workflow?**

Business evaluation can reveal additional candidate classes:

- `RefundWorkflowScheduler`: Coordinates the overall workflow, including triggering notifications, risk-control checks, and workflow-transition checks.
- `RefundRiskInspector`: Coordinates the risk-control subprocess and serves as its logical boundary.
- `RefundNotificationDrafter`: Drafts refund notification content; responsibility analysis reveals that this earlier step was missing.

## Step 4: Handle Exceptions — Improve Robustness

Focus strictly on business exceptions. The following scenarios are explicitly outside the scope of this design stage:

- Network interruptions, timeouts, or instability.
- Database connection failures.
- Third-party interfaces being unavailable for technical reasons.
- System outages or restarts.
- Out-of-memory or performance problems.

### Step 4-1: List Business-Exception Scenarios

At every key point in the main flow, ask "What business problem could occur here?" List every business-exception scenario.

**Evaluation criteria** (apply both tests in sequence):

1. **Removal test:** If this mechanism is removed, can the main flow still finish? If it cannot, the scenario may be an exception; proceed to the second test.
2. **Business-stakeholder involvement test:** Does understanding and resolving the problem require participation from a nontechnical business stakeholder? If so, it is a business exception and belongs in the design.

### Step 4-2: Assign Business Responsibilities for Each Exception

For every business-exception scenario, ask:

- Who is responsible for **detecting** the exception? (Observer)
- Who is responsible for **deciding** how to handle it? (Decision-maker)
- Who is responsible for **performing** the handling action? (Executor)

### Step 4-3: Identify New Candidate Classes for Exception Handling

If no existing candidate class can own the responsibilities for handling an exception, add a candidate class. For example:

- "The buyer misses the return deadline" → requires a class responsible for timeout detection and automatic handling.
- "The merchant rejects the refund" → may require a class responsible for a negotiation or arbitration workflow.

### Step 4-4: Relate Exception Flows to the Main Flow

In the class diagram, use a dashed arrow or a label to show how an exception flow is triggered from the main flow. For example:

- Main flow: `RefundApplicationManager` → `RefundReviewDecision`
- Exception flow: `RefundApplicationManager` → (buyer misses the return deadline) → `RefundTimeoutHandler`

## Step 5: Refine Boundaries — Avoid Mixed Functions

### Step 5-1: Refine Functional Boundaries

The main goal is to adjust functions and give each class a clear functional role, avoiding bloated or overlapping responsibilities.

Separate decision-making, execution, and coordination:

- A **decision class** answers "Which path should be taken?" For example, `RefundEligibilityChecker` determines refund eligibility.
- An **execution class** answers "How is this action carried out?" For example, `RefundNotifier` notifies the user.
- A **coordination class** answers "How is the complete use-case workflow connected?" For example, `RefundWorkflowScheduler` coordinates the overall workflow.

Without this separation, it is easy to create a massive "refund controller" that combines decisions, execution, notifications, and state changes. Such a class may make the workflow run, but it obscures business meaning.

### Step 5-2: Refine Hierarchical Boundaries

The main goal is separation of concerns: functions within the same level should have the same degree of abstraction.

- **Use-case level:** Eligibility checks, amount calculations, path decisions, risk-control checks, and refund notifications.
- **Subprocess level:** Details of risk-control checks and refund notifications.

The layered structure moves from the abstract to the concrete. The use-case level defines only the overall workflow, not the internal details of each workflow node. Subprocess levels provide the specific implementation. The hierarchy has no fixed depth; prioritize business meaning and semantics throughout.
