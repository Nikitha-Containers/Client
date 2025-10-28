import { useState, useRef, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import server from "../../../server/server";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 400,
  width: "100%",
  borderRadius: theme.spacing(2),
  boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.1)",
  backgroundColor: "#fff",
  textAlign: "center",
}));

export default function GoogleAuth() {
  const navigate = useNavigate();
  const OTP_LENGTH = 6;
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info", // 'success', 'error', 'warning', 'info'
  });
  const inputsRef = useRef([]);

  // Auto-verify when OTP is complete
  useEffect(() => {
    const otpCode = otp.join("");
    if (otpCode.length === OTP_LENGTH && !isVerifying) {
      handleVerify();
    }
  }, [otp]);

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleChange = async (e, idx) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 1);
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);

    if (val && idx < OTP_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace") {
      if (!otp[idx] && idx > 0) {
        // if current empty, move back
        inputsRef.current[idx - 1]?.focus();
      } else {
        // clear current value (handled by onChange)
      }
    }
    if (e.key === "ArrowLeft" && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowRight" && idx < OTP_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData)
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    const arr = Array.from({ length: OTP_LENGTH }).map(
      (_, i) => pasted[i] || ""
    );
    setOtp(arr);
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    const adminID = sessionStorage.getItem("adminID");

    if (isVerifying || otpCode.length !== OTP_LENGTH) {
      return;
    }

    setIsVerifying(true);

    try {
      const res = await server.post("/admin/verify-otp", {
        adminID,
        otp: otpCode,
      });

      if (res.data.success) {
        showSnackbar("OTP Verified Successfully", "success");
        sessionStorage.setItem("isLoggedIn", "true");

        // Small delay to show success message before redirect
        setTimeout(() => {
          navigate("/admin_dashboard");
        }, 1500);
      } else {
        showSnackbar(
          res.data.message || "Invalid OTP. Please try again.",
          "error"
        );
        setOtp(Array(OTP_LENGTH).fill(""));
        inputsRef.current[0]?.focus();
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      showSnackbar(
        error.response?.data?.message ||
          "OTP verification failed. Please try again.",
        "error"
      );
      setOtp(Array(OTP_LENGTH).fill(""));
      inputsRef.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // Check if OTP is complete but not yet verifying (auto-verify state)
  const isOtpComplete = otp.join("").length === OTP_LENGTH;
  const isAutoVerifying = isOtpComplete && !isVerifying;

  return (
    <>
      <StyledPaper>
        <Grid
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h5"
            mb={2.5}
            fontWeight="500"
            sx={{ fontFamily: "poppins , sans-serif" }}
          >
            Enter OTP
          </Typography>

          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Please enter the 6-digit verification code
          </Typography>

          {/* OTP inputs container */}
          <Box
            onPaste={handlePaste}
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "center",
              gap: 2,
              pb: 1,
            }}
          >
            {otp.map((digit, idx) => (
              <TextField
                key={idx}
                inputRef={(el) => (inputsRef.current[idx] = el)}
                value={digit}
                onChange={(e) => handleChange(e, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                variant="outlined"
                size="small"
                disabled={isVerifying}
                error={snackbar.severity === "error" && snackbar.open}
                inputProps={{
                  maxLength: 1,
                  style: {
                    textAlign: "center",
                    fontSize: 20,
                    width: 56,
                    height: 56,
                    padding: "12px 8px",
                    boxSizing: "border-box",
                  },
                }}
                sx={{
                  width: 56,
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor:
                        snackbar.severity === "error" ? "#f44336" : "#1976d2",
                    },
                  },
                }}
              />
            ))}
          </Box>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              mt: 3,
              py: 1.5,
              fontWeight: "bold",
              position: "relative",
              minHeight: "48px",
            }}
            onClick={handleVerify}
            disabled={isVerifying || !isOtpComplete}
          >
            {isVerifying ? (
              <>
                <CircularProgress
                  size={24}
                  sx={{
                    color: "white",
                    position: "absolute",
                    left: "50%",
                    marginLeft: "-12px",
                  }}
                />
                <span style={{ opacity: 0 }}>Verifying...</span>
              </>
            ) : isAutoVerifying ? (
              "Verifying..."
            ) : (
              "Verify OTP"
            )}
          </Button>
        </Grid>
      </StyledPaper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
