import { AppBar, Toolbar, IconButton, Box, Button } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Logo from "../../assets/logo.png";
import "../components/components.scss";
import { Link, useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import { clearSession } from "../pages/login/authSession";

const Topbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#ffffff",
        boxShadow: "unset",
        borderBlockEnd: "2px solid #d5d6d669",
        display: "flex",
        justifyContent: "center",
        minHeight: 77,
      }}
    >
      <Toolbar className="nav-sub">
        <Box sx={{ display: "flex", alignItems: "baseline" }}>
          <IconButton onClick={onToggleSidebar}>
            <MenuIcon fontSize="large" />
          </IconButton>

          <img src={Logo} alt="Logo" className="logo-img" />
        </Box>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout <LogoutIcon />
        </button>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
