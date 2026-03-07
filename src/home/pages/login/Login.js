import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import { Box, Paper, TextField, Typography } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import server from "../../../server/server";
import "../../pages/pagestyle.scss";
import GoogleAuth from "./GoogleAuth";
import { setSession } from "./authSession";

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

  const [loading, setLoading] = useState(false);

  const [getLoginVal, setLoginVal] = useState({
    empID: "",
    password: "",
  });

  const [getLoginDetails, setLoginDetails] = useState("");
  const [getAuthPage, setAuthPage] = useState(false);
  // Custom function start here

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!getLoginVal.empID || !getLoginVal.password) {
      setLoginDetails("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await server.post("/user/login", {
        empID: getLoginVal?.empID,
        password: getLoginVal?.password,
      });

      // OTP Required For Admin
      if (res?.data?.success && res.data.requiredOTP) {
        sessionStorage.setItem("adminID", res.data.adminID);
        setAuthPage(true);
        return;
      }

      // Normal Login
      if (res.data.success && !res.data.requiredOTP) {
        setSession(res?.data);
        navigate("/");
      }
    } catch (error) {
      setLoginDetails(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Custom function end here
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#fff",
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
                <Alert severity="error">{getLoginDetails}</Alert>
              )}
            </Stack>

            <form onSubmit={handleLogin}>
              <TextField
                label="Emp ID"
                variant="outlined"
                fullWidth
                autoFocus
                margin="normal"
                value={getLoginVal.empID}
                onChange={(e) =>
                  setLoginVal({ ...getLoginVal, empID: e.target.value })
                }
              />

              <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                value={getLoginVal.password}
                onChange={(e) =>
                  setLoginVal({ ...getLoginVal, password: e.target.value })
                }
              />

              <LoadingButton
                type="submit"
                fullWidth
                loading={loading}
                variant="contained"
                sx={{ mt: 3, py: 1.5, fontWeight: "bold" }}
                disabled={loading}
              >
                Login
              </LoadingButton>
            </form>
          </StyledPaper>
        )}
      </Box>
    </Box>
  );
}

export default Login;
