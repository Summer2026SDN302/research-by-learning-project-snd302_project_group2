# SRS — Scheduled Menu Management Screen

**Feature:** Implement Scheduled Menu Management Screen
**Project:** StallBox — Canteen Management System
**Date:** 2026-06-14
**Status:** Ready for Implementation

---

## 1. Overview

Cho phép Admin và Manager cấu hình thực đơn theo tuần bằng cách gán các món ăn vào từng ngày trong tuần (Monday → Sunday). Hệ thống lưu trữ lịch thực đơn cố định theo tuần (không theo ngày cụ thể), phục vụ việc lập lịch tái sử dụng hàng tuần.

---

## 2. Roles & Permissions

| Role    | Xem lịch | Gán món | Xóa món | Lưu thay đổi |
|---------|-----------|---------|---------|--------------|
| admin   | ✓         | ✓       | ✓       | ✓            |
| manager | ✓         | ✗       | ✗       | ✗            |
| staff   | ✗         | ✗       | ✗       | ✗            |

> **Chỉ admin** được tạo và cập nhật Scheduled Menu. Manager chỉ được xem (GET). Staff không có quyền truy cập.

---

## 3. Database

### ScheduledMenu Schema (đã tồn tại)

**File:** `project-be/backend/src/modules/menu/scheduled_menu/scheduled_menu.model.js`

```js
{
  dayOfWeek: String,  // enum: Monday..Sunday, unique
  menuItems: [{ foodItemId: ObjectId → FoodItem }],
  createdBy: ObjectId → User,
  updatedBy: ObjectId → User | null,
  timestamps: true     // createdAt, updatedAt
}
```

> Schema đã đủ. Không cần thêm field hay migration.

---

## 4. Backend

### 4.1 Module cần tạo

```
src/modules/menu/scheduled_menu/
├── scheduled_menu.model.js       ← đã có
├── scheduled_menu.constants.js   ← TẠO MỚI  (DAY_OF_WEEK enum)
├── scheduled_menu.route.js       ← TẠO MỚI
├── scheduled_menu.controller.js  ← TẠO MỚI
├── scheduled_menu.service.js     ← TẠO MỚI
├── scheduled_menu.repository.js  ← TẠO MỚI
└── scheduled_menu.validation.js  ← TẠO MỚI
```

### 4.1a Constants (`scheduled_menu.constants.js`)

```js
export const DAY_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday',
  'Thursday', 'Friday', 'Saturday', 'Sunday',
];
```

Dùng `DAY_OF_WEEK` làm nguồn duy nhất cho enum ngày trong tuần — model, validation, và service đều import từ file này.

### 4.2 API Endpoints

#### GET /api/scheduled-menu

Lấy toàn bộ lịch 7 ngày trong tuần.

- **Auth:** `authenticate`
- **Roles:** `admin`, `manager` (xem được, không cần write access)
- **Populate:** `menuItems.foodItemId` → `name`, `basePrice`, `categoryId`

**Response thành công (200):**
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
            "_id": "...",
            "name": "Phở Bò",
            "basePrice": 35000,
            "categoryId": { "_id": "...", "name": "Ăn sáng" }
          }
        }
      ],
      "updatedAt": "2026-06-14T..."
    }
    // ... 6 ngày còn lại (trả về tất cả 7 ngày, ngày chưa có menuItems = [])
  ],
  "error": null
}
```

> Luôn trả về đủ 7 ngày theo thứ tự cố định: Monday → Sunday. Ngày chưa được tạo trả về object với `menuItems: []`.

---

#### PUT /api/scheduled-menu/:dayOfWeek

Gán danh sách món ăn cho một ngày cụ thể. Nếu document chưa tồn tại thì tạo mới (upsert).

- **Auth:** `authenticate`
- **Roles:** `admin` only
- **Param:** `dayOfWeek` ∈ `DAY_OF_WEEK` (từ `scheduled_menu.constants.js`)

**Request body:**
```json
{
  "foodItemIds": ["<ObjectId>", "<ObjectId>"]
}
```

**Validation rules:**
- `foodItemIds`: required, array, tối thiểu 0 phần tử (cho phép mảng rỗng để xóa hết món), mỗi phần tử phải là ObjectId hợp lệ.
- `dayOfWeek` param phải nằm trong `DAY_OF_WEEK` enum.
- Tất cả `foodItemIds` phải tồn tại và chưa bị xóa (`deletedAt: null`).
- **Không được có duplicate `foodItemId`** trong array (service trả về lỗi nếu có trùng).

**Response thành công (200):**
```json
{
  "success": true,
  "message": "Schedule updated successfully",
  "data": {
    "dayOfWeek": "Monday",
    "menuItems": [
      { "foodItemId": { "_id": "...", "name": "Phở Bò", "basePrice": 35000 } }
    ],
    "updatedAt": "2026-06-14T..."
  },
  "error": null
}
```

**Error cases:**
| Condition | Code | Status |
|---|---|---|
| `dayOfWeek` param không hợp lệ | `VALIDATION_ERROR` | 400 |
| `foodItemIds` có giá trị trùng nhau | `DUPLICATE_FOOD_ITEM` | 400 |
| `foodItemIds` chứa ID không tồn tại | `FOOD_ITEM_NOT_FOUND` | 404 |
| Thiếu auth | `AUTHENTICATION_REQUIRED` | 401 |
| Role không phải admin | `INSUFFICIENT_PERMISSIONS` | 403 |

---

### 4.3 Layer Responsibilities

**Repository** (`scheduled_menu.repository.js`):
```js
findAll()           // tìm tất cả documents, populate foodItemId
findByDay(day)      // tìm 1 document theo dayOfWeek, populate
upsertByDay(day, menuItems, userId)  // upsert theo dayOfWeek
```

**Service** (`scheduled_menu.service.js`):
- `getWeeklySchedule()`: gọi `findAll()`, sau đó điền đủ 7 ngày còn thiếu với `menuItems: []` theo thứ tự `DAY_OF_WEEK`
- `updateDaySchedule(day, foodItemIds, userId)`:
  1. Validate `day` nằm trong `DAY_OF_WEEK`
  2. **Kiểm tra duplicate**: nếu `foodItemIds` có giá trị trùng → throw `AppError('Duplicate food item IDs', 400, 'DUPLICATE_FOOD_ITEM')`
  3. Query FoodItem để kiểm tra tất cả IDs tồn tại và `deletedAt: null`
  4. Map `foodItemIds` → `[{ foodItemId }]`
  5. Gọi `upsertByDay()`

**Controller** (`scheduled_menu.controller.js`):
- `getWeeklySchedule`: gọi service, trả về `successResponse`
- `updateDaySchedule`: lấy `dayOfWeek` từ `req.params`, `foodItemIds` từ `req.body`, gọi service, trả về `successResponse`

**Route** (`scheduled_menu.route.js`):
```js
GET  /            → authenticate → authorizeRoles('admin', 'manager') → controller.getWeeklySchedule
PUT  /:dayOfWeek  → authenticate → authorizeRoles('admin')            → validation → validateRequest → controller.updateDaySchedule
```

**Đăng ký trong app.js:**
```js
app.use("/api/scheduled-menu", scheduledMenuRoute);
```

---

## 5. Frontend

### 5.1 Routes

| Role    | Path                        | Component            | Access |
|---------|-----------------------------|----------------------|--------|
| admin   | `/admin/scheduled-menu`     | `ScheduledMenuPage`  | Xem + Chỉnh sửa |
| manager | `/manager/scheduled-menu`   | `PlaceholderPage`    | Giữ nguyên (không implement) |

Chỉ admin có trang Scheduled Menu đầy đủ. Manager route giữ `PlaceholderPage` (manager xem lịch qua DailyMenu).

### 5.2 Module structure

Tuân theo pattern hiện có (ProfilePage, UserManagementPage, LoginPage đều nằm trong `modules/`):

```
src/modules/menu/
├── api/
│   └── scheduledMenuApi.js           ← TẠO MỚI
├── hooks/
│   └── useScheduledMenu.js           ← TẠO MỚI
├── redux/
│   └── scheduledMenuSlice.js         ← TẠO MỚI
├── pages/
│   └── ScheduledMenuPage.jsx         ← TẠO MỚI  ← VỊ TRÍ ĐÚNG
└── constants/
    └── scheduledMenuConstants.js     ← TẠO MỚI
```

> `src/pages/admin/ScheduledMenu/index.jsx` — **KHÔNG implement**, chỉ chứa `code.html` và `screen.png` mockup tham khảo.
> `src/pages/manager/ScheduledMenu/index.jsx` — **KHÔNG implement** trong task này.

### 5.3 Constants (`scheduledMenuConstants.js`)

```js
export const DAY_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday',
  'Thursday', 'Friday', 'Saturday', 'Sunday',
];

export const DAY_LABEL = {
  Monday:    'Thứ 2',
  Tuesday:   'Thứ 3',
  Wednesday: 'Thứ 4',
  Thursday:  'Thứ 5',
  Friday:    'Thứ 6',
  Saturday:  'Thứ 7',
  Sunday:    'Chủ Nhật',
};
```

### 5.4 API Layer (`scheduledMenuApi.js`)

```js
// GET /api/scheduled-menu
export const getWeeklySchedule = () => apiClient.get('/scheduled-menu')

// PUT /api/scheduled-menu/:dayOfWeek
export const updateDaySchedule = (dayOfWeek, foodItemIds) =>
  apiClient.put(`/scheduled-menu/${dayOfWeek}`, { foodItemIds })
```

### 5.5 Redux Slice (`scheduledMenuSlice.js`)

```js
initialState: {
  schedule: [],        // Array<{ dayOfWeek, menuItems }>
  isLoading: false,
  isSaving: false,     // loading riêng cho save action
  error: null,
}

actions: setSchedule, updateDayItems, setLoading, setSaving, setError, resetError
```

> `schedule` là local working copy. Người dùng chỉnh sửa local, bấm "Lưu" mới gọi API.

### 5.6 Hook (`useScheduledMenu.js`)

Handles:
- Fetch toàn bộ lịch tuần khi mount (`useEffect`)
- `addItemToDay(dayOfWeek, foodItem)` — thêm món vào ngày (local)
- `removeItemFromDay(dayOfWeek, foodItemId)` — xóa món khỏi ngày (local)
- `saveDaySchedule(dayOfWeek)` — gọi `updateDaySchedule` API cho 1 ngày cụ thể
- `saveAllSchedule()` — gọi `saveDaySchedule` cho tất cả 7 ngày tuần tự
- Dispatch toast thành công/lỗi qua `useAppToast`

### 5.7 UI — ScheduledMenuPage

Tham chiếu thiết kế: `src/pages/admin/ScheduledMenu/code.html` (đã có file mockup HTML)

**Layout tổng thể:**
```
PageHeader
  title="Thực đơn theo lịch"
  breadcrumbs=[{ label: 'Admin' }, { label: 'Thực đơn theo lịch' }]
  action=<button "Lưu thay đổi">

Weekly Grid (7 cột trên desktop, 1 cột trên mobile)
  └── DayColumn × 7
        ├── Header: tên ngày (Thứ 2 ... CN)
        ├── FoodItem cards (có nút xóa)
        └── "Thêm món" button → mở FoodItemPicker

FoodItemPicker (modal/panel)
  ├── SearchBar lọc theo tên
  ├── FilterBar lọc theo category
  └── Danh sách FoodItem → click để thêm vào ngày đang chọn
```

**Shared components sử dụng:**
- `PageHeader` — header với breadcrumb + nút lưu
- `SearchBar` — tìm kiếm trong FoodItemPicker
- `FilterBar` — lọc theo danh mục trong FoodItemPicker
- `ConfirmDialog` — xác nhận trước khi lưu toàn bộ lịch (optional)
- `LoadingOverlay` — hiển thị khi đang fetch lịch
- `Spinner` — hiển thị trong nút Lưu khi đang saving
- `EmptyState` — khi một ngày chưa có món nào
- `useAppToast` — thông báo thành công/lỗi sau khi lưu

**States UI:**
- Loading: `LoadingOverlay` phủ toàn trang khi fetch lần đầu
- Saving: nút "Lưu thay đổi" disabled + `Spinner` khi đang gọi API
- Empty day: `EmptyState` nhỏ trong cột ngày
- Saturday/Sunday: hiển thị "Nghỉ cuối tuần" (vẫn cho phép gán món nếu cần)

### 5.8 Routes Update

```jsx
// AdminRoutes.jsx — thay PlaceholderPage, import trực tiếp từ modules (pattern chuẩn)
const ScheduledMenuPage = lazy(() => import('../modules/menu/pages/ScheduledMenuPage'));
<Route path="scheduled-menu" element={<ScheduledMenuPage />} />

// ManagerRoutes.jsx — GIỮ NGUYÊN PlaceholderPage, không thay đổi
```

> Pattern chuẩn theo AdminRoutes hiện có:
> ```jsx
> const UserManagementPage = lazy(() => import("../modules/user/pages/UserManagementPage"));
> ```
> Routes import thẳng từ `modules/`, không qua wrapper tại `pages/[role]/`.

---

## 6. Data Flow

```
ScheduledMenuPage (admin only)
  └── useScheduledMenu (hook)
        ├── scheduledMenuApi.getWeeklySchedule()        → GET /api/scheduled-menu
        │     └── dispatch setSchedule(data)
        ├── addItemToDay(day, foodItem)
        │     ├── guard: nếu foodItem đã có trong ngày → bỏ qua (duplicate guard ở UI)
        │     └── dispatch updateDayItems (local)
        ├── removeItemFromDay(day, foodItemId)          → dispatch updateDayItems (local)
        └── saveAllSchedule()
              └── scheduledMenuApi.updateDaySchedule(day, ids)  → PUT /api/scheduled-menu/:day
                    │    (service validate duplicate + existence)
                    └── toast.success / toast.error
```

---

## 7. Business Rules

1. Mỗi `dayOfWeek` là unique trong DB — upsert, không tạo duplicate document.
2. Một ngày có thể có 0 món (mảng rỗng = xóa hết).
3. Cùng 1 món có thể xuất hiện ở **nhiều ngày khác nhau** (không bị giới hạn).
4. **Không được có cùng 1 `foodItemId` xuất hiện 2 lần trong cùng 1 ngày** — service kiểm tra và trả về `DUPLICATE_FOOD_ITEM` (400) nếu vi phạm.
5. Chỉ FoodItem chưa bị xóa mềm (`deletedAt: null`) mới được gán vào lịch.
6. Archived food items (`isArchived: true`) không hiển thị trong FoodItemPicker nhưng vẫn giữ trong lịch nếu đã được gán trước.
7. Thứ 7 và Chủ nhật có thể được cấu hình (backend cho phép), UI hiển thị "Nghỉ cuối tuần" nhưng vẫn cho phép admin gán.
8. **Chỉ admin** được gán/xóa món và lưu lịch. Manager không có quyền thao tác.
9. Người dùng chỉnh sửa local — chỉ gọi API khi bấm "Lưu thay đổi".

---

## 8. Implementation Order

### Phase 1 — Backend (project-be)

1. `scheduled_menu.constants.js` — `DAY_OF_WEEK` array
2. `scheduled_menu.repository.js` — `findAll`, `findByDay`, `upsertByDay`
3. `scheduled_menu.service.js` — `getWeeklySchedule`, `updateDaySchedule` (bao gồm duplicate check)
4. `scheduled_menu.validation.js` — validate `foodItemIds`
5. `scheduled_menu.controller.js` — `getWeeklySchedule`, `updateDaySchedule`
6. `scheduled_menu.route.js` — kết nối route + middleware
7. `app.js` — đăng ký `/api/scheduled-menu`

### Phase 2 — Frontend (project-clean)

1. `scheduledMenuConstants.js` — `DAY_OF_WEEK`, `DAY_LABEL`
2. `scheduledMenuApi.js` — 2 hàm API
3. `scheduledMenuSlice.js` — Redux slice
4. `store.js` — thêm `scheduledMenu` reducer
5. `useScheduledMenu.js` — hook tổng hợp (bao gồm duplicate guard ở UI)
6. `ScheduledMenuPage.jsx` — component chính tại `src/modules/menu/pages/`
7. `AdminRoutes.jsx` — thay `PlaceholderPage` bằng lazy import từ modules

---

## 9. File Checklist

### Backend — Tạo mới
- [ ] `src/modules/menu/scheduled_menu/scheduled_menu.constants.js`
- [ ] `src/modules/menu/scheduled_menu/scheduled_menu.repository.js`
- [ ] `src/modules/menu/scheduled_menu/scheduled_menu.service.js`
- [ ] `src/modules/menu/scheduled_menu/scheduled_menu.validation.js`
- [ ] `src/modules/menu/scheduled_menu/scheduled_menu.controller.js`
- [ ] `src/modules/menu/scheduled_menu/scheduled_menu.route.js`

### Backend — Cập nhật
- [ ] `src/app.js` — thêm `scheduledMenuRoute`

### Frontend — Tạo mới
- [ ] `src/modules/menu/constants/scheduledMenuConstants.js`
- [ ] `src/modules/menu/api/scheduledMenuApi.js`
- [ ] `src/modules/menu/redux/scheduledMenuSlice.js`
- [ ] `src/modules/menu/hooks/useScheduledMenu.js`
- [ ] `src/modules/menu/pages/ScheduledMenuPage.jsx`    ← vị trí đúng

### Frontend — Cập nhật
- [ ] `src/app/store.js` — thêm `scheduledMenuReducer`
- [ ] `src/routes/AdminRoutes.jsx` — thay `PlaceholderPage` bằng `ScheduledMenuPage` từ modules

### Không thay đổi
- `src/pages/admin/ScheduledMenu/index.jsx` — giữ nguyên (chỉ dùng cho mockup)
- `src/pages/manager/ScheduledMenu/index.jsx` — giữ nguyên
- `src/routes/ManagerRoutes.jsx` — giữ `PlaceholderPage`

---

## 10. Out of Scope (không implement trong task này)

- Copy lịch từ tuần trước (nút "Sao chép tuần trước" trong mockup — task riêng)
- AI-recommended food items (badge "Nhu cầu cao" trong mockup — task riêng)
- Drag-and-drop reorder trong ngày (task riêng)
- Export/print lịch tuần
