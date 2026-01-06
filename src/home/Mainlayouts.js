import { useState } from "react";
import { Box } from "@mui/material";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import TopBar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import Default_Dashboard from "./pages/dashboard/DefaultDashboard";
import Login from "./pages/login/Login";
import PrivateRoute from "./PrivateRouter";
import NotFound from "./NotFound";
import Toast from "./components/Toast";
import { ROUTE_CONFIG } from "./routeConfig";

function Mainlayouts() {
  const access = sessionStorage.getItem("access");
  const menuPages = sessionStorage.getItem("sidemenus")?.split(",") || [];

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  const notfound = sessionStorage.getItem("isLoggedIn");

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  return (
    <Box>
      <Toast />
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
            <Sidebar isCollapsed={isSidebarCollapsed} />
          </Box>
        )}

        <Box sx={{ flexGrow: 1, overflowY: "auto", padding: 0 }}>
          <Routes>
            <Route
              path="/"
              element={
                access ? (
                  <Navigate to={ROUTE_CONFIG[access]?.[0]?.path} replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route path="/login" element={<Login />} />

            {ROUTE_CONFIG[access]
              ?.filter((route) => menuPages.includes(route.key))
              ?.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <PrivateRoute>
                      <route.component />
                    </PrivateRoute>
                  }
                />
              ))}

            <Route
              path="/Default_dashboard"
              element={
                <PrivateRoute>
                  <Default_Dashboard />
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
