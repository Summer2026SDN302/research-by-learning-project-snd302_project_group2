# StallBox Backend — Copilot Instructions

You are a backend code generator for the StallBox project (Node.js + Express + MongoDB).
Follow every rule below **strictly**. No shortcuts, no invention of new features.

---

## 1. Code Generation Workflow

Before generating any code, always follow this order:

1. Identify the module boundary
2. Generate the full layer stack — never skip any layer
3. Apply naming convention
4. Apply response format
5. Apply error handling

Full spec → `docs/BACKEND_AI_GUIDE.md`

---

## 2. Architecture (Non-Negotiable)

Every module MUST follow this flow — no exceptions:

```
Route → Controller → Service → Repository → Model
```

Each module folder structure:

```
module/
├── module.route.js
├── module.controller.js
├── module.service.js
├── module.repository.js
├── module.model.js
├── module.validation.js   ← optional
├── module.dto.js          ← optional
```

Full spec → `docs/BACKEND_STRUCTURE.md`

---

## 3. Layer Responsibilities

| Layer | Responsibility | MUST NOT |
|---|---|---|
| **Route** | Define endpoints, apply middlewares | business logic |
| **Controller** | Receive req, call service, return response | query DB, business logic |
| **Service** | All business logic, validation, orchestration | access req/res |
| **Repository** | MongoDB/Mongoose queries only | business logic |
| **Model** | Schema definition only | anything else |

Full spec → `docs/BACKEND_AI_GUIDE.md`

---

## 4. Model Rules

Every model MUST include:

```js
{
  // ...fields
  isActive: { type: Boolean, default: true },
  deletedAt: { type: Date, default: null },
},
{ timestamps: true }   // adds createdAt + updatedAt automatically
```

Full spec → `docs/BACKEND_AI_GUIDE.md`

---

## 5. API Response Format

ALL responses MUST use this format:

```js
// Success
{ success: true,  message: "string", data: {},   error: null }

// Error
{ success: false, message: "string", data: null, error: { code: "string", details: [] } }
```

Full spec → `docs/BACKEND_AI_GUIDE.md`

---

## 6. Error Handling

ALWAYS throw via `AppError`:

```js
throw new AppError("ERROR_CODE", statusCode);
```

NEVER:
```js
throw "some string"
throw new Error("raw message")
```

Full spec → `docs/BACKEND_AI_GUIDE.md`

---

## 7. Auth & Authorization

```js
// Require login
router.use(authenticate);

// Require role
router.use(authorizeRoles(USER_ROLES.ADMIN));
```

Full spec → `docs/BACKEND_AI_GUIDE.md`

---

## 8. Naming Convention

| Target | Convention | Example |
|---|---|---|
| Files | kebab-case | `order-item.service.js` |
| Variables / functions | camelCase | `getOrderById` |
| Classes | PascalCase | `OrderService` |

Full spec → `docs/BACKEND_AI_GUIDE.md`

---

## 9. Project Setup & Environment

- Runtime: Node.js + Express
- Database: MongoDB Atlas via Mongoose
- Auth: JWT (`JWT_SECRET`, `JWT_REFRESH_SECRET`)
- Entry: `src/server.js`

Full spec → `docs/BACKEND_SETUP.md`

---

## 10. Folder Structure

```
src/
├── config/
├── middlewares/
├── shared/
├── sockets/
├── jobs/
├── modules/
├── app.js
└── server.js
```

Full spec → `docs/BACKEND_STRUCTURE.md`

---

## Reference Files

| File | Nội dung |
|---|---|
| `docs/BACKEND_AI_GUIDE.md` | Toàn bộ rules kiến trúc, layer, naming, response format |
| `docs/BACKEND_STRUCTURE.md` | Folder structure, module example, layer rules |
| `docs/BACKEND_SETUP.md` | Cài đặt, biến môi trường, chạy project |