# md-linkage Inversify Container Setup

## Goal

Prepare `@bluey/md-linkage` to use Inversify through one package-owned dependency
injection container. This change establishes only the composition root; it does
not scaffold or bind the domain services described in the md-linkage object
model.

## Design

- Add `inversify` and `reflect-metadata` as runtime dependencies of
  `@bluey/md-linkage`.
- Enable TypeScript decorator and metadata emission options so later injectable
  services can use Inversify decorators without another configuration change.
- Define one module-owned `Container` instance in `src/container.ts`.
- Export that instance from the package entry point.
- Prefer concrete class constructors as service identifiers and bind them
  explicitly. Use symbols or strings only when a class cannot identify the
  dependency.
- Keep automatic binding disabled.
- Do not expose a container factory or introduce placeholder domain bindings.

Importing the package initializes metadata support and returns the same container
instance to every consumer in the process. Future implementation work will add
domain bindings at this composition root as concrete services are introduced.

## Verification

A focused test will prove that an unbound class does not resolve, explicitly bind
injectable classes by constructor, and resolve a constructor dependency. The
package test, typecheck, and build commands must all succeed.
