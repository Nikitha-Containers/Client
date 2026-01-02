import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import TopBar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/dashboard/Dashboard";
import Default_Dashboard from "./pages/dashboard/DefaultDashboard";
import Login from "./pages/login/Login";
import Planning from "./pages/dashboard/planning/Planning";
import PrivateRoute from "./PrivateRouter";
import EditPlan from "./pages/dashboard/planning/EditPlan";
import CoatingDashboard from "./pages/dashboard/coating/CoatingDashboard";
import EditCoating from "./pages/dashboard/coating/EditCoating";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CreateUser from "./pages/user/CreateUser";
import NotFound from "./NotFound";
import DesigningDashboard from "./pages/dashboard/desigining/DesigningDashboard";
import PrintingManager from "./pages/dashboard/printing/PrintingManager";
import EditPrint from "./pages/dashboard/printing/EditPrint";
import EditDesign from "./pages/dashboard/desigining/EditDesign";
import Stores_dashboard from "./pages/dashboard/stores/Stores_dashboard";
import Uploadsheet from "./pages/dashboard/stores/Uploadsheet";
import Toast from "./components/Toast";

function Mainlayouts() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const [getAccess, setAccess] = useState("");
  const [getMenus, setMenus] = useState([]);
  const isLoginPage = location.pathname === "/login";
  const menuPages = getMenus?.toString()?.split(",");

  const notfound = sessionStorage.getItem("isLoggedIn");

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  useEffect(() => {
    if (isLoginPage) {
      setIsSidebarCollapsed(false);
    }
    setAccess(sessionStorage.getItem("access"));
    setMenus(sessionStorage.getItem("sidemenus"));
  }, [isLoginPage]);

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
            <Sidebar />
          </Box>
        )}

        <Box sx={{ flexGrow: 1, overflowY: "auto", padding: 0 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route path="/login" element={<Login />} />

            {getAccess === "Planning" && menuPages?.includes("Dashboard") ? (
              <Route
                path="/Planning_dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
            ) : null}

            {getAccess === "Planning" && menuPages?.includes("Sync with SO") ? (
              <Route
                path="/planning"
                element={
                  <PrivateRoute>
                    <Planning />
                  </PrivateRoute>
                }
              />
            ) : null}

            {getAccess === "Stores" && menuPages?.includes("Dashboard") ? (
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Stores_dashboard />
                  </PrivateRoute>
                }
              />
            ) : null}

            {getAccess === "Stores" && menuPages?.includes("Sheet Taken") ? (
              <Route
                path="/uploadsheet"
                element={
                  <PrivateRoute>
                    <Uploadsheet />
                  </PrivateRoute>
                }
              />
            ) : null}

            {getAccess === "Planning" && menuPages?.includes("Sync with SO") ? (
              <Route
                path="/editplan"
                element={
                  <PrivateRoute>
                    <EditPlan />
                  </PrivateRoute>
                }
              />
            ) : null}

            {getAccess === "Designing" && menuPages?.includes("Dashboard") ? (
              <Route
                path="/Designing_dashboard"
                element={
                  <PrivateRoute>
                    <DesigningDashboard />
                  </PrivateRoute>
                }
              />
            ) : null}

            {getAccess === "Designing" && menuPages?.includes("Dashboard") ? (
              <Route
                path="/edit_design"
                element={
                  <PrivateRoute>
                    <EditDesign />
                  </PrivateRoute>
                }
              />
            ) : null}

            {getAccess === "Printing Manager" &&
            menuPages?.includes("Dashboard") ? (
              <Route
                path="/PrintingManager_dashboard"
                element={
                  <PrivateRoute>
                    <PrintingManager />
                  </PrivateRoute>
                }
              />
            ) : null}

            {getAccess === "Printing Manager" &&
            menuPages?.includes("Dashboard") ? (
              <Route
                path="/edit_print"
                element={
                  <PrivateRoute>
                    <EditPrint />
                  </PrivateRoute>
                }
              />
            ) : null}

            {getAccess === "Coating" && menuPages?.includes("Dashboard") ? (
              <Route
                path="/Coating_dashboard"
                element={
                  <PrivateRoute>
                    <CoatingDashboard />
                  </PrivateRoute>
                }
              />
            ) : null}

            {getAccess === "Coating" && menuPages?.includes("Dashboard") ? (
              <Route
                path="/coating_dashboard"
                element={
                  <Route
                    path="/edit_coating"
                    element={
                      <PrivateRoute>
                        <EditCoating />
                      </PrivateRoute>
                    }
                  />
                }
              />
            ) : null}

            {/* Admin pages start here  */}
            {getAccess === "Admin" && menuPages?.includes("All") ? (
              <Route
                path="/admin_dashboard"
                element={
                  <PrivateRoute>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
            ) : null}

            {getAccess === "Admin" && menuPages?.includes("All") ? (
              <Route
                path="/create_user"
                element={
                  <PrivateRoute>
                    <CreateUser />
                  </PrivateRoute>
                }
              />
            ) : null}

            {/* Admin pages end here  */}

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
