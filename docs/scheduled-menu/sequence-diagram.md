# Sequence Diagrams — Scheduled Menu Management

This document provides visual sequence flows for the primary actions in the **Scheduled Menu Management** module:
1. **View Weekly Schedule**
2. **Assign Food Items to Weekday** (Local State)
3. **Batch Save Weekly Schedule**

---

## 1. View Weekly Schedule Flow

This workflow illustrates how the Weekly Schedule is retrieved and rendered on the user interface. Both **Admin** and **Manager** roles are authorized to perform this operation.

```mermaid
sequenceDiagram
  autonumber
  actor User as Admin / Manager
  participant Page as ScheduledMenuPage (React)
  participant Hook as useScheduledMenu (React Hook)
  participant Redux as scheduledMenuSlice (Redux)
  participant API as scheduledMenuApi (FE)
  participant Client as apiClient (Axios)
  participant Router as ScheduledMenuRoute (Express)
  participant Controller as scheduledMenuController (BE)
  participant Service as scheduledMenuService (BE)
  participant Repo as scheduledMenuRepository (BE)
  database DB as MongoDB (scheduled_menus)

  User->>Page: Accesses "/[role]/scheduled-menu" route
  Page->>Hook: Mounts and triggers useEffect
  
  activate Hook
  Hook->>Redux: Dispatch setLoading(true)
  Hook->>API: Calls getWeeklySchedule()
  activate API
  
  API->>Client: GET /scheduled-menu
  activate Client
  Client->>Router: GET /api/scheduled-menu (with Auth token)
  
  activate Router
  Note over Router: Middleware: authenticate<br/>Middleware: authorizeRoles("Admin", "Manager")
  Router->>Controller: getWeeklySchedule(req, res)
  
  activate Controller
  Controller->>Service: getWeeklySchedule()
  
  activate Service
  Service->>Repo: findAll()
  
  activate Repo
  Repo->>DB: find().populate(FOOD_ITEM_POPULATE)
  DB-->>Repo: Returns scheduled documents
  Repo-->>Service: Returns raw schedule array
  deactivate Repo
  
  Note over Service: Map DAY_OF_WEEK: convert found docs using<br/>toScheduledMenuDayResponse(), or generate empty<br/>via toEmptyScheduledMenuDayResponse()
  
  Service-->>Controller: Returns completed 7-day schedule array
  deactivate Service
  
  Controller-->>Client: HTTP 200 OK { success: true, data: [...] }
  deactivate Controller
  deactivate Router
  
  Client-->>API: Response JSON data
  deactivate Client
  API-->>Hook: Returns structured schedule array
  deactivate API
  
  Hook->>Redux: Dispatch setSchedule(data)
  Note over Redux: Stores schedule & builds<br/>initial savedSnapshot for dirty tracking
  Hook->>Page: Returns loaded states & schedule data
  deactivate Hook
  
  Page->>User: Renders 7 DayColumns with food items (Monday to Sunday)
```

---

## 2. Assign Food Items to Weekday (Local State Change)

This workflow illustrates the process when an **Admin** user updates a day's schedule locally by picking items from the selection modal.

> [!NOTE]
> This phase does not involve backend API calls. It updates the frontend Redux state and marks the column dirty.

```mermaid
sequenceDiagram
  autonumber
  actor Admin
  participant Page as ScheduledMenuPage (React)
  participant Hook as useScheduledMenu (React Hook)
  participant Modal as FoodItemPickerModal (React)
  participant Redux as scheduledMenuSlice (Redux)

  Admin->>Page: Clicks "Thêm món" on a DayColumn (e.g., Monday)
  Page->>Hook: Invokes openPicker("Monday")
  Hook-->>Page: Updates pickerOpen=true, pickerDay="Monday"
  Page->>Modal: Renders Modal with food items list
  
  Admin->>Modal: Type keyword in SearchBar / Filter Category / Check items
  Admin->>Modal: Clicks "Thêm (N) món" confirm button
  
  Modal->>Page: Triggers handlePickerAdd(selectedItems)
  Page->>Hook: Invokes addItemsToDay("Monday", selectedItems)
  
  activate Hook
  Note over Hook: Filters out already assigned items
  Hook->>Redux: Dispatch updateDayItems({ dayOfWeek: "Monday", menuItems: [...] })
  deactivate Hook
  
  Note over Page: Hook recalculates dirtyDays using isDayDirty().<br/>"Monday" column border glows;<br/>"Lưu thay đổi" & "Hủy thay đổi" actions appear.
```

---

## 3. Batch Save Weekly Schedule

This workflow illustrates the database synchronization process when the **Admin** clicks the global save button to commit all local modifications.

```mermaid
sequenceDiagram
  autonumber
  actor Admin
  participant Page as ScheduledMenuPage (React)
  participant Hook as useScheduledMenu (React Hook)
  participant Redux as scheduledMenuSlice (Redux)
  participant API as scheduledMenuApi (FE)
  participant Client as apiClient (Axios)
  participant Router as ScheduledMenuRoute (Express)
  participant Controller as scheduledMenuController (BE)
  participant Service as scheduledMenuService (BE)
  participant FoodRepo as foodItemRepository (BE)
  participant Repo as scheduledMenuRepository (BE)
  database DB as MongoDB

  Admin->>Page: Clicks global "Lưu thay đổi" button
  Page->>Page: Shows ConfirmDialog
  Admin->>Page: Confirms save
  Page->>Hook: Invokes saveAllSchedule()
  
  activate Hook
  Hook->>Redux: Dispatch setSaving(true)
  
  Note over Hook: Sorts dirtyDays and builds payload:<br/>days = [{ dayOfWeek, foodItemIds }]
  
  Hook->>API: Calls batchUpdateSchedule(days)
  activate API
  API->>Client: PUT /scheduled-menu/batch { days }
  activate Client
  Client->>Router: PUT /api/scheduled-menu/batch { days }
  
  activate Router
  Note over Router: Middleware: authenticate<br/>Middleware: authorizeRoles("Admin")<br/>Middleware: validateBatchUpdateBody (limits payload array)
  Router->>Controller: batchUpdateSchedule(req, res)
  
  activate Controller
  Controller->>Service: batchUpdateSchedule(days, adminUserId)
  
  activate Service
  Note over Service: Validates day list & checks for duplicate day entries
  Note over Service: Checks for duplicate foodItemIds within each day
  
  Service->>FoodRepo: countActiveByIds(uniqueAllFoodItemIds)
  activate FoodRepo
  FoodRepo-->>Service: Returns count of active matches in DB
  deactivate FoodRepo
  
  alt Count matches uniqueAllFoodItemIds.length
    Note over Service: All items valid & active
  else One or more items deleted or missing
    Service-->>Controller: Throws AppError("One or more food items not found", 404)
    Controller-->>API: HTTP 404 Not Found { success: false, error: "FOOD_ITEM_NOT_FOUND" }
  end
  
  Note over Service: Starts mongoose session via withTransaction() helper
  
  loop Each dayObj in batch
    Service->>Repo: upsertByDay(dayOfWeek, menuItems, adminUserId, { session })
    activate Repo
    Repo->>DB: findOneAndUpdate({ dayOfWeek }, { $set, $setOnInsert }, { upsert: true, session })
    DB-->>Repo: Returns saved document
    Repo-->>Service: Returns updated document
    deactivate Repo
  end
  
  Note over Service: Commits transaction on success.<br/>If any error occurs, transaction aborts & rolls back.
  
  Service->>Repo: findAll() [Retrieves updated 7-day schedule]
  activate Repo
  Repo-->>Service: Returns raw schedule array
  deactivate Repo
  
  Service-->>Controller: Returns DTO formatted 7-day schedule
  deactivate Service
  
  Controller-->>Client: HTTP 200 OK { success: true, message: "Weekly schedule updated successfully", data }
  deactivate Controller
  deactivate Router
  
  Client-->>API: Response JSON data
  deactivate Client
  API-->>Hook: Returns complete updated 7-day schedule
  deactivate API
  
  Hook->>Redux: Dispatch setSchedule(updatedSchedule)
  Note over Redux: Updates state & snapshots, clearing dirty state
  Hook-->>Page: Displays success Toast: "Lịch thực đơn tuần đã được cập nhật."
  
  Hook->>Redux: Dispatch setSaving(false)
  deactivate Hook
```
