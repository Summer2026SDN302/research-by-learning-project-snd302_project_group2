import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import adminRoutes from "./adminRoutes"
import managerRoutes from "./managerRoutes";
import staffRoutes from "./staffRoutes";
import LoadingOverlay from "../components/feedback/LoadingOverlay"

/**
 * AppRoutes
 *
 * Root route configuration. Composes role-based route files.
 * BrowserRouter wraps the entire app here — do NOT wrap again in main.jsx.
 * Suspense handles lazy-loaded pages with a fullPage loading overlay.
 *
 * Route structure:
 *   /          → redirect to /admin/dashboard (replace with auth guard when ready)
 *   /admin/*   → adminRoutes   (MainLayout role="admin")
 *   /manager/* → managerRoutes (MainLayout role="manager")
 *   /staff/*   → staffRoutes   (MainLayout role="staff")
 *   *          → redirect to /admin/dashboard (replace with 404 page when ready)
 */

const AppRoutes = () => (
  <BrowserRouter>
    <Suspense fallback={<LoadingOverlay show fullPage />}>
      <Routes>
        {/* Default redirect — replace with auth-based redirect when ready */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Role-based routes */}
        {adminRoutes}
        {managerRoutes}
        {staffRoutes}

        {/* Fallback — replace with NotFound page when ready */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default AppRoutes;
