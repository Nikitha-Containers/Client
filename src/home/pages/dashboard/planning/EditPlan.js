import { useState } from "react";
import Grid from "@mui/material/Grid";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import {
  FormGroup,
  TextField,
  Typography,
  Select,
  MenuItem,
  Box,
  Step,
  StepLabel,
  Stepper,
  styled,
  Button,
  Modal,
} from "@mui/material";
import Check from "@mui/icons-material/Check";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";
import "../Dashboard.scss";
import { Link, useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import upsImage from "../../../../assets/Pagesimage/ups-image.jpg";
import { useLocation } from "react-router-dom";

const stepsStatus = [
  { label: "Design Team", status: "completed" },
  { label: "Coating Team", status: "completed" },
  { label: "Printing Team", status: "active" },
  { label: "Varnish Team", status: "pending" },
  { label: "Fabrication Team", status: "pending" },
];

const lastCompletedOrActiveIndex = [...stepsStatus]
  .reverse()
  .findIndex((step) => step.status === "active" || step.status === "completed");

const activeStep =
  lastCompletedOrActiveIndex >= 0
    ? stepsStatus.length - 1 - lastCompletedOrActiveIndex
    : 0;

const CustomConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 30,
  },
  [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]: {
    backgroundColor: "#2196f3",
  },
  [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: {
    backgroundColor: "#2196f3",
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 5,
    border: 0,
    backgroundColor: "#d5d6d6",
    borderRadius: 1,
  },
}));

const StepIconRoot = styled("div")(({ ownerState }) => {
  const { active, completed } = ownerState;

  return {
    backgroundColor: completed ? "#2196f3" : active ? "#f44336" : "#fff",
    zIndex: 1,
    color: "#fff",
    width: 56,
    height: 56,
    display: "flex",
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: 600,
    fontSize: "1.1rem",
    border: active
      ? "3px solid #f44336"
      : completed
      ? "3px solid #2196f3"
      : "3px solid #d5d6d6",
  };
});

function CustomStepIcon(props) {
  const { active, completed, icon } = props;
  const iconColor = active ? "#fff" : completed ? "#fff" : "#d5d6d6";

  return (
    <StepIconRoot ownerState={{ completed, active }}>
      {completed ? (
        <Check sx={{ color: "#fff" }} />
      ) : (
        <span style={{ color: iconColor }}>{icon}</span>
      )}
    </StepIconRoot>
  );
}

function EditPlan() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const location = useLocation();
  const rowData = location.state;


  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    outline: 0,
    maxWidth: "90vw",
    maxHeight: "90vh",
  };
  return (
    <Box className="Dashboard-con">
      <Box className="breadcrump-con">
        <Box className="main-title">
          <div className="main-inner-txts">
            <Link
              style={{ color: "#0a85cb", textDecoration: "none" }}
              to={"/planning"}
            >
              Planning
            </Link>
            <KeyboardArrowRightIcon sx={{ color: "#0a85cb" }} />
            <div>Edit Plan</div>
          </div>
        </Box>
      </Box>

      <Box className="page-layout" sx={{ marginTop: 1 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={2.5}>
            <Grid size={3}>
              <FormGroup>
                <Typography mb={1}>SO Number</Typography>
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="text"
                  value={rowData?.saleorder_no || ""}
                />
              </FormGroup>
            </Grid>

            <Grid size={3}>
              <FormGroup>
                <Typography mb={1}>SO Date</Typography>
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="date"
                  value={rowData?.posting_date || ""}
                />
              </FormGroup>
            </Grid>

            <Grid size={3}>
              <FormGroup>
                <Typography mb={1}>Customer Name</Typography>
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="text"
                  value={rowData?.customer_name || ""}
                />
              </FormGroup>
            </Grid>

            <Grid size={3}>
              <FormGroup>
                <Typography mb={1}>Sales Person</Typography>
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="text"
                  value={rowData?.sales_person || ""}
                />
              </FormGroup>
            </Grid>

            <Grid size={3}>
              <FormGroup>
                <Typography mb={1}>Dimensions</Typography>
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="text"
                  value={rowData?.item_description || ""}
                />
              </FormGroup>
            </Grid>

            {/* <Grid size={3}>
              <FormGroup>
                <Typography mb={1}>Size</Typography>
                <TextField id="outlined-size-small" name="" size="small" />
              </FormGroup>
            </Grid> */}

            <Grid size={3}>
              <FormGroup>
                <Typography mb={1}>Qty</Typography>
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="number"
                  value={rowData?.quantity}
                />
              </FormGroup>
            </Grid>

            <Grid size={3}>
              <FormGroup>
                <Typography mb={1}>MC</Typography>
                <TextField id="outlined-size-small" name="" size="small" />
              </FormGroup>
            </Grid>

            <Grid size={3}>
              <FormGroup>
                <Typography mb={1}>Print Start Date</Typography>
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="date"
                />
              </FormGroup>
            </Grid>

            <Grid size={3}>
              <FormGroup>
                <Typography mb={1}>Print End Date</Typography>
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="date"
                />
              </FormGroup>
            </Grid>

            <Grid size={3}>
              <FormGroup>
                <Typography mb={1}>Shift</Typography>
                <TextField id="outlined-size-small" name="" size="small" />
              </FormGroup>
            </Grid>

            <Grid size={3}>
              <FormGroup fullWidth>
                <Typography mb={1}>Fab Site</Typography>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={10}
                  size="small"
                >
                  <MenuItem value={10}>1.</MenuItem>
                  <MenuItem value={20}>2.</MenuItem>
                  <MenuItem value={30}>3.</MenuItem>
                </Select>
              </FormGroup>
            </Grid>
          </Grid>
        </Box>

        {/* ✅ Stepper Section */}
        <Box sx={{ width: "100%", mt: 8 }}>
          <Stepper
            alternativeLabel
            activeStep={activeStep}
            connector={<CustomConnector />}
          >
            {stepsStatus.map((step) => {
              const isCompleted = step.status === "completed";
              const isActive = step.status === "active";

              return (
                <Step key={step.label} completed={isCompleted}>
                  <StepLabel StepIconComponent={CustomStepIcon}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        fontFamily: "system-ui",
                        color: isCompleted
                          ? "#2196f3"
                          : isActive
                          ? "#f44336"
                          : "#858485",
                      }}
                    >
                      {step.label}
                    </Typography>
                  </StepLabel>
                </Step>
              );
            })}
          </Stepper>
        </Box>

        <Box sx={{ flexGrow: 1, mt: 8 }}>
          <Grid container spacing={2.5} sx={{ alignItems: "end" }}>
            <Grid size={8}>
              <FormGroup>
                <Typography mb={1}>Printing Layout</Typography>
              </FormGroup>

              <div className="ups-img-con" onClick={handleOpen}>
                <img src={upsImage} className="ups-image" alt="ups-image" />
              </div>
            </Grid>

            <Grid
              size={4}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "end",
                columnGap: 2,
              }}
            >
              <Button
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: "#e0e0e0",
                  color: "#000",
                  "&:hover": {
                    backgroundColor: "#bdbdbd",
                  },
                }}
              >
                Cancel
              </Button>

              <Button variant="contained" size="large">
                Save
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <img
            src={upsImage}
            alt="ups-modal"
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            }}
          />
        </Box>
      </Modal>
    </Box>
  );
}

export default EditPlan;
