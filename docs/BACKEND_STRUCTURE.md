# StallBox Backend - Structure

## 1. Folder Structure

```text
src/
│
├── config/
│
├── middlewares/
│
├── shared/
│
├── sockets/
│
├── jobs/
│
├── modules/
│
├── app.js
│
└── server.js
```

---

## 2. Module Architecture (BẮT BUỘC)

Route → Controller → Service → Repository → Model

---

## 3. Module Example

```text
order/
├── order.route.js
├── order.controller.js
├── order.service.js
├── order.repository.js
├── order.model.js
├── order.dto.js
├── order.validation.js
```

---

## 4. Layer Rules

### Controller

- handle request/response
- NO business logic

### Service

- business logic
- validation logic

### Repository

- MongoDB queries only

### Model

- schema definition
