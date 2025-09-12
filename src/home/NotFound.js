import React from "react";
import { Link } from "react-router-dom";
import "../home/components/components.scss";
import { Grid, Box, Typography } from "@mui/material";
import { Grid3x3 } from "@mui/icons-material";

function NotFound() {
  return (
    <>
      <Box className="Dashboard-con">
        <Box className="page-layout" sx={{ marginTop: 1 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2.5} className="four_zero_four_bg">
              <Grid
                size={12}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "arvo , serif",
                    fontSize: "80px",
                    fontWeight: "bold",
                    color: "#3b3b3b",
                  }}
                >
                  404
                </Typography>
              </Grid>

              <Grid
                size={12}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <h3 className="h2" style={{ marginTop: "150px" }}>
                  Looks like you're lost
                </h3>

                <p style={{ fontSize: "16px", color: "#555" }}>
                  The page you are looking for is not available!
                </p>

                <Link to="/" className="link_404">
                  Go to Home
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default NotFound;
