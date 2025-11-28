import React from "react";
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

  console.log("location", location.pathname);

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
        <ListItem
          button
          component={Link}
          to="/dashboard"
          className={`list-element ${
            location.pathname === "/dashboard" ? "pageactive" : ""
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
            primary="Planning"
            sx={{
              overflow: "hidden",
              maxWidth: isCollapsed ? 0 : 150,
              opacity: isCollapsed ? 0 : 1,
              transition: "max-width 0.3s ease, opacity 0.3s ease",
              whiteSpace: "nowrap",
            }}
          />
        </ListItem>

        <ListItem
          button
          component={Link}
          to="/desigining_dashboard"
          className={`list-element ${
            location.pathname === "/desigining_dashboard" ? "pageactive" : ""
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

        <ListItem
          button
          component={Link}
          to="/UpsDesignplan"
          className={`list-element ${
            location.pathname === "/UpsDesignplan" ? "pageactive" : ""
          }`}
        >
          <DesignServicesIcon className="menu-icon" />
          <ListItemText
            primary="Ups Design plan"
            sx={{
              overflow: "hidden",
              maxWidth: isCollapsed ? 0 : 150,
              opacity: isCollapsed ? 0 : 1,
              transition: "max-width 0.3s ease, opacity 0.3s ease",
              whiteSpace: "nowrap",
            }}
          />
        </ListItem>

        <ListItem
          button
          component={Link}
          to="/printing_manager"
          className={`list-element ${
            location.pathname === "/printing_manager" ? "pageactive" : ""
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

        <ListItem
          button
          component={Link}
          to="/coating_dashboard"
          className={`list-element ${
            location.pathname === "/coating_dashboard" ? "pageactive" : ""
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
      </List>
    </Box>
  );
};

export default Sidebar;
