import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import Grid from "@mui/material/Grid";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import CloseIcon from "@mui/icons-material/Close";

import {
  FormGroup,
  TextField,
  Typography,
  Select,
  MenuItem,
  Box,
  Button,
  Modal,
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
  DialogActions,
} from "@mui/material";

import { toast } from "react-toastify";

import "../Dashboard.scss";
import upsImage from "../../../../assets/Pagesimage/ups-image.jpg";
import server from "../../../../server/server";
import { useDesign } from "../../../../API/Design_API";

function EditPlan() {
  const { designs } = useDesign();
  const navigate = useNavigate();
  const location = useLocation();

  const design = location.state?.design;

  const [getFormData, setFormData] = useState({});
  const [open, setOpen] = useState(false);
  const [openPending, setOpenPending] = useState(false);

  const [pendingData, setPendingData] = useState({ pending_reason: "" });

  const [coatingPlan, setCoatingPlan] = useState({
    machine: "",
    shift: "",
    start_date: "",
    end_date: "",
    shift_from: "",
    shift_to: "",
    shift_from_dt: "",
    shift_to_dt: "",
  });

  const [printingPlan, setPrintingPlan] = useState({
    machine: "",
    shift: "",
    start_date: "",
    end_date: "",
    shift_from: "",
    shift_to: "",
    shift_from_dt: "",
    shift_to_dt: "",
  });

  useEffect(() => {
    if (!design) {
      navigate("/planning_dashboard");
    }
  }, [design, navigate]);

  useEffect(() => {
    if (design) {
      setFormData({
        saleorder_no: design.saleorder_no || "",
        posting_date: design.posting_date
          ? new Date(design.posting_date).toISOString().split("T")[0]
          : "",
        customer_name: design.customer_name || "",
        sales_person_code: design.sales_person_code || "",
        item_description: design.item_description || "",
        item_quantity: design.item_quantity || "",
      });
    }
  }, [design]);

  useEffect(() => {
    if (design?.planning_pending_details?.pending_reason) {
      setPendingData({
        pending_reason: design.planning_pending_details.pending_reason,
      });
    }
  }, [design]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    navigate("/planning_dashboard");
  };

  // Handles Submission for both Pending
  const handleSubmit = async (type) => {
    const planning_status = type === "PENDING" ? 1 : 2;

    const payload = {
      saleorder_no: getFormData.saleorder_no,
      posting_date: getFormData.posting_date,
      customer_name: getFormData.customer_name,
      sales_person_code: getFormData.sales_person_code,
      item_description: getFormData.item_description,
      item_quantity: getFormData.item_quantity,

      planning_status,

      planning_pending_details:
        type === "PENDING"
          ? { pending_reason: pendingData.pending_reason }
          : design?.planning_pending_details || {},

      planning_work_details: {
        coating_machine_plan: coatingPlan,
        printing_machine_plan: printingPlan,
      },
    };

    try {
      await server.post("/design/add", payload);

      if (type === "PENDING") {
        toast.info("Design moved to Pending");
      } else {
        toast.success("Design saved successfully");
      }

      navigate("/planning_dashboard");
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      toast.error(errorMessage);
    }
  };

  // Configurations for shifts and machines
  const SHIFT_CONFIG = {
    General: { from: "09:00", to: "18:00", hours: 9, crossDay: false },
    "Shift 1": { from: "06:00", to: "14:00", hours: 8, crossDay: false },
    "Shift 2": { from: "14:00", to: "22:00", hours: 8, crossDay: false },
    "Shift 3": { from: "22:00", to: "06:00", hours: 8, crossDay: true },
  };

  const MACHINE_CONFIG = {
    coating: {
      title: "Coating Machine",
      machines: ["Machine 1", "Machine 2", "Machine 3"],
      sheetsPerHour: {
        "Machine 1": 500,
        "Machine 2": 300,
        "Machine 3": 200,
      },
    },
    printing: {
      title: "Printing Machine",
      machines: ["IGK", "DC", "NIGK", "RTCPL-DC"],
      sheetsPerHour: {
        IGK: 1600,
        DC: 3500,
        NIGK: 3500,
        "RTCPL-DC": 2500,
      },
    },
  };

  // Calculate printable sheets based on machine and shift

  const CoatingPrintableSheets = useMemo(() => {
    const { machine, shift } = coatingPlan;
    if (!machine || !shift) return 0;

    return (
      MACHINE_CONFIG.coating.sheetsPerHour[machine] * SHIFT_CONFIG[shift].hours
    );
  }, [coatingPlan.machine, coatingPlan.shift]);

  const PrintingPrintableSheets = useMemo(() => {
    const { machine, shift } = printingPlan;
    if (!machine || !shift) return 0;

    return (
      MACHINE_CONFIG.printing.sheetsPerHour[machine] * SHIFT_CONFIG[shift].hours
    );
  }, [printingPlan.machine, printingPlan.shift]);

  // Handle shift change to auto-calculate shift timings

  const handlePlanShiftChange = (setPlan) => (e) => {
    const shift = e.target.value;
    const cfg = SHIFT_CONFIG[shift];
    if (!cfg || !getFormData.posting_date) return;

    const baseDate = getFormData.posting_date;
    let toDate = baseDate;

    if (cfg.crossDay) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + 1);
      toDate = d.toISOString().split("T")[0];
    }

    setPlan((prev) => ({
      ...prev,
      shift,
      shift_from: cfg.from,
      shift_to: cfg.to,
      shift_from_dt: `${baseDate}T${cfg.from}:00`,
      shift_to_dt: `${toDate}T${cfg.to}:00`,
    }));
  };

  const handlePlanDateChange = (setPlan) => (e) => {
    const { name, value } = e.target;
    setPlan((prev) => ({
      ...prev,
      [name]: value,
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
              to={"/planning_dashboard"}
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
            <Grid size={2}>
              <FormGroup>
                <Typography mb={1}>SO Number</Typography>
                <TextField
                  name="saleorder_no"
                  size="small"
                  type="text"
                  value={getFormData?.saleorder_no}
                  onChange={handleChange}
                  disabled
                />
              </FormGroup>
            </Grid>
            <Grid size={2}>
              <FormGroup>
                <Typography mb={1}>SO Date</Typography>
                <TextField
                  name="posting_date"
                  size="small"
                  type="date"
                  value={getFormData?.posting_date}
                  onChange={handleChange}
                  disabled
                />
              </FormGroup>
            </Grid>
            <Grid size={2}>
              <FormGroup>
                <Typography mb={1}>Customer Name</Typography>
                <TextField
                  name="customer_name"
                  size="small"
                  type="text"
                  value={getFormData?.customer_name}
                  onChange={handleChange}
                  disabled
                />
              </FormGroup>
            </Grid>
            <Grid size={2}>
              <FormGroup>
                <Typography mb={1}>Sales Person</Typography>
                <TextField
                  name="sales_person_code"
                  size="small"
                  type="text"
                  value={getFormData?.sales_person_code}
                  onChange={handleChange}
                  disabled
                />
              </FormGroup>
            </Grid>
            <Grid size={2}>
              <FormGroup>
                <Typography mb={1}>Dimensions</Typography>
                <TextField
                  name="item_description"
                  size="small"
                  type="text"
                  value={getFormData?.item_description}
                  onChange={handleChange}
                  disabled
                />
              </FormGroup>
            </Grid>
            <Grid size={2}>
              <FormGroup>
                <Typography mb={1}>Quantity</Typography>
                <TextField
                  id="outlined-size-small"
                  name="item_quantity"
                  size="small"
                  type="number"
                  value={getFormData?.item_quantity}
                  onChange={handleChange}
                  disabled
                />
              </FormGroup>
            </Grid>
          </Grid>
          {/* Coating Machine Config*/}
          <Box
            sx={{
              background: "#fff",
              mt: 3,
              boxShadow:
                "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
            }}
          >
            <Grid container spacing={2.5}>
              <Grid size={12}>
                <div
                  className="Box-table-title"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  Coating Machine
                </div>
              </Grid>

              <Grid size={3}>
                <FormGroup>
                  <Typography mb={1}>
                    Machine
                    {CoatingPrintableSheets > 0 && (
                      <span
                        style={{
                          marginLeft: 8,
                          color: "#2e7d32",
                          fontWeight: 600,
                          fontSize: "16px",
                        }}
                      >
                        ({CoatingPrintableSheets} / Shift)
                      </span>
                    )}
                  </Typography>

                  <Select
                    name="machine"
                    value={coatingPlan?.machine ?? ""}
                    size="small"
                    onChange={(e) =>
                      setCoatingPlan((prev) => ({
                        ...prev,
                        machine: e.target.value,
                      }))
                    }
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Select
                    </MenuItem>
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
                    {coatingPlan.shift_from && coatingPlan.shift_to && (
                      <span
                        style={{
                          color: "#0288d1",
                          fontSize: "16px",
                          marginLeft: "10px",
                        }}
                      >
                        ({coatingPlan.shift_from} to {coatingPlan.shift_to})
                      </span>
                    )}
                  </Typography>
                  <Select
                    name="shift"
                    value={coatingPlan?.shift ?? ""}
                    size="small"
                    onChange={handlePlanShiftChange(setCoatingPlan)}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Select
                    </MenuItem>
                    <MenuItem value="General">General</MenuItem>
                    <MenuItem value="Shift 1">Shift 1</MenuItem>
                    <MenuItem value="Shift 2">Shift 2</MenuItem>
                    <MenuItem value="Shift 3">Shift 3</MenuItem>
                  </Select>
                </FormGroup>
              </Grid>

              <Grid size={3}>
                <FormGroup>
                  <Typography mb={1}>Start Date</Typography>
                  <TextField
                    value={coatingPlan?.start_date}
                    name="start_date"
                    size="small"
                    type="date"
                    onChange={handlePlanDateChange(setCoatingPlan)}
                  />
                </FormGroup>
              </Grid>

              <Grid size={3}>
                <FormGroup>
                  <Typography mb={1}>End Date</Typography>
                  <TextField
                    value={coatingPlan?.end_date}
                    name="end_date"
                    size="small"
                    type="date"
                    onChange={handlePlanDateChange(setCoatingPlan)}
                  />
                </FormGroup>
              </Grid>
            </Grid>
          </Box>

          {/* Printing Machine Config*/}
          <Box
            sx={{
              background: "#fff",
              mt: 3,
              boxShadow:
                "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
            }}
          >
            <Grid container spacing={2.5}>
              <Grid size={12}>
                <div
                  className="Box-table-title"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  Printing Machine
                </div>
              </Grid>

              <Grid size={3}>
                <FormGroup>
                  <Typography mb={1}>
                    Machine
                    {PrintingPrintableSheets > 0 && (
                      <span
                        style={{
                          marginLeft: 8,
                          color: "#2e7d32",
                          fontWeight: 600,
                          fontSize: "16px",
                        }}
                      >
                        ({PrintingPrintableSheets} / Shift)
                      </span>
                    )}
                  </Typography>

                  <Select
                    name="machine"
                    value={printingPlan?.machine ?? ""}
                    size="small"
                    onChange={(e) =>
                      setPrintingPlan((prev) => ({
                        ...prev,
                        machine: e.target.value,
                      }))
                    }
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Select
                    </MenuItem>
                    {MACHINE_CONFIG.printing.machines.map((m) => (
                      <MenuItem key={m} value={m}>
                        {m}
                      </MenuItem>
                    ))}
                  </Select>
                </FormGroup>
              </Grid>

              <Grid size={3}>
                <FormGroup>
                  <Typography mb={1}>
                    Shift
                    {printingPlan?.shift_from && printingPlan?.shift_to && (
                      <span
                        style={{
                          color: "#0288d1",
                          fontSize: "16px",
                          marginLeft: "10px",
                        }}
                      >
                        ({printingPlan.shift_from} to {printingPlan.shift_to})
                      </span>
                    )}
                  </Typography>
                  <Select
                    name="shift"
                    value={printingPlan?.shift ?? ""}
                    size="small"
                    onChange={handlePlanShiftChange(setPrintingPlan)}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Select
                    </MenuItem>
                    <MenuItem value="General">General</MenuItem>
                    <MenuItem value="Shift 1">Shift 1</MenuItem>
                    <MenuItem value="Shift 2">Shift 2</MenuItem>
                    <MenuItem value="Shift 3">Shift 3</MenuItem>
                  </Select>
                </FormGroup>
              </Grid>

              <Grid size={3}>
                <FormGroup>
                  <Typography mb={1}>Start Date</Typography>
                  <TextField
                    value={printingPlan?.start_date}
                    name="start_date"
                    size="small"
                    type="date"
                    onChange={handlePlanDateChange(setPrintingPlan)}
                  />
                </FormGroup>
              </Grid>

              <Grid size={3}>
                <FormGroup>
                  <Typography mb={1}>End Date</Typography>
                  <TextField
                    value={printingPlan?.end_date}
                    name="end_date"
                    size="small"
                    type="date"
                    onChange={handlePlanDateChange(setPrintingPlan)}
                  />
                </FormGroup>
              </Grid>
            </Grid>
          </Box>

          {/* Action Buttons */}

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              p: 2,
              mt: 2,
              gap: 2,
            }}
          >
            <Button
              variant="contained"
              color="error"
              onClick={handleCancel}
              sx={{ minWidth: 100 }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenPending(true)}
              sx={{ minWidth: 100 }}
            >
              Pending
            </Button>

            <Button
              variant="contained"
              color="success"
              onClick={() => handleSubmit("FINAL")}
              sx={{ minWidth: 100 }}
            >
              Submit
            </Button>
          </Box>
        </Box>
      </Box>

      {/* File Preview Modal */}
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

      {/* Pending Dialouge */}
      <Dialog
        open={openPending}
        onClose={() => setOpenPending(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px" } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" fontWeight="bold" color="#0a85cb">
            Pending
          </Typography>

          <IconButton
            onClick={() => setOpenPending(false)}
            sx={{ color: "#3b3b3b" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* Reason */}
            <Grid size={5}>
              <Typography>Reason for Pending</Typography>
            </Grid>
            <Grid size={7}>
              <Select
                fullWidth
                size="small"
                value={pendingData?.pending_reason ?? ""}
                displayEmpty
                onChange={(e) =>
                  setPendingData({
                    ...pendingData,
                    pending_reason: e.target.value,
                  })
                }
              >
                <MenuItem value="" disabled>
                  Select
                </MenuItem>

                <MenuItem value="Machine Not Availbale">
                  Machine Not Availbale
                </MenuItem>
              </Select>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: "flex-end",
            p: 2,
            gap: 2,
          }}
        >
          <Button
            variant="contained"
            color="error"
            onClick={() => setOpenPending(false)}
            sx={{ minWidth: 100 }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="success"
            onClick={() => {
              if (!pendingData?.pending_reason) {
                toast.error("Please Select Pending Reason");
                return;
              }
              setOpenPending(false);
              handleSubmit("PENDING");
            }}
          >
            Save
          </Button>

          <Button
            variant="contained"
            color="info"
            onClick={() => navigate("/machine_calendar")}
          >
            View Machine Calendar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EditPlan;
