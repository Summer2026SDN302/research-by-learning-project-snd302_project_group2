# Module Spec: Daily Menu Management

> File này là SPEC để AI sinh code backend cho module `daily-menu`.
> AI PHẢI đọc `docs/BACKEND_AI_GUIDE.md` trước khi sinh code.

---

## 1. Module Overview

**Module name:** `daily-menu`
**Folder:** `src/modules/menu/daily-menu/`

Daily Menu là thực đơn vận hành thực tế trong ngày. Mỗi ngày sẽ có một danh sách món ăn được kích hoạt từ Scheduled Menu hoặc tạo thủ công. Manager/Admin quản lý số lượng chuẩn bị, trạng thái còn hàng, và giá bán trong ngày.

---

## 2. Actors & Permissions

| Action | Staff | Manager | Admin |
|---|---|---|---|
| View daily menu (today) | ✓ | ✓ | ✓ |
| Update item quantity | | ✓ | ✓ |
| Update item availability | | ✓ | ✓ |
| Apply recommended quantity (AI) | | ✓ | ✓ |
| Apply recommended price (AI) | | ✓ | ✓ |
| Generate daily menu from schedule | | ✓ | ✓ |

---

## 3. Data Model

**File:** `daily-menu.model.js`

### PriceHistory (sub-schema, `_id: false`)

| Field | Type | Ghi chú |
|---|---|---|
| `oldValue` | Number, min 0 | Giá cũ |
| `newValue` | Number, min 0 | Giá mới |
| `changedBy` | ObjectId → `User` | Người thay đổi |
| `changedAt` | Date | default: `Date.now` |
| `source` | String, enum: `AI` \| `MANUAL` | Nguồn thay đổi |
| `recommendationId` | ObjectId → `AiInsight`, default: null | Liên kết AI nếu source = AI |
| `reason` | String, default: null | Lý do thay đổi |

### DailyMenuItem (sub-schema, `_id: false`)

| Field | Type | Ghi chú |
|---|---|---|
| `foodItemId` | ObjectId → `FoodItem` | required |
| `originalPrice` | Number, min 0 | Giá gốc từ FoodItem, không thay đổi |
| `currentPrice` | Number, min 0 | Giá bán hiện tại trong ngày |
| `preparedQuantity` | Number, min 0 | Số lượng chuẩn bị |
| `soldQuantity` | Number, min 0, default: 0 | Tăng khi có order |
| `remainingQuantity` | Number, min 0 | = preparedQuantity - soldQuantity |
| `status` | String, enum: `Available` \| `Unavailable` | Trạng thái bán |
| `priceHistory` | [PriceHistory] | Lịch sử thay đổi giá |
| `quantityAdjustedBy` | ObjectId → `User`, default: null | Người chỉnh số lượng |
| `adjustedAt` | Date, default: null | Thời điểm chỉnh số lượng |

### DailyMenu (main schema)

| Field | Type | Ghi chú |
|---|---|---|
| `date` | String, unique, index | Định dạng YYYY-MM-DD |
| `isConfigured` | Boolean, default: false | true sau khi Manager set quantity |
| `items` | [DailyMenuItem] | Danh sách món trong ngày |
| `createdBy` | ObjectId → `User` | required |
| `createdAt` | Date | auto (timestamps) |
| `updatedAt` | Date | auto (timestamps) |

> ⚠️ Model này **không có** `isActive` / `deletedAt` — không áp dụng soft delete.

---

## 4. API Endpoints

**Base:** `/api/daily-menu`
**Auth:** Tất cả routes đều yêu cầu `authenticateToken`

| Method | Endpoint | Role | Use Case |
|---|---|---|---|
| GET | `/today` | Staff, Manager, Admin | View daily menu hôm nay |
| GET | `/:date` | Manager, Admin | View daily menu theo ngày (YYYY-MM-DD) |
| POST | `/generate` | Manager, Admin | Tạo daily menu từ scheduled menu |
| PATCH | `/:menuId/items/:itemId` | Manager, Admin | Cập nhật quantity / availability / price |
| PATCH | `/:menuId/items/:itemId/apply-ai-quantity` | Manager, Admin | Áp dụng số lượng AI đề xuất |
| PATCH | `/:menuId/items/:itemId/apply-ai-price` | Manager, Admin | Áp dụng giá AI đề xuất |

---

## 5. Business Logic (Service Layer)

> Toàn bộ logic dưới đây PHẢI nằm trong `daily-menu.service.js`

### 5.1 `getTodayMenu()`
- Lấy bản ghi DailyMenu có `date` = ngày hôm nay
- Nếu không tìm thấy → trả về `data: null`, KHÔNG tạo tự động
- Populate `foodItemId` để lấy thông tin

### 5.2 `getMenuByDate(date)`
- Validate format date (YYYY-MM-DD)
- Nếu không tồn tại → throw `AppError('DAILY_MENU_NOT_FOUND', 404)`

### 5.3 `generateDailyMenu(date, createdBy)`
- Kiểm tra đã tồn tại DailyMenu cho `date` chưa → nếu có throw `AppError('DAILY_MENU_ALREADY_EXISTS', 409)`
- Lấy ScheduledMenu tương ứng với weekday của `date`
- Map các food item từ scheduled menu sang DailyMenuItem:
  - `originalPrice` = `currentPrice` = giá hiện tại của FoodItem (snapshot)
  - `preparedQuantity` = 0, `soldQuantity` = 0, `remainingQuantity` = 0
  - `status` = `'Available'`
  - `priceHistory` = []
- Set `isConfigured` = false, `createdBy` = userId
- Tạo và trả về DailyMenu mới

### 5.4 `updateDailyMenuItem(menuId, itemId, payload, userId)`
- Payload cho phép: `{ preparedQuantity?, status?, currentPrice?, reason? }`
- Validate: `preparedQuantity` >= 0, `currentPrice` > 0 nếu có, `status` thuộc enum
- Nếu update `preparedQuantity`:
  - Cập nhật `remainingQuantity` = `preparedQuantity` - `soldQuantity`
  - Set `quantityAdjustedBy` = userId, `adjustedAt` = now
  - Set `isConfigured` = true trên DailyMenu
- Nếu update `currentPrice`:
  - Push vào `priceHistory`: `{ oldValue, newValue, changedBy: userId, source: 'MANUAL', reason }`
- Nếu `menuId` hoặc `itemId` không tồn tại → throw `AppError('DAILY_MENU_ITEM_NOT_FOUND', 404)`

### 5.5 `applyAiQuantity(menuId, itemId, recommendedQuantity, userId)`
- `recommendedQuantity` lấy từ request body
- Validate `recommendedQuantity` > 0
- Cập nhật `preparedQuantity` = `recommendedQuantity`
- Cập nhật `remainingQuantity` = `recommendedQuantity` - `soldQuantity`
- Set `quantityAdjustedBy` = userId, `adjustedAt` = now
- Set `isConfigured` = true trên DailyMenu

### 5.6 `applyAiPrice(menuId, itemId, recommendedPrice, recommendationId, userId)`
- `recommendedPrice`, `recommendationId` lấy từ request body
- Validate `recommendedPrice` > 0
- Push vào `priceHistory`: `{ oldValue: currentPrice, newValue: recommendedPrice, changedBy: userId, source: 'AI', recommendationId }`
- Cập nhật `currentPrice` = `recommendedPrice`

---

## 6. Validation Rules

**File:** `daily-menu.validation.js`

| Field | Rule |
|---|---|
| `date` | bắt buộc, định dạng YYYY-MM-DD, không phải ngày trong quá khứ (khi generate) |
| `preparedQuantity` | số nguyên >= 0 |
| `currentPrice` | số thực > 0 |
| `status` | enum: `Available` \| `Unavailable` |
| `reason` | string, tuỳ chọn |
| `recommendedQuantity` | số nguyên > 0 |
| `recommendedPrice` | số thực > 0 |
| `recommendationId` | ObjectId hợp lệ, tuỳ chọn |

---

## 7. Error Codes

| Code | HTTP | Mô tả |
|---|---|---|
| `DAILY_MENU_NOT_FOUND` | 404 | Không tìm thấy daily menu |
| `DAILY_MENU_ALREADY_EXISTS` | 409 | Daily menu ngày này đã tồn tại |
| `DAILY_MENU_ITEM_NOT_FOUND` | 404 | Không tìm thấy item trong daily menu |
| `INVALID_DATE_FORMAT` | 400 | Sai định dạng date |
| `INVALID_QUANTITY` | 400 | Số lượng không hợp lệ |
| `INVALID_PRICE` | 400 | Giá không hợp lệ |

---

## 8. Response Examples

### GET `/today` — Success
```json
{
  "success": true,
  "message": "Daily menu fetched successfully",
  "data": {
    "_id": "...",
    "date": "2025-06-11",
    "isConfigured": true,
    "createdBy": "...",
    "items": [
      {
        "foodItemId": { "_id": "...", "name": "Cơm gà", "imageUrl": "..." },
        "originalPrice": 35000,
        "currentPrice": 31500,
        "preparedQuantity": 100,
        "soldQuantity": 42,
        "remainingQuantity": 58,
        "status": "Available",
        "priceHistory": [
          {
            "oldValue": 35000,
            "newValue": 31500,
            "changedBy": "...",
            "changedAt": "2025-06-11T08:00:00Z",
            "source": "AI",
            "recommendationId": "...",
            "reason": null
          }
        ],
        "quantityAdjustedBy": "...",
        "adjustedAt": "2025-06-11T07:30:00Z"
      }
    ]
  },
  "error": null
}
```

### GET `/today` — No menu today
```json
{
  "success": true,
  "message": "No daily menu for today",
  "data": null,
  "error": null
}
```

### Error response
```json
{
  "success": false,
  "message": "Daily menu already exists for this date",
  "data": null,
  "error": {
    "code": "DAILY_MENU_ALREADY_EXISTS",
    "details": []
  }
}
```

---

## 9. Files To Generate

```
src/modules/daily-menu/
├── daily-menu.route.js
├── daily-menu.controller.js
├── daily-menu.service.js
├── daily-menu.repository.js
├── daily-menu.model.js
├── daily-menu.validation.js
```

---

## 10. Dependencies (modules liên quan)

| Module | Quan hệ |
|---|---|
| `food-item` | DailyMenuItem.foodItemId → ref FoodItem |
| `scheduled-menu` | `generateDailyMenu` đọc từ ScheduledMenu theo weekday |
| `order` | Order.items trừ `soldQuantity` khi tạo order thành công |

---

## Notice

Đây là spec dự kiện của dev, AI có quyền review, xem xét, và gợi ý hướng chỉnh sửa, xóa, thêm mới cho dev để dev quyết định trong quá trình gen code để hoàn thiện feature daily menu nhất có thể.