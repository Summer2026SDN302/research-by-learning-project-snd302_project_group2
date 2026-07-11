# Software Requirements Specification (SRS) — Scheduled Menu Management Screen

**Module:** Scheduled Menu Management  
**Application:** StallBox  
**Version:** 1.0  
**Status:** Verified against codebase (`project-clean/frontend`, `project-be/backend`)

---

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for the **Scheduled Menu Management Screen**. It provides a detailed specification for the user interface designs, visual components, interaction flows, input validation constraints, error handling rules, and acceptance criteria. It serves as the primary specification for front-end developers, back-end developers, and QA engineers.

### 1.2 Scope
This specification covers:
1. Horizontal weekly layout displaying seven weekday columns (Monday through Sunday) showing assigned food items.
2. Administrative operations to assign, query, and remove food items from weekday columns.
3. Client-side change-tracking (dirty state tracking) and batch or single-day database synchronization.
4. Search, category filter, and duplicate checks in the item assignment modal.
5. Role-based client-side UI visibility (Admin vs. Manager).

Excluded from this scope:
- Adding or editing food items or category metadata (handled by the Food Item/Category management screens).
- Publishing daily menus or adjusting item quantities/prices (handled by the Daily Menu screen).

---

## 2. User Roles and Actors

| Actor | Description | View Weekly Schedule | Configure Weekly Schedule | Authorized Route |
| :--- | :--- | :---: | :---: | :--- |
| **Admin** | Stall owner or system administrator | Yes | Yes (full write access) | `/admin/scheduled-menu` |
| **Manager** | Canteen manager | Yes | No (read-only UI) | `/manager/scheduled-menu` |
| **Staff** | Operational staff | No | No | Route not registered (blocked) |

---

## 3. Screen Description

The Scheduled Menu Management Screen consists of three main structural components: the Page Header, the Weekly Grid Layout, and the Food Item Picker Modal.

### 3.1 Page Header
- **Breadcrumbs**: Renders navigation indicator pathway:
  - If role is Admin: `Admin / Thực đơn theo lịch`
  - If role is Manager: `Manager / Thực đơn theo lịch`
- **Title & Subtitle**: Shows page title `"Thực đơn theo lịch"` and subtitle `"Cấu hình thực đơn cho từng ngày trong tuần"`.
- **Global Actions (Admin Only)**:
  - `"Hủy thay đổi"` button: Visible only when `hasUnsavedChanges` is true. Clicking this reverts all dirty day changes to the last saved snapshots.
  - `"Lưu thay đổi"` button: Disabled unless `hasUnsavedChanges` is true. Clicking this opens the batch confirmation dialog. Shows a loading spinner inside the button during API write requests.

### 3.2 Weekly Grid Layout
- **Horizontally Scrollable Grid**: Container displaying 7 columns side-by-side using CSS horizontal overflow (`overflow-x-auto`) to support small screens.
- **Day Column (`DayColumn`)**: Represents a single weekday.
  - **Header**: Weekday label (e.g. `Thứ 2`, `Thứ 3`... `Chủ Nhật`) and item count (e.g. `"3 món"`).
  - **Inline Action Controls (Admin Only - Visible when dirty)**:
    - Save icon (disk symbol): Clicking this triggers a single-day save confirmation dialog.
    - Undo icon: Clicking this reverts all unsaved changes for this specific weekday.
  - **Items List**: Scrollable area displaying food cards. If empty, it renders an `EmptyState` component displaying "Chưa có món". If the user is Admin, it shows the tip "Nhấn Thêm món bên dưới."; if Manager, it shows "Không có món ăn".
  - **Food Card (`FoodItemCard`)**: Renders inline inside `DayColumn.jsx`. Displays the name, category (if present), base price in VND (formatted with currency separators). If the user is Admin, hovering over the card displays a close icon (`close` symbol) in the top-right corner to allow item deletion.
  - **Add Item Button ("Thêm món" - Admin Only)**: Rendered at the bottom of the column as a dashed-border button. Clicking this opens the item picker modal for that weekday.

### 3.3 Food Item Picker Modal (`FoodItemPickerModal`)
- **Modal Wrapper**: Opens as a centered overlay with a dark backdrop.
- **Header**: Displays `"Thêm món — [Tên ngày]"` and a close icon button at the top-right.
- **Filter Controls**:
  - **Search Bar**: Text input field with a placeholder `"Tìm món ăn..."` that filters items by name.
  - **Filter Bar**: Horizontal scrollable categories pill filters (retrieved via category API).
- **Food List**: Scrollable checkbox list showing search and category filter results.
  - Each item displays a checkbox, name, category, and base price.
  - Items already present on that weekday are disabled, checkbox checked, and labeled with a badge `"Đã thêm"`.
  - Non-duplicate items are clickable; selecting them toggles their checkbox state and adds them to `newSelectedItems`.
- **Footer Button**: Displays `"Thêm (N) món"` where `N` is the count of new selections. Clicking this confirms additions, closes the modal, and pushes changes to the page state. Disabled if `N` is 0.

### 3.4 Confirm Dialogs
- Renders a warning confirmation pop-up modal (`ConfirmDialog`) before initiating write operations:
  - Batch Save: "Lưu thay đổi lịch tuần? Bạn đã chỉnh sửa X ngày. Các thay đổi sẽ được lưu lên hệ thống."
  - Single-Day Save: "Lưu thay đổi lịch [Tên ngày]? Các thay đổi đối với lịch [Tên ngày] sẽ được lưu lên hệ thống."

---

## 4. Functional Requirements

### 4.1 View Weekly Schedule

| FR-ID | Requirement | User action | System response | Related components |
| :--- | :--- | :--- | :--- | :--- |
| **FR-01** | Render weekly grid layout | Access Scheduled Menu page | Renders header and 7 weekday columns (Monday–Sunday) horizontally. | `ScheduledMenuPage`, `DayColumn` |
| **FR-02** | Query weekly schedule | Page mounts | Fetches schedule array via `GET /api/scheduled-menu`. Displays loading overlay. | `useScheduledMenu`, `scheduledMenuApi` |
| **FR-03** | DTO Fallback representation | Schedule loaded | Maps DB documents to weekday columns; weekdays with no documents default to an empty array payload structure. | `scheduledMenuDTO` (backend) |
| **FR-04** | Show item details | View weekday columns | Displays food name, category name, and VND base price for each item card. | `DayColumn` -> `FoodItemCard` |
| **FR-05** | Empty column representation | View empty day column | Displays `EmptyState` component. Admin sees hint "Nhấn Thêm món bên dưới."; Manager sees "Không có món ăn". | `DayColumn`, `EmptyState` |
| **FR-06** | Enforce Read-Only mode | Manager views page | Admin-only elements (Add/Delete/Save/Cancel/Undo buttons) are omitted from rendering. | `ScheduledMenuPage`, `DayColumn` |

### 4.2 Schedule Configuration (Admin Only)

| FR-ID | Requirement | User action | System response | Related components |
| :--- | :--- | :--- | :--- | :--- |
| **FR-07** | De-assign food item | Admin clicks close button on hover of a food card | Removes item from local day state; marks the column dirty. | `DayColumn` -> `FoodItemCard` |
| **FR-08** | Open assignment picker | Admin clicks "Thêm món" | Launches picker modal initialized with category filters. | `DayColumn`, `FoodItemPickerModal` |
| **FR-09** | Filter and search items | Admin inputs keyword or clicks category filter | Filters the food list client-side based on search term and category ID match. | `FoodItemPickerModal` |
| **FR-10** | Highlight duplicate items | Admin views picker | Disables checkboxes for items already added, appending an "Đã thêm" badge. | `FoodItemPickerModal` |
| **FR-11** | Add new items | Admin checks items and clicks "Thêm (N) món" | Appends checked items to local state; closes modal; marks column dirty. | `FoodItemPickerModal`, `useScheduledMenu` |
| **FR-12** | Track unsaved changes | Admin edits a column | Highlights the column border (`border-primary bg-primary-container/10`); displays global actions and column undo/save icons. | `ScheduledMenuPage`, `DayColumn` |
| **FR-13** | Revert single day edits | Admin clicks undo icon on a column | Restores that day's items from backup state `savedItemsSnapshot`; clears its dirty highlight. | `DayColumn`, `scheduledMenuSlice` |
| **FR-14** | Revert all weekly edits | Admin clicks "Hủy thay đổi" button | Reverts all dirty day columns using the backup state cache; hides global actions. | `ScheduledMenuPage`, `scheduledMenuSlice` |
| **FR-15** | Submit single day save | Admin clicks save icon on a column and confirms | Dispatches `PUT /api/scheduled-menu/:dayOfWeek` with `{ foodItemIds }`. Shows loading spinner; clears day dirty flag upon success. | `DayColumn`, `scheduledMenuApi` |
| **FR-16** | Submit batch save | Admin clicks "Lưu thay đổi" and confirms | Dispatches `PUT /api/scheduled-menu/batch` with `{ days: [{ dayOfWeek, foodItemIds }] }`. Shows loading spinner; clears all dirty flags upon success. | `ScheduledMenuPage`, `scheduledMenuApi` |
| **FR-17** | Block double submit | Admin saves schedule | Disables all action buttons and displays a spinner during write API requests. | `ScheduledMenuPage`, `DayColumn` |

---

## 5. UI/UX Requirements
- **Responsive Navigation**: The 7 weekday columns must use horizontal scroll container (`overflow-x-auto`) to avoid compression on tablet screens.
- **Visual Feedback (Dirty States)**: Unsaved modifications must be visually distinct via active borders (`border-primary`) and light background container colors (`bg-primary-container/10`).
- **Hover Interactions**: The close (de-assign) button on food cards must remain invisible by default, opacity transitioning to 100% on hover (`group-hover:opacity-100`).
- **Loaders**: Full-screen blocking loading overlay showing "Đang tải lịch thực đơn..." must render during initial schedule fetch.
- **Accessibility**: Modals, close icons, inputs, and button controls must declare descriptive `aria-label` tags for screen readers.

---

## 6. Input Validation

### 6.1 Parameter Validation
- **`:dayOfWeek`** path parameter: Must be one of the defined enum strings: `Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`, `Saturday`, `Sunday` (checked by `validateDayParam`). Returns HTTP 400 with code `VALIDATION_ERROR` on failure.

### 6.2 Body Payload Validation (Single Day Save)
- **`foodItemIds`**: Must be a JSON array (checked by `validateUpdateBody`).
- **`foodItemIds.*`**: Each element must represent a valid, 24-character hexadecimal MongoDB ObjectId. Returns HTTP 400 with `VALIDATION_ERROR` on malformed inputs.

### 6.3 Body Payload Validation (Batch Save)
- **`days`**: Non-empty array, minimum size 1, maximum size 7 (checked by `validateBatchUpdateBody`).
- **`days.*.dayOfWeek`**: Must be a valid weekday enum string.
- **`days.*.foodItemIds`**: Array of ObjectIds, maximum length 200 items per day.
- **`days.*.foodItemIds.*`**: Each element must represent a valid MongoDB ObjectId.

### 6.4 Service Business Rules Validation
- **Duplicate IDs check**: Duplicate `foodItemId` values within the same weekday are disallowed. Triggers error code `DUPLICATE_FOOD_ITEM` (HTTP 400).
- **Duplicate Weekday in Batch**: Multiple elements in the `days` payload array representing the same weekday are disallowed. Triggers error code `DUPLICATE_DAY_IN_BATCH` (HTTP 400).
- **Food Item Existence check**: Assigned items must exist in the database and must not be archived. Triggers error code `FOOD_ITEM_NOT_FOUND` (HTTP 404) if counts do not match.

---

## 7. Error Handling

All Express validation and database operation exceptions return standard JSON envelopes containing error codes mapped in [scheduledMenuConstants.js](file:///E:/CN/cn7/metroiday/project-clean/frontend/src/modules/menu/constants/scheduledMenuConstants.js):

| Error Code | HTTP Status | Frontend Display Notification |
| :--- | :---: | :--- |
| `VALIDATION_ERROR` | 400 | "Ngày trong tuần không hợp lệ." / "Dữ liệu không hợp lệ." |
| `DUPLICATE_FOOD_ITEM` | 400 | "Không thể thêm món trùng lặp trong cùng một ngày." |
| `DUPLICATE_DAY_IN_BATCH` | 400 | "Không được trùng lặp các ngày trong đợt cập nhật." |
| `FOOD_ITEM_NOT_FOUND` | 404 | "Một hoặc nhiều món ăn không tồn tại hoặc đã bị ngừng bán." |
| `TRANSACTION_NOT_SUPPORTED`| 503 | "Hệ thống không hỗ trợ giao dịch (transaction). Vui lòng liên hệ quản trị viên." |
| *Default Exception* | 500 | "Không thể tải lịch thực đơn." / "Không thể lưu thay đổi lịch thực đơn tuần." |

---

## 8. Acceptance Criteria

- **AC-01 (Role Security)**: Given a logged-in user with the role `Staff`, when attempting to view or access scheduled menu components, then the system rejects access.
- **AC-02 (Read-Only Mode)**: Given a logged-in user with the role `Manager`, when loading `/manager/scheduled-menu`, then the horizontal columns render correctly but edit/save controls are hidden.
- **AC-03 (Dirty State Highlight)**: Given an Admin on `/admin/scheduled-menu`, when removing or adding items, then the modified day column glows with a primary colored border, and save/cancel buttons appear in the header.
- **AC-04 (Undo Actions)**: Given an Admin with dirty local edits on Wednesday, when clicking the column undo icon, then Wednesday's state reverts to the saved snapshots, and the dirty indicators disappear.
- **AC-05 (Revert All)**: Given an Admin with multiple dirty columns, when clicking "Hủy thay đổi", then all columns revert to their initial snapshots, and global actions hide.
- **AC-06 (Batch Save Success)**: Given an Admin with changes on Monday and Wednesday, when confirming the global "Lưu thay đổi" dialog, then a single `PUT /api/scheduled-menu/batch` is dispatched, the database commits the transactions, the dirty flags clear, and a success toast displays.
- **AC-07 (Single Column Save)**: Given an Admin with changes on Tuesday, when confirming the inline save icon for Tuesday, then `PUT /api/scheduled-menu/Tuesday` is dispatched, Tuesday updates, and a success toast displays.
- **AC-08 (Database Fallback)**: Given a weekday with no record in the database, when loading the schedule, then the DTO layer creates an empty object payload structure, rendering the column as "Chưa có món".
- **AC-09 (Integrity Exception)**: Given an Admin saving a scheduled item that has been concurrently archived or deleted, when saving changes, then the API responds with HTTP 404 `FOOD_ITEM_NOT_FOUND`, and the frontend displays a toast error, preserving local dirty states.
