# User Story

An administrator can create, edit, publish, and unpublish products. A product has three attributes: name, price, and inventory. Its name must not exceed 200 characters; its price must be a positive integer; and its inventory must not be negative. A newly created product is in the "Draft" state. It can be published, which changes its state to "Published". A published product can be unpublished, which changes its state to "Unpublished". An unpublished product cannot be edited directly and must first return to Draft. A product can have only one active state at a time.
