# Software Work Product (SWD) Design Report — Scheduled Menu Module

**Module:** Scheduled Menu Management  
**Application:** StallBox  
**Version:** 1.0  
**Status:** Verified against codebase (`project-clean/frontend`, `project-be/backend`)

---

## 1. Module Overview

The **Scheduled Menu Management** module establishes the weekly recurring template layout (Monday through Sunday) consumed by the Daily Menu module.
Administrators assign food items to weekdays to create a blueprint menu structure. The blueprint is consumed in two primary ways:
1. **Automatic Generation (Cron Job)**: The background cron job `dailyMenu.job.js` executes daily at `00:00` (Asia/Ho_Chi_Minh timezone). It invokes `generateDailyMenu(date)` which queries the schedule template corresponding to the current weekday and inserts it into the active daily menu.
2. **Manual Generation**: Managers or Admins trigger the creation of a daily menu from the Daily Menu management screen for a target date, pulling the pre-configured items template from the schedule.

---

## 2. System Architecture

The module utilizes a clean layered architecture, enforcing decoupled operations between user interface, logic hook, state store, validation, controller processing, service business rules, database queries, and Mongoose schemas.

```
[Frontend UI Page / Components]
              │
              ▼ (uses hook controller)
     [useScheduledMenu.js]
              │
      ┌───────┴─────────────────┐
      ▼ (reads/dispatches)      ▼ (sends requests)
 [scheduledMenuSlice.js]   [scheduledMenuApi.js] (Axios)
                                │
────────────────────────────────┼───────────────────────────────── HTTP Boundary
                                ▼ (routing & security check)
                    [scheduled_menu.route.js]
                                │
                                ▼ (parses express req)
                    [scheduled_menu.controller.js]
                                │
                                ▼ (enforces business rules)
                    [scheduled_menu.service.js]
                                │
                                ▼ (executes Mongoose queries)
                    [scheduled_menu.repository.js]
                                │
                                ▼
                     [ScheduledMenuModel (ODM)]
                                │
                                ▼
                       MongoDB (scheduled_menus)
```

### Data Flow Summary
- **Read Operations**: Page mounts -> Hook dispatches `setLoading(true)` -> triggers Axios `GET /api/scheduled-menu` -> Express Route maps route -> Controller calls Service `getWeeklySchedule` -> Repository executes `findAll` -> DTO processes response formatting, filling missing weekday records with empty arrays -> Redux commits `setSchedule` to state and builds cache snapshots.
- **Write Operations (Batch)**: Admin triggers save -> Hook builds `{ days: [{ dayOfWeek, foodItemIds }] }` payload -> Axios `PUT /api/scheduled-menu/batch` -> Validation checks params -> Service runs active item count verification -> executes Mongoose `withTransaction` -> Repository calls `upsertByDay` for each dirty day -> Commits session -> DTO shapes weekly schedule -> returns payload -> Redux resets snapshot cache and removes dirty states.
- **Write Operations (Single Day)**: Admin triggers save on a column -> Hook sends `PUT /api/scheduled-menu/:dayOfWeek` with `{ foodItemIds }` -> Route validates param -> Service updates single day -> Repository executes `findOneAndUpdate` upsert -> returns updated day -> Redux updates state and triggers silent re-fetch to rebuild snapshots.

---

## 3. Frontend Design

### 3.1 Component Structure

- **`ScheduledMenuPage.jsx`**: Page container shell. Checks permissions, mounts horizontale columns grid, holds picker modal state, page actions, loading overlay, and confirm modal states.
- **`DayColumn.jsx`**: Displays a single day's card grid. Features inline sub-component `FoodItemCard` to render card contents, name, category, and formatted price. It displays count badges, dirty highlighted borders, column-level undo, and column-level save actions.
- **`FoodItemPickerModal.jsx`**: Multi-select modal allowing checklist additions to the day. Employs shared `SearchBar` and `FilterBar` filters to search and categorize list entries.
- **`useScheduledMenu.js`**: React hook acting as the controller. Encapsulates Axios HTTP dispatchers, handles selections, filters, and local states.
- **`scheduledMenuSlice.js`**: Redux state slice defining initial states:
  - `schedule`: Active array of the weekly template.
  - `savedSnapshot`: Map storing key-values `{ dayOfWeek: string[] }` of sorted food item IDs, used to compute dirty states.
  - `savedItemsSnapshot`: Backup map storing `{ dayOfWeek: MenuItem[] }` of original items, used to roll back local cancellations.
- **`scheduleSnapshot.js`**: Pure utility functions containing `isDayDirty`, `getDirtyDays`, and `buildSavedSnapshot`. Compares active array contents with snapshots to identify unsaved changes.

### 3.2 Dirty State Algorithm
1. When a schedule is fetched, the frontend dispatches `setSchedule` action, caching the active state and building `savedSnapshot` and `savedItemsSnapshot`.
2. When the Admin modifies a day column (add or delete item), the frontend dispatches `updateDayItems` mutation on Redux state.
3. The custom hook calls `getDirtyDays(schedule, savedSnapshot)` inside a `useMemo` block. The utility:
   - Sorts the current food item IDs.
   - Compares the length and contents with the stored snapshot.
   - If they differ, the day is marked dirty.
4. Dirty days apply visual classes (`border-primary bg-primary-container/10`).
5. Clicking single day save or global save success triggers `markDaysSaved` or `setSchedule` which updates the cached snapshot and resets dirty states.

---

## 4. Backend Design

### 4.1 Layer Responsibilities

- **Route Layer (`scheduled_menu.route.js`)**: Configures routing, applies JWT auth (`authenticate`), checks permissions (`authorizeRoles("Admin", "Manager")` for read, `"Admin"` for write), and applies validations.
- **Controller Layer (`scheduled_menu.controller.js`)**: Parses parameters, catches errors using `asyncHandler`, and triggers services, returning envelopes via `successResponse`.
- **Service Layer (`scheduled_menu.service.js`)**: Enforces validation parameters, scans for duplicate food items within a day, queries active food items to block inactive assignments, manages transactions, and uses DTO formatting.
- **Repository Layer (`scheduled_menu.repository.js`)**: Executes queries. Maps population paths: `menuItems.foodItemId` to `FoodItem` collection and nested population `categoryId` to `Category` collection.
- **DTO Layer (`scheduled_menu.dto.js`)**: Decouples database entities from client representations. Maps schema documents using `toScheduledMenuDayResponse` and falls back to `toEmptyScheduledMenuDayResponse` if a weekday lacks a database record.
- **Validation Layer (`scheduled_menu.validation.js`)**: Enforces payload checks using express-validator sanitizers.
- **Constants (`scheduled_menu.constants.js`)**: Defines `DAY_OF_WEEK` enum arrays, read roles, and write roles.

### 4.2 Authorization Matrix

- **`GET /api/scheduled-menu`**: Authorized roles: `Admin`, `Manager`.
- **`PUT /api/scheduled-menu/batch`**: Authorized roles: `Admin` only.
- **`PUT /api/scheduled-menu/:dayOfWeek`**: Authorized roles: `Admin` only.

---

## 5. Database Design

### 5.1 Collection Mapping
- **Mongoose Model**: `ScheduledMenu` (defined in [scheduled_menu.model.js](file:///E:/CN/cn7/metroiday/project-be/backend/src/modules/menu/scheduled_menu/scheduled_menu.model.js)).
- **MongoDB Collection**: **`scheduled_menus`** (maps to default pluralised collection name `scheduledmenus`).

### 5.2 Schema Definition

| Field Name | Type | Required | Constraints / Indexes | Purpose |
| :--- | :--- | :---: | :--- | :--- |
| `_id` | ObjectId | Yes (Auto) | Primary Key | Document Identifier |
| `dayOfWeek` | String | Yes | Unique index, Enum: `Monday`...`Sunday` | Weekday key |
| `menuItems` | Array | No | Subdocument array | Mapped items list |
| `menuItems[].foodItemId` | ObjectId | Yes | Reference: `FoodItem` | Associated food item |
| `createdBy` | ObjectId | Yes | Reference: `User` | User who created the document |
| `updatedBy` | ObjectId | No | Reference: `User`, Default: `null` | User who updated the document |
| `createdAt` | Date | Yes (Auto) | Timestamps | Database creation timestamp |
| `updatedAt` | Date | Yes (Auto) | Timestamps | Database update timestamp |

### 5.3 Schema Population & Integrity
- **Population Path**: Populates `menuItems.foodItemId` (fields: `name`, `basePrice`, `categoryId`) and category path `categoryId` (fields: `name`).
- **Integrity Constraints**: The schema defines a unique constraint on `dayOfWeek` to guarantee that at most one scheduled menu document exists per weekday.

---

## 6. API Design

Base route endpoint: **`/api/scheduled-menu`**

### 6.1 Endpoints Specification

#### 1. Retrieve Weekly Schedule
- **Method**: `GET`
- **Path**: `/`
- **Auth**: Required (`Admin` or `Manager` role)
- **Request Body**: None
- **Response Code**: `200 OK`
- **Response Payload Shape**:
```json
{
  "success": true,
  "message": "Weekly schedule retrieved successfully",
  "data": [
    {
      "dayOfWeek": "Monday",
      "menuItems": [
        {
          "foodItemId": {
            "_id": "603f8a5a5c6d3d3a7c6b4e01",
            "name": "Cơm gà xối mỡ",
            "basePrice": 35000,
            "categoryId": {
              "_id": "603f8a5a5c6d3d3a7c6b4e00",
              "name": "Cơm trưa"
            }
          }
        }
      ],
      "createdAt": "2026-06-21T02:00:00.000Z",
      "updatedAt": "2026-06-21T02:30:00.000Z"
    },
    {
      "dayOfWeek": "Tuesday",
      "menuItems": [],
      "createdAt": null,
      "updatedAt": null
    }
  ]
}
```

#### 2. Update Single Day Schedule
- **Method**: `PUT`
- **Path**: `/:dayOfWeek`
- **Auth**: Required (`Admin` role only)
- **Request Body**:
```json
{
  "foodItemIds": [
    "603f8a5a5c6d3d3a7c6b4e01",
    "603f8a5a5c6d3d3a7c6b4e02"
  ]
}
```
- **Response Code**: `200 OK`
- **Response Payload Shape**:
```json
{
  "success": true,
  "message": "Schedule updated successfully",
  "data": {
    "dayOfWeek": "Monday",
    "menuItems": [
      {
        "foodItemId": {
          "_id": "603f8a5a5c6d3d3a7c6b4e01",
          "name": "Cơm gà xối mỡ",
          "basePrice": 35000,
          "categoryId": {
            "_id": "603f8a5a5c6d3d3a7c6b4e00",
            "name": "Cơm trưa"
          }
        }
      }
    ],
    "createdAt": "2026-06-21T02:00:00.000Z",
    "updatedAt": "2026-06-21T03:00:00.000Z"
  }
}
```

#### 3. Update Weekly Schedule (Batch)
- **Method**: `PUT`
- **Path**: `/batch`
- **Auth**: Required (`Admin` role only)
- **Request Body**:
```json
{
  "days": [
    {
      "dayOfWeek": "Monday",
      "foodItemIds": ["603f8a5a5c6d3d3a7c6b4e01"]
    },
    {
      "dayOfWeek": "Wednesday",
      "foodItemIds": ["603f8a5a5c6d3d3a7c6b4e02"]
    }
  ]
}
```
- **Response Code**: `200 OK`
- **Response Payload Shape**: Returns the complete 7-day formatted schedule array.

---

## 7. Database Transactions & Atomicity

To ensure database consistency, the batch update endpoint utilizes database transaction controls:
1. **Transaction Wrapper**: The backend executes updates within the utility helper `withTransaction`.
2. **Session Allocation**: A mongoose session is initiated and passed down as an options block (`{ session }`) to repository write commands.
3. **Atomicity (All-or-Nothing)**: The service loops through all weekdays in the batch payload, executing updates. If any query fails (e.g. database error, constraint violation), the transaction is aborted, and all changes are rolled back.
4. **Environment Constraint**: Mongoose transactions require a MongoDB replica set deployment. If run on a standalone MongoDB instance, the transaction helper catches the exception and returns a `TRANSACTION_NOT_SUPPORTED` error code (HTTP 503), preventing data corruption.

---

## 8. Error Handling Design

### 8.1 Backend Validation and Safety
- Express validation errors are intercepted by `validateRequest` middleware, returning `VALIDATION_ERROR` HTTP 400.
- Business validation rules throw customized `AppError` exceptions parsed by the global express handler.
- If transactions fail, clean session rollbacks are performed to maintain data integrity.

### 8.2 Frontend Interception
- Axios error interceptors capture failure statuses, calling the custom utility `getApiErrorMsg` to resolve errors.
- Displays error messages inside toast notifications. In the case of saving errors, the frontend preserves the active dirty states to prevent input data loss, allowing the Admin to retry the save operation.

---

## 9. Testing Strategy and Notes

The module's test coverage verifies operations across both frontend and backend layers:

### 9.1 Backend Testing (Mocha / Chai / Jest equivalent)
- **`scheduled_menu.validation.test.js`**: Focuses on input parameters validation (verifies day param formatting, body array limits, ObjectId structure checks).
- **`scheduled_menu.service.test.js`**: Unit tests target validations, active item counts matching database queries, and DTO mappings.
- **`scheduled_menu.route.test.js`**: Focuses on route permission checks (verifies Admin permits, Manager views, and Staff blocks).
- **`scheduled_menu.integration.test.js`**: Runs integration tests using a test database to verify transaction commits and rollback behaviors on constraint failures.
- **`scheduled_menu.dto.test.js`**: Focuses on DTO mapping formatting, checking empty day fallbacks.

### 9.2 Frontend Testing (React Testing Library / Jest)
- **`scheduledMenuSlice.test.js`**: Targets Redux mutations (`setSchedule`, `revertDayItems`, `updateDayItems`).
- **`scheduleSnapshot.test.js`**: Focuses on dirty state comparison helpers.
- **`useScheduledMenu.test.jsx`**: Mocks HTTP endpoints to test custom hook actions.
- **`ScheduledMenuPage.test.jsx`**: Verifies UI rendering and element visibility for Admin vs. Manager roles.
- **`DayColumn.test.jsx` / `FoodItemPickerModal.test.jsx`**: Tests checklist bindings, modal behaviors, search keywords, and action clicks.

---

## 10. Limitations and Future Improvements

- **Concurrence Warning on Close**: The frontend currently lacks a prompt warning when an Admin attempts to navigate away with active unsaved (dirty) columns.
- **WebSocket Synchronization**: The page retrieves the schedule on mount only. If multiple Admins are editing concurrently, the last write wins without notification.
- **Optimistic Rendering**: The UI locks action controls during API calls, waiting for server responses before refreshing states.
- **Reordering UI**: Food items are displayed in order of array insertion; drag-and-drop reordering is not supported.
