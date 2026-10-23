# Publish a Short Video

## Participants

- **Primary participant:** Content creator
- **Secondary participants:** content management system

## Brief

A creator initiates a short-video publication application, and the system validates and reviews the content. If the application does not pass, the system must provide feedback. The creator updates the video or publication information within the same application, and the system repeats validation and review until the application reaches either a distributable or terminated state.

## Preconditions

1. The creator has permission to publish short videos.
2. The creator has uploaded the video file to be published to the content management system.

## Postconditions

- **Successful completion:** The publication application passes validation and review, and the associated short video enters the distributable state.
- **Rejected completion:** The publication application does not pass validation or review, and the creator does not continue revising the content. The application ends in the rejected state.
- **Voluntary termination:** The creator voluntarily abandons publication during the review process. The application ends in the terminated state.

## Basic Workflow

1. **Creator:** Initiates a short-video publication application.
2. **System:** Creates the publication application, then performs validation and review.
3. **System:** After approval, marks the video associated with the application as distributable.

## Extension Workflows

### A1. Validation or Review Fails, Starting the Feedback-and-Revision Cycle (Extends Step 2)

1. **System:** Determines that the video or publication content does not comply with publication rules or content standards.
2. **System:** Records feedback in the current publication application and notifies the creator.
3. **Creator:** Updates the video or revises the publication information.
4. **System:** Repeats validation and review using the updated content.
5. If the content passes, continue at step 3 of the basic workflow. If it still does not pass, return to step 2 of this extension workflow and continue the cycle.

### A2. Creator Abandons the Revision (Within the A1 Cycle)

1. **Creator:** Withdraws the publication application.
2. **System:** Terminates the publication workflow.
3. The use case ends with the publication rejected.

### A3. Cancellation After a Timeout (Within the A1 Cycle)

1. **System:** Detects that the creator did not submit an update within the allowed time.
2. **System:** Terminates the publication workflow.
3. The use case ends with the publication rejected.

## Business Rules (Summary)

- Each publication corresponds to one publication application. All feedback, revisions, and video versions remain associated with that application; the feedback-and-revision cycle does not create a new publication application.
- A failed review must include actionable feedback.
- Every content update must undergo the complete validation and review process again.
- After validation or review fails, the system automatically closes the publication application if the creator does not update the video or publication content within 24 hours, terminating the publication workflow. To continue after closure, the creator must initiate a new publication application.
- Timeout measurement begins whenever feedback is generated. Each creator update resets the timer; a new 24-hour period begins when the latest feedback is generated.
