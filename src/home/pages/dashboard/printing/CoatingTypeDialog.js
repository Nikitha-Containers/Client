import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Button as MuiButton,
  Box,
  Typography,
  Grid,
  TextField,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const CoatingTypeDialog = ({ open, onClose, onSelect, currentValue = "" }) => {
  const [initialOpt, setInitialOpt] = useState({
    vinyl: false,
    white: false,
    gold: false,
    clearWhite: false,
    others: false,
    glossyFinish: false,
    matteFinish: false,
    coatingCount: "",
  });

  const [opt, setOpt] = useState({ ...initialOpt });

  useEffect(() => {
    if (open) {
      const newOpt = {
        vinyl: false,
        white: false,
        gold: false,
        clearWhite: false,
        others: false,
        glossyFinish: false,
        matteFinish: false,
        coatingCount: "",
      };

      const value = currentValue || "";
      if (value.includes("Vinyl")) newOpt.vinyl = true;
      if (value.includes("White")) newOpt.white = true;
      if (value.includes("Gold")) newOpt.gold = true;
      if (value.includes("Clear White")) newOpt.clearWhite = true;
      if (value.includes("Others")) newOpt.others = true;
      if (value.includes("Gloss")) newOpt.glossyFinish = true;
      if (value.includes("Matt")) newOpt.matteFinish = true;

      const coatingMatch = value.match(/(\d+)\s*coats?/i);
      if (coatingMatch && newOpt.white) {
        newOpt.coatingCount = coatingMatch[1];
      }

      setOpt(newOpt);
      setInitialOpt(newOpt);
    }
  }, [open, currentValue]);

  const toggle = (name) => {
    setOpt({ ...opt, [name]: !opt[name] });
  };

  const handleSelectAll = () => {
    const allSelected = Object.keys(opt).every((key) =>
      typeof opt[key] === "boolean" ? opt[key] : true
    );

    const newOpt = { ...opt };
    Object.keys(newOpt).forEach((key) => {
      if (typeof newOpt[key] === "boolean") {
        newOpt[key] = !allSelected;
      }
    });

    setOpt(newOpt);
  };

  const handleSubmit = () => {
    const selectedOptions = [];

    if (opt.vinyl) selectedOptions.push("Vinyl sizing");
    if (opt.white) selectedOptions.push("White");
    if (opt.gold) selectedOptions.push("Gold");
    if (opt.clearWhite) selectedOptions.push("Clear White");
    if (opt.others) selectedOptions.push("Others");
    if (opt.glossyFinish) selectedOptions.push("Glossy finish");
    if (opt.matteFinish) selectedOptions.push("Matte finish");

    if (opt.white && opt.coatingCount) {
      selectedOptions.push(`${opt.coatingCount} coats`);
    }

    const selectedValue =
      selectedOptions.length > 0 ? selectedOptions.join(", ") : "";

    if (onSelect) {
      onSelect(selectedValue);
    }

    onClose();
  };

  const handleCancel = () => {
    setOpt({ ...initialOpt });
    onClose();
  };

  const allSelected = Object.keys(opt).every((key) =>
    typeof opt[key] === "boolean" ? opt[key] : true
  );

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 5,
          paddingBottom: 1,
          position: "relative",
        },
      }}
    >
      <IconButton
        aria-label="close"
        onClick={handleCancel}
        sx={{
          position: "absolute",
          right: 16,
          top: 16,
          zIndex: 1,
          color: "#d32f2f",
          backgroundColor: "rgba(211, 47, 47, 0.08)",
          "&:hover": {
            backgroundColor: "rgba(211, 47, 47, 0.16)",
          },
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogTitle
        sx={{
          bgcolor: "#f5f5f5",
          fontSize: "1.4rem",
          fontWeight: 600,
          color: "#0070CC",
          paddingBottom: 1,
          paddingRight: 6,
        }}
      >
        Coating Type
      </DialogTitle>

      <Box sx={{ display: "flex", alignItems: "center", px: 3, mt: 1 }}>
        <Checkbox
          checked={allSelected}
          onChange={handleSelectAll}
          sx={{ transform: "scale(1.2)" }}
        />
        <Typography fontSize="1rem">Select All</Typography>
      </Box>

      <DialogContent sx={{ px: 5 }}>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={opt.vinyl}
                  onChange={() => toggle("vinyl")}
                />
              }
              label={<span style={{ fontSize: "1rem" }}>Vinyl sizing</span>}
            />
          </Grid>

          <Grid item xs={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={opt.white}
                  onChange={() => toggle("white")}
                />
              }
              label={<span style={{ fontSize: "1rem" }}>White</span>}
            />
          </Grid>
        </Grid>

        <Typography sx={{ mt: 3, mb: 1, fontWeight: 500 }}>
          Inside food-grade lacquer :
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={4}>
            <FormControlLabel
              control={
                <Checkbox checked={opt.gold} onChange={() => toggle("gold")} />
              }
              label="Gold"
            />
          </Grid>

          <Grid item xs={4}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={opt.clearWhite}
                  onChange={() => toggle("clearWhite")}
                />
              }
              label="Clear White"
            />
          </Grid>

          <Grid item xs={4}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={opt.others}
                  onChange={() => toggle("others")}
                />
              }
              label="Others"
            />
          </Grid>
        </Grid>

        <Typography sx={{ mt: 3, mb: 1, fontWeight: 500 }}>
          Varnish :
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={opt.glossyFinish}
                  onChange={() => toggle("glossyFinish")}
                />
              }
              label="Glossy finish"
            />
          </Grid>

          <Grid item xs={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={opt.matteFinish}
                  onChange={() => toggle("matteFinish")}
                />
              }
              label="Matte finish"
            />
          </Grid>
        </Grid>

        <Typography sx={{ mt: 3, mb: 1, fontWeight: 500 }}>
          White Coating Count :
        </Typography>

        <TextField
          size="small"
          value={opt.coatingCount}
          onChange={(e) => {
            const value = e.target.value;
            if (
              /^\d*$/.test(value) &&
              (value === "" || parseInt(value) <= 10)
            ) {
              setOpt({ ...opt, coatingCount: value });
            }
          }}
          inputProps={{
            maxLength: 2,
            inputMode: "numeric",
          }}
          sx={{ width: 80 }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <MuiButton variant="outlined" color="inherit" onClick={handleCancel}>
          Cancel
        </MuiButton>

        <MuiButton
          variant="contained"
          onClick={handleSubmit}
          sx={{
            bgcolor: "#0070CC",
            "&:hover": { bgcolor: "#005da8" },
          }}
        >
          Submit
        </MuiButton>
      </DialogActions>
    </Dialog>
  );
};

export default CoatingTypeDialog;
