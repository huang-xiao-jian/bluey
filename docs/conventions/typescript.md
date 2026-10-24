# TypeScript convention

This document defines the default TypeScript code style for the repository.
Apply it unless a package or runtime has a more specific requirement.

## Object-oriented design

- Prefer classes for stateful domain behavior, services, and dependency
  boundaries.
- Use functions for small stateless transformations, predicates, schemas, and
  other behavior that does not benefit from an object lifecycle.
- Keep each class focused on one responsibility and expose a small, explicit
  public API.
- Encapsulate mutable state. Prefer `private` or `protected` members over
  publicly writable properties.
- Supply required collaborators through the constructor so dependencies are
  visible and instances are easy to test.
- Favor composition and delegation over inheritance. Use inheritance only when
  subtypes have a genuine substitutable relationship with the base type.
- Define interfaces at meaningful boundaries, such as repositories, external
  services, and interchangeable strategies. Do not create an interface solely
  to mirror every class.
- Avoid static utility classes and classes that only wrap a single stateless
  function.

## Class implementation

- Use descriptive nouns for class names and verbs for methods.
- Declare member visibility explicitly when it improves the public contract.
- Prefer `readonly` fields for dependencies and state that is not reassigned.
- Keep constructors free of I/O and substantial business logic.
- Preserve class invariants inside the class instead of requiring callers to
  coordinate internal state.
- Test observable behavior through the public API. Avoid tests coupled to
  private implementation details.

## Dependency injection

- Use concrete or abstract classes as service identifiers so constructor type
  metadata can resolve dependencies without parameter-level injection
  decorators.
- Do not introduce string or symbol service identifiers when a concrete or
  abstract class can express the dependency.
- Injection decorators are allowed. Use a class service identifier with
  `@inject` when explicit annotation is useful and with `@multiInject` when a
  constructor consumes multiple implementations of one abstract class.
- Keep service bindings in the composition root and use `@injectable` to make
  constructor metadata available to the container.

## Imports

- Write imports without file extensions, including relative imports.
- Import from the narrowest stable module boundary available.
- Use `import type` when an import is used only as a type.
- Include a file extension only when a runtime, compiler, or external tool
  explicitly requires it.
