# Object-Oriented Design Analysis: Publish a Short Video

---

## Step 1: Extract Nouns — Identify Business Entities

Extract candidate nouns from the use-case specification and answer three questions about each noun:

| Candidate Noun       | Recognized Business Meaning | Independent Existence         | Lifecycle        | Conclusion                                      |
| -------------------- | :-------------------------: | :---------------------------: | :--------------: | ----------------------------------------------- |
| Content creator      | Yes                           | Yes                           | No (role)        | Business role, not an independent class         |
| Publication application | Yes                        | Yes                           | Yes              | **Candidate class**                             |
| Video file           | No (technical implementation) | —                             | —                | Technical artifact, not a class                 |
| Content validation   | Yes                           | No (action)                   | —                | Business action, not a class                    |
| Review               | Yes                           | No (action)                   | —                | Business action, not a class                    |
| Review feedback      | Yes                           | No (depends on the application) | No             | Strongly associated with the application; not an independent class |
| Short video          | Yes                           | Yes                           | Yes              | **Candidate class**                             |
| Distributable state  | Yes                           | Yes                           | No (state value) | State concept, not an independent class         |

**Candidate classes:**

1. **VideoPublishApplication** (publication application) — Owns the complete lifecycle of one publication application.
2. **VideoContent** (short-video content) — Represents the video content being published.
3. **ReviewFeedback** (review feedback) — Records review feedback.

---

## Step 2: Identify Verbs — Identify Business Functions

Extract verbs from the use-case specification's event flows and group them by business function:

| Verb                              | Business Function             | Candidate Class                    |
| --------------------------------- | ----------------------------- | ---------------------------------- |
| Perform validation                | Determine content compliance  | VideoContentValidator              |
| Perform review                    | Make a content-review decision | ContentReviewer                   |
| Record feedback                   | Manage feedback               | ReviewFeedback (entity)            |
| Notify the creator                | Send notifications            | PublishNotificationDrafter         |
| Update the video/revise information | Update content              | VideoContent (entity)              |
| Mark as distributable             | Change state                  | VideoPublishApplication (entity)   |
| Terminate the publication workflow | Terminate the workflow       | VideoPublishApplicationManager     |
| Create a publication application  | Create the application        | VideoPublishApplicationManager     |

**Additional candidate classes:**

1. **VideoContentValidator** — Validates video-content compliance.
2. **ContentReviewer** — Makes content-review decisions.
3. **PublishNotificationDrafter** — Drafts and sends feedback notifications.
4. **VideoPublishApplicationManager** — Manages the publication application's lifecycle.

---

## Step 3: Assign Responsibilities — Connect the Business Workflow

### "The system creates a publication application, then performs validation and review"

| Question                                      | Responsible Class                | Responsibility                         |
| --------------------------------------------- | -------------------------------- | -------------------------------------- |
| Who creates the application?                  | VideoPublishApplicationManager   | Create and submit the application      |
| Who triggers validation?                      | VideoPublishWorkflowScheduler    | Coordinate the validation workflow     |
| Who performs validation?                      | VideoContentValidator            | Validate content compliance            |
| Who performs the review?                      | ContentReviewer                  | Perform content review                 |
| Who marks the video as distributable?         | VideoPublishApplicationManager   | Change the application's state         |

### "The system records feedback in the current publication application and notifies the creator"

| Question                              | Responsible Class                | Responsibility                              |
| ------------------------------------- | -------------------------------- | ------------------------------------------- |
| Who records the feedback?             | VideoPublishApplicationManager   | Associate feedback with the application     |
| Who drafts the notification content?  | PublishNotificationDrafter       | Draft the feedback notification              |
| Who sends the notification?           | PublishNotificationDrafter       | Send the notification to the creator         |

### Additional Coordination Class

- **VideoPublishWorkflowScheduler:** Coordinates the overall publication workflow, including validation, review, and state changes.

---

## Step 4: Handle Exceptions — Improve Robustness

### Identify Exception Scenarios

| Exception Scenario            | Removal Test                                             | Business-Stakeholder Involvement Test       | Conclusion                         |
| ----------------------------- | :------------------------------------------------------: | :-----------------------------------------: | ---------------------------------- |
| Validation/review fails       | Without it, the main flow cannot continue to distribution | Business stakeholders must understand review rules | **Business exception**    |
| Creator abandons the revision | Without it, the workflow cannot terminate correctly       | Business stakeholders must define withdrawal rules | **Business exception**   |
| Revision deadline expires     | Without it, the application remains pending forever       | Business stakeholders must define the timeout policy | **Business exception**   |
| Network interruption          | —                                                        | —                                           | Technical exception; out of scope  |
| Database connection failure   | —                                                        | —                                           | Technical exception; out of scope  |

### Assign Exception Responsibilities

**Exception 1: Validation/review fails**

- Observer: VideoContentValidator / ContentReviewer
- Decision-maker: VideoPublishApplicationManager
- Executor: PublishNotificationDrafter (sends the feedback notification)

**Exception 2: Creator abandons the revision**

- Observer: Creator (external participant)
- Decision-maker: VideoPublishApplicationManager
- Executor: VideoPublishCancellationHandler (performs the termination workflow)

**Exception 3: Revision deadline expires**

- Observer: VideoPublishTimeoutInspector
- Decision-maker: VideoPublishApplicationManager
- Executor: VideoPublishTimeoutHandler (performs automatic closure)

### Additional Exception-Handling Classes

- **VideoPublishCancellationHandler:** Handles the creator's voluntary withdrawal of the publication application.
- **VideoPublishTimeoutInspector:** Detects whether the creator has missed the deadline for updating the content.
- **VideoPublishTimeoutHandler:** Performs the automatic closure workflow after a timeout.

### Relate Exception Flows to the Main Flow

- Main flow: VideoPublishApplicationManager → VideoContentValidator → ContentReviewer → VideoPublishApplicationManager (state change)
- Exception flow 1: VideoContentValidator/ContentReviewer → (validation/review fails) → PublishNotificationDrafter → return to validation
- Exception flow 2: Creator → (voluntary withdrawal) → VideoPublishCancellationHandler → VideoPublishApplicationManager
- Exception flow 3: VideoPublishTimeoutInspector → (revision deadline expires) → VideoPublishTimeoutHandler → VideoPublishApplicationManager

---

## Step 5: Refine Boundaries — Avoid Mixed Functions

### Refine Functional Boundaries

| Category           | Class                           | Functional Role                                      |
| ------------------ | ------------------------------- | ---------------------------------------------------- |
| Decision class     | VideoContentValidator           | Determine whether the video content is compliant     |
| Decision class     | ContentReviewer                 | Determine whether the content passes review          |
| Decision class     | VideoPublishTimeoutInspector    | Determine whether a timeout has occurred             |
| Execution class    | PublishNotificationDrafter      | Draft and send feedback notifications                |
| Execution class    | VideoPublishApplicationManager  | Manage application state changes                     |
| Execution class    | VideoPublishCancellationHandler | Perform the withdrawal workflow                      |
| Execution class    | VideoPublishTimeoutHandler      | Perform the timeout-closure workflow                 |
| Coordination class | VideoPublishWorkflowScheduler   | Coordinate the overall publication workflow          |

### Refine Hierarchical Boundaries

**Use-case level** (defines the overall workflow without implementing the internals of each node):

- VideoPublishWorkflowScheduler — Coordinates the publication workflow.
- VideoContentValidator — Validates content (black box).
- ContentReviewer — Reviews content (black box).
- VideoPublishApplicationManager — Manages the application (black box).

**Subprocess level** (provides specific implementation):

- VideoPublishTimeoutInspector — Provides the timeout-check details.
- PublishNotificationDrafter — Provides the notification-content drafting details.

### Final Candidate-Class List

| No. | Class                           | Responsibility                                                  | Collaborators                                                                                       |
| --- | ------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 1   | VideoPublishApplication         | Own the complete publication-application lifecycle and manage its state | VideoContent, ReviewFeedback, VideoPublishApplicationManager                                 |
| 2   | VideoContent                    | Represent the video-content entity being published              | VideoPublishApplication                                                                             |
| 3   | ReviewFeedback                  | Record review feedback                                          | VideoPublishApplication                                                                             |
| 4   | VideoContentValidator           | Determine whether the video content complies with publication rules | VideoPublishWorkflowScheduler                                                                   |
| 5   | ContentReviewer                 | Determine whether the content passes review                     | VideoPublishWorkflowScheduler                                                                       |
| 6   | PublishNotificationDrafter      | Draft and send feedback notifications to the creator            | VideoPublishApplicationManager                                                                      |
| 7   | VideoPublishApplicationManager  | Manage the publication application's lifecycle: creation, updates, and termination | VideoPublishWorkflowScheduler, VideoPublishCancellationHandler, VideoPublishTimeoutHandler |
| 8   | VideoPublishWorkflowScheduler   | Coordinate the overall short-video publication workflow         | VideoContentValidator, ContentReviewer, PublishNotificationDrafter, VideoPublishApplicationManager |
| 9   | VideoPublishCancellationHandler | Handle the creator's voluntary withdrawal of the publication application | VideoPublishApplicationManager                                                               |
| 10  | VideoPublishTimeoutInspector    | Detect whether the creator has missed the content-update deadline | VideoPublishApplicationManager                                                                    |
| 11  | VideoPublishTimeoutHandler      | Perform automatic closure after a timeout                       | VideoPublishApplicationManager                                                                      |
