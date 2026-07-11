# Sequence Diagram Specifications for Daily Menu Routes

This document provides a structured specification for creating sequence diagrams for the two key Daily Menu retrieval routes: `GET /today` and `GET /date/:date`. The details are organized into tables to facilitate manual diagram drawing or translation.

---

## 1. Route: `GET /today`

### Lifelines (Objects)
| Lifeline Name | Type / File Reference | Description / Role |
| :--- | :--- | :--- |
| **Client** | Actor (Frontend SPA) | Initiator of the HTTP request. |
| **authenticate** | Middleware | Validates the JWT in the Request Header. |
| **dailyMenuController** | Controller ([daily-menu.controller.js](file:///d:/Yna/Study/TERM_7/SDN302/src/BE/research-by-learning-project-snd302_project_group2/backend/src/modules/menu/daily-menu/daily-menu.controller.js)) | Coordinates receiving the HTTP request and responding. |
| **dailyMenuService** | Service ([daily-menu.service.js](file:///d:/Yna/Study/TERM_7/SDN302/src/BE/research-by-learning-project-snd302_project_group2/backend/src/modules/menu/daily-menu/daily-menu.service.js)) | Contains business validations and role-based checks. |
| **dailyMenuRepository** | Repository ([daily-menu.repository.js](file:///d:/Yna/Study/TERM_7/SDN302/src/BE/research-by-learning-project-snd302_project_group2/backend/src/modules/menu/daily-menu/daily-menu.repository.js)) | Handles database interaction. |
| **DailyMenu** | Model / Database | Mongoose model performing queries on MongoDB collection. |
| **errorHandler** | Middleware | Handles thrown application errors and returns error HTTP status. |

### Requests (Messages / Control Flows)
| Step | Source Lifeline | Target Lifeline | Message / Call Signature | Parameters | Description |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | Client | authenticate | `GET /api/daily-menu/today` | Header: `Authorization: Bearer <Token>` | Checks for access token. |
| **2** | authenticate | dailyMenuController | `getTodayMenu(req, res)` | `req`, `res` | Moves to controller on successful authentication. |
| **3** | dailyMenuController | dailyMenuService | `getTodayMenu(role)` | `role = req.user.role` | Controller calls service layer. |
| **4** | dailyMenuService | dailyMenuRepository | `findMenuByDate(todayDate)` | `todayDate` (formatted by `getTodayVNDateString()`) | Service queries repository. |
| **5** | dailyMenuRepository | DailyMenu | `findOne({ date })` | `{ date: todayDate }` | Query against MongoDB with `.populate()`. |

### Responses (Returns / Callbacks)
| Step | Source Lifeline | Target Lifeline | Return Message / Signature | Data Returned | Description |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **R1** | DailyMenu | dailyMenuRepository | Mongoose Doc / `null` | DB document or `null` | Returns query result. |
| **R2** | dailyMenuRepository | dailyMenuService | Menu Object / `null` | Menu Object / `null` | Returns data. |
| **R3** | dailyMenuService | dailyMenuController | Return Menu | Menu Object / `null` | Passes menu back to controller. |
| **R4** | dailyMenuController | Client | `200 OK` | JSON with menu details or `null` | Final response. |

### Alternative Sequences (Conditional Logic)
| Condition (ALT / ELSE) | Flow | Exception / Action | Status Code / Code Returned |
| :--- | :--- | :--- | :--- |
| **JWT is expired/invalid** | authenticate $\rightarrow$ Client | Stop flow, return error immediately. | `401 Unauthorized` |
| **Menu does not exist for today** | dailyMenuService $\rightarrow$ dailyMenuController $\rightarrow$ Client | Service returns `null`, Controller returns success with message `"No daily menu for today"`. | `200 OK` (with `data: null`) |
| **User role is "Staff" and menu is not published** | dailyMenuService $\rightarrow$ errorHandler $\rightarrow$ Client | Service checks `role === USER_ROLES.STAFF && !menu.isConfigured`, throws `AppError`. | `404 Not Found` (code: `DAILY_MENU_NOT_FOUND`) |

---

## 2. Route: `GET /date/:date`

### Lifelines (Objects)
| Lifeline Name | Type / File Reference | Description / Role |
| :--- | :--- | :--- |
| **Client** | Actor (Frontend SPA) | Initiator of the HTTP request. |
| **authenticate** | Middleware | Validates the JWT in the Request Header. |
| **authorizeRoles** | Middleware | Restricts access to roles: `ADMIN`, `MANAGER`. |
| **validateRequest** | Middleware | Executes Joi validation logic on route parameters. |
| **dailyMenuController** | Controller ([daily-menu.controller.js](file:///d:/Yna/Study/TERM_7/SDN302/src/BE/research-by-learning-project-snd302_project_group2/backend/src/modules/menu/daily-menu/daily-menu.controller.js)) | Receives date parameter and coordinates response. |
| **dailyMenuService** | Service ([daily-menu.service.js](file:///d:/Yna/Study/TERM_7/SDN302/src/BE/research-by-learning-project-snd302_project_group2/backend/src/modules/menu/daily-menu/daily-menu.service.js)) | Runs format validations and status expiration check. |
| **dailyMenuRepository** | Repository ([daily-menu.repository.js](file:///d:/Yna/Study/TERM_7/SDN302/src/BE/research-by-learning-project-snd302_project_group2/backend/src/modules/menu/daily-menu/daily-menu.repository.js)) | Fetches and updates menu data. |
| **DailyMenu** | Model / Database | Mongoose model performing queries on MongoDB collection. |
| **errorHandler** | Middleware | Catches and processes format and missing menu errors. |

### Requests (Messages / Control Flows)
| Step | Source Lifeline | Target Lifeline | Message / Call Signature | Parameters | Description |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | Client | authenticate | `GET /api/daily-menu/date/:date` | `date` (path param), Token (header) | Initiator request. |
| **2** | authenticate | authorizeRoles | Forward request | `req.user.role` | Passes down for authorization checks. |
| **3** | authorizeRoles | validateRequest | Forward request | `req.params.date` | Passes down for validation checks. |
| **4** | validateRequest | dailyMenuController | `getMenuByDate(req, res)` | `req`, `res` | Controller execution starts. |
| **5** | dailyMenuController | dailyMenuService | `getMenuByDate(date)` | `date` | Service logic execution starts. |
| **6** | dailyMenuService | dailyMenuService | `validateDateFormat(date)` | `date` | Validates regex and parses date. |
| **7** | dailyMenuService | dailyMenuRepository | `findMenuByDate(date)` | `date` | Queries menu for that date. |
| **8** | dailyMenuRepository | DailyMenu | `findOne({ date })` | `{ date }` | Mongoose query. |
| **9**| dailyMenuService | dailyMenuService | `normalizeExpiredMenuStatus(menu)` | `menu` | Evaluates if historical menu needs to be expired. |
| **10** | dailyMenuService | dailyMenuRepository | `expireMenuStatus(menuId)` | `menu._id` | (Only if past date & items are active) Update DB. |
| **11** | dailyMenuRepository | DailyMenu | `updateOne({ _id: menuId }, $set)` | `{ _id: menuId }, { $set: { status: 'Unavailable' } }` | Updates MongoDB status. |

### Responses (Returns / Callbacks)
| Step | Source Lifeline | Target Lifeline | Return Message / Signature | Data Returned | Description |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **R1** | DailyMenu | dailyMenuRepository | Mongoose Doc / `null` | DB document or `null` | Returns query result. |
| **R2** | dailyMenuRepository | dailyMenuService | Menu Object / `null` | Menu Object / `null` | Returns query result data. |
| **R3** | DailyMenu | dailyMenuRepository | Write Result | Update ACK | Confirms status update. |
| **R4** | dailyMenuRepository | dailyMenuService | Done | void / ACK | Status updated successfully. |
| **R5** | dailyMenuService | dailyMenuController | Return Menu | Menu Object (modified/normalized) | Returns resolved menu. |
| **R6** | dailyMenuController | Client | `200 OK` | JSON with menu details | Final response. |

### Alternative Sequences (Conditional Logic)
| Condition (ALT / ELSE) | Flow | Exception / Action | Status Code / Code Returned |
| :--- | :--- | :--- | :--- |
| **JWT is expired/invalid** | authenticate $\rightarrow$ Client | Token verification failed, returns error. | `401 Unauthorized` |
| **User is not Admin/Manager** | authorizeRoles $\rightarrow$ Client | Role check failed, returns error. | `403 Forbidden` |
| **Invalid date parameter format** | validateRequest/Service $\rightarrow$ errorHandler $\rightarrow$ Client | Schema validation fails or parser fails regex verification. | `400 Bad Request` |
| **Menu does not exist for date** | dailyMenuService $\rightarrow$ errorHandler $\rightarrow$ Client | Service checks for menu existence, if null, throws `AppError`. | `404 Not Found` (code: `DAILY_MENU_NOT_FOUND`) |
| **Menu date is in the past and has available items** | dailyMenuService $\rightarrow$ dailyMenuRepository $\rightarrow$ DB | Automatically invokes `expireMenuStatus()` to synchronize and lock state. | Internal Update flow |
