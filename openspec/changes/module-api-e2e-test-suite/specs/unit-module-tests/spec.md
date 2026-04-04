# Unit module tests

## Purpose

Define requirements for automated unit tests covering each library module and React hook in the application so that pure logic and client-side behavior regressions are caught without starting a browser or full HTTP stack.

## ADDED Requirements

### Requirement: Library modules have unit tests

The system SHALL include automated unit tests for each TypeScript module under `app/src/lib/` that exercises public functions or classes with deterministic inputs and outputs.

#### Scenario: Pure utilities are tested

- **WHEN** a module exports pure functions (e.g., formatting, calculations)
- **THEN** unit tests SHALL verify representative inputs including edge cases and expected outputs

#### Scenario: Modules with external dependencies use test doubles

- **WHEN** a module depends on the filesystem, network, or environment variables
- **THEN** unit tests SHALL mock or stub those dependencies and SHALL NOT require real external services

### Requirement: Hooks have unit tests

The system SHALL include automated unit tests for each file under `app/src/hooks/` that validates hook behavior under mocked fetch, storage, or context as appropriate to the hook.

#### Scenario: Hook exposes consistent API

- **WHEN** a hook is mounted with `renderHook` (or equivalent) and mocked dependencies
- **THEN** tests SHALL assert initial state and at least one mutation or side-effect path relevant to the hook’s contract

### Requirement: Unit tests run in CI

The system SHALL expose an npm script (e.g., `test:unit`) that runs all unit tests in non-interactive mode suitable for continuous integration.

#### Scenario: CI executes unit suite

- **WHEN** the CI pipeline runs the unit test script
- **THEN** the command SHALL exit with code zero when all unit tests pass and non-zero on failure
