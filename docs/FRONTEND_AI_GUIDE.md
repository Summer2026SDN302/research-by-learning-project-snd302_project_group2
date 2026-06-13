# StallBox Frontend AI Guide

## Purpose

This document defines frontend architecture, coding rules, folder structure, naming conventions, and generation flow for AI-assisted development.

AI MUST strictly follow these rules when generating code.

---

# STACK

- ReactJS
- Vite
- Redux Toolkit
- React Router
- Axios
- Custom Hooks

---

# CORE PRINCIPLE

Frontend MUST follow:

Page
↓
Hook
↓
Redux
↓
API
↓
Backend

NEVER skip layers.

---

# MODULE STRUCTURE

modules/auth/

- api/
- hooks/
- redux/
- pages/
- components/
- validation/
- constants/

---

# RULES

## MUST

- Use feature-based structure
- Use Redux Toolkit
- Use custom hooks
- Separate UI and logic
- Use reusable components
- Use centralized API client

## NEVER

- API call inside component
- Business logic inside JSX
- Hardcode API URL
- Put everything in one file

---

# COMPONENT RULE

Components ONLY render UI.

Components MUST NOT:

- Call API directly
- Handle business logic

---

# HOOK RULE

Hooks handle:

- API calls
- Business logic
- Redux dispatch
- State handling

Example:

- useLogin.js
- useOrder.js

---

# API RULE

ALL API calls MUST use:

services/appClient.js

NEVER use axios directly inside components.

---

# FILE EXTENSION RULE

- .jsx → UI Components
- .js → Logic files

---

# FINAL ARCHITECTURE

ReactJS
↓
Redux Toolkit
↓
Custom Hooks
↓
Axios API Layer
↓
Express Backend