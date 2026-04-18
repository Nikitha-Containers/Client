import { Fragment, useEffect, useMemo, useState } from "react";
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
  FormControl,
  InputLabel,
} from "@mui/material";

import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";

import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import TimerIcon from "@mui/icons-material/Timer";
import TimerOffIcon from "@mui/icons-material/TimerOff";

import { toast } from "react-toastify";

import "../../../pages/pagestyle.scss";
import server from "../../../../server/server";

const COLUMNS = [
  { label: "Component", w: 100 },
  { label: "Sheet Size", w: 160 },
  { label: "No of Sheets", w: 120 },
  { label: "Source File", w: 110 },
  { label: "Machine", w: 120 },
  { label: "Coating Type", w: 180 },
  { label: "Plan", w: 160 },
  { label: "Action", w: 110 },
  { label: "Start Time", w: 150 },
  { label: "End Time", w: 130 },
  { label: "CO Time", w: 110 },
  { label: "Total Time", w: 120 },
  { label: "Status", w: 120 },
];

const TOTAL_WIDTH = COLUMNS.reduce((sum, c) => sum + c.w, 0);

// Helper Function
const getArtWorkClass = (art) => {
  if (!art || art === "NA") return "art-badge art-blue";
  if (art.toLowerCase() === "old") return "art-badge art-red";
  if (art.toLowerCase() === "new") return "art-badge art-green";
  return "art-badge";
};

const extractKeysWithSequence = (obj) => {
  if (!obj || typeof obj !== "object") return [];
  return Object.entries(obj).flatMap(([key, value]) => {
    if (key === "Other" && value?.name) {
      const count = value.count || 1;
      return Array.from(
        { length: count },
        (_, i) => `${value.name} - ${i + 1}`,
      );
    }
    if (typeof value === "number") {
      return Array.from({ length: value }, (_, i) => `${key} - ${i + 1}`);
    }
    return [];
  });
};

const getCoatingList = (comp) => {
  const inside = extractKeysWithSequence(comp?.coating?.insideColor).map(
    (label) => `In - ${label}`,
  );
  const outside = extractKeysWithSequence(comp?.coating?.outsideColor).map(
    (label) => `Out - ${label}`,
  );
  return [...inside, ...outside];
};

const getPlanningDetails = (design, compName, process) => {
  const bookings =
    design?.planning_work_details?.coating_machine_plan?.bookings || [];

  const match = bookings.find(
    (b) =>
      b.component === compName &&
      process.includes(b.process.replace(" - 1", "")),
  );

  if (!match) return "";

  const date = new Date(match.shift_from_dt);

  const formattedDate = date.toLocaleDateString("en-GB").replace(/\//g, "-");

  const shiftMap = {
    General: "G",
    "Shift 1": "S1",
    "Shift 2": "S2",
    "Shift 3": "S3",
  };

  return `${formattedDate} - ${shiftMap[match.shift] || match.shift}`;
};

const getPlanningDatesWithShifts = (design) => {
  const bookings =
    design?.planning_work_details?.coating_machine_plan?.bookings || [];

  const map = {};

  bookings.forEach((b) => {
    const date = new Date(b.shift_from_dt)
      .toLocaleDateString("en-GB")
      .replace(/\//g, "-");

    if (!map[date]) map[date] = new Set();

    map[date].add(b.shift);
  });

  return Object.entries(map).map(([date, shifts]) => ({
    date,
    shifts: Array.from(shifts),
  }));
};

const Cell = ({ colIndex, children, sx = {} }) => (
  <Box
    sx={{
      minWidth: COLUMNS[colIndex].w,
      width: COLUMNS[colIndex].w,
      px: 0.75,
      display: "flex",
      alignItems: "center",
      ...sx,
    }}
  >
    {children}
  </Box>
);

const ComponentRow = ({
  component,
  name,
  onViewFile,
  totalQty,
  timers,
  statusMap,
  setTimers,
  setStatusMap,
  design,
}) => {
  const initTimer = () => ({
    status: "IDLE",
    startTime: null,
    endTime: null,
    currentTime: null,
    coRunning: false,
    coStart: null,
    coTotalMs: 0,
  });

  // Live clock tick
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const updated = {};
        Object.keys(prev).forEach((key) => {
          const t = prev[key];
          updated[key] =
            t.status === "RUNNING" ? { ...t, currentTime: Date.now() } : t;
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [setTimers]);

  // Handler Functions

  const handleStart = (index) => {
    const now = Date.now();
    setTimers((prev) => ({
      ...prev,
      [index]: {
        ...initTimer(),
        status: "RUNNING",
        startTime: now,
        currentTime: now,
      },
    }));
  };

  const handleStop = (index) => {
    const now = Date.now();
    setTimers((prev) => {
      const t = prev[index];
      if (!t) return prev;
      const extraCoMs = t.coRunning ? now - t.coStart : 0;
      return {
        ...prev,
        [index]: {
          ...t,
          status: "STOPPED",
          endTime: now,
          currentTime: t.startTime,
          coRunning: false,
          coStart: null,
          coTotalMs: t.coTotalMs + extraCoMs,
        },
      };
    });
  };

  const handleCoToggle = (index) => {
    setTimers((prev) => {
      const t = prev[index];
      if (!t) return prev;
      const now = Date.now();
      if (!t.coRunning) {
        return { ...prev, [index]: { ...t, coRunning: true, coStart: now } };
      }
      return {
        ...prev,
        [index]: {
          ...t,
          coRunning: false,
          coTotalMs: t.coTotalMs + (now - t.coStart),
          coStart: null,
        },
      };
    });
  };

  const handleStatusChange = (index, newValue) => {
    if (newValue !== null) {
      setStatusMap((prev) => ({ ...prev, [index]: newValue }));
    }
  };

  // Utils
  const format12Hr = (ms) =>
    new Date(ms).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

  const msToHMS = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}:${String(seconds).padStart(2, "0")}`;
  };

  const listOfCoating = getCoatingList(component);
  const originalSheets =
    component.ups && totalQty
      ? Math.ceil(Number(totalQty) / Number(component.ups))
      : "";

  return (
    <>
      {listOfCoating.map((process, index) => {
        const timer = timers[index] ?? initTimer();
        const status = statusMap[index] || "No";

        const labelStartTime = timer.startTime
          ? format12Hr(timer.startTime)
          : "Start Time";
        const insideLiveTime =
          timer.status === "RUNNING" && timer.currentTime
            ? format12Hr(timer.currentTime)
            : timer.startTime
              ? format12Hr(timer.startTime)
              : "";
        const endTimeText = timer.endTime ? format12Hr(timer.endTime) : "";
        const totalTimeText =
          timer.startTime && timer.endTime
            ? msToHMS(timer.endTime - timer.startTime - timer.coTotalMs)
            : "";
        const liveCoMs =
          timer.coRunning && timer.coStart
            ? timer.coTotalMs + (timer.currentTime - timer.coStart)
            : timer.coTotalMs;

        return (
          <Box
            key={index}
            sx={{
              display: "flex",
              alignItems: "center",
              borderBottom: "1px solid #dcdddd",
              minWidth: TOTAL_WIDTH,
              py: 0.75,
              "&:hover": { background: "#fafafa" },
            }}
          >
            {/* Component */}
            <Cell colIndex={0}>
              <div className="Box-table-text">{name}</div>
            </Cell>
            {/* Sheet Size */}
            <Cell colIndex={1}>
              <TextField
                size="small"
                fullWidth
                value={`${component?.length} X ${component?.breadth} X ${component?.thickness}`}
                sx={{
                  "& .MuiInputBase-input": {
                    fontSize: "14px",
                  },
                }}
                disabled
              />
            </Cell>
            {/* No of Sheets */}
            <Cell colIndex={2}>
              <TextField
                size="small"
                fullWidth
                type="number"
                label={originalSheets}
                value={component?.sheets}
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiInputLabel-root.Mui-disabled": { color: "green" },
                  "& .MuiInputLabel-root": { color: "green" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "green" },
                }}
                disabled
              />
            </Cell>
            {/* Source File */}
            <Cell colIndex={3}>
              <div
                className="gray-md-btn"
                onClick={() => onViewFile(name)}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <VisibilityIcon fontSize="small" /> View
              </div>
            </Cell>
            {/* Machine */}
            <Cell colIndex={4}>
              <TextField
                size="small"
                fullWidth
                value={design?.machine || "Crab Tree"}
                disabled
              />
            </Cell>
            {/* Coating Type */}
            <Cell colIndex={5}>
              <TextField
                size="small"
                fullWidth
                value={process}
                sx={{
                  "& .MuiInputBase-input": {
                    fontSize: "14px",
                  },
                }}
                disabled
              />
            </Cell>
            {/* Planning Date + Shift */}
            <Cell colIndex={6}>
              <TextField
                size="small"
                fullWidth
                value={getPlanningDetails(design, name, process)}
                disabled
              />
            </Cell>
            {/* Action */}
            <Cell colIndex={7} sx={{ gap: 0.25 }}>
              <PlayCircleFilledWhiteIcon
                onClick={
                  timer.status === "IDLE" ? () => handleStart(index) : undefined
                }
                style={{
                  cursor: timer.status === "IDLE" ? "pointer" : "not-allowed",
                  color: "green",
                  opacity: timer.status === "IDLE" ? 1 : 0.3,
                  fontSize: "32px",
                }}
              />
              <StopCircleIcon
                onClick={
                  timer.status === "RUNNING"
                    ? () => handleStop(index)
                    : undefined
                }
                style={{
                  cursor:
                    timer.status === "RUNNING" ? "pointer" : "not-allowed",
                  color: "red",
                  opacity: timer.status === "RUNNING" ? 1 : 0.3,
                  fontSize: "30px",
                }}
              />
              {timer.coRunning ? (
                <TimerOffIcon
                  onClick={
                    timer.status === "RUNNING"
                      ? () => handleCoToggle(index)
                      : undefined
                  }
                  style={{
                    cursor:
                      timer.status === "RUNNING" ? "pointer" : "not-allowed",
                    color: "#0a85cb",
                    fontSize: "30px",
                  }}
                  titleAccess="Stop CO Time"
                />
              ) : (
                <TimerIcon
                  onClick={
                    timer.status === "RUNNING"
                      ? () => handleCoToggle(index)
                      : undefined
                  }
                  style={{
                    cursor:
                      timer.status === "RUNNING" ? "pointer" : "not-allowed",
                    color: "#0a85cb",
                    opacity: timer.status === "RUNNING" ? 1 : 0.3,
                    fontSize: "30px",
                  }}
                  titleAccess="Start CO Time"
                />
              )}
            </Cell>
            {/* Start Time */}
            <Cell colIndex={8}>
              <TextField
                size="small"
                fullWidth
                label={labelStartTime}
                value={insideLiveTime}
                disabled
                InputLabelProps={{ shrink: true }}
              />
            </Cell>
            {/* End Time */}
            <Cell colIndex={9}>
              <TextField size="small" fullWidth value={endTimeText} disabled />
            </Cell>
            {/* CO Time */}
            <Cell colIndex={9}>
              <TextField
                size="small"
                fullWidth
                value={msToHMS(liveCoMs)}
                disabled
              />
            </Cell>
            {/* Total Time */}
            <Cell colIndex={10}>
              <TextField
                size="small"
                fullWidth
                value={totalTimeText}
                disabled
              />
            </Cell>
            {/* Status */}
            <Cell colIndex={10}>
              <ToggleButtonGroup
                value={status}
                exclusive
                onChange={(e, val) => handleStatusChange(index, val)}
                size="small"
                disabled={timer.status !== "STOPPED"}
                sx={{ opacity: timer.status !== "STOPPED" ? 0.6 : 1 }}
              >
                <ToggleButton
                  value="Yes"
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: "green",
                      color: "white",
                    },
                    "&:hover": { backgroundColor: "#008000db" },
                    "&.Mui-selected:hover": { backgroundColor: "#008000" },
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
                    "&:hover": { backgroundColor: "#ff0000bf" },
                    "&.Mui-selected:hover": { backgroundColor: "#ff0000" },
                  }}
                >
                  No
                </ToggleButton>
              </ToggleButtonGroup>
            </Cell>
          </Box>
        );
      })}
    </>
  );
};

// Main Component Started Here
function EditCoating() {
  const navigate = useNavigate();
  const location = useLocation();
  const { design } = location?.state || {};

  useEffect(() => {
    if (!design) {
      toast.error("No design selected. Redirecting to dashboard.");
      navigate("/coating_dashboard", { replace: true });
    }
  }, [design, navigate]);

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
    telephone: design?.telephone || "",
    machine: design?.machine,
    coating_operator_name: design?.coating_operator_name,
    art_work: design?.art_work || "NA",
  });

  const [coatingState, setCoatingState] = useState({});
  const [operatorAssign, setOperatorAssign] = useState({});

  const planningData = getPlanningDatesWithShifts(design);

  // Pending Dialog
  const [openPending, setOpenPending] = useState(false);
  const [pendingData, setPendingData] = useState({
    reason: "",
    otherReason: "",
  });

  // Common Pending Reasons
  const pendingReasons = [
    "Material Not Available",
    "Machine Breakdown - Mechanical",
    "Machine Breakdown - Electrical",
    "No Man Power",
    "Flim Plate Damage",
  ];

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

  const buildStateFromDB = (componentData) => {
    if (!componentData?.coating_process) return {};
    const timers = {};
    const statusMap = {};
    const coatingList = getCoatingList(componentData);
    coatingList.forEach((processName, index) => {
      const p = componentData.coating_process[processName];
      if (!p) return;
      const start = new Date(p.start_time).getTime();
      const end = new Date(p.end_time).getTime();
      timers[index] = {
        status: "STOPPED",
        startTime: start,
        endTime: end,
        currentTime: start,
        coRunning: false,
        coStart: null,
        coTotalMs: (p.co_time || 0) * 1000,
      };
      statusMap[index] = p.status === 1 ? "Yes" : "No";
    });
    return { timers, statusMap };
  };

  useEffect(() => {
    if (!design?.components) return;
    const updatedComponents = { ...initialComponentsState };
    const newCoatingState = {};
    Object.entries(design.components).forEach(([name, comp]) => {
      if (updatedComponents[name]) {
        updatedComponents[name] = { ...comp };
        newCoatingState[name] = buildStateFromDB(comp);
      }
    });
    setComponents(updatedComponents);
    setCoatingState(newCoatingState);
  }, [design]);

  useEffect(() => {
    return () => {
      if (currentImage?.startsWith("blob:")) URL.revokeObjectURL(currentImage);
    };
  }, [currentImage]);

  useEffect(() => {
    const reason = design?.coating_pending_details?.pending_reason;
    if (!reason) return;
    setPendingData({
      reason: pendingReasons.includes(reason) ? reason : "Others",
      otherReason: pendingReasons.includes(reason) ? "" : reason,
    });
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

  const handleArtworkView = () => {
    if (!design?.file_name || !design?.file_ext) return;
    const imageUrl = `${server?.defaults?.baseURL}/artworkImages/${encodeURIComponent(design?.file_name)}.${design?.file_ext}`;
    setCurrentImage(imageUrl);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    if (currentImage?.startsWith("blob:")) URL.revokeObjectURL(currentImage);
    setCurrentImage("");
  };

  const validateCoating = (type) => {
    if (type === "PENDING") return true;
    for (const compName of Object.keys(design?.components || {})) {
      const { timers = {}, statusMap = {} } = coatingState[compName] || {};
      if (Object.keys(timers).length === 0) return false;
      for (const index of Object.keys(timers)) {
        const t = timers[index];
        if (!t?.startTime) return false;
        if (!t?.endTime || t.status !== "STOPPED") return false;
        if (statusMap[index] !== "Yes") return false;
      }
    }
    return true;
  };

  const handleSubmit = async (type) => {
    try {
      if (!formData?.coating_operator_name) {
        toast.info("Please Select Operator");
        return;
      }
      const coating_status = type === "PENDING" ? 1 : 2;
      if (!validateCoating(type)) {
        toast.warning("Complete all coating processes before submitting");
        return;
      }
      const updatedComponents = {};
      Object.entries(components)
        .filter(([compName]) => design?.components?.[compName])
        .forEach(([compName, comp]) => {
          const { timers = {}, statusMap = {} } = coatingState[compName] || {};
          let coating_process = {};
          const coatingList = getCoatingList(comp);
          coatingList.forEach((processName, index) => {
            const t = timers[index];
            if (!t || !t.startTime || !t.endTime) return;
            coating_process[processName] = {
              start_time: new Date(t.startTime),
              end_time: new Date(t.endTime),
              co_time: Math.floor((t.coTotalMs || 0) / 1000),
              total_time: Math.floor(
                (t.endTime - t.startTime - (t.coTotalMs || 0)) / 1000,
              ),
              status: statusMap[index] === "Yes" ? 1 : 0,
            };
          });
          updatedComponents[compName] = { ...comp, coating_process };
        });

      const payload = {
        unique_id: design.unique_id,
        saleorder_no: design.saleorder_no,
        item_line_no: design.item_line_no,
        coating_operator_name: formData.coating_operator_name,
        coating_status,
        coating_pending_details:
          type === "PENDING"
            ? {
                pending_reason:
                  pendingData.reason === "Others"
                    ? pendingData.otherReason
                    : pendingData.reason,
              }
            : design?.coating_pending_details || {},
        components: updatedComponents,
      };

      await server.post("/design/add", payload);
      if (type === "PENDING") {
        toast.info("Moved to Pending");
      } else {
        toast.success("Coating Saved Successfully");
      }
      navigate("/coating_dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Failed to Save Coating");
    }
  };

  const handleCancel = () => navigate("/coating_dashboard");

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    outline: 0,
    maxWidth: "90vw",
    maxHeight: "90vh",
  };

  if (!design) return null;

  return (
    <Box className="Dashboard-con">
      {/* Breadcrumb */}
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

      <Box className="page-layout" sx={{ marginTop: 2 }}>
        {/* Top Form Fields */}
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={2.5}>
            <Grid size={2}>
              <FormGroup>
                <Typography mb={1}>Customer Name</Typography>
                <TextField
                  size="small"
                  value={formData?.customer_name}
                  disabled
                />
              </FormGroup>
            </Grid>
            <Grid size={2}>
              <FormGroup>
                <Typography mb={1}>SO Number</Typography>
                <TextField
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
                <Typography mb={1}>Total Qty</Typography>
                <TextField
                  size="small"
                  value={formData?.item_quantity}
                  disabled
                />
              </FormGroup>
            </Grid>
            <Grid size={2}>
              <FormGroup>
                <Typography mb={1}>Sales Person</Typography>
                <TextField
                  size="small"
                  value={formData?.sales_employee}
                  disabled
                />
              </FormGroup>
            </Grid>
            <Grid size={2}>
              <FormGroup>
                <Typography mb={1}>SP Contact No</Typography>
                <TextField size="small" value={formData?.telephone} disabled />
              </FormGroup>
            </Grid>
          </Grid>
        </Box>

        <Box
          sx={{
            background: "#fff",
            mt: 2,
            boxShadow:
              "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(27,31,35,0.15) 0px 0px 0px 1px",
          }}
        >
          {/* Title */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              borderBottom: "1px solid #ddd",
            }}
          >
            <Typography sx={{ fontSize: "18px", color: "#0a85cb" }}>
              Assign Operator
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography>Instructor Name :</Typography>
              <Select
                value={formData.coating_operator_name ?? ""}
                size="small"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    coating_operator_name: e.target.value,
                  })
                }
                sx={{ width: "180px", fontSize: "14px" }}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select
                </MenuItem>
                <MenuItem value="KATHIRAVAN K">KATHIRAVAN K</MenuItem>
                <MenuItem value="AMARNATH D">AMARNATH D</MenuItem>
                <MenuItem value="SAMAY MARANDI">SAMAY MARANDI</MenuItem>
              </Select>
            </Box>
          </Box>
          <Box sx={{ p: 2 }}>
            {planningData.map(({ date, shifts }) => {
              const shiftOrder = ["General", "Shift 1", "Shift 2", "Shift 3"];
              return (
                <Box
                  key={date}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "140px repeat(3, 110px 220px)",
                    alignItems: "center",
                    mb: 2,
                    px: 1,
                    py: 1,
                    borderRadius: 1,
                    "&:hover": { background: "#fafafa" },
                  }}
                >
                  {/* Date */}
                  <Typography>{date}</Typography>

                  {shiftOrder
                    .slice(shifts.includes("General") ? 0 : 1)
                    .slice(0, 3)
                    .map((shift) => {
                      const hasShift = shifts.includes(shift);

                      if (!hasShift) return null;

                      return (
                        <Fragment key={shift}>
                          <Typography>{shift}</Typography>

                          <Box sx={{ pr: 2 }}>
                            <FormControl size="small" sx={{ width: 180 }}>
                              <InputLabel>Operator Name</InputLabel>

                              <Select
                                value={operatorAssign?.[date]?.[shift] || ""}
                                onChange={(e) =>
                                  setOperatorAssign((prev) => ({
                                    ...prev,
                                    [date]: {
                                      ...prev[date],
                                      [shift]: e.target.value,
                                    },
                                  }))
                                }
                                label="Operator Name"
                                sx={{ fontSize: "14px", p: 0.5 }}
                              >
                                <MenuItem value="KATHIRAVAN K">
                                  KATHIRAVAN K
                                </MenuItem>
                                <MenuItem value="AMARNATH D">
                                  AMARNATH D
                                </MenuItem>
                                <MenuItem value="SAMAY MARANDI">
                                  SAMAY MARANDI
                                </MenuItem>
                              </Select>
                            </FormControl>
                          </Box>
                        </Fragment>
                      );
                    })}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Table Section */}
        <Box
          sx={{
            background: "#fff",
            mt: 2,
            boxShadow:
              "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(27,31,35,0.15) 0px 0px 0px 1px",
          }}
        >
          {/* Table Title */}
          <Box
            className="Box-table-title"
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              Today's Work - ({new Date().toLocaleDateString()}){" "}
              <span className={getArtWorkClass(design?.art_work)}>
                {design?.art_work || "NA"}
              </span>
            </div>
            <button className="gray-md-btn" onClick={handleArtworkView}>
              <VisibilityIcon style={{ fontSize: 20 }} /> Artwork Image
            </button>
          </Box>

          {/* Scrollable Table */}
          <Box sx={{ overflowX: "auto", width: "100%" }}>
            {/* Header Row */}
            <Box
              sx={{
                display: "flex",
                minWidth: TOTAL_WIDTH,
                background: "#f5f5f5",
                borderBottom: "2px solid #dcdddd",
              }}
            >
              {COLUMNS.map(({ label, w }) => (
                <Box
                  key={label}
                  sx={{ minWidth: w, width: w, px: 0.75, py: 1.25 }}
                >
                  <div className="Box-table-subtitle">{label}</div>
                </Box>
              ))}
            </Box>

            {/* Data Rows */}
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
                  design={design}
                  timers={coatingState[key]?.timers || {}}
                  statusMap={coatingState[key]?.statusMap || {}}
                  setTimers={(val) =>
                    setCoatingState((prev) => ({
                      ...prev,
                      [key]: {
                        ...prev[key],
                        timers:
                          typeof val === "function"
                            ? val(prev[key]?.timers || {})
                            : val,
                      },
                    }))
                  }
                  setStatusMap={(val) =>
                    setCoatingState((prev) => ({
                      ...prev,
                      [key]: {
                        ...prev[key],
                        statusMap:
                          typeof val === "function"
                            ? val(prev[key]?.statusMap || {})
                            : val,
                      },
                    }))
                  }
                />
              ))}
          </Box>
        </Box>

        {/* Component Output Section */}
        <Box
          sx={{
            background: "#fff",
            mt: 2,
            boxShadow:
              "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(27,31,35,0.15) 0px 0px 0px 1px",
          }}
        >
          {/* Title */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              borderBottom: "1px solid #ddd",
            }}
          >
            <Typography sx={{ fontSize: "18px", color: "#0a85cb" }}>
              Component Output
            </Typography>
          </Box>

          {/* Header Row */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              px: 2,
              py: 1,
              background: "#f5f5f5",
              borderBottom: "2px solid #dcdddd",
            }}
          >
            <Box sx={{ width: 180 }}>
              <div className="Box-table-subtitle">Component</div>
            </Box>
            <Box sx={{ width: 180 }}>
              <div className="Box-table-subtitle">Printed Sheets</div>
            </Box>
            <Box sx={{ width: 180 }}>
              <div className="Box-table-subtitle">Rejected Sheets</div>
            </Box>
          </Box>

          {/* Data Rows */}
          <Box sx={{ p: 2 }}>
            {Object.entries(components)
              .filter(([key]) =>
                Object.keys(design?.components || {}).includes(key),
              )
              .map(([name, comp]) => (
                <Box
                  key={name}
                  sx={{ display: "flex", alignItems: "center", mb: 2 }}
                >
                  {/* Component Name */}
                  <Typography sx={{ width: 180 }}>{name}</Typography>

                  {/* Printed */}
                  <Box sx={{ width: 180, pr: 2 }}>
                    <TextField
                      size="small"
                      fullWidth
                      type="number"
                      value={comp.printed || ""}
                      onChange={(e) =>
                        setComponents((prev) => ({
                          ...prev,
                          [name]: { ...prev[name], printed: e.target.value },
                        }))
                      }
                    />
                  </Box>

                  {/* Rejected */}
                  <Box sx={{ width: 180, pr: 2 }}>
                    <TextField
                      size="small"
                      fullWidth
                      type="number"
                      value={comp.rejected || ""}
                      onChange={(e) =>
                        setComponents((prev) => ({
                          ...prev,
                          [name]: { ...prev[name], rejected: e.target.value },
                        }))
                      }
                    />
                  </Box>
                </Box>
              ))}
          </Box>
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
          >
            Submit
          </Button>
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

        {/* Pending Dialog */}
        <Dialog
          open={openPending}
          onClose={() => setOpenPending(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: "16px" } }}
        >
          <DialogTitle
            sx={{ display: "flex", justifyContent: "space-between" }}
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
              <Grid size={5}>
                <Typography>Reason for Pending</Typography>
              </Grid>
              <Grid size={7}>
                <Select
                  fullWidth
                  size="small"
                  value={pendingData?.reason ?? ""}
                  displayEmpty
                  onChange={(e) =>
                    setPendingData({ ...pendingData, reason: e.target.value })
                  }
                >
                  <MenuItem value="" disabled>
                    Select
                  </MenuItem>
                  {pendingReasons.map((reason) => (
                    <MenuItem key={reason} value={reason}>
                      {reason}
                    </MenuItem>
                  ))}
                  <MenuItem value="Others">Others</MenuItem>
                </Select>
              </Grid>

              {pendingData.reason === "Others" && (
                <>
                  <Grid size={5}>
                    <Typography>Enter Reason</Typography>
                  </Grid>
                  <Grid size={7}>
                    <TextField
                      autoFocus
                      fullWidth
                      size="small"
                      multiline
                      rows={3}
                      placeholder="Enter Pending Reason"
                      value={pendingData?.otherReason}
                      onChange={(e) =>
                        setPendingData({
                          ...pendingData,
                          otherReason: e.target.value,
                        })
                      }
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </DialogContent>

          <DialogActions sx={{ justifyContent: "flex-end", p: 2, gap: 2 }}>
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
                if (!pendingData?.reason) {
                  toast.error("Please Select Pending Reason");
                  return;
                }
                if (
                  pendingData.reason === "Others" &&
                  !pendingData.otherReason.trim()
                ) {
                  toast.error("Please Enter Pending Reason");
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

export default EditCoating;
