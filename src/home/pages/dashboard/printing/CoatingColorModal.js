import {
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Typography,
} from "@mui/material";
import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Checkbox,
  DialogActions,
  Divider,
  FormControl,
  Input,
  Stack,
} from "@mui/joy";
export const CoatingTypeModal = ({
  open,
  onClose,
  selectedComponent,
  onSubmit,
}) => {
  const [selectedoptions, setSelectedOptions] = useState({
    "Select All": false,
    "Vinyl sizing": false,
    White: false,
    Gold: false,
    "Clear White": false,
    Others: false,
    "Glossy finish": false,
    "Matte finish": false,
  });

  const [whiteCoatingCount, setWhiteCoatingCount] = useState(0);

  console.log("Child rendered");
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: "16px",
          },
        }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography
            style={{ color: "#0a85cb", textDecoration: "none" }}
            variant="h6"
            fontWeight="bold"
          >
            Coating Type
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            <FormControlLabel
              control={<Checkbox color="success" label="Select All" />}
            />

            <Box pl={5}>
              <Stack direction="row" spacing={5}>
                {["Vinylm Sizing", "White"].map((item) => (
                  <FormControlLabel
                    key={item}
                    control={<Checkbox color="success" />}
                    label={item}
                    sx={{ gap: 1 }}
                  />
                ))}
              </Stack>
            </Box>

            <Typography variant="subtitle2">
              Inside food-grade lacquer :
            </Typography>
            <Box pl={5}>
              <Stack direction="row" spacing={13}>
                {["Gold", "Clear White", "Others"].map((item) => (
                  <FormControlLabel
                    key={item}
                    control={<Checkbox color="success" />}
                    label={item}
                    sx={{ gap: 1 }}
                  />
                ))}
              </Stack>
            </Box>

            <Typography variant="subtitle2">Varnish :</Typography>
            <Box pl={5}>
              <Stack direction="row" spacing={5}>
                {["Glossy Finish", "Matte Finish"].map((item) => (
                  <FormControlLabel
                    key={item}
                    control={<Checkbox color="success" />}
                    label={item}
                    sx={{ gap: 1 }}
                  />
                ))}
              </Stack>
            </Box>

            <Typography variant="subtitle2">White Coating Count :</Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body2">Count : </Typography>
              <FormControl>
                <Input
                  color="neutral"
                  variant="outlined"
                  type="number"
                  size="sm"
                  sx={{ width: "60px" }}
                />
              </FormControl>
            </Box>
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
          <Button variant="solid" color="success">
            Submit
          </Button>
          <Button variant="outlined" color="danger">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

{
  /* Priting Color Modal  */
}
export const PrintingColorModal = ({
  open,
  onClose,
  selectedComponent,
  onSubmit,
}) => {
  const [selectedColor, setSelected] = useState({
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

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: "16px",
          },
        }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography
            style={{ color: "#0a85cb", textDecoration: "none" }}
            variant="h6"
            fontWeight="bold"
          >
            Printing color
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <FormControlLabel
              control={<Checkbox color="success" label="Select All" />}
            />
            <Box pl={5}>
              <Stack direction="row" spacing={3}>
                {["TP White", "Cyan", "Magnetta", "Yellow", "Black"].map(
                  (item) => (
                    <FormControlLabel
                      key={item}
                      control={<Checkbox color="success" />}
                      label={item}
                      sx={{ gap: 1 }}
                    />
                  )
                )}
              </Stack>
            </Box>

            <Typography variant="subtitle2">Special Colors :</Typography>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
};
