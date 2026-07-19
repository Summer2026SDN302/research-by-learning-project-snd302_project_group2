# Class Diagram — Scheduled Menu Management

This document details the class structure and structural relationships within the **Scheduled Menu Management** module for both the Frontend and Backend services. 

The architecture adheres to a clean separation of concerns:
* **Frontend**: React Components, Custom Hooks, Redux Toolkit (state management), and REST API client layers.
* **Backend**: Express Router, Controller, Validation, Service, Repository (data access), DTO (data transfer object), and Mongoose ODM models.

---

## 1. Mermaid Class Diagram

```mermaid
classDiagram
  %% Relations and Associations
  ScheduledMenuPage ..> useScheduledMenu : uses custom hook
  ScheduledMenuPage --> DayColumn : renders
  ScheduledMenuPage --> FoodItemPickerModal : renders
  useScheduledMenu --> scheduledMenuSlice : dispatches actions to
  useScheduledMenu --> scheduledMenuApi : invokes API requests
  useScheduledMenu ..> scheduleSnapshot : calculates dirty state via
  
  DayColumn --> FoodItemCard : renders (inline in DayColumn.jsx)
  FoodItemPickerModal ..> FilterBar : uses shared component
  FoodItemPickerModal ..> SearchBar : uses shared component
  
  scheduledMenuApi ..> apiClient : uses global Axios client

  ScheduledMenuRoute --> scheduledMenuController : dispatches to
  scheduledMenuController --> scheduledMenuService : calls
  scheduledMenuService --> scheduledMenuRepository : queries
  scheduledMenuService --> foodItemRepository : validates items via
  scheduledMenuService ..> scheduledMenuDTO : transforms data via
  
  scheduledMenuRepository --> ScheduledMenuModel : manipulates
  foodItemRepository --> FoodItemModel : manipulates
  
  DailyMenuService --> scheduledMenuRepository : retrieves schedule from
  
  ScheduledMenuModel "1" *-- "many" MenuItemSchema : embeds
  MenuItemSchema "many" --> "1" FoodItemModel : references
  ScheduledMenuModel "many" --> "1" UserModel : createdBy / updatedBy
  FoodItemModel "many" --> "1" CategoryModel : categoryId
  FoodItemModel "many" --> "1" UserModel : deletedBy

  %% FRONTEND CLASSES
  class ScheduledMenuPage {
    <<React Component>>
    -confirmOpen: boolean
    -saveDayTarget: string
    -user: Object
    -isAdmin: boolean
    +handlePickerAdd(selectedItems)
    +handleConfirmSave()
    +handleConfirmSaveDay()
    +render()
  }

  class DayColumn {
    <<React Component>>
    +day: Object
    +isDirty: boolean
    +isSaving: boolean
    +isAdmin: boolean
    +onAddItem: function
    +onRemoveItem: function
    +onSaveDay: function
    +onCancelDay: function
    +render()
  }

  class FoodItemCard {
    <<React Component (inline in DayColumn.jsx)>>
    +item: Object
    +isAdmin: boolean
    +onRemove: function
    +render()
  }

  class FoodItemPickerModal {
    <<React Component>>
    -newSelectedItems: Array
    -prevOpen: boolean
    +open: boolean
    +day: string
    +search: string
    +category: string
    +categories: Array
    +items: Array
    +initialSelectedIds: Array
    +onSearch: function
    +onCategory: function
    +onAdd: function
    +onClose: function
    +handleToggle(item)
    +handleConfirmAdd()
    +render()
  }

  class useScheduledMenu {
    <<React Custom Hook>>
    +schedule: Array
    +isLoading: boolean
    +isSaving: boolean
    +error: string
    +dirtyDays: Array
    +hasUnsavedChanges: boolean
    +pickerOpen: boolean
    +pickerDay: string
    +pickerSearch: string
    +pickerCategory: string
    +filteredPickerItems: Array
    +categories: Array
    +fetchSchedule(silent)
    +fetchPickerData()
    +openPicker(day)
    +closePicker()
    +addItemsToDay(dayOfWeek, items)
    +removeItemFromDay(dayOfWeek, itemId)
    +saveDaySchedule(dayOfWeek)
    +saveAllSchedule()
    +cancelDayEdits(dayOfWeek)
    +cancelAllEdits()
    +updatePickerFilters(filters)
  }

  class scheduledMenuSlice {
    <<Redux Slice>>
    +initialState: Object
    +setSchedule(state, action)
    +updateDayItems(state, action)
    +revertDayItems(state, action)
    +markDaysSaved(state, action)
    +setLoading(state, action)
    +setSaving(state, action)
    +setError(state, action)
    +resetError(state)
  }

  class scheduleSnapshot {
    <<Utility>>
    +extractFoodItemIds(menuItems) Array
    +buildSavedSnapshot(schedule) Object
    +isDayDirty(dayOfWeek, schedule, savedSnapshot) boolean
    +getDirtyDays(schedule, savedSnapshot) Array
  }

  class scheduledMenuApi {
    <<API Client>>
    +getWeeklySchedule() Promise
    +updateDaySchedule(dayOfWeek, foodItemIds) Promise
    +batchUpdateSchedule(days) Promise
  }

  class apiClient {
    <<Axios Instance>>
    +get(url) Promise
    +put(url, data) Promise
  }

  %% BACKEND CLASSES
  class ScheduledMenuRoute {
    <<Express Router>>
    +GET /api/scheduled-menu
    +PUT /api/scheduled-menu/batch
    +PUT /api/scheduled-menu/:dayOfWeek
  }

  class scheduledMenuController {
    <<Express Controller>>
    +getWeeklySchedule(req, res) Promise
    +updateDaySchedule(req, res) Promise
    +batchUpdateSchedule(req, res) Promise
  }

  class scheduledMenuService {
    <<Service Layer>>
    +getWeeklySchedule() Promise
    +updateDaySchedule(day, foodItemIds, userId) Promise
    +batchUpdateSchedule(days, userId) Promise
  }

  class scheduledMenuRepository {
    <<Repository Layer>>
    +countByFoodItemId(foodItemId) Promise
    +findByDayOfWeek(dayOfWeek) Promise
    +findAll() Promise
    +findByDay(day) Promise
    +upsertByDay(day, menuItems, userId, options) Promise
    +removeFoodItemFromAllSchedules(foodItemId) Promise
  }

  class scheduledMenuDTO {
    <<Data Transfer Object>>
    +toScheduledMenuFoodItemResponse(menuItem) Object
    +toScheduledMenuDayResponse(doc) Object
    +toEmptyScheduledMenuDayResponse(dayOfWeek) Object
  }

  class foodItemRepository {
    <<Repository Layer>>
    +countActiveByIds(ids) Promise
    +findFoodItemsByIds(ids) Promise
  }

  class DailyMenuService {
    <<Service Layer>>
    +generateDailyMenu(date, createdBy) Promise
  }

  %% DATABASE MODELS
  class ScheduledMenuModel {
    <<Mongoose Model>>
    +dayOfWeek: String [Enum]
    +menuItems: Array~MenuItemSchema~
    +createdBy: ObjectId~User~
    +updatedBy: ObjectId~User~
    +createdAt: Date
    +updatedAt: Date
  }

  class MenuItemSchema {
    <<Mongoose Schema>>
    +foodItemId: ObjectId~FoodItem~
  }

  class FoodItemModel {
    <<Mongoose Model>>
    +categoryId: ObjectId~Category~
    +name: String
    +description: String
    +basePrice: Number
    +cost: Number
    +isArchived: Boolean
    +deletedAt: Date
    +deletedBy: ObjectId~User~
    +createdAt: Date
    +updatedAt: Date
  }

  class CategoryModel {
    <<Mongoose Model>>
    +name: String
    +description: String
    +createdAt: Date
    +updatedAt: Date
  }

  class UserModel {
    <<Mongoose Model>>
    +fullName: String
    +email: String
    +role: String
  }
```

---

## 2. Component Explanations

### 2.1 Backend Layer (Express & Mongoose)
* **`ScheduledMenuModel`**: Maps directly to the MongoDB `scheduled_menus` collection. It ensures data consistency through enum validation on `dayOfWeek` and requires a reference to active food items.
* **`ScheduledMenuRoute`**: Handles HTTP endpoints. Uses validation middlewares (`validateDayParam`, `validateUpdateBody`) and authentication/authorization middlewares (`authenticate`, `authorizeRoles`).
* **`scheduledMenuController`**: Extracts params and request bodies, maps async logic via `asyncHandler`, and delegates to `scheduledMenuService`. It returns formatted responses using `successResponse`.
* **`scheduledMenuService`**: Encapsulates business logic. It checks for duplicate items, validates that requested food items are existing and active in the database (via `foodItemRepository`), and orchestrates updates or reads.
* **`scheduledMenuRepository`**: Contains all database queries for ScheduledMenu. Uses standard Mongoose helper methods like `findOneAndUpdate` with query populate stages.
* **`scheduledMenuDTO`**: Structures MongoDB documents into standardized responses for client consumption. This decouples database internal fields (like database versioning `__v` or password hashes) from clients.

### 2.2 Frontend Layer (React & Redux Toolkit)
* **`ScheduledMenuPage`**: The entry page rendering the weekly schedule board. It delegates state management and asynchronous operations to `useScheduledMenu`.
* **`DayColumn`**: Renders a vertical column representing a specific weekday (e.g. Thứ 2). Contains inline `FoodItemCard` sub-component and triggers action events.
* **`FoodItemPickerModal`**: A multi-select checklist modal to add food items to a specific day. Uses shared `SearchBar` and `FilterBar` from `components/search/`.
* **`useScheduledMenu`**: A React hook containing the core UI controller logic, fetching backend schedules, tracking local modifications, and calling state management actions.
* **`scheduledMenuSlice`**: Stores the global Redux state: the active `schedule` array, `savedSnapshot` (for tracking changes), loading states, and API errors.
* **`scheduleSnapshot`**: Computes differences between current state and saved database snapshot to determine if a day is "dirty" (i.e. contains unsaved modifications).
