# StallBox Frontend Structure

src/

- app/
- assets/
- components/
- hooks/
- layouts/
- routes/
- services/
- constants/
- utils/
- modules/

- App.jsx
- main.jsx

---

# Folder Responsibility

app/
- Redux store

components/
- Shared reusable UI

hooks/
- Shared reusable hooks

layouts/
- Layout components

routes/
- App routing

services/
- Axios/API config

modules/
- Business modules

---

# Module Structure

modules/auth/

- api/
- hooks/
- redux/
- pages/
- components/
- validation/
- constants/

---

# Code Flow

Page
↓
Hook
↓
Redux
↓
API
↓
Backend