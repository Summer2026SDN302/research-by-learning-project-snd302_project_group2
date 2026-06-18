# Test Cases — Scheduled Menu (Thực đơn theo lịch)

**Feature:** Scheduled Menu Management  
**Phiên bản:** 1.0  
**Ngày:** 2026-06-18  
**Tham chiếu SRS:** [SRS_ScheduledMenu.md](./SRS_ScheduledMenu.md)

---

## 1. Phạm vi kiểm thử

| Lớp | Phạm vi |
|-----|---------|
| Backend API | `GET/PUT /api/scheduled-menu` |
| Frontend UI | `ScheduledMenuPage`, `DayColumn`, `FoodItemPickerModal` |
| Business logic | Redux slice, dirty tracking, phân quyền |
| Tích hợp | Luồng admin chỉnh sửa và lưu lịch tuần |

---

## 2. Tiền điều kiện chung

| ID | Điều kiện |
|----|-----------|
| PRE-01 | Backend đang chạy, DB có dữ liệu món ăn (`FoodItem`, `deletedAt: null`) |
| PRE-02 | Có tài khoản Admin, Manager, Staff với mật khẩu hợp lệ |
| PRE-03 | Admin đăng nhập thành công, truy cập `/admin/scheduled-menu` |
| PRE-04 | Manager đăng nhập, có token hợp lệ (cho API test) |
| PRE-05 | Staff đăng nhập, có token hợp lệ (cho API test) |

---

## 3. Backend API Test Cases

### 3.1 GET `/api/scheduled-menu`

| ID | Mô tả | Bước thực hiện | Kết quả mong đợi | Ưu tiên |
|----|-------|----------------|------------------|---------|
| API-GET-01 | Admin lấy lịch tuần | Gửi GET với token Admin | `200`, `success: true`, trả về đủ 7 ngày Monday→Sunday | P0 |
| API-GET-02 | Manager xem lịch | Gửi GET với token Manager | `200`, dữ liệu lịch tuần | P0 |
| API-GET-03 | Staff bị từ chối | Gửi GET với token Staff | `403`, `INSUFFICIENT_PERMISSIONS` | P0 |
| API-GET-04 | Không có token | Gửi GET không Authorization | `401`, `AUTHENTICATION_REQUIRED` | P0 |
| API-GET-05 | Ngày chưa cấu hình | DB chỉ có Monday | Response vẫn có 7 phần tử, ngày thiếu có `menuItems: []` | P1 |
| API-GET-06 | Populate food item | Monday có món đã gán | `menuItems[].foodItemId` có `name`, `basePrice`, `categoryId` | P1 |

### 3.2 PUT `/api/scheduled-menu/:dayOfWeek`

| ID | Mô tả | Bước thực hiện | Kết quả mong đợi | Ưu tiên |
|----|-------|----------------|------------------|---------|
| API-PUT-01 | Admin gán món cho ngày | PUT Monday, `foodItemIds: [id1, id2]` | `200`, lịch Monday cập nhật | P0 |
| API-PUT-02 | Upsert ngày mới | PUT Thursday khi chưa có document | `200`, tạo document mới | P0 |
| API-PUT-03 | Xóa hết món trong ngày | PUT Friday, `foodItemIds: []` | `200`, `menuItems: []` | P0 |
| API-PUT-04 | Manager không được sửa | PUT với token Manager | `403`, `INSUFFICIENT_PERMISSIONS` | P0 |
| API-PUT-05 | Staff không được sửa | PUT với token Staff | `403` | P0 |
| API-PUT-06 | dayOfWeek không hợp lệ | PUT `/Funday` | `400`, `VALIDATION_ERROR` | P0 |
| API-PUT-07 | foodItemIds không phải array | Body `{ foodItemIds: "abc" }` | `400`, `VALIDATION_ERROR` | P0 |
| API-PUT-08 | ObjectId không hợp lệ | `foodItemIds: ["invalid"]` | `400`, `VALIDATION_ERROR` | P0 |
| API-PUT-09 | Trùng foodItemId cùng ngày | `foodItemIds: [id1, id1]` | `400`, `DUPLICATE_FOOD_ITEM` | P0 |
| API-PUT-10 | Món không tồn tại | `foodItemIds: [id không có trong DB]` | `404`, `FOOD_ITEM_NOT_FOUND` | P0 |
| API-PUT-11 | Món đã xóa mềm | Gán món có `deletedAt != null` | `404`, `FOOD_ITEM_NOT_FOUND` | P1 |
| API-PUT-12 | Cùng món ở nhiều ngày | Gán id1 cho Monday và Tuesday | Cả hai ngày lưu thành công | P1 |

---

## 4. Frontend UI Test Cases

### 4.1 Trang Scheduled Menu (Admin)

| ID | Mô tả | Bước thực hiện | Kết quả mong đợi | Ưu tiên |
|----|-------|----------------|------------------|---------|
| UI-PAGE-01 | Hiển thị trang | Vào `/admin/scheduled-menu` | Tiêu đề "Thực đơn theo lịch", breadcrumb Admin | P0 |
| UI-PAGE-02 | Loading lần đầu | Mở trang khi API chậm | `LoadingOverlay` "Đang tải lịch thực đơn..." | P1 |
| UI-PAGE-03 | Hiển thị 7 cột ngày | Sau khi load xong | 7 cột Thứ 2 → Chủ Nhật | P0 |
| UI-PAGE-04 | Nút Lưu thay đổi | Quan sát header | Có nút "Lưu thay đổi" | P0 |
| UI-PAGE-05 | Nút Lưu khi saving | Bấm Lưu khi đang gọi API | Nút disabled, hiện Spinner | P1 |
| UI-PAGE-06 | Lỗi tải lịch | API GET lỗi | Toast lỗi "Không thể tải lịch thực đơn." | P1 |

### 4.2 DayColumn

| ID | Mô tả | Bước thực hiện | Kết quả mong đợi | Ưu tiên |
|----|-------|----------------|------------------|---------|
| UI-DAY-01 | Hiển thị món đã gán | Monday có 2 món | Hiện tên món, "2 món" | P0 |
| UI-DAY-02 | Ngày trống (weekday) | Wednesday chưa có món | EmptyState "Chưa có món" | P1 |
| UI-DAY-03 | Cuối tuần trống | Saturday/Sunday trống | Hiện "Nghỉ cuối tuần" | P1 |
| UI-DAY-04 | Thêm món | Bấm "Thêm món" | Mở FoodItemPicker cho đúng ngày | P0 |
| UI-DAY-05 | Xóa món | Hover card món → bấm X | Món biến mất khỏi cột (local) | P0 |
| UI-DAY-06 | Cuối tuần vẫn thêm được | Bấm Thêm món ở Sunday | Picker mở bình thường | P2 |

### 4.3 FoodItemPickerModal

| ID | Mô tả | Bước thực hiện | Kết quả mong đợi | Ưu tiên |
|----|-------|----------------|------------------|---------|
| UI-PICK-01 | Mở modal | Thêm món cho Thứ 3 | Tiêu đề "Thêm món — Thứ 3" | P0 |
| UI-PICK-02 | Tìm kiếm theo tên | Nhập "phở" | Chỉ hiện món khớp tên | P0 |
| UI-PICK-03 | Lọc danh mục | Chọn category | Chỉ hiện món thuộc danh mục | P1 |
| UI-PICK-04 | Không có kết quả | Tìm từ khóa không tồn tại | EmptyState "Không tìm thấy món" | P1 |
| UI-PICK-05 | Chọn món | Click một món | Món được thêm vào cột ngày | P0 |
| UI-PICK-06 | Không trùng món | Chọn món đã có trong ngày | Không thêm duplicate | P0 |
| UI-PICK-07 | Đóng modal | Bấm Đóng hoặc X | Modal đóng | P1 |
| UI-PICK-08 | Không hiện món archived | Mở picker | Chỉ món `isArchived: false` | P1 |

### 4.4 Lưu thay đổi

| ID | Mô tả | Bước thực hiện | Kết quả mong đợi | Ưu tiên |
|----|-------|----------------|------------------|---------|
| UI-SAVE-01 | Lưu khi có thay đổi | Thêm/xóa món → Lưu | Toast "Lịch thực đơn tuần đã được cập nhật." | P0 |
| UI-SAVE-02 | Không có thay đổi | Bấm Lưu khi chưa sửa | Toast "Không có thay đổi cần lưu." | P1 |
| UI-SAVE-03 | Chỉ lưu ngày dirty | Sửa Tuesday, Monday giữ nguyên | API PUT chỉ gọi cho Tuesday | P0 |
| UI-SAVE-04 | Lỗi khi lưu | API PUT trả lỗi | Toast "Lưu thất bại" + message lỗi | P1 |
| UI-SAVE-05 | Reload sau lưu | Lưu thành công | Dữ liệu đồng bộ với server | P0 |

---

## 5. Phân quyền & Routing

| ID | Mô tả | Bước thực hiện | Kết quả mong đợi | Ưu tiên |
|----|-------|----------------|------------------|---------|
| AUTH-01 | Admin truy cập route | Admin vào nav "Thực đơn theo lịch" | Mở `ScheduledMenuPage` đầy đủ | P0 |
| AUTH-02 | Manager route | Manager vào `/manager/scheduled-menu` | `PlaceholderPage` (ngoài scope UI) | P2 |
| AUTH-03 | Staff không thấy menu | Staff đăng nhập | Không có quyền API scheduled-menu | P0 |

---

## 6. Business Rules

| ID | Quy tắc | Cách kiểm tra | Kết quả mong đợi |
|----|---------|---------------|------------------|
| BR-01 | Mỗi ngày unique trong DB | PUT cùng ngày 2 lần | Chỉ 1 document, upsert |
| BR-02 | Cho phép 0 món/ngày | Xóa hết món và Lưu | Ngày có `menuItems: []` |
| BR-03 | Cùng món nhiều ngày | Gán món A cho Mon + Wed | Cả hai ngày OK |
| BR-04 | Không duplicate trong ngày | Thêm món đã có (UI) / gửi duplicate (API) | UI bỏ qua; API 400 |
| BR-05 | Chỉ món chưa xóa mềm | Gán món deleted | API 404 |
| BR-06 | Chỉnh sửa local trước | Thêm món, refresh trang (chưa Lưu) | Thay đổi mất (chưa persist) |
| BR-07 | Admin-only write | Manager thử PUT | 403 |

---

## 7. Automated Tests (đã implement)

Chạy test tự động:

```bash
# Backend
cd project-be/backend
npm test

# Frontend
cd project-clean/frontend
npm test
```

| File | Coverage |
|------|----------|
| `scheduled_menu.service.test.js` | Service: getWeeklySchedule, updateDaySchedule, validation errors |
| `scheduled_menu.validation.test.js` | Express validators |
| `scheduled_menu.route.test.js` | Route auth, roles, HTTP status |
| `scheduleSnapshot.test.js` | Dirty tracking utilities |
| `scheduledMenuSlice.test.js` | Redux reducers |
| `DayColumn.test.jsx` | UI cột ngày |
| `FoodItemPickerModal.test.jsx` | Modal chọn món |
| `useScheduledMenu.test.js` | Hook logic |
| `ScheduledMenuPage.test.jsx` | Page integration |

---

## 8. Ma trận traceability SRS → Test

| SRS Section | Test IDs |
|-------------|----------|
| §2 Roles & Permissions | API-GET-03/04, API-PUT-04/05, AUTH-01/03, BR-07 |
| §4.2 GET endpoint | API-GET-01→06 |
| §4.2 PUT endpoint | API-PUT-01→12 |
| §5.7 UI layout | UI-PAGE-01→06, UI-DAY-01→06 |
| §5.7 FoodItemPicker | UI-PICK-01→08 |
| §6 Data flow / Save | UI-SAVE-01→05, BR-06 |
| §7 Business rules | BR-01→07 |
