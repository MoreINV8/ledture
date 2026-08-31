# AGENT.md

You are senior software developer

## Development Guidelines

When making changes to this React project, follow these rules.

### 1. Reuse Existing Components

Before creating a new component:

1. Check whether an existing component can already be reused.
2. If an existing component satisfies the requirement, use it instead of creating a duplicate component.
3. Only create a new component when the existing components cannot reasonably support the required functionality.
4. When creating a new component, follow the existing project's:

   * Styling patterns
   * Component structure
   * Naming conventions
   * Props patterns
   * File organization

Do not create components that duplicate existing functionality.

---

### 2. Keep Functions in the Appropriate Component

Functions should be placed in the component where they are used.

* If a function is only used by one component, define it inside that component or its appropriate local file.
* Do not move component-specific logic into unrelated components.
* Do not place logic in another component simply to reuse its function.
* Keep related UI and component-specific behavior close together when possible.

Example:

```tsx
function TransactionForm() {
  const handleSubmit = () => {
    // Logic specific to TransactionForm
  };

  return (...);
}
```

---

### 3. Extract Common Functions to Global Helper Functions

Before creating a new helper or utility function, check whether a similar function already exists.

* If the function is used by multiple components or represents reusable application logic, place it in the global helper/utility functions.
* If an existing helper function can be reused, use it instead of creating a duplicate.
* Do not extract functions into global helpers when they are only relevant to a single component.

Use global helper functions for shared logic such as:

* Data formatting
* Date formatting
* Value conversion
* Reusable validation
* Common calculations

---

### 4. Manage Constant Values Separately

Before creating a new constant value:

1. Check the existing constant files first.
2. Reuse an existing constant when appropriate.
3. If a new reusable or application-level constant is required, add it to the appropriate constant file.
4. Do not define reusable constants directly inside component files.

Constants that should be stored separately include:

* Fixed option values
* Reusable labels
* Configuration values
* Shared limits
* Reusable status values
* Common error messages

Component-specific temporary values may remain inside the component when they are not intended for reuse.

Example:

```tsx
// constants/transaction.ts
export const TRANSACTION_TYPES = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
} as const;
```

Instead of:

```tsx
function TransactionForm() {
  const INCOME = "INCOME";
  const EXPENSE = "EXPENSE";
}
```

---

## General Decision Process

Before adding new code, follow this order:

### When adding a component

> Check existing components → Reuse if possible → Otherwise create a new component following existing styles and patterns.

### When adding a function

> Check existing helper functions → Reuse if possible → If shared, add to global helpers → If component-specific, keep it in the working component.

### When adding a constant

> Check existing constants → Reuse if possible → If new and reusable, add it to the appropriate constant file → Avoid placing shared constants directly in components.

---

## Core Principle

**Always check for existing implementations before creating new components, functions, or constants.**

Prefer:

* Reuse over duplication
* Consistency over introducing new patterns
* Component-local logic for component-specific behavior
* Global helpers for genuinely shared functions
* Constant files for reusable constant values
