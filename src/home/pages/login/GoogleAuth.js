import React, { useState, useRef } from "react";
import {
  Box,
  Card,
  Grid,
  CardContent,
  TextField,
  Button,
  Typography,
  Paper,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

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
  const inputsRef = useRef([]);

  const handleChange = (e, idx) => {
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
    // focus to last pasted index (or last field)
    const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputsRef.current[nextIndex]?.focus();
  };

  const handleVerify = () => {
    navigate("/admin_dashboard");
    console.log("Verify OTP:", otp.join(""));
  };

  return (
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

        {/* OTP inputs container - centered and evenly spaced */}
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
              }}
            />
          ))}
        </Box>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3, py: 1.5, fontWeight: "bold" }}
          onClick={handleVerify}
        >
          Verify OTP
        </Button>

        <Typography variant="body2" sx={{ mt: 2 }}>
          OTP Entered: <strong>{otp.join("")}</strong>
        </Typography>
      </Grid>
    </StyledPaper>
  );
}
