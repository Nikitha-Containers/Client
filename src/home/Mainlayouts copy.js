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

function Mainlayouts() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
    setHasInteracted(true);
  };

  useEffect(() => {
    if (isLoginPage) {
      setIsSidebarCollapsed(false);
      setHasInteracted(false);
    }
  }, [isLoginPage]);

  return (
    <Box>
      {!isLoginPage && <TopBar onToggleSidebar={handleToggleSidebar} />}

      <Box sx={{ display: "flex", flexWrap: "wrap" }}>
        {!isLoginPage && (
          <Box
            sx={{
              width: isSidebarCollapsed ? "0%" : "20%",
              overflow: "hidden",
              opacity: isSidebarCollapsed ? 0 : 1,
              transform: isSidebarCollapsed
                ? "translateX(-10px)"
                : "translateX(0)",
              transition: hasInteracted
                ? "width 0.3s ease, opacity 0.3s ease, transform 0.3s ease"
                : "none",
            }}
          >
            <Sidebar isCollapsed={isSidebarCollapsed} />
          </Box>
        )}
        <Box
          sx={{
            width: isLoginPage ? "100%" : isSidebarCollapsed ? "100%" : "80%",
            transition: hasInteracted ? "width 0.3s ease" : "none",
          }}
        >
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
              path="/about"
              element={
                <PrivateRoute>
                  <Reports />
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
