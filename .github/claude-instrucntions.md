# StallBox Frontend — Copilot Instructions

> AI MUST strictly follow every rule in this file when generating frontend code for StallBox.
> For full details on any topic, refer to the linked source documents below.

---

## Reference Documents

Before generating any code, read the relevant documents:

| Document | When to Read |
|---|---|
| [`FRONTEND_AI_GUIDE.md`](../docs/FRONTEND_AI_GUIDE.md) | Always — core architecture, layer rules, MUST/NEVER list |
| [`FRONTEND_STRUCTURE.md`](../docs/FRONTEND_STRUCTURE.md) | When creating files or folders — folder layout, module structure |
| [`FRONTEND_CONVENTION.md`](../docs/FRONTEND_CONVENTION.md) | When naming anything — files, hooks, slices, API, extensions |
| [`FRONTEND_SHARE_COMPONENTS.md`](../docs/FRONTEND_SHARE_COMPONENTS.md) | Before creating any new UI component — check if shared component already exists |
| [`FRONTEND_SETUP.md`](../docs/FRONTEND_SETUP.md) | When installing packages or configuring the dev environment |

---

## Stack

- ReactJS + Vite
- Redux Toolkit
- React Router
- Axios (via centralized client only — see [`FRONTEND_CONVENTION.md`](../docs/FRONTEND_CONVENTION.md#api-rule))
- React Hook Form + Zod
- Tailwind CSS
- dayjs

---

## Core Architecture (NON-NEGOTIABLE)

> Full rules in [`FRONTEND_AI_GUIDE.md`](../docs/FRONTEND_AI_GUIDE.md#core-principle)

Every feature MUST flow through these layers in order:

```
Page → Hook → Redux → API → Backend
```

NEVER skip layers. NEVER call API inside a component.

---

## Folder Structure

> Full structure in [`FRONTEND_STRUCTURE.md`](../docs/FRONTEND_STRUCTURE.md)

```
src/
├── app/              ← Redux store + slices
├── assets/
├── components/       ← Shared reusable UI only
├── hooks/            ← Shared reusable hooks only
├── layouts/
├── routes/
├── services/         ← Axios config (apiClient.js)
├── constants/
├── utils/
└── modules/          ← Feature modules (see below)
```

### Module Structure

> See [`FRONTEND_STRUCTURE.md § Module Structure`](../docs/FRONTEND_STRUCTURE.md#module-structure)

```
modules/<feature>/
├── api/              ← API call functions
├── hooks/            ← Module-specific hooks
├── redux/            ← Slice + selectors
├── pages/            ← Page components (.jsx)
├── components/       ← Module-specific UI (.jsx)
├── validation/       ← Zod schemas
└── constants/
```

---

## Naming Conventions

> Full rules in [`FRONTEND_CONVENTION.md`](../docs/FRONTEND_CONVENTION.md)

| Type | Convention | Example |
|---|---|---|
| Components | PascalCase | `LoginForm.jsx`, `RevenueChart.jsx` |
| Pages | PascalCase | `OrderListPage.jsx` |
| Hooks | camelCase, starts with `use` | `useLogin.js`, `useOrder.js` |
| Redux slices | camelCase + Slice suffix | `authSlice.js`, `orderSlice.js` |
| API files | camelCase + Api suffix | `authApi.js`, `orderApi.js` |

### File Extensions

> See [`FRONTEND_CONVENTION.md § File Extension`](../docs/FRONTEND_CONVENTION.md#file-extension)

| Extension | Used For |
|---|---|
| `.jsx` | Components, Pages, Layouts |
| `.js` | Hooks, Redux, API, Utils, Constants |

---

## Layer Rules

> Full rules in [`FRONTEND_AI_GUIDE.md`](../docs/FRONTEND_AI_GUIDE.md#rules)

### Page (`.jsx`)
- Renders layout and composes components
- Calls ONE hook per concern
- NO business logic, NO API calls

```jsx
// ✅ Correct
const OrderListPage = () => {
  const { orders, isLoading, handleDelete } = useOrderList();
  return <DataTable rows={orders} isLoading={isLoading} />;
};
```

### Hook (`.js`)

> See [`FRONTEND_AI_GUIDE.md § Hook Rule`](../docs/FRONTEND_AI_GUIDE.md#hook-rule)

- Handles ALL business logic, API calls, Redux dispatch, local state
- Named `use<Feature>.js`
- Module hooks → `modules/<feature>/hooks/`
- Shared hooks → `hooks/`

```js
// ✅ Correct
const useOrderList = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders);

  const fetchOrders = async () => {
    const data = await orderApi.getAll();
    dispatch(setOrders(data));
  };

  return { orders, fetchOrders };
};
```

### Redux (`.js`)
- Use Redux Toolkit (`createSlice`)
- One slice per module
- Slices live in `modules/<feature>/redux/`

```js
// ✅ Correct
const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: { setOrders, clearOrders }
});
```

### API (`.js`)

> See [`FRONTEND_AI_GUIDE.md § API Rule`](../docs/FRONTEND_AI_GUIDE.md#api-rule) and [`FRONTEND_CONVENTION.md § API Rule`](../docs/FRONTEND_CONVENTION.md#api-rule)

- MUST use `services/apiClient.js` — NEVER import axios directly
- API functions live in `modules/<feature>/api/`

```js
// ✅ Correct
import apiClient from '@/services/apiClient';
export const getOrders = () => apiClient.get('/orders');

// ❌ NEVER do this
import axios from 'axios';
axios.get('http://localhost:5000/api/orders');
```

---

## Component Rules

> See [`FRONTEND_AI_GUIDE.md § Component Rule`](../docs/FRONTEND_AI_GUIDE.md#component-rule)

Components MUST:
- Only render UI
- Receive data and handlers via props
- Use shared components from `components/` whenever possible

Components MUST NOT:
- Call API directly
- Contain business logic
- Import axios

---

## Shared Components

> **Full props, usage examples, and component API in [`FRONTEND_SHARE_COMPONENTS.md`](../docs/FRONTEND_SHARE_COMPONENTS.md)**
> Always check this file before creating a new UI component.

> Placement rules in [`FRONTEND_CONVENTION.md § Shared Component Rule`](../docs/FRONTEND_CONVENTION.md#shared-component-rule)

| Component | Location | Use For |
|---|---|---|
| `DataTable` | `components/common/table/` | All data tables |
| `FilterBar` | `components/common/table/` | Table filters |
| `SearchBar` | `components/common/table/` | Search inputs |
| `PaginationControl` | `components/common/table/` | Pagination |
| `ConfirmDialog` | `components/common/dialog/` | Delete / action confirmation |
| `PageHeader` | `components/common/page/` | Page title + breadcrumbs |
| `StatusBadge` | `components/common/status/` | Status display |
| `LoadingOverlay` | `components/common/status/` | Loading states |
| `Spinner` | `components/common/status/` | Inline loading |
| `EmptyState` | `components/common/status/` | Empty list states |
| `Sidebar` | `components/common/navigation/` | App sidebar |
| `Navbar` | `components/common/navigation/` | App top bar |
| `ToastContainer` | `components/common/notification/` | Toast root (mount once in layout) |

### Showing Toasts

> See [`FRONTEND_SHARE_COMPONENTS.md § ToastContainer`](../docs/FRONTEND_SHARE_COMPONENTS.md#toastcontainerjsx)

NEVER use react-hot-toast directly. Always use `useAppToast`:

```js
// ✅ Correct
import useAppToast from '@/hooks/useAppToast';
const { toast } = useAppToast();
toast.success('Thành công', 'Đã lưu dữ liệu');
toast.error('Lỗi', 'Không thể kết nối server');
```

---

## Shared Hooks

> See [`FRONTEND_SHARE_COMPONENTS.md § Shared Hooks`](../docs/FRONTEND_SHARE_COMPONENTS.md#shared-hooks)
> Placement rules in [`FRONTEND_CONVENTION.md § Shared Hook Rule`](../docs/FRONTEND_CONVENTION.md#shared-hook-rule)

| Hook | Purpose |
|---|---|
| `useAppToast` | Dispatch toast notifications via Redux |
| `useTableSort` | Sort logic for DataTable |
| `usePagination` | Page range calculation |
| `useClickOutside` | Close dropdowns on outside click |
| `useSearch` | Debounced search (300ms) |
| `useSidebar` | Sidebar collapse state (persisted to localStorage) |
| `useMainLayout` | Combines Router + auth + sidebar for root layout |

---

## Environment Variables

> See [`FRONTEND_SETUP.md § Environment Setup`](../docs/FRONTEND_SETUP.md#environment-setup)

All API base URLs come from `.env`:

```
VITE_API_URL=http://localhost:5000/api
```

`services/apiClient.js` reads `import.meta.env.VITE_API_URL`. NEVER hardcode URLs.

---

## Anti-Patterns (NEVER DO)

> Source: [`FRONTEND_AI_GUIDE.md § NEVER`](../docs/FRONTEND_AI_GUIDE.md#never)

```js
// ❌ API call inside component
const MyComponent = () => {
  useEffect(() => { axios.get('/orders'); }, []);
};

// ❌ Business logic inside JSX
const MyPage = () => {
  const total = orders.reduce(...); // belongs in hook
  return <div>{total}</div>;
};

// ❌ Hardcoded API URL
fetch('http://localhost:5000/api/orders');

// ❌ Axios imported directly anywhere except apiClient.js
import axios from 'axios';

// ❌ Everything in one file
// page + hook + redux + api all in OrderPage.jsx
```

---

## Where Code Belongs — Quick Reference

| Concern | Where | Reference |
|---|---|---|
| UI rendering | Component / Page `.jsx` | [`FRONTEND_AI_GUIDE.md`](../docs/FRONTEND_AI_GUIDE.md#component-rule) |
| Data fetching | Hook `.js` → API `.js` | [`FRONTEND_AI_GUIDE.md`](../docs/FRONTEND_AI_GUIDE.md#hook-rule) |
| Global state | Redux slice `.js` | [`FRONTEND_STRUCTURE.md`](../docs/FRONTEND_STRUCTURE.md) |
| Business logic | Hook `.js` | [`FRONTEND_AI_GUIDE.md`](../docs/FRONTEND_AI_GUIDE.md#hook-rule) |
| Validation schema | `modules/<feature>/validation/` | [`FRONTEND_STRUCTURE.md`](../docs/FRONTEND_STRUCTURE.md#module-structure) |
| HTTP config / interceptors | `services/apiClient.js` | [`FRONTEND_CONVENTION.md`](../docs/FRONTEND_CONVENTION.md#api-rule) |
| Reusable UI | `components/common/` | [`FRONTEND_SHARE_COMPONENTS.md`](../docs/FRONTEND_SHARE_COMPONENTS.md) |
| Feature UI | `modules/<feature>/components/` | [`FRONTEND_CONVENTION.md`](../docs/FRONTEND_CONVENTION.md#shared-component-rule) |
| Shared hooks | `hooks/` | [`FRONTEND_CONVENTION.md`](../docs/FRONTEND_CONVENTION.md#shared-hook-rule) |
| Feature hooks | `modules/<feature>/hooks/` | [`FRONTEND_CONVENTION.md`](../docs/FRONTEND_CONVENTION.md#shared-hook-rule) |
