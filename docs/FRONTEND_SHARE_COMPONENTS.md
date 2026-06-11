# Tài liệu Component Dùng Chung — StallBox Frontend

Tài liệu này mô tả toàn bộ các component, hook, và Redux slice dùng chung trong project StallBox. Tất cả được thiết kế theo nguyên tắc tách biệt UI và logic, tuân thủ kiến trúc `Page → Hook → Redux → API`.

---

## Cấu trúc thư mục

```
src/
├── components/common/
│   ├── navigation/       ← điều hướng, layout shell
│   ├── notification/     ← thông báo, phản hồi hành động
│   ├── status/           ← trạng thái dữ liệu, loading
│   ├── table/            ← bảng dữ liệu và công cụ liên quan
│   ├── dialog/           ← modal, confirm, popup
│   └── page/             ← thành phần cấu trúc trang
│
├── hooks/                ← shared hooks
└── app/                  ← Redux slices
```

---

## Navigation

### `Sidebar.jsx`

Thanh điều hướng bên trái, hỗ trợ thu gọn (collapsed mode). Nav items được tạo tự động từ `NAV_CONFIG` theo role.

**Props:**

| Prop | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `role` | `string` | `'admin'` | `'admin'` \| `'manager'` \| `'staff'` |
| `activePath` | `string` | `''` | Pathname hiện tại, dùng để highlight nav item |
| `onNavigate` | `fn` | `noop` | `(path: string) => void` gọi khi click nav item |
| `collapsed` | `boolean` | `false` | `true` = chỉ hiện icon, `false` = hiện đầy đủ |
| `onToggleCollapse` | `fn` | `noop` | `() => void` toggle trạng thái thu gọn |
| `className` | `string` | `''` | Class Tailwind bổ sung (ví dụ: width transition) |
| `user` | `object` | — | `{ name, initials }` hiển thị ở footer |

**Ví dụ:**
```jsx
<Sidebar
  role="admin"
  activePath={pathname}
  onNavigate={navigate}
  collapsed={collapsed}
  onToggleCollapse={toggle}
  user={user}
/>
```

---

### `Navbar.jsx`

Thanh navigation trên cùng. Tích hợp search bar, notification dropdown, user dropdown. Tự quản lý trạng thái dropdown bên trong qua `useDropdownToggle`.

**Props:**

| Prop | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `onSearch` | `fn` | `noop` | `(query: string) => void` gọi sau debounce 300ms |
| `searchPlaceholder` | `string` | `'Tìm kiếm...'` | Placeholder của ô search |
| `user` | `object` | — | `{ name, initials, email }` |
| `notifications` | `number` | `0` | Số badge thông báo chưa đọc |
| `notificationItems` | `Array` | `[]` | Danh sách thông báo cho dropdown |
| `onReadNotification` | `fn` | `noop` | `(id: string) => void` đánh dấu 1 thông báo đã đọc |
| `onReadAllNotifications` | `fn` | `noop` | `() => void` đánh dấu tất cả đã đọc |
| `onProfile` | `fn` | `noop` | Mở trang thông tin cá nhân |
| `onChangePassword` | `fn` | `noop` | Mở trang đổi mật khẩu |
| `onSettings` | `fn` | `noop` | Mở trang cài đặt |
| `onLogout` | `fn` | `noop` | Đăng xuất |

---

### `NotificationDropdown.jsx`

Dropdown hiển thị danh sách thông báo. Hỗ trợ 3 loại: `order`, `system`, `payment`. Tự đóng khi click ra ngoài.

**Props:**

| Prop | Kiểu | Mô tả |
|---|---|---|
| `open` | `boolean` | Kiểm soát hiển thị |
| `items` | `Array` | Danh sách thông báo |
| `onClose` | `fn` | `() => void` |
| `onRead` | `fn` | `(id: string) => void` đánh dấu 1 thông báo đã đọc |
| `onReadAll` | `fn` | `() => void` đánh dấu tất cả đã đọc |

**Notification shape:**
```js
{
  id:      string,
  type:    'order' | 'system' | 'payment',
  title:   string,
  message: string,
  time:    string,   // ví dụ: '5 phút trước'
  isRead:  boolean,
}
```

---

### `UserDropdown.jsx`

Dropdown tài khoản hiển thị thông tin user và các hành động: thông tin cá nhân, đổi mật khẩu, cài đặt, đăng xuất. Tự đóng khi click ra ngoài.

**Props:**

| Prop | Kiểu | Mô tả |
|---|---|---|
| `open` | `boolean` | Kiểm soát hiển thị |
| `user` | `object` | `{ name, initials, email }` |
| `onClose` | `fn` | `() => void` |
| `onProfile` | `fn` | `() => void` |
| `onChangePassword` | `fn` | `() => void` |
| `onSettings` | `fn` | `() => void` |
| `onLogout` | `fn` | `() => void` |

---

## Notification

### `Toast.jsx`

Một toast notification. Hiển thị icon, tiêu đề, nội dung và progress bar tự động đóng. Không dùng trực tiếp — dùng qua `ToastContainer`.

**Props:**

| Prop | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `id` | `string` | — | ID duy nhất |
| `type` | `string` | `'info'` | `'success'` \| `'error'` \| `'warning'` \| `'info'` |
| `title` | `string` | `''` | Tiêu đề in đậm |
| `message` | `string` | `''` | Nội dung mô tả |
| `duration` | `number` | `3000` | Thời gian tự đóng (ms), `0` = không tự đóng |
| `onClose` | `fn` | `noop` | `(id: string) => void` |

---

### `ToastContainer.jsx`

Mount một lần tại root layout. Tự đọc danh sách toast từ Redux store — không cần truyền props.

**Cách dùng:**
```jsx
// MainLayout.jsx — mount một lần
<ToastContainer />
```

**Hiển thị toast từ bất kỳ hook nào:**
```js
import useAppToast from '@/hooks/useAppToast';

const { toast } = useAppToast();
toast.success('Thành công', 'Đã lưu dữ liệu');
toast.error('Lỗi', 'Không thể kết nối server');
toast.warning('Cảnh báo', 'Dữ liệu chưa được lưu');
toast.info('Thông tin', 'Phiên làm việc sắp hết hạn');
```

---

## Status

### `LoadingOverlay.jsx`

Overlay loading che phủ parent element hoặc toàn màn hình.

**Props:**

| Prop | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `show` | `boolean` | `true` | Kiểm soát hiển thị |
| `message` | `string` | `'Đang tải...'` | Văn bản hiển thị bên dưới spinner |
| `fullPage` | `boolean` | `false` | `true` = phủ toàn viewport, `false` = phủ parent (parent cần `relative`) |

**Ví dụ:**
```jsx
// Overlay toàn trang
<LoadingOverlay show={isLoading} fullPage />

// Overlay trong section — parent cần có relative
<div className="relative">
  <LoadingOverlay show={isLoading} />
  <DataTable ... />
</div>
```

---

### `Spinner.jsx`

Spinner vòng tròn nhỏ, dùng inline trong button hoặc các slot nhỏ.

**Props:**

| Prop | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `size` | `string` | `'md'` | `'sm'` (16px) \| `'md'` (24px) \| `'lg'` (40px) |

**Ví dụ:**
```jsx
// Trong button khi loading
<button disabled={isLoading}>
  {isLoading && <Spinner size="sm" />}
  Lưu
</button>
```

---

### `EmptyState.jsx`

Hiển thị khi danh sách trống. Có thể thêm CTA button tuỳ chọn.

**Props:**

| Prop | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `icon` | `string` | `'inbox'` | Tên Material Symbol icon |
| `title` | `string` | `'Chưa có dữ liệu'` | Tiêu đề |
| `message` | `string` | `'Hiện tại chưa có mục nào để hiển thị.'` | Mô tả |
| `action` | `ReactNode` | `null` | CTA button tuỳ chọn |

---

### `StatusBadge.jsx`

Badge hiển thị trạng thái với màu sắc tương ứng.

**Props:**

| Prop | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `status` | `string` | `'active'` | `'active'` \| `'inactive'` \| `'pending'` \| `'completed'` \| `'cancelled'` \| `'paid'` \| `'unpaid'` |
| `label` | `string` | — | Override text hiển thị |
| `size` | `string` | `'md'` | `'sm'` \| `'md'` |

---

## Table

### `DataTable.jsx`

Bảng dữ liệu có sort theo cột, empty state, và loading overlay. Logic sort được xử lý bởi `useTableSort`.

**Props:**

| Prop | Kiểu | Mô tả |
|---|---|---|
| `columns` | `Array` | `[{ key, label, sortable? }]` |
| `rows` | `Array` | Dữ liệu hàng |
| `isLoading` | `boolean` | Hiện loading overlay khi `true` |
| `emptyTitle` | `string` | Tiêu đề khi không có dữ liệu |
| `emptyMessage` | `string` | Mô tả khi không có dữ liệu |
| `onRowClick` | `fn` | `(row) => void` |
| `renderCell` | `fn` | `(key, value, row) => ReactNode` custom cell |

---

### `FilterBar.jsx`

Thanh lọc với nhiều dropdown filter. Hiện nút reset khi có filter đang active.

**Props:**

| Prop | Kiểu | Mô tả |
|---|---|---|
| `filters` | `Array` | `[{ key, label, options: [{ value, label }] }]` |
| `values` | `object` | `{ [key]: selectedValue }` |
| `onChange` | `fn` | `(key, value) => void` |
| `onReset` | `fn` | `() => void` |

---

### `SearchBar.jsx`

Ô tìm kiếm standalone. Hỗ trợ cả controlled và uncontrolled mode. Có nút clear khi có giá trị.

**Props:**

| Prop | Kiểu | Mô tả |
|---|---|---|
| `placeholder` | `string` | Placeholder text |
| `value` | `string` | Controlled value (tuỳ chọn) |
| `onChange` | `fn` | `(value: string) => void` |
| `onClear` | `fn` | `() => void` gọi khi nhấn nút X |
| `className` | `string` | Class Tailwind bổ sung |

---

### `PaginationControl.jsx`

Phân trang với số trang và nút Prev/Next. Hiển thị ellipsis khi có nhiều trang. Logic tính toán xử lý bởi `usePagination`.

**Props:**

| Prop | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `currentPage` | `number` | `1` | Trang hiện tại (bắt đầu từ 1) |
| `totalPages` | `number` | `1` | Tổng số trang |
| `onPageChange` | `fn` | `noop` | `(page: number) => void` |
| `showPageNumbers` | `boolean` | `true` | Hiển thị số trang |

---

## Dialog

### `ConfirmDialog.jsx`

Modal xác nhận hành động. Hỗ trợ 3 variant với màu sắc và icon khác nhau. Hiển thị spinner khi đang xử lý.

**Props:**

| Prop | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `open` | `boolean` | `false` | Kiểm soát hiển thị |
| `title` | `string` | `'Are you sure?'` | Tiêu đề |
| `description` | `string` | `'This action cannot be undone.'` | Mô tả |
| `confirmLabel` | `string` | `'Confirm'` | Label nút xác nhận |
| `cancelLabel` | `string` | `'Cancel'` | Label nút huỷ |
| `variant` | `string` | `'danger'` | `'danger'` \| `'warning'` \| `'info'` |
| `onConfirm` | `fn` | `noop` | `() => void` khi xác nhận |
| `onCancel` | `fn` | `noop` | `() => void` khi huỷ hoặc click backdrop |
| `isLoading` | `boolean` | `false` | Hiện spinner và disable cả 2 nút |

---

## Page

### `PageHeader.jsx`

Header trang với breadcrumb, tiêu đề, mô tả và slot CTA button. Responsive: CTA xuống hàng trên mobile.

**Props:**

| Prop | Kiểu | Mô tả |
|---|---|---|
| `breadcrumbs` | `Array` | `[{ label, path? }]` |
| `title` | `string` | Tiêu đề trang |
| `subtitle` | `string` | Mô tả ngắn bên dưới tiêu đề |
| `action` | `ReactNode` | CTA button tuỳ chọn bên phải |

**Ví dụ:**
```jsx
<PageHeader
  breadcrumbs={[{ label: 'Admin' }, { label: 'Người dùng' }]}
  title="Quản lý người dùng"
  subtitle="Danh sách toàn bộ tài khoản trong hệ thống"
  action={<button>Thêm người dùng</button>}
/>
```

---

## Shared Hooks

| Hook | Dùng ở đâu | Mô tả |
|---|---|---|
| `useSearch` | `Navbar` | Debounce search 300ms, quản lý query state |
| `useTableSort` | `DataTable` | Sort logic, trả về `sortedRows` |
| `usePagination` | `PaginationControl` | Tính page range với ellipsis |
| `useClickOutside` | `UserDropdown`, `NotificationDropdown` | Đóng khi click ra ngoài |
| `useDropdownToggle` | `Navbar` | Quản lý trạng thái mở/đóng dropdown |
| `useToastTimer` | `Toast` | Auto-dismiss sau `duration` ms |
| `useToastClose` | `ToastContainer` | Dispatch `removeToast` action |
| `useAppToast` | Mọi hook trong project | Dispatch toast qua Redux |
| `useSidebar` | `useMainLayout` | Collapse state, persist localStorage |
| `useMainLayout` | `MainLayout` | Tổng hợp Router + Redux auth + sidebar |

---

## Redux

### `toastSlice.js`

Quản lý danh sách toast toàn cục.

**Actions:**
```js
import { addToast, removeToast } from '@/app/toastSlice';

// Thêm toast
dispatch(addToast({
  type: 'success',    // 'success' | 'error' | 'warning' | 'info'
  title: 'Thành công',
  message: 'Đã lưu dữ liệu',
  duration: 3000,     // tuỳ chọn, mặc định 3000ms
}));

// Xoá toast theo id
dispatch(removeToast(id));
```

**Khuyến nghị:** Dùng `useAppToast` thay vì dispatch trực tiếp:
```js
const { toast } = useAppToast();
toast.success('Thành công', 'Đã lưu dữ liệu');
```