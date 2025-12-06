// PrintingColorDialog.js
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
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const PrintingColorDialog = ({
  open,
  onClose,
  onSelect,
  currentValue = "", // Changed from [] to ""
}) => {
  const defaultColors = ["Tp White", "Cyan", "Magenta", "Yellow", "Black"];
  const specialColors = ["Sp1", "Sp2", "Sp3", "Sp4", "Sp5", "Sp6"];

  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (open) {
      // Convert string to array when opening dialog
      if (currentValue && typeof currentValue === "string") {
        const selectedArray = currentValue.split(", ").filter(Boolean);
        setSelected(selectedArray);
      } else if (Array.isArray(currentValue)) {
        setSelected(currentValue);
      } else {
        setSelected([]);
      }
    }
  }, [currentValue, open]);

  const toggleColor = (color) => {
    setSelected((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const allSelected =
    selected.length === defaultColors.length + specialColors.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelected([]);
    } else {
      setSelected([...defaultColors, ...specialColors]);
    }
  };

  const handleSubmit = () => {
    // Convert array back to string for display
    const displayValue = selected.join(", ");
    onSelect(displayValue);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 16,
          top: 16,
          zIndex: 1,
          color: "#d32f2f",
          backgroundColor: "rgba(211,47,47,0.08)",
          "&:hover": { backgroundColor: "rgba(211,47,47,0.16)" },
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
        Printing Color
      </DialogTitle>

      <Box sx={{ display: "flex", alignItems: "center", px: 1, mt: 1 }}>
        <Checkbox
          checked={allSelected}
          onChange={handleSelectAll}
          sx={{ transform: "scale(1.2)" }}
        />
        <Typography fontSize="1rem">Select All</Typography>
      </Box>

      <DialogContent sx={{ px: 5 }}>
        <Grid container spacing={2}>
          {defaultColors.map((color) => (
            <Grid item xs={6} key={color}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selected.includes(color)}
                    onChange={() => toggleColor(color)}
                  />
                }
                label={<span style={{ fontSize: "1rem" }}>{color}</span>}
              />
            </Grid>
          ))}
        </Grid>

        {/* Special Colors */}
        <Typography sx={{ mt: 3, mb: 1, fontWeight: 500 }}>
          Special Colors :
        </Typography>

        <Grid container spacing={2}>
          {specialColors.map((color) => (
            <Grid item xs={4} key={color}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selected.includes(color)}
                    onChange={() => toggleColor(color)}
                  />
                }
                label={<span style={{ fontSize: "1rem" }}>{color}</span>}
              />
            </Grid>
          ))}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <MuiButton variant="outlined" color="inherit" onClick={onClose}>
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

export default PrintingColorDialog;
