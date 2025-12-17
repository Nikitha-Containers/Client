import {
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  DialogActions,
  FormControl,
  Stack,
} from "@mui/joy";
import CloseIcon from "@mui/icons-material/Close";

export const CoatingTypeModal = ({ open, onClose, onSubmit, value }) => {
  // Initial Values
  const coatingInitialVal = {
    sizing: [],
    insideColor: [],
    varnish: [],
    whitecount: 1,
  };

  // Static Data
  const getCoatingType = {
    sizing: ["Vinyl Sizing", "White"],
    insideColor: ["Gold", "Clear White", "Others"],
    varnish: ["Glossy Finish", "Matte Finish"],
  };

  const [getCoatingValues, setCoatingValues] = useState(coatingInitialVal);

  useEffect(() => {
    if (open) {
      setCoatingValues(value || coatingInitialVal);
    }
  }, [open, value]);

  // Select All
  const handleSelectAll = (checked) => {
    setCoatingValues(
      checked
        ? {
            sizing: [...getCoatingType?.sizing],
            insideColor: [...getCoatingType?.insideColor],
            varnish: [...getCoatingType?.varnish],
            whitecount: getCoatingValues?.whitecount,
          }
        : coatingInitialVal
    );
  };

  // Checkbox Handling
  const handleCheckbox = (section, item, checked) => {
    setCoatingValues((prev) => {
      const exists = prev[section].includes(item);

      const updatedList = checked
        ? exists
          ? prev[section]
          : [...prev[section], item]
        : prev[section].filter((i) => i !== item);

      return {
        ...prev,
        [section]: updatedList,
        whitecount:
          section === "sizing" && item === "White" && !checked
            ? 0
            : prev.whitecount,
      };
    });
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

    if (
      getCoatingValues.sizing.includes("White") &&
      getCoatingValues.whitecount <= 0
    ) {
      alert("Please enter valid white coating count");
      return;
    }

    onSubmit(getCoatingValues);
  };

  // Handle Cancel
  const handleCancel = () => {
    setCoatingValues(coatingInitialVal);
    onClose();
  };

  // Select All Active Check
  const selectAllChecked =
    getCoatingValues?.sizing?.length === getCoatingType?.sizing?.length &&
    getCoatingValues?.insideColor?.length ===
      getCoatingType?.insideColor?.length &&
    getCoatingValues?.varnish?.length === getCoatingType?.varnish?.length;

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: "16px" },
      }}
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
        <Stack spacing={2}>
          {/* Select All */}
          <FormControlLabel
            control={
              <Checkbox
                color="success"
                checked={selectAllChecked}
                onChange={(e) => handleSelectAll(e.target.checked)}
                label="Select All"
              />
            }
          />

          {/* Sizing */}
          <Box pl={5}>
            <Stack direction="row" spacing={7}>
              {getCoatingType?.sizing?.map((item) => (
                <FormControlLabel
                  key={item}
                  control={
                    <Checkbox
                      color="success"
                      checked={getCoatingValues?.sizing?.includes(item)}
                      onChange={(e) =>
                        handleCheckbox("sizing", item, e.target.checked)
                      }
                    />
                  }
                  label={item}
                  sx={{ gap: 1 }}
                />
              ))}
            </Stack>
          </Box>

          {/* Inside Color */}
          <Typography variant="subtitle2">
            Inside food-grade lacquer :
          </Typography>
          <Box pl={5}>
            <Stack direction="row" spacing={13}>
              {getCoatingType?.insideColor?.map((item) => (
                <FormControlLabel
                  key={item}
                  label={item}
                  sx={{ gap: 1 }}
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
            <Stack direction="row" spacing={5}>
              {getCoatingType?.varnish?.map((item) => (
                <FormControlLabel
                  key={item}
                  label={item}
                  sx={{ gap: 1 }}
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

          {/* White Count */}
          {getCoatingValues?.sizing?.includes("White") && (
            <Box display="flex" alignItems="center" gap={2} pt={2}>
              <Typography variant="body2">White Coating Count :</Typography>
              <FormControl>
                <TextField
                  type="number"
                  size="small"
                  sx={{ width: "70px", height: "40px" }}
                  error={getCoatingValues.whitecount <= 0 ? true : false}
                  value={getCoatingValues.whitecount}
                  onChange={(e) =>
                    setCoatingValues((prev) => ({
                      ...prev,
                      whitecount: Number(e.target.value),
                    }))
                  }
                />
              </FormControl>
              {getCoatingValues.whitecount <= 0 ? (
                <Typography sx={{ color: "#d32f2f", fontSize: "14px" }}>
                  Please Enter The Correct Value
                </Typography>
              ) : null}
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
        <Button variant="solid" color="success" onClick={handleSubmit}>
          Save
        </Button>
        <Button variant="outlined" color="danger" onClick={handleCancel}>
          Cancel
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
    if (open && value) {
      setPrintingValues(value);
    }
  }, [open, value]);

  // Select All

  const handleSelectAll = (checked) => {
    if (checked) {
      setPrintingValues({
        normalColor: [...getPrintColors.normalColors],
        splColor: [...getPrintColors.splColors],
      });
    } else {
      setPrintingValues(printingInitVal);
    }
  };

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

  // Select All Active Check
  const selectAllChecked =
    getPrintingValues?.normalColor?.length ===
      getPrintColors?.normalColors?.length &&
    getPrintingValues?.splColor?.length === getPrintColors?.splColors?.length;

  return (
    <>
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
          <Stack spacing={3}>
            {/* Select All */}
            <FormControlLabel
              control={
                <Checkbox
                  color="success"
                  checked={selectAllChecked}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  label="Select All"
                />
              }
            />

            {/* Normal Colors */}
            <Box pl={5}>
              <Stack direction="row" spacing={3}>
                {getPrintColors?.normalColors?.map((item) => (
                  <FormControlLabel
                    key={item}
                    control={
                      <Checkbox
                        color="success"
                        checked={getPrintingValues?.normalColor?.includes(item)}
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
            <Box pl={5}>
              <Stack direction="row" spacing={3}>
                {getPrintColors?.splColors?.map((item) => (
                  <FormControlLabel
                    key={item}
                    control={
                      <Checkbox
                        color="success"
                        checked={getPrintingValues?.splColor?.includes(item)}
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
          <Button variant="solid" color="success" onClick={handleSubmit}>
            Save
          </Button>
          <Button variant="outlined" color="danger" onClick={handleCancel}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
