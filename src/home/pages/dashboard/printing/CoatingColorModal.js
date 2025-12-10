import { useState } from "react";
import {
  Box,
  Modal,
  Typography,
  Checkbox,
  FormControlLabel,
  Divider,
  Stack,
  Button,
} from "@mui/material";

// Coating Type Modal Component
export const CoatingTypeModal = ({
  open,
  onClose,
  selectedComponent,
  onSubmit,
}) => {
  const [selectedOptions, setSelectedOptions] = useState({
    "Select All": false,
    "Vinyl sizing": false,
    White: false,
    Gold: false,
    "Clear White": false,
    Others: false,
    "Glossy finish": false,
    "Matte finish": false,
  });

  const [whiteCoatingCount, setWhiteCoatingCount] = useState(3);

  const handleCheckboxChange = (option) => {
    if (option === "Select All") {
      const allChecked = !selectedOptions["Select All"];
      const newState = Object.keys(selectedOptions).reduce((acc, key) => {
        acc[key] = allChecked;
        return acc;
      }, {});
      setSelectedOptions(newState);
      if (allChecked) {
        setWhiteCoatingCount();
      } else {
        setWhiteCoatingCount(0);
      }
    } else {
      setSelectedOptions((prev) => ({
        ...prev,
        [option]: !prev[option],
        "Select All": false, 
      }));

      if (option === "White" || option === "Vinyl sizing") {
        const newCount = selectedOptions[option]
          ? whiteCoatingCount - 1
          : whiteCoatingCount + 1;
        setWhiteCoatingCount(Math.max(0, newCount));
      }
    }
  };

  const handleSubmit = () => {
    const selected = Object.entries(selectedOptions)
      .filter(([_, isChecked]) => isChecked)
      .map(([key]) => key)
      .filter((key) => key !== "Select All");

    onSubmit(selected.join(", "));
  };

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" gutterBottom>
          Coating Type – {selectedComponent}
        </Typography>

        <Stack spacing={2}>

          <FormControlLabel
            control={
              <Checkbox
                checked={selectedOptions["Select All"]}
                onChange={() => handleCheckboxChange("Select All")}
              />
            }
            label="Select All"
          />


          <Box pl={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedOptions["Vinyl sizing"]}
                  onChange={() => handleCheckboxChange("Vinyl sizing")}
                />
              }
              label="Vinyl sizing"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedOptions["White"]}
                  onChange={() => handleCheckboxChange("White")}
                />
              }
              label="White"
            />
          </Box>

          <Divider />


          <Typography variant="subtitle2">
            Inside food-grade lacquer :
          </Typography>
          <Box pl={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedOptions["Gold"]}
                  onChange={() => handleCheckboxChange("Gold")}
                />
              }
              label="Gold"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedOptions["Clear White"]}
                  onChange={() => handleCheckboxChange("Clear White")}
                />
              }
              label="Clear White"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedOptions["Others"]}
                  onChange={() => handleCheckboxChange("Others")}
                />
              }
              label="Others"
            />
          </Box>

          <Divider />


          <Typography variant="subtitle2">Varnish :</Typography>
          <Box pl={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedOptions["Glossy finish"]}
                  onChange={() => handleCheckboxChange("Glossy finish")}
                />
              }
              label="Glossy finish"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedOptions["Matte finish"]}
                  onChange={() => handleCheckboxChange("Matte finish")}
                />
              }
              label="Matte finish"
            />
          </Box>

          <Divider />


          <Typography variant="subtitle2">White Coating Count :</Typography>
          <Typography variant="body2">
            Coating Count: {whiteCoatingCount}
          </Typography>

          {/* Action Buttons */}
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}
          >
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Submit
            </Button>
          </Box>
        </Stack>
      </Box>
    </Modal>
  );
};

// Printing Color Modal Component
export const PrintingColorModal = ({
  open,
  onClose,
  selectedComponent,
  onSubmit,
}) => {
  const [selectedColors, setSelectedColors] = useState({
    "Select All": false,
    "To White": false,
    Cyan: false,
    Magenta: false,
    Yellow: false,
    Black: false,
    Sp1: false,
    Sp2: false,
    Sp3: false,
    Sp4: false,
    Sp5: false,
    Sp6: false,
  });

  const handleCheckboxChange = (color) => {
    if (color === "Select All") {
      const allChecked = !selectedColors["Select All"];
      const newState = Object.keys(selectedColors).reduce((acc, key) => {
        acc[key] = allChecked;
        return acc;
      }, {});
      setSelectedColors(newState);
    } else {
      setSelectedColors((prev) => ({
        ...prev,
        [color]: !prev[color],
        "Select All": false,
      }));
    }
  };

  const handleSubmit = () => {
    const selected = Object.entries(selectedColors)
      .filter(([_, isChecked]) => isChecked)
      .map(([key]) => key)
      .filter((key) => key !== "Select All");

    onSubmit(selected.join(", "));
  };

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" gutterBottom>
          Printing Color - {selectedComponent}
        </Typography>

        <Stack spacing={2}>

          <FormControlLabel
            control={
              <Checkbox
                checked={selectedColors["Select All"]}
                onChange={() => handleCheckboxChange("Select All")}
              />
            }
            label="Select All"
          />


          <Box pl={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedColors["To White"]}
                  onChange={() => handleCheckboxChange("To White")}
                />
              }
              label="To White"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedColors["Cyan"]}
                  onChange={() => handleCheckboxChange("Cyan")}
                />
              }
              label="Cyan"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedColors["Magenta"]}
                  onChange={() => handleCheckboxChange("Magenta")}
                />
              }
              label="Magenta"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedColors["Yellow"]}
                  onChange={() => handleCheckboxChange("Yellow")}
                />
              }
              label="Yellow"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedColors["Black"]}
                  onChange={() => handleCheckboxChange("Black")}
                />
              }
              label="Black"
            />
          </Box>

          <Divider />


          <Typography variant="subtitle2">Special Colors :</Typography>
          <Box pl={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedColors["Sp1"]}
                  onChange={() => handleCheckboxChange("Sp1")}
                />
              }
              label="Sp1"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedColors["Sp2"]}
                  onChange={() => handleCheckboxChange("Sp2")}
                />
              }
              label="Sp2"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedColors["Sp3"]}
                  onChange={() => handleCheckboxChange("Sp3")}
                />
              }
              label="Sp3"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedColors["Sp4"]}
                  onChange={() => handleCheckboxChange("Sp4")}
                />
              }
              label="Sp4"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedColors["Sp5"]}
                  onChange={() => handleCheckboxChange("Sp5")}
                />
              }
              label="Sp5"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedColors["Sp6"]}
                  onChange={() => handleCheckboxChange("Sp6")}
                />
              }
              label="Sp6"
            />
          </Box>

          <Divider />

          {/* Action Buttons */}
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}
          >
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Submit
            </Button>
          </Box>
        </Stack>
      </Box>
    </Modal>
  );
};
