import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import "../../pages/pagestyle.scss";
import server from "../../../server/server";
import { useState } from "react";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 400,
  width: "100%",
  borderRadius: theme.spacing(2),
  boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.1)",
  backgroundColor: "#fff",
  textAlign: "center",
}));

const adminMenu = {
  admin_dashboard: {
    1: "create_user",
    2: "credentials_details",
  },
};

function Login() {
  const navigate = useNavigate();

  const [getLoginVal, setLoginVal] = useState({
    email: "admin",
    password: "Admin@123",
  });
  const [getLoginDetails, setLoginDetails] = useState("");

  console.log("getLoginDetails", getLoginDetails);

  // Custom function start here

  const handleLogin = async () => {
    if (!getLoginVal.email && !getLoginVal.password) {
      return alert("Please Fill The Empty Fields");
    }

    if (getLoginVal?.email === "admin") {
      try {
        const res = await server.post("/admin/login", {
          email: getLoginVal?.email,
          password: getLoginVal?.password,
        });

        setLoginDetails(res?.data?.message);
        console.log("responzzz", res?.data?.message);
        if (res?.data?.message === "Login successful") {
          setTimeout(() => {
            navigate("/admin_dashboard"); // After Login Navigate
          }, [300]);
        }
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("loginMenu", JSON.stringify(adminMenu));
      } catch (error) {
        console.log(
          "Error in fetching:",
          error.response?.data || error.message
        );
        setLoginDetails(error.response?.data?.message);
      }
    } else {
      alert("User Login");
    }

    const loginMenu = {
      "Planning Team": {
        1: "Planning_Dashboard",
        2: "Planning_Report",
      },
      "Designing Team": {
        1: "Designing_Dashboard",
        2: "Designing_Report",
      },
      "Coating Team": {
        1: "Coating_Dashboard",
        2: "Coating_Report",
      },
    };

    // sessionStorage.setItem("loginMenu", JSON.stringify(loginMenu));
  };

  // Custom function end here
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `#fff`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      className="loginBackgroung"
    >
      <Box className="innerLoginBox">
        <StyledPaper>
          <Typography
            variant="h5"
            mb={2.5}
            fontWeight="500"
            sx={{ fontFamily: "poppins , sans-serif" }}
          >
            Welcome
          </Typography>

          <Stack sx={{ width: "100%", marginBottom: 2 }} spacing={2}>
            {getLoginDetails && (
              <Alert
                severity={
                  getLoginDetails === "Login successful" ? "success" : "error"
                }
              >
                {getLoginDetails}
              </Alert>
            )}
          </Stack>

          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={getLoginVal.email}
            onChange={(e) => {
              setLoginVal({ ...getLoginVal, email: e.target.value });
            }}
          />

          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={getLoginVal.password}
            onChange={(e) => {
              setLoginVal({ ...getLoginVal, password: e.target.value });
            }}
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3, py: 1.5, fontWeight: "bold" }}
            onClick={handleLogin}
          >
            Login
          </Button>
        </StyledPaper>
      </Box>
    </Box>
  );
}

export default Login;
