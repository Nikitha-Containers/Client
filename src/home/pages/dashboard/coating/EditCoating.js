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

const ComponentRow = ({
  component,
  name,
  onViewFile,
  totalQty,
  timers,
  statusMap,
  setTimers,
  setStatusMap,
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

  // Live timer update
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

      let extraCoMs = t.coRunning ? now - t.coStart : 0;

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
        return {
          ...prev,
          [index]: { ...t, coRunning: true, coStart: now },
        };
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
      setStatusMap((prev) => ({
        ...prev,
        [index]: newValue,
      }));
    }
  };

  // Utils Functions

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
          <Fragment key={index}>
            <Grid size={12} sx={{ borderBottom: "1px solid #dcdddd" }}></Grid>
            {/* Component Name */}
            <Grid size={1}>
              <div className="Box-table-text">{name} </div>
            </Grid>
            {/* Sheet Size */}
            <Grid size={1}>
              <div className="Box-table-content">
                <TextField
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
            <Grid size={1}>
              <div className="Box-table-content">
                <TextField size="small" value={process} disabled />
              </div>
            </Grid>
            {/* Time Action Button */}
            <Grid size={1}>
              <div className="Box-table-content">
                <PlayCircleFilledWhiteIcon
                  onClick={
                    timer.status === "IDLE"
                      ? () => handleStart(index)
                      : undefined
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

                {/* CO Time Toggle */}
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
              </div>
            </Grid>
            {/* Start Time */}
            <Grid size={1}>
              <div className="Box-table-content">
                <TextField
                  size="small"
                  label={labelStartTime}
                  value={insideLiveTime}
                  disabled
                  InputLabelProps={{ shrink: true }}
                />
              </div>
            </Grid>
            {/* End Time */}
            <Grid size={1}>
              <div className="Box-table-content">
                <TextField size="small" value={endTimeText} disabled />
              </div>
            </Grid>
            {/* CO Time */}
            <Grid size={1}>
              <div className="Box-table-content">
                <TextField size="small" value={msToHMS(liveCoMs)} disabled />
              </div>
            </Grid>
            {/* Total Time */}
            <Grid size={1}>
              <div className="Box-table-content">
                <TextField size="small" value={totalTimeText} disabled />
              </div>
            </Grid>

            {/* Printed Sheets  */}
            <Grid size={0.5}>
              <div className="Box-table-content">
                <TextField
                  size="small"
                  value={`${component?.length} X ${component?.breadth} X ${component?.thickness}`}
                  disabled
                />
              </div>
            </Grid>

            {/* Rejected Sheets */}
            <Grid size={0.5}>
              <div className="Box-table-content">
                <TextField
                  size="small"
                  value={`${component?.length} X ${component?.breadth} X ${component?.thickness}`}
                  disabled
                />
              </div>
            </Grid>
            <Grid size={1}>
              <div className="Box-table-content">
                <ToggleButtonGroup
                  value={status}
                  exclusive
                  onChange={(e, val) => handleStatusChange(index, val)}
                  size="small"
                  disabled={timer.status !== "STOPPED"}
                  sx={{
                    opacity: timer.status !== "STOPPED" ? 0.6 : 1,
                  }}
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

  //Pending Dialog
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
      if (currentImage?.startsWith("blob:")) {
        URL.revokeObjectURL(currentImage);
      }
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

    const imageUrl = `${server?.defaults?.baseURL}/artworkImages/${encodeURIComponent(
      design?.file_name,
    )}.${design?.file_ext}`;

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

          updatedComponents[compName] = {
            ...comp,
            coating_process,
          };
        });

      const payload = {
        saleorder_no: design.saleorder_no,
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

  const handleCancel = () => {
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

  if (!design) return null;

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

            <Grid size={2}>
              <FormGroup>
                <Typography mb={1}>Instructor Name</Typography>

                <Select
                  value={formData.coating_operator_name ?? ""}
                  size="small"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      coating_operator_name: e.target.value,
                    })
                  }
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Select
                  </MenuItem>
                  <MenuItem value="KATHIRAVAN K">KATHIRAVAN K</MenuItem>
                  <MenuItem value="AMARNATH D">AMARNATH D</MenuItem>
                  <MenuItem value="SAMAY MARANDI">SAMAY MARANDI</MenuItem>
                </Select>
              </FormGroup>
            </Grid>

            <Grid size={2}>
              <FormGroup>
                <Typography mb={1}>Operator Name</Typography>

                <Select
                  value={formData.coating_operator_name ?? ""}
                  size="small"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      coating_operator_name: e.target.value,
                    })
                  }
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Select
                  </MenuItem>
                  <MenuItem value="KATHIRAVAN K">KATHIRAVAN K</MenuItem>
                  <MenuItem value="AMARNATH D">AMARNATH D</MenuItem>
                  <MenuItem value="SAMAY MARANDI">SAMAY MARANDI</MenuItem>
                </Select>
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
                <div>
                  Today's Work - ({new Date().toLocaleDateString()}){" "}
                  <span className={getArtWorkClass(design?.art_work)}>
                    {design?.art_work || "NA"}
                  </span>
                </div>
                <button className="gray-md-btn" onClick={handleArtworkView}>
                  <VisibilityIcon style={{ fontSize: 20 }} /> Artwork Image
                </button>
              </div>
            </Grid>
            {/* Header */}
            <Grid size={1}>
              <div className="Box-table-subtitle">Component</div>
            </Grid>
            <Grid size={1}>
              <div className="Box-table-subtitle">Sheet Size</div>
            </Grid>
            <Grid size={1}>
              <div className="Box-table-subtitle">No of Sheets</div>
            </Grid>
            <Grid size={1}>
              <div className="Box-table-subtitle">Source File</div>
            </Grid>
            <Grid size={1}>
              <div className="Box-table-subtitle">Coating Type</div>
            </Grid>
            <Grid size={1}>
              <div className="Box-table-subtitle">Action</div>
            </Grid>
            <Grid size={1}>
              <div className="Box-table-subtitle">Start Time</div>
            </Grid>
            <Grid size={1}>
              <div className="Box-table-subtitle">End Time</div>
            </Grid>
            <Grid size={1}>
              <div className="Box-table-subtitle">CO Time</div>
            </Grid>
            <Grid size={1}>
              <div className="Box-table-subtitle">Total Time</div>
            </Grid>
            <Grid size={0.5}>
              <div className="Box-table-subtitle">PS</div>
            </Grid>
            <Grid size={0.5}>
              <div className="Box-table-subtitle">RS</div>
            </Grid>
            <Grid size={0.5}>
              <div className="Box-table-subtitle">Status</div>
            </Grid>
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
                  value={pendingData?.reason ?? ""}
                  displayEmpty
                  onChange={(e) =>
                    setPendingData({
                      ...pendingData,
                      reason: e.target.value,
                    })
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
