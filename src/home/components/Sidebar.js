import React, { useState, useEffect } from "react";
import { List, ListItem, ListItemText, Box } from "@mui/material";
import { useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";
import Badge from "@mui/material/Badge";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import DashboardIcon from "@mui/icons-material/Addchart";
import AssignmentAddIcon from "@mui/icons-material/AssignmentAdd";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import FormatPaintIcon from "@mui/icons-material/FormatPaint";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { Link } from "react-router-dom";
import "../components//components.scss";

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    padding: "7px",
    borderRadius: "50%",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: -1,
      left: -1,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

const Sidebar = ({ isCollapsed }) => {
  const location = useLocation();
  const [getAccess, setAccess] = useState("");
  const [getMenus, setMenus] = useState([]);

  const menuPages = getMenus?.toString()?.split(",");


  useEffect(() => {
    setAccess(sessionStorage.getItem("access"));
    setMenus(sessionStorage.getItem("sidemenus"));
  }, []);


  return (
    <Box sx={{ backgroundColor: "#f5f7f9", height: "91.5vh" }}>
      <Box className="avatar-con">
        <Stack direction="row" spacing={2}>
          <StyledBadge
            overlap="circular"
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            variant="dot"
          >
            <Avatar sx={{ bgcolor: "#3B3B3B" }} className="avatar-img">
              J
            </Avatar>
          </StyledBadge>
        </Stack>

        <Box
          className="avatar-txt"
          sx={{
            overflow: "hidden",
            maxWidth: isCollapsed ? 0 : 150,
            opacity: isCollapsed ? 0 : 1,
            transition: "max-width 0.3s ease, opacity 0.3s ease",
            whiteSpace: "nowrap",
          }}
        >
          <div className="dept-name">Processing Team</div>
          <div className="emp-name">John Wick , 371</div>
        </Box>
      </Box>

      <List className="side-list">
        {/* Stores menu start here  */}
        {getAccess === "Stores" && menuPages?.includes("Dashboard") ? (
          <ListItem
            button
            component={Link}
            to="/Stores_dashboard"
            className={`list-element ${
              location.pathname === "/Stores_dashboard" ? "pageactive" : ""
            }`}
          >
            <DashboardIcon className="menu-icon" />
            <ListItemText
              primary="Dashboard"
              sx={{
                overflow: "hidden",
                maxWidth: isCollapsed ? 0 : 150,
                opacity: isCollapsed ? 0 : 1,
                transition: "max-width 0.3s ease, opacity 0.3s ease",
                whiteSpace: "nowrap",
              }}
            />
          </ListItem>
        ) : null}

        {getAccess === "Stores" && menuPages?.includes("Sheet Taken") ? (
          <ListItem
            button
            component={Link}
            to="/uploadsheet"
            className={`list-element ${
              location.pathname === "/uploadsheet" ? "pageactive" : ""
            }`}
          >
            <DashboardIcon className="menu-icon" />
            <ListItemText
              primary="Dashboard"
              sx={{
                overflow: "hidden",
                maxWidth: isCollapsed ? 0 : 150,
                opacity: isCollapsed ? 0 : 1,
                transition: "max-width 0.3s ease, opacity 0.3s ease",
                whiteSpace: "nowrap",
              }}
            />
          </ListItem>
        ) : null}
        {/* Stores menu end here  */}

        {/* Planning menu pages start here  */}

        {getAccess === "Planning" && menuPages?.includes("Dashboard") ? (
          <ListItem
            button
            component={Link}
            to="/Planning_dashboard"
            className={`list-element ${
              location.pathname === "/Planning_dashboard" ? "pageactive" : ""
            }`}
          >
            <DashboardIcon className="menu-icon" />
            <ListItemText
              primary="Dashboard"
              sx={{
                overflow: "hidden",
                maxWidth: isCollapsed ? 0 : 150,
                opacity: isCollapsed ? 0 : 1,
                transition: "max-width 0.3s ease, opacity 0.3s ease",
                whiteSpace: "nowrap",
              }}
            />
          </ListItem>
        ) : null}

        {getAccess === "Planning" && menuPages?.includes("Sync with SO") ? (
          <ListItem
            button
            component={Link}
            to="/planning"
            className={`list-element ${
              location.pathname === "/planning" ||
              location.pathname === "/editplan"
                ? "pageactive"
                : ""
            }`}
          >
            <AssignmentAddIcon className="menu-icon" />
            <ListItemText
              primary="Sync With SO"
              sx={{
                overflow: "hidden",
                maxWidth: isCollapsed ? 0 : 150,
                opacity: isCollapsed ? 0 : 1,
                transition: "max-width 0.3s ease, opacity 0.3s ease",
                whiteSpace: "nowrap",
              }}
            />
          </ListItem>
        ) : null}

        {/* Planning menu pages end here  */}

        {/* Designing menu pages start here  */}

        {getAccess === "Designing" && menuPages?.includes("Dashboard") ? (
          <ListItem
            button
            component={Link}
            to="/Designing_dashboard"
            className={`list-element ${
              location.pathname === "/Designing_dashboard" ||
              location.pathname === "/edit_design"
                ? "pageactive"
                : ""
            }`}
          >
            <DashboardIcon className="menu-icon" />
            <ListItemText
              primary="Designing Dashboard"
              sx={{
                overflow: "hidden",
                maxWidth: isCollapsed ? 0 : 200,
                opacity: isCollapsed ? 0 : 1,
                transition: "max-width 0.3s ease, opacity 0.3s ease",
                whiteSpace: "nowrap",
              }}
            />
          </ListItem>
        ) : null}

        {getAccess === "Designing" && menuPages?.includes("Sheet Store") ? (
          <ListItem
            button
            component={Link}
            to="/"
            className={`list-element ${
              location.pathname === "/" || location.pathname === "/"
                ? "pageactive"
                : ""
            }`}
          >
            <DashboardIcon className="menu-icon" />
            <ListItemText
              primary="Sheet Store"
              sx={{
                overflow: "hidden",
                maxWidth: isCollapsed ? 0 : 200,
                opacity: isCollapsed ? 0 : 1,
                transition: "max-width 0.3s ease, opacity 0.3s ease",
                whiteSpace: "nowrap",
              }}
            />
          </ListItem>
        ) : null}

        {/* Designing menu pages end here  */}

        {/* Printing manager menu pages start here  */}

        {getAccess === "Printing Manager" &&
        menuPages?.includes("Dashboard") ? (
          <ListItem
            button
            component={Link}
            to="/PrintingManager_dashboard"
            className={`list-element ${
              location.pathname === "/PrintingManager_dashboard" ||
              location.pathname === "/edit_print"
                ? "pageactive"
                : ""
            }`}
          >
            <DesignServicesIcon className="menu-icon" />
            <ListItemText
              primary="Printing Manager"
              sx={{
                overflow: "hidden",
                maxWidth: isCollapsed ? 0 : 150,
                opacity: isCollapsed ? 0 : 1,
                transition: "max-width 0.3s ease, opacity 0.3s ease",
                whiteSpace: "nowrap",
              }}
            />
          </ListItem>
        ) : null}

        {getAccess === "Printing Manager" &&
        menuPages?.includes("Sheet Store") ? (
          <ListItem
            button
            component={Link}
            to="/"
            className={`list-element ${
              location.pathname === "/" || location.pathname === "/"
                ? "pageactive"
                : ""
            }`}
          >
            <DesignServicesIcon className="menu-icon" />
            <ListItemText
              primary="Sheet Stores"
              sx={{
                overflow: "hidden",
                maxWidth: isCollapsed ? 0 : 150,
                opacity: isCollapsed ? 0 : 1,
                transition: "max-width 0.3s ease, opacity 0.3s ease",
                whiteSpace: "nowrap",
              }}
            />
          </ListItem>
        ) : null}

        {/* Printing manager menu pages end here  */}

        {/* Coating menu pages start here  */}

        {getAccess === "Coating" && menuPages?.includes("Dashboard") ? (
          <ListItem
            button
            component={Link}
            to="/Coating_dashboard"
            className={`list-element ${
              location.pathname === "/Coating_dashboard" ||
              location.pathname === "/edit_coating"
                ? "pageactive"
                : ""
            }`}
          >
            <FormatPaintIcon className="menu-icon" />
            <ListItemText
              primary="Coating Dashboard"
              sx={{
                overflow: "hidden",
                maxWidth: isCollapsed ? 0 : 150,
                opacity: isCollapsed ? 0 : 1,
                transition: "max-width 0.3s ease, opacity 0.3s ease",
                whiteSpace: "nowrap",
              }}
            />
          </ListItem>
        ) : null}

        {getAccess === "Coating" && menuPages?.includes("Sheet Store") ? (
          <ListItem
            button
            component={Link}
            to="/"
            className={`list-element ${
              location.pathname === "/" || location.pathname === "/"
                ? "pageactive"
                : ""
            }`}
          >
            <FormatPaintIcon className="menu-icon" />
            <ListItemText
              primary="Sheet Store"
              sx={{
                overflow: "hidden",
                maxWidth: isCollapsed ? 0 : 150,
                opacity: isCollapsed ? 0 : 1,
                transition: "max-width 0.3s ease, opacity 0.3s ease",
                whiteSpace: "nowrap",
              }}
            />
          </ListItem>
        ) : null}

        {/* Coating menu pages start here  */}

        {/* Admin sidemenu pages start here  */}

        {getAccess === "Admin" && menuPages?.includes("All") ? (
          <ListItem
            button
            component={Link}
            to="/admin_dashboard"
            className={`list-element ${
              location.pathname === "/admin_dashboard" ? "pageactive" : ""
            }`}
          >
            <AdminPanelSettingsIcon className="menu-icon" />
            <ListItemText
              primary="Admin Dashboard"
              sx={{
                overflow: "hidden",
                maxWidth: isCollapsed ? 0 : 150,
                opacity: isCollapsed ? 0 : 1,
                transition: "max-width 0.3s ease, opacity 0.3s ease",
                whiteSpace: "nowrap",
              }}
            />
          </ListItem>
        ) : null}

        {getAccess === "Admin" && menuPages?.includes("All") ? (
          <ListItem
            button
            component={Link}
            to="/create_user"
            className={`list-element ${
              location.pathname === "/create_user" ? "pageactive" : ""
            }`}
          >
            <PersonAddIcon className="menu-icon" />
            <ListItemText
              primary="Create User"
              sx={{
                overflow: "hidden",
                maxWidth: isCollapsed ? 0 : 150,
                opacity: isCollapsed ? 0 : 1,
                transition: "max-width 0.3s ease, opacity 0.3s ease",
                whiteSpace: "nowrap",
              }}
            />
          </ListItem>
        ) : null}
        {/* Admin sidemenu pages start here  */}
      </List>
    </Box>
  );
};

export default Sidebar;
