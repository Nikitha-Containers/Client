import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import TopBar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/dashboard/Dashboard";
import Reports from "./pages/Reports";
import Login from "./pages/login/Login";
import Planning from "./pages/dashboard/planning/Planning";
import PrivateRoute from "./PrivateRouter";
import EditPlan from "./pages/dashboard/planning/EditPlan";
import UpsDashboard from "./pages/dashboard/upsDesign/UpsDashboard";
import CoatingDashboard from "./pages/dashboard/coating/CoatingDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

function Mainlayouts() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  useEffect(() => {
    if (isLoginPage) {
      setIsSidebarCollapsed(false);
    }
  }, [isLoginPage]);

  return (
    <Box>
      {!isLoginPage && <TopBar onToggleSidebar={handleToggleSidebar} />}

      <Box sx={{ display: "flex", flexWrap: "nowrap" }}>
        {!isLoginPage && (
          <Box
            sx={{
              width: isSidebarCollapsed ? "0px" : "310px",
              transition: "width 0.3s ease",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <Sidebar />
          </Box>
        )}
        <Box sx={{ flexGrow: 1, overflowY: "auto", padding: 0 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route path="/login" element={<Login />} />

            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/planning"
              element={
                <PrivateRoute>
                  <Planning />
                </PrivateRoute>
              }
            />

            <Route
              path="/editplan"
              element={
                <PrivateRoute>
                  <EditPlan />
                </PrivateRoute>
              }
            />

            <Route
              path="/UpsDesignplan"
              element={
                <PrivateRoute>
                  <UpsDashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/coating_dashboard"
              element={
                <PrivateRoute>
                  <CoatingDashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/admin_dashboard"
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/about"
              element={
                <PrivateRoute>
                  <Reports />
                </PrivateRoute>
              }
            />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}

export default Mainlayouts;
