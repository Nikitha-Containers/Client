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
import CreateUser from "./pages/admin/CreateUser";
import NotFound from "./NotFound";
import DesigningDashboard from './pages/desigining/designingDashboard'
function Mainlayouts() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  const notfound = sessionStorage.getItem("isLoggedIn");

  console.log(notfound, "notfound");

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
      {!isLoginPage && notfound && (
        <TopBar onToggleSidebar={handleToggleSidebar} />
      )}

      <Box sx={{ display: "flex", flexWrap: "nowrap" }}>
        {!isLoginPage && notfound && (
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
              path="/desigining_dashboard"
              element={
                <PrivateRoute>
                  <DesigningDashboard />
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

            {/* Admin pages start here  */}
            <Route
              path="/admin_dashboard"
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/create_user"
              element={
                <PrivateRoute>
                  <CreateUser />
                </PrivateRoute>
              }
            />

            {/* Admin pages end here  */}

            <Route
              path="/about"
              element={
                <PrivateRoute>
                  <Reports />
                </PrivateRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}

export default Mainlayouts;
