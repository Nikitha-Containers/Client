import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import {
  MenuItem,
  Grid,
  FormGroup,
  Typography,
  TextField,
  Select,
  Modal,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

import { toast } from "react-toastify";

import "../../../pages/pagestyle.scss";
import server from "../../../../server/server";

const ComponentRow = ({ component, name, onViewFile, totalQty, soNumber }) => {
  const [machine, setMachine] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedShifts, setSelectedShifts] = useState({});
  const [openShiftDialog, setOpenShiftDialog] = useState(false);

  const [statusMap, setStatusMap] = useState({});

  const handleStatusChange = (index, newValue) => {
    if (newValue !== null) {
      setStatusMap((prev) => ({
        ...prev,
        [index]: newValue,
      }));
    }
  };

  const getDateRange = (start, end) => {
    if (!start || !end) return [];

    const dates = [];

    const current = new Date(start);
    const last = new Date(end);

    while (current <= last) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const dateRange = useMemo(() => {
    if (!machine || !startDate || !endDate) return [];
    return getDateRange(startDate, endDate);
  }, [machine, startDate, endDate]);
  // Data Handler
  const listOfCoating = (() => {
    const c = component?.coating;
    if (!c) return [];
    const toArr = (v) => {
      if (!v) return [];

      if (Array.isArray(v)) return v;

      if (typeof v === "string") {
        return v
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }

      return [];
    };

    return [
      ...toArr(c.sizing),
      ...toArr(c.insideColor),
      ...toArr(c.varnish),
      ...(c.coatingColor && c.coatingCount
        ? Array.from(
            { length: c.coatingCount },
            (_, i) => `${c.coatingColor} - ${i + 1}`,
          )
        : []),
    ];
  })();

  const originalSheets =
    component.ups && totalQty
      ? Math.ceil(Number(totalQty) / Number(component.ups))
      : "";

  // Configurations for shifts and machines
  const SHIFT_CONFIG = {
    General: { from: "09:00", to: "18:00", hours: 9, crossDay: false },
    "Shift 1": { from: "06:00", to: "14:00", hours: 8, crossDay: false },
    "Shift 2": { from: "14:00", to: "22:00", hours: 8, crossDay: false },
    "Shift 3": { from: "22:00", to: "06:00", hours: 8, crossDay: true },
  };

  const SHIFT_ORDER = ["General", "Shift 1", "Shift 2", "Shift 3"];

  const MACHINE_CONFIG = {
    coating: {
      title: "Coating Machine",
      machines: ["Crab Tree"],
      sheetsPerHour: {
        "Crab Tree": 3500,
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

  return (
    <>
      {listOfCoating.map((process, index) => {
        const status = statusMap[index] || "No";

        return (
          <Fragment key={index}>
            <Grid size={12} sx={{ borderBottom: "1px solid #dcdddd" }}></Grid>

            {/* Component Name */}
            <Grid size={1}>
              <div className="Box-table-text">{name} </div>
            </Grid>

            {/* Sheet Size */}
            <Grid size={1.5}>
              <div className="Box-table-content">
                <TextField
                  id="outlined-size-small"
                  size="small"
                  value={`${component?.length} X ${component?.breadth} X ${component?.thickness}`}
                  disabled
                />
              </div>
            </Grid>

            {/* No. of Sheets */}
            <Grid size={1}>
              <div className="Box-table-content">
                <TextField
                  size="small"
                  type="number"
                  label={originalSheets}
                  value={component?.sheets}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    "& .MuiInputLabel-root.Mui-disabled": {
                      color: "green",
                    },
                    "& .MuiInputLabel-root": {
                      color: "green",
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "green",
                    },
                  }}
                  disabled
                />
              </div>
            </Grid>
            {/* Source File */}
            <Grid size={1}>
              <Box
                sx={{ display: "flex", alignItems: "center", columnGap: 2.5 }}
              >
                <div className="Box-table-content">
                  <div
                    className="gray-md-btn"
                    onClick={() => onViewFile(name)}
                    style={{ cursor: "pointer" }}
                  >
                    <VisibilityIcon /> View
                  </div>
                </div>
              </Box>
            </Grid>
            {/* Coating Type */}
            <Grid size={1.5}>
              <div className="Box-table-content">
                <TextField
                  id="outlined-size-small"
                  size="small"
                  value={process}
                  disabled
                />
              </div>
            </Grid>

            {/* Machine */}
            <Grid size={1}>
              <div className="Box-table-content">
                <Select
                  size="small"
                  value={machine}
                  displayEmpty
                  onChange={(e) => {
                    setMachine(e.target.value);
                    setSelectedShifts({});
                  }}
                >
                  <MenuItem value="" disabled>
                    Select
                  </MenuItem>
                  {MACHINE_CONFIG?.coating?.machines?.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </Grid>

            {/* Start Date */}
            <Grid size={1.5}>
              <div className="Box-table-content">
                <TextField
                  type="date"
                  size="small"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setSelectedShifts({});
                  }}
                />
              </div>
            </Grid>

            {/* End Date */}
            <Grid size={1.5}>
              <div className="Box-table-content">
                <TextField
                  type="date"
                  size="small"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setSelectedShifts({});
                  }}
                />
              </div>
            </Grid>

            {/*Shift */}
            <Grid size={1}>
              <div className="Box-table-content">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    if (!machine || !startDate || !endDate) {
                      toast.error("Please select Machine and Dates first");
                      return;
                    }
                    setOpenShiftDialog(true);
                  }}
                >
                  {Object.keys(selectedShifts).length > 0
                    ? "Edit Shift"
                    : "Select Shift"}
                </Button>
              </div>
            </Grid>

            {/* Status */}
            <Grid size={1}>
              <div className="Box-table-content">
                <ToggleButtonGroup
                  value={status}
                  exclusive
                  onChange={(e, val) => handleStatusChange(index, val)}
                  size="small"
                >
                  <ToggleButton
                    value="Yes"
                    sx={{
                      "&.Mui-selected": {
                        backgroundColor: "green",
                        color: "white",
                      },
                      "&:hover": {
                        backgroundColor: "#008000db",
                      },
                      "&.Mui-selected:hover": {
                        backgroundColor: "#008000",
                      },
                    }}
                  >
                    Yes
                  </ToggleButton>

                  <ToggleButton
                    value="No"
                    sx={{
                      "&.Mui-selected": {
                        backgroundColor: "red",
                        color: "white",
                      },
                      "&:hover": {
                        backgroundColor: "#ff0000bf",
                      },
                      "&.Mui-selected:hover": {
                        backgroundColor: "#ff0000",
                      },
                    }}
                  >
                    No
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>
            </Grid>
          </Fragment>
        );
      })}

      <Dialog
        open={openShiftDialog}
        onClose={() => setOpenShiftDialog(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: "16px" } }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight="bold" color="#0a85cb">
            Select Shift
          </Typography>

          <IconButton onClick={() => setOpenShiftDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {dateRange.length === 0 ? (
            <Typography color="error">
              Please select Machine and Date range
            </Typography>
          ) : (
            dateRange.map((dateObj, index) => {
              const formatted = dateObj.toISOString().split("T")[0];

              return (
                <Box key={index} mb={2}>
                  <Typography fontWeight={600}>{formatted}</Typography>

                  <Box mt={1} display="flex" gap={2} flexWrap="wrap">
                    {SHIFT_ORDER.map((shift) => {
                      const isChecked =
                        selectedShifts[formatted]?.includes(shift) || false;

                      return (
                        <FormControlLabel
                          key={shift}
                          label={shift}
                          control={
                            <Checkbox
                              color="success"
                              checked={isChecked}
                              onChange={(e) => {
                                setSelectedShifts((prev) => {
                                  const prevShifts = prev[formatted] || [];

                                  if (e.target.checked) {
                                    return {
                                      ...prev,
                                      [formatted]: [...prevShifts, shift],
                                    };
                                  } else {
                                    return {
                                      ...prev,
                                      [formatted]: prevShifts.filter(
                                        (s) => s !== shift,
                                      ),
                                    };
                                  }
                                });
                              }}
                            />
                          }
                        />
                      );
                    })}
                  </Box>
                </Box>
              );
            })
          )}
        </DialogContent>

        <DialogActions sx={{ pr: 3 }}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => setOpenShiftDialog(false)}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="success"
            onClick={() => {
              setOpenShiftDialog(false);
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Main Component Started Here
function EditPlan() {
  const navigate = useNavigate();
  const location = useLocation();
  const { design } = location?.state || {};

  const [open, setOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [components, setComponents] = useState({});

  const [formData, setFormData] = useState({
    customer_name: design?.customer_name || "",
    saleorder_no: design?.saleorder_no || "",
    posting_date: design?.posting_date
      ? new Date(design?.posting_date).toISOString().split("T")[0]
      : "",
    item_quantity: design?.item_quantity || "",
    shift: design?.planning_work_details?.shift || "",
    fab_site: design?.planning_work_details?.fab_site || "",
    sales_employee: design?.sales_employee || "",
    machine: design?.machine,
    coating_operator_name: design?.coating_operator_name,
    art_work: design?.art_work || "NA",
  });

  //Pending Dialog
  const [openPending, setOpenPending] = useState(false);
  const [pendingData, setPendingData] = useState({
    pending_reason: "",
  });

  const initialComponentsState = useMemo(() => {
    const compNames = [
      "Lid",
      "Body",
      "Bottom",
      "Lid & Body",
      "Lid & Body & Bottom",
      "Body & Bottom",
    ];
    const obj = {};
    compNames.forEach((name) => {
      obj[name] = {
        length: "",
        breadth: "",
        thickness: "",
        ups: "",
        sheets: "",
        file: null,
      };
    });
    return obj;
  }, []);

  useEffect(() => {
    if (!design?.components) return;

    const updatedComponents = { ...initialComponentsState };

    Object.entries(design.components).forEach(([name, comp]) => {
      if (updatedComponents[name]) {
        updatedComponents[name] = { ...comp };
      }
    });

    setComponents(updatedComponents);
  }, [design, initialComponentsState]);

  useEffect(() => {
    return () => {
      if (currentImage?.startsWith("blob:")) {
        URL.revokeObjectURL(currentImage);
      }
    };
  }, [currentImage]);

  useEffect(() => {
    if (design?.coating_pending_details?.pending_reason) {
      setPendingData((prev) => ({
        ...prev,
        pending_reason: design?.coating_pending_details?.pending_reason,
      }));
    }
  }, [design]);

  // Handler Functions

  const handleViewFile = (componentName) => {
    const { file } = components[componentName];
    if (!file) return;

    let imageUrl;
    if (file instanceof File) {
      imageUrl = URL.createObjectURL(file);
    } else if (typeof file === "string") {
      imageUrl = file.startsWith("http")
        ? file
        : `${server?.defaults?.baseURL}/uploads/${file}`;
    }
    setCurrentImage(imageUrl);
    setOpen(true);
  };

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    if (currentImage) URL.revokeObjectURL(currentImage);
    setCurrentImage("");
  };

  const handleSubmit = () => {
    console.log("Submit");
  };

  const handleCancel = () => {
    const soNo = formData.saleorder_no;

    Object.keys(localStorage)
      .filter((key) => key.startsWith(`COATING_${soNo}_`))
      .forEach((key) => localStorage.removeItem(key));

    setComponents({});
    setTimeout(() => {
      setComponents(initialComponentsState);
    }, 0);

    toast.info("Changes cleared. Initial values restored.");

    navigate("/coating_dashboard");
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
              to={"/coating_dashboard"}
            >
              Coating Dashboard
            </Link>
            <KeyboardArrowRightIcon sx={{ color: "#0a85cb" }} />
            <div>Edit Coating</div>
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
                  id="outlined-size-small"
                  size="small"
                  value={formData?.saleorder_no}
                  disabled
                />
              </FormGroup>
            </Grid>

            <Grid size={2}>
              <FormGroup>
                <Typography mb={1}>SO Date</Typography>
                <TextField
                  id="outlined-size-small"
                  size="small"
                  type="date"
                  value={
                    formData?.posting_date
                      ? new Date(formData?.posting_date)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  disabled
                />
              </FormGroup>
            </Grid>

            <Grid size={2}>
              <FormGroup>
                <Typography mb={1}>Customer Name</Typography>
                <TextField
                  id="outlined-size-small"
                  size="small"
                  value={formData?.customer_name}
                  disabled
                />
              </FormGroup>
            </Grid>

            <Grid size={2}>
              <FormGroup>
                <Typography mb={1}>Sales Person</Typography>
                <TextField
                  id="outlined-size-small"
                  size="small"
                  value={formData?.sales_employee}
                  disabled
                />
              </FormGroup>
            </Grid>

            <Grid size={2}>
              <FormGroup>
                <Typography mb={1}>Total Qty</Typography>
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  value={formData?.item_quantity}
                  disabled
                />
              </FormGroup>
            </Grid>

            <Grid size={2}>
              <FormGroup>
                <Typography mb={1}>Fab Site</Typography>
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  value={formData?.fab_site}
                  disabled
                />
              </FormGroup>
            </Grid>
          </Grid>
        </Box>

        <Box
          sx={{
            background: "#fff",
            mt: 1,
            boxShadow:
              "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
          }}
        >
          <Grid container spacing={0.5}>
            <Grid size={12}>
              <div
                className="Box-table-title"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>Coating Machine Plan</div>
                <button
                  className="gray-md-btn"
                  onClick={() => navigate("/machine_calendar")}
                >
                  <CalendarMonthOutlinedIcon style={{ fontSize: 20 }} /> Machine
                  Calendar
                </button>
              </div>
            </Grid>
            {/* Header Start Here  */}
            <Grid size={1}>
              <div className="Box-table-subtitle">Component</div>
            </Grid>
            <Grid size={1.5}>
              <div className="Box-table-subtitle">Sheet Size</div>
            </Grid>
            <Grid size={1}>
              <div className="Box-table-subtitle">No of Sheets</div>
            </Grid>
            <Grid size={1}>
              <div className="Box-table-subtitle">Source File</div>
            </Grid>
            <Grid size={1.5}>
              <div className="Box-table-subtitle">Coating Type</div>
            </Grid>
            <Grid size={1}>
              <div className="Box-table-subtitle">Machine</div>
            </Grid>
            <Grid size={1.5}>
              <div className="Box-table-subtitle">Start Date</div>
            </Grid>
            <Grid size={1.5}>
              <div className="Box-table-subtitle">End Date</div>
            </Grid>

            <Grid size={1}>
              <div className="Box-table-subtitle">Shift</div>
            </Grid>
            <Grid size={1}>
              <div className="Box-table-subtitle">Status</div>
            </Grid>
            {/* Header End Here  */}

            {/* Render Component Rows */}
            {Object.entries(components)
              .filter(([key]) =>
                Object.keys(design?.components || {}).includes(key),
              )
              .map(([key, component]) => (
                <ComponentRow
                  key={key}
                  component={component}
                  name={key}
                  onViewFile={handleViewFile}
                  totalQty={design?.item_quantity}
                  soNumber={design?.saleorder_no}
                />
              ))}
          </Grid>

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

            <Button variant="contained" color="primary" sx={{ minWidth: 100 }}>
              Pending
            </Button>

            <Button
              variant="contained"
              color="success"
              onClick={() => handleSubmit("FINAL")}
            >
              Submit
            </Button>
          </Box>
        </Box>

        {/* File Preview Modal */}
        <Modal open={open} onClose={handleClose}>
          <Box sx={modalStyle}>
            <img
              src={currentImage}
              alt="preview"
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
                  <MenuItem value="Work is Not Completed">
                    Work is Not Completed
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
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

export default EditPlan;
