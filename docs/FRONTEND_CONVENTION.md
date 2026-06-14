# StallBox Frontend Convention

# Naming Convention

## Components

Use PascalCase:

- LoginForm.jsx
- RevenueChart.jsx

---

## Hooks

Hooks MUST start with:

- useLogin.js
- useOrder.js

---

## Redux

Examples:

- authSlice.js
- orderSlice.js

---

## API

Examples:

- authApi.js
- orderApi.js

---

# File Extension

.jsx
- Components
- Pages
- Layouts

.js
- Hooks
- Redux
- API
- Utils

---

# Shared Component Rule

Shared reusable UI:

components/

Module-specific UI:

modules/auth/components/

---

# Shared Hook Rule

Shared reusable hooks:

hooks/

Module hooks:

modules/auth/hooks/

---

# API Rule

All API calls MUST use:

services/apiClient.js

NEVER use axios directly inside components.