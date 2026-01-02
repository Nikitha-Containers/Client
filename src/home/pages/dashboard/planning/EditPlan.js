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
  const navigate = useNavigate();
  const location = useLocation();
  const rowData = location.state || {};

  // Helper Functions
  const extractSize = (desc = "") => {
    const nums = desc.match(/\d+/g);
    return nums ? nums.join(" x ") : "";
  };

  const initialComp = {
    saleorder_no: rowData.saleorder_no || "",
    posting_date: rowData.posting_date
      ? new Date(rowData.posting_date).toISOString().split("T")[0]
      : "",
    customer_name: rowData.customer_name || "",
    sales_person_code: rowData.sales_person_code || "",
    item_description: rowData.item_description || "",
    size: extractSize(rowData.item_description),
    item_quantity: rowData.item_quantity || "",
    machine: "",
    fab_site: "",
    priority: "Normal",
    shift: "",
    shift_from: "",
    shift_to: "",
    shift_from_dt: "",
    shift_to_dt: "",
  };

  const [getFormData, setFormData] = useState(initialComp);

  // Handle Change

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle Submit

  const handleSubmit = () => {
    console.log("Submitting Data:", getFormData);
    alert("Plan Updated Successfully ✅");
  };
  // Handle Cancel
  const handleCancel = () => {
    navigate("/planning");
  };

  // Shift Time

  const shiftTime = {
    General: { from: "09:00", to: "18:00", crossDay: false },
    "Shift 1": { from: "06:00", to: "14:00", crossDay: false },
    "Shift 2": { from: "14:00", to: "22:00", crossDay: false },
    "Shift 3": { from: "22:00", to: "06:00", crossDay: true },
  };

  const handleShiftChange = (e) => {
    const shift = e.target.value;
    const cfg = shiftTime[shift];

    if (!cfg || !getFormData.posting_date) {
      setFormData((prev) => ({
        ...prev,
        shift,
        shift_from: "",
        shift_to: "",
        shift_from_dt: "",
        shift_to_dt: "",
      }));
      return;
    }

    const baseDate = getFormData.posting_date;
    let fromDate = baseDate;
    let toDate = baseDate;

    if (cfg.crossDay) {
      const nextDay = new Date(baseDate);
      nextDay.setDate(nextDay.getDate() + 1);
      toDate = nextDay.toISOString().split("T")[0];
    }

    setFormData((prev) => ({
      ...prev,
      shift,
      shift_from: cfg.from,
      shift_to: cfg.to,
      shift_from_dt: `${fromDate}T${cfg.from}:00`,
      shift_to_dt: `${toDate}T${cfg.to}:00`,
    }));
  };

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
                  name="saleorder_no"
                  size="small"
                  type="text"
                  value={getFormData?.saleorder_no}
                  onChange={handleChange}
                />
              </FormGroup>
            </Grid>

            <Grid size={3}>
              <FormGroup>
                <Typography mb={1}>SO Date</Typography>
                <TextField
                  name="posting_date"
                  size="small"
                  type="date"
                  value={getFormData?.posting_date}
                  onChange={handleChange}
                />
              </FormGroup>
            </Grid>

            <Grid size={3}>
              <FormGroup>
                <Typography mb={1}>Customer Name</Typography>
                <TextField
                  name="customer_name"
                  size="small"
                  type="text"
                  value={getFormData?.customer_name}
                  onChange={handleChange}
                />
              </FormGroup>
            </Grid>

            <Grid size={3}>
              <FormGroup>
                <Typography mb={1}>Sales Person</Typography>
                <TextField
                  name="sales_person_code"
                  size="small"
                  type="text"
                  value={getFormData?.sales_person_code}
                  onChange={handleChange}
                />
              </FormGroup>
            </Grid>

            <Grid size={3}>
              <FormGroup>
                <Typography mb={1}>Dimensions</Typography>
                <TextField
                  name="item_description"
                  size="small"
                  type="text"
                  value={getFormData?.item_description}
                  onChange={handleChange}
                />
              </FormGroup>
            </Grid>

            <Grid size={3}>
              <FormGroup>
                <Typography mb={1}>Size</Typography>
                <TextField
                  name="size"
                  size="small"
                  type="text"
                  value={getFormData?.size}
                  onChange={handleChange}
                />
              </FormGroup>
            </Grid>

            <Grid size={3}>
              <FormGroup>
                <Typography mb={1}>Quantity</Typography>
                <TextField
                  id="outlined-size-small"
                  name="item_quantity"
                  size="small"
                  type="number"
                  value={getFormData?.item_quantity}
                  onChange={handleChange}
                />
              </FormGroup>
            </Grid>

            <Grid size={3}>
              <FormGroup>
                <Typography mb={1}>Machine</Typography>
                <Select
                  name="machine"
                  value={getFormData?.machine}
                  size="small"
                  onChange={handleChange}
                  displayEmpty
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="Machine 1">Machine 1</MenuItem>
                  <MenuItem value="Machine 2">Machine 2</MenuItem>
                  <MenuItem value="Machine 3">Machine 3</MenuItem>
                </Select>
              </FormGroup>
            </Grid>

            <Grid size={3}>
              <FormGroup>
                <Typography mb={1}>
                  Shift
                  {getFormData.shift_from && getFormData.shift_to && (
                    <span
                      style={{
                        color: "#777",
                        fontSize: "16px",
                        marginLeft: "10px",
                      }}
                    >
                      ({getFormData.shift_from} to {getFormData.shift_to})
                    </span>
                  )}
                </Typography>

                <Select
                  name="shift"
                  value={getFormData.shift}
                  size="small"
                  onChange={handleShiftChange}
                  displayEmpty
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="General">General</MenuItem>
                  <MenuItem value="Shift 1">Shift 1</MenuItem>
                  <MenuItem value="Shift 2">Shift 2</MenuItem>
                  <MenuItem value="Shift 3">Shift 3</MenuItem>
                </Select>
              </FormGroup>
            </Grid>

            <Grid size={3}>
              <FormGroup>
                <Typography mb={1}>Fab Site</Typography>
                <Select
                  name="fab_site"
                  value={getFormData?.fab_site}
                  size="small"
                  onChange={handleChange}
                  displayEmpty
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="Site 1">Site 1</MenuItem>
                  <MenuItem value="Site 2">Site 2</MenuItem>
                  <MenuItem value="Site 3">Site 3</MenuItem>
                </Select>
              </FormGroup>
            </Grid>

            <Grid size={3}>
              <FormGroup>
                <Typography mb={1}>Priority</Typography>
                <Select
                  name="priority"
                  value={getFormData?.priority}
                  size="small"
                  onChange={handleChange}
                >
                  <MenuItem value="Normal">Normal</MenuItem>
                  <MenuItem value="Urgent">Urgent</MenuItem>
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
                justifyContent: "flex-end",
                columnGap: "15px",
              }}
            >
              <Button
                variant="outlined"
                color="error"
                sx={{
                  borderRadius: "8px",
                  minWidth: "100px",
                }}
                onClick={handleCancel}
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                color="success"
                sx={{
                  borderRadius: "8px",
                  minWidth: "100px",
                }}
                onClick={handleSubmit}
              >
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
