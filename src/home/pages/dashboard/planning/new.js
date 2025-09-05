import React from "react";
import Grid from "@mui/material/Grid";
import { Link } from "react-router-dom";
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
} from "@mui/material";
import Check from "@mui/icons-material/Check";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";
import "../Dashboard.scss";

const stepsStatus = [
  { label: "Design Team", status: "completed" },
  { label: "Coating Team", status: "completed" },
  { label: "Printing Team", status: "active" },
  { label: "Varnish Team", status: "pending" },
  { label: "Fabrication Team", status: "pending" },
];

// ✅ Get the index of the active step from stepsStatus
const lastCompletedOrActiveIndex = [...stepsStatus]
  .reverse()
  .findIndex((step) => step.status === "active" || step.status === "completed");

const activeStep =
  lastCompletedOrActiveIndex >= 0
    ? stepsStatus.length - 1 - lastCompletedOrActiveIndex
    : 0;

// ✅ Step Connector Styling
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
    backgroundColor: completed ? "#2196f3" : active ? "#fff" : "#fff",
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
  const iconColor = active ? "#f44336" : completed ? "#fff" : "#d5d6d6";

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
            {[
              "SO Number",
              "SO Date",
              "Customer Name",
              "Sales Person",
              "Dimensions",
              "Size",
              "Qty",
              "MC",
              "Print Start Date",
              "Print End Date",
              "Shift",
            ].map((label, i) => (
              <Grid key={i} item xs={3}>
                <FormGroup>
                  <Typography mb={1}>{label}</Typography>
                  <TextField
                    id={`field-${i}`}
                    size="small"
                    type={
                      label.toLowerCase().includes("date") ? "date" : "text"
                    }
                  />
                </FormGroup>
              </Grid>
            ))}

            <Grid item xs={3}>
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
        <Box sx={{ width: "100%", mt: 12 }}>
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
      </Box>
    </Box>
  );
}

export default EditPlan;
