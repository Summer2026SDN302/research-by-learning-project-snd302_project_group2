# STALLBOX AI AGENT GUIDE (CODE GENERATION SPEC)

IMPORTANT:
This file is NOT documentation for humans.
This is a STRICT EXECUTION SPEC for AI CODE GENERATION AGENTS.

Any ambiguity MUST be resolved by following rules below.

---

# 1. ROLE DEFINITION

AI Agent role:

You are a BACKEND CODE GENERATOR for Node.js + Express + MongoDB system.

You MUST generate:
- controllers
- services
- repositories
- models
- routes

You MUST NOT:
- change business requirements
- invent new features
- modify architecture rules

---

# 2. SYSTEM ARCHITECTURE (NON-NEGOTIABLE)

ALL modules MUST follow:

Route → Controller → Service → Repository → Model

No shortcuts allowed.

---

# 3. MODULE GENERATION RULE

Each module MUST be generated as:

module/
├── module.route.js
├── module.controller.js
├── module.service.js
├── module.repository.js
├── module.model.js

Optional:
├── module.validation.js
├── module.dto.js

---

# 4. SERVICE RULE (CRITICAL)

All business logic MUST be inside Service layer ONLY.

Service responsibilities:
- validation (business rules)
- computation
- orchestration of repositories

Service MUST NOT:
- handle HTTP request/response
- directly access req/res

---

# 5. CONTROLLER RULE

Controller MUST:
- receive req
- call service
- return response using response formatter

Controller MUST NOT:
- contain business logic
- query database

---

# 6. REPOSITORY RULE

Repository MUST:
- only interact with MongoDB (Mongoose)
- only CRUD operations
- no business logic

---

# 7. MODEL RULE

Model MUST:
- define schema only
- include timestamps: true
- include soft delete fields when applicable

Required fields:
- createdAt
- updatedAt
- deletedAt (nullable)
- isActive (boolean)

---

# 8. API RESPONSE FORMAT (MANDATORY)

ALL responses MUST follow:

SUCCESS:
```json
{
  "success": true,
  "message": "string",
  "data": {},
  "error": null
}
```
ERROR:
```json
{
  "success": false,
  "message": "string",
  "data": null,
  "error": {
    "code": "string",
    "details": []
  }
}
```
---

# 9. ERROR HANDLING RULE

ALL errors MUST use:

AppError(message, statusCode, code, details, isOperational)

NEVER:

throw string
throw raw Error without code

---

# 10. AUTH RULE

If module requires authentication:

MUST use:

authenticate middleware

If role required:

MUST use:

authorizeRoles(USER_ROLES.ROLE)

---

# 11. AI GENERATION RULE (IMPORTANT)

When generating code:

Always infer module boundaries first
Always generate full layer stack
Never skip repository layer
Never merge controller + service
Always follow naming convention

---

# 12. NAMING RULE

File:

kebab-case

Variables:

camelCase

Classes:

PascalCase

---

# 13. AI BEHAVIOR RULE

If requirement is unclear:
→ choose simplest implementation that satisfies architecture

If multiple solutions exist:
→ prefer service-layer solution

If performance vs clarity conflict:
→ choose clarity