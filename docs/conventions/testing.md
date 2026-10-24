# Automation Testing Conventions

## Vibe Tech

- Test Runner: `vitest`

## Testing Conventions

### File Organization Conventions

- Colocate unit test with source files
- Colocate unit test **fixtures** with source files
- Place `E2E` tests in `tests/e2e/`

```shell
├── inference
│   └── __fixtures__
│   └── observer.ts
│   ├── observer.test.ts
```

### Test Code Conventions

- `vitest` APIs must be explicitly imported;
- `vitest` test case must be written entirely in English
- Resolve dependency-injected systems and their managed collaborators from a
  test-local container or the production composition factory. Do not manually
  reconstruct their object graph with `new`.
- Construct value objects, immutable test data, and collaborators outside the
  dependency-injection graph directly when doing so keeps the test explicit.

```ts
import { describe, expect, it, rstest } from "vitest";

it("should return single point", () => {
  // Arrange, Act, Assert pattern
});
```

### Running Tests

```bash
# Run specific test cases
pnpm vitest run -t "should return single point"

# Run test cases with file names containing "observer"
pnpm vitest run "observer"

# Run test cases for a specific package
pnpm vitest run --project @bluey/echo-mcp
```
