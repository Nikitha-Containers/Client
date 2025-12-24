import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import server from "../../../server/server";
import "../../pages/pagestyle.scss";
import GoogleAuth from "./GoogleAuth";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 400,
  width: "100%",
  borderRadius: theme.spacing(2),
  boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.1)",
  backgroundColor: "#fff",
  textAlign: "center",
}));

function Login() {
  const navigate = useNavigate();

  const [getLoginVal, setLoginVal] = useState({
    empID: "Admin",
    password: "Admin@123",
  });

  const [getLoginDetails, setLoginDetails] = useState("");
  const [getAuthPage, setAuthPage] = useState(false);

  console.log("getLoginDetails", getLoginDetails);

  // Custom function start here

  const handleLogin = async () => {
    if (!getLoginVal.empID || !getLoginVal.password) {
      return alert("Please fill all fields");
    }

    try {
      const res = await server.post("/user/login", {
        empID: getLoginVal?.empID,
        password: getLoginVal?.password,
      });

      setLoginDetails(res?.data?.message);

      if (
        res?.data?.message === "Password correct, proceed to OTP verification"
      ) {
        sessionStorage.setItem("adminID", res.data.adminID);
        setTimeout(() => {
          setAuthPage(true);
        }, 300);
      } else {
        console.log("USer Login");
      }
    } catch (error) {
      setLoginDetails(error.response?.data?.message || "Login failed");
    }
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
        {getAuthPage ? (
          <GoogleAuth />
        ) : (
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
                    getLoginDetails ===
                    "Password correct, proceed to OTP verification"
                      ? "success"
                      : "error"
                  }
                >
                  {getLoginDetails}
                </Alert>
              )}
            </Stack>

            <TextField
              label="Emp ID"
              variant="outlined"
              fullWidth
              margin="normal"
              value={getLoginVal.empID}
              onChange={(e) => {
                setLoginVal({ ...getLoginVal, empID: e.target.value });
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
        )}
      </Box>
    </Box>
  );
}

export default Login;
