import {
  List,
  ListItem,
  ListItemText,
  Box,
  ListItemButton,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";
import Badge from "@mui/material/Badge";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import { Link } from "react-router-dom";
import "../components//components.scss";
import { SIDEBAR_MENU } from "./sidebarMenu";

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

  const getAccess = sessionStorage.getItem("access");
  const menuPages = sessionStorage.getItem("sidemenus")?.split(",") || [];

  return (
    <Box sx={{ backgroundColor: "#f5f7f9", height: "calc(100vh - 64px)" }}>
      <Box className="avatar-con">
        <Stack direction="row" spacing={2}>
          <StyledBadge
            overlap="circular"
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            variant="dot"
          >
            <Avatar sx={{ bgcolor: "#3B3B3B" }} className="avatar-img"></Avatar>
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
        {SIDEBAR_MENU[getAccess]
          ?.filter((menu) => menuPages.includes(menu.key))
          ?.map((menu) => {
            const Icon = menu.icon;
            const isActive = menu.matchRoutes
              ? menu.matchRoutes.some((route) =>
                  location.pathname.startsWith(route)
                )
              : location.pathname === menu.path;

            return (
              <ListItem key={menu.path} disablePadding>
                <ListItemButton
                  component={Link}
                  to={menu.path}
                  className={`list-element ${isActive ? "pageactive" : ""}`}
                >
                  <Icon className="menu-icon" />

                  <ListItemText
                    primary={menu.label}
                    sx={{
                      overflow: "hidden",
                      maxWidth: isCollapsed ? 0 : 180,
                      opacity: isCollapsed ? 0 : 1,
                      transition: "all 0.3s ease",
                      whiteSpace: "nowrap",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
      </List>
    </Box>
  );
};

export default Sidebar;
