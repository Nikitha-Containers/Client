import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  FormControlLabel,
  IconButton,
  TextField,
  Typography,
  Select,
  MenuItem,
  Checkbox,
  Button,
  Box,
  Stack,
  FormControl,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export const CoatingTypeModal = ({ open, onClose, onSubmit, value }) => {
  // Initial Values
  const coatingInitialVal = {
    sizing: [],
    insideColor: [],
    varnish: [],
    coatingColor: "",
    coatingCount: 1,
  };

  // Static Data
  const getCoatingType = {
    sizing: ["Vinyl Sizing"],
    coatingColor: ["Bombay White", "Mixing White", "Untoned White"],
    insideColor: ["Gold Lacquer", "Clear Lacquer", ],
    varnish: ["Glossy Finish", "Matte Finish"],
  };

  const [getCoatingValues, setCoatingValues] = useState(coatingInitialVal);

  useEffect(() => {
    if (open) {
      setCoatingValues(value || coatingInitialVal);
    }
  }, [open, value]);

  // Checkbox Handling
  const handleCheckbox = (section, item, checked) => {
    setCoatingValues((prev) => ({
      ...prev,
      [section]: checked
        ? [...prev[section], item]
        : prev[section].filter((i) => i !== item),
    }));
  };

  // Handle Submit
  const handleSubmit = () => {
    if (
      getCoatingValues.sizing.length === 0 &&
      getCoatingValues.insideColor.length === 0 &&
      getCoatingValues.varnish.length === 0
    ) {
      alert("Please select at least one coating option");
      return;
    }

    if (getCoatingValues?.coatingCount <= 0) {
      alert("Please enter valid coating count");
      return;
    }

    onSubmit(getCoatingValues);
  };

  // Handle Cancel
  const handleCancel = () => {
    setCoatingValues(coatingInitialVal);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: "16px" } }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" fontWeight="bold" color="#0a85cb">
          Coating Type
        </Typography>

        <IconButton onClick={handleCancel}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={1}>
          {/* Sizing */}
          <Box pl={5}>
            <Stack direction="row" spacing={6}>
              {getCoatingType?.sizing?.map((item) => (
                <FormControlLabel
                  key={item}
                  label={item}
                  control={
                    <Checkbox
                      color="success"
                      checked={getCoatingValues?.sizing?.includes(item)}
                      onChange={(e) =>
                        handleCheckbox("sizing", item, e.target.checked)
                      }
                    />
                  }
                />
              ))}

              {/* Coating Color */}
              <FormControl sx={{ minWidth: 200 }} size="small">
                <Select
                  value={getCoatingValues.coatingColor}
                  displayEmpty
                  onChange={(e) =>
                    setCoatingValues((prev) => ({
                      ...prev,
                      coatingColor: e.target.value,
                      coatingCount: 1,
                    }))
                  }
                  sx={{ borderRadius: "8px", marginTop: "3px" }}
                >
                  <MenuItem value="">Selct Coating Color</MenuItem>
                  {getCoatingType.coatingColor.map((color) => (
                    <MenuItem key={color} value={color}>
                      {color}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Box>

          {/* Inside Color */}
          <Typography variant="subtitle2">
            Inside food-grade lacquer :
          </Typography>

          <Box pl={5}>
            <Stack direction="row" spacing={3}>
              {getCoatingType?.insideColor?.map((item) => (
                <FormControlLabel
                  key={item}
                  label={item}
                  control={
                    <Checkbox
                      color="success"
                      checked={getCoatingValues?.insideColor?.includes(item)}
                      onChange={(e) =>
                        handleCheckbox("insideColor", item, e.target.checked)
                      }
                    />
                  }
                />
              ))}
            </Stack>
          </Box>

          {/* Varnish */}
          <Typography variant="subtitle2">Varnish :</Typography>

          <Box pl={5}>
            <Stack direction="row" spacing={3}>
              {getCoatingType?.varnish?.map((item) => (
                <FormControlLabel
                  key={item}
                  label={item}
                  control={
                    <Checkbox
                      color="success"
                      checked={getCoatingValues?.varnish?.includes(item)}
                      onChange={(e) =>
                        handleCheckbox("varnish", item, e.target.checked)
                      }
                    />
                  }
                />
              ))}
            </Stack>
          </Box>

          {/* Coating Count */}
          {getCoatingValues?.coatingColor && (
            <Box display="flex" alignItems="center" gap={2} pt={2}>
              <Typography variant="body2">Coating Count :</Typography>

              <TextField
                type="number"
                size="small"
                sx={{ width: 80 }}
                value={getCoatingValues.coatingCount}
                error={getCoatingValues.coatingCount <= 0}
                onChange={(e) =>
                  setCoatingValues((prev) => ({
                    ...prev,
                    coatingCount: Number(e.target.value),
                  }))
                }
              />

              {getCoatingValues.coatingCount <= 0 && (
                <Typography color="error" fontSize={13}>
                  Please enter valid value
                </Typography>
              )}
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          padding: "10px 18px 10px 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "end",
          columnGap: "15px",
        }}
      >
        <Button
          variant="outlined"
          color="error"
          onClick={handleCancel}
          sx={{
            borderRadius: "8px",
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleSubmit}
          sx={{
            borderRadius: "8px",
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

{
  /* Priting Color Modal  */
}

export const PrintingColorModal = ({ open, onClose, onSubmit, value }) => {
  // Initial State
  const printingInitVal = {
    normalColor: [],
    splColor: [],
  };

  // Static Data
  const getPrintColors = {
    normalColors: ["TP White", "Cyan", "Magenta", "Yellow", "Black"],
    splColors: ["SP 1", "SP 2", "SP 3", "SP 4", "SP 5", "SP 6"],
  };

  const [getPrintingValues, setPrintingValues] = useState(printingInitVal);

  useEffect(() => {
    if (open) {
      setPrintingValues(value || printingInitVal);
    }
  }, [open, value]);

  // Checkbox Handling
  const handleCheckbox = (section, item, checked) => {
    setPrintingValues((prev) => ({
      ...prev,
      [section]: checked
        ? [...prev[section], item]
        : prev[section].filter((i) => i !== item),
    }));
  };

  // Handle Submit
  const handleSubmit = () => {
    if (
      getPrintingValues.normalColor.length === 0 &&
      getPrintingValues.splColor.length === 0
    ) {
      alert("Please select at least one printing color");
      return;
    }

    onSubmit(getPrintingValues);
  };

  //Handle Cancel
  const handleCancel = () => {
    setPrintingValues(printingInitVal);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: "16px" } }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" fontWeight="bold" color="#0a85cb">
          Printing Color
        </Typography>
        <IconButton onClick={handleCancel}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={1}>
          {/* Normal Colors */}
          <Box pl={1}>
            <Stack direction="row">
              {getPrintColors?.normalColors?.map((item) => (
                <FormControlLabel
                  key={item}
                  control={
                    <Checkbox
                      color="success"
                      checked={getPrintingValues.normalColor.includes(item)}
                      onChange={(e) =>
                        handleCheckbox("normalColor", item, e.target.checked)
                      }
                    />
                  }
                  label={item}
                  sx={{ gap: 1 }}
                />
              ))}
            </Stack>
          </Box>
          {/* Special Colors */}
          <Typography variant="subtitle2">Special Colors :</Typography>

          <Box pl={1}>
            <Stack direction="row">
              {getPrintColors?.splColors?.map((item) => (
                <FormControlLabel
                  key={item}
                  control={
                    <Checkbox
                      color="success"
                      checked={getPrintingValues.splColor.includes(item)}
                      onChange={(e) =>
                        handleCheckbox("splColor", item, e.target.checked)
                      }
                    />
                  }
                  label={item}
                  sx={{ gap: 1 }}
                />
              ))}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      {/* Action Button */}
      <DialogActions
        sx={{
          padding: "10px 18px 10px 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "end",
          columnGap: "15px",
        }}
      >
        <Button
          variant="outlined"
          color="error"
          onClick={handleCancel}
          sx={{
            borderRadius: "8px",
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleSubmit}
          sx={{
            borderRadius: "8px",
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
