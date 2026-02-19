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

const ComponentRow = ({ component, name, onViewFile, totalQty, soNumber }) => {
  const storageKey = `PRINTINGTEAM_${soNumber}_${name}`;

  const initTimer = () => ({
    status: "IDLE",
    startTime: null,
    endTime: null,
    currentTime: null,
    coRunning: false,
    coStart: null,
    coTotalMs: 0,
  });

  const isLoaded = useRef(false);

  const [timers, setTimers] = useState({});
  const [statusMap, setStatusMap] = useState({});

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      setTimers(parsed.timers || {});
      setStatusMap(parsed.statusMap || {});
    }
    isLoaded.current = true;
  }, [storageKey]);

  // Save to localStorage
  useEffect(() => {
    if (!isLoaded.current) return;

    localStorage.setItem(
      storageKey,
      JSON.stringify({
        timers,
        statusMap,
      }),
    );
  }, [timers, statusMap, storageKey]);

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
  }, []);

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

  // Data Handler
  const listOfPrinting = (() => {
    const c = component?.printingColor;
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

    return [...toArr(c.normalColor), ...toArr(c.splColor)];
  })();

  const originalSheets =
    component.ups && totalQty
      ? Math.ceil(Number(totalQty) / Number(component.ups))
      : "";

  return (
    <>
      {listOfPrinting.map((process, index) => {
        const timer = timers[index] || initTimer();
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

            {/* Printing Color */}
            <Grid size={1}>
              <div className="Box-table-content">
                <TextField
                  id="outlined-size-small"
                  size="small"
                  value={process}
                  disabled
                />
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

            {/*Change Time */}
            <Grid size={1}>
              <div className="Box-table-content">
                <TextField size="small" value={msToHMS(liveCoMs)} disabled />
              </div>
            </Grid>

            {/*Total Time */}
            <Grid size={1}>
              <div className="Box-table-content">
                <TextField size="small" value={totalTimeText} disabled />
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

      {/* First Row end Here  */}
    </>
  );
};

// Main Component Started Here
function EditPrintingTeam() {
  const navigate = useNavigate();
  const location = useLocation();
  const { design } = location?.state || {};

  const [open, setOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [components, setComponents] = useState({});

  console.log("components", components);

  const [formData, setFormData] = useState({
    customer_name: design?.customer_name || "",
    saleorder_no: design?.saleorder_no || "",
    posting_date: design?.posting_date
      ? new Date(design?.posting_date).toISOString().split("T")[0]
      : "",
    item_quantity: design?.item_quantity || "",
    shift: design?.planning_work_details?.shift || "",
    fab_site: design?.planning_work_details?.fab_site || "",
    sales_person_code: design?.sales_person_code || "",
    machine: design?.machine,
    printingteam_operator_name: design?.printingteam_operator_name,
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

  const buildLocalStorageFromDB = (componentName, componentData) => {
    if (!componentData?.printingteam_process) return;

    const timers = {};
    const statusMap = {};

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

    // SAME ORDER AS UI
    const printingList = [
      ...toArr(componentData?.printingColor?.normalColor),
      ...toArr(componentData?.printingColor?.splColor),
    ];

    printingList.forEach((processName, index) => {
      const p = componentData.printingteam_process[processName];
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

    const key = `PRINTINGTEAM_${design.saleorder_no}_${componentName}`;

    localStorage.setItem(
      key,
      JSON.stringify({
        timers,
        statusMap,
      }),
    );
  };

  useEffect(() => {
    if (!design?.components) return;

    const updatedComponents = { ...initialComponentsState };

    Object.entries(design.components).forEach(([name, comp]) => {
      if (updatedComponents[name]) {
        updatedComponents[name] = { ...comp };
        buildLocalStorageFromDB(name, comp);
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
    if (design?.printingteam_pending_details?.pending_reason) {
      setPendingData((prev) => ({
        ...prev,
        pending_reason: design?.printingteam_pending_details?.pending_reason,
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

  const isAllPrintingCompleted = () => {
    for (const compName of Object.keys(design?.components || {})) {
      const key = `PRINTINGTEAM_${design.saleorder_no}_${compName}`;
      const saved = localStorage.getItem(key);

      if (!saved) return false;

      const { timers = {}, statusMap = {} } = JSON.parse(saved);

      if (Object.keys(timers).length === 0) return false;

      for (const index of Object.keys(timers)) {
        const t = timers[index];

        if (!t || t.status !== "STOPPED") return false;

        if (statusMap[index] !== "Yes") return false;
      }
    }

    return true;
  };

  const handleSubmit = async (type) => {
    try {
      if (!formData?.printingteam_operator_name) {
        toast.info("Please Select Operator");
        return;
      }

      if (type === "FINAL" && !isAllPrintingCompleted()) {
        toast.warning(
          "All Printing processes must be completed before submitting. Moving to Pending.",
        );
        return;
      }

      const printingteam_status = type === "PENDING" ? 1 : 2;
      const updatedComponents = {};

      Object.entries(components)
        .filter(([compName]) => design?.components?.[compName])
        .forEach(([compName, comp]) => {
          const storageKey = `PRINTINGTEAM_${design.saleorder_no}_${compName}`;
          const saved = localStorage.getItem(storageKey);

          let printingteam_process = {};

          if (saved) {
            const { timers = {}, statusMap = {} } = JSON.parse(saved);

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

            const PrintingList = [
              ...toArr(comp?.printingColor?.normalColor),
              ...toArr(comp?.printingColor?.splColor),
            ];

            PrintingList.forEach((processName, index) => {
              const t = timers[index];
              if (!t || !t.startTime || !t.endTime) return;

              printingteam_process[processName] = {
                start_time: new Date(t.startTime),
                end_time: new Date(t.endTime),
                co_time: Math.floor((t.coTotalMs || 0) / 1000),
                total_time: Math.floor(
                  (t.endTime - t.startTime - (t.coTotalMs || 0)) / 1000,
                ),
                status: statusMap[index] === "Yes" ? 1 : 0,
              };
            });
          }

          updatedComponents[compName] = {
            ...comp,
            printingteam_process,
          };
        });

      const payload = {
        saleorder_no: design.saleorder_no,
        printingteam_operator_name: formData.printingteam_operator_name,
        printingteam_status,
        printingteam_pending_details:
          type === "PENDING"
            ? { pending_reason: pendingData?.pending_reason }
            : design?.printing_pending_details || {},
        components: updatedComponents,
      };

      await server.post("/design/add", payload);

      Object.keys(localStorage)
        .filter((k) => k.startsWith(`PRINTINGTEAM_${design.saleorder_no}_`))
        .forEach((k) => localStorage.removeItem(k));

      toast.success("Printing Color Saved Successfully");
      navigate("/printingteam_dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Failed to Save Printing Color");
    }
  };

  const handleCancel = () => {
    const soNo = formData.saleorder_no;

    Object.keys(localStorage)
      .filter((key) => key.startsWith(`PRINTINGTEAM_${soNo}_`))
      .forEach((key) => localStorage.removeItem(key));

    setComponents({});
    setTimeout(() => {
      setComponents(initialComponentsState);
    }, 0);

    toast.info("Changes cleared. Initial values restored.");

    navigate("/printingteam_dashboard");
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
              to={"/printingteam_dashboard"}
            >
              Printingteam Dashboard
            </Link>
            <KeyboardArrowRightIcon sx={{ color: "#0a85cb" }} />
            <div>Edit Printingteam</div>
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
                  id="outlined-size-small"
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
                <Typography mb={1}>Machine</Typography>
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  value={formData?.machine}
                  disabled
                />
              </FormGroup>
            </Grid>

            <Grid size={2}>
              <FormGroup>
                <Typography mb={1}>Shift</Typography>
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  value={formData?.shift}
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

            <Grid size={2}>
              <FormGroup>
                <Typography mb={1}>Operator Name</Typography>

                <Select
                  value={formData.printingteam_operator_name ?? ""}
                  size="small"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      printingteam_operator_name: e.target.value,
                    })
                  }
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Select
                  </MenuItem>
                  <MenuItem value="Name 1">Name 1</MenuItem>
                  <MenuItem value="Name 2">Name 2</MenuItem>
                  <MenuItem value="Name 3">Name 3</MenuItem>
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
                <button className="gray-md-btn">
                  <VisibilityIcon style={{ fontSize: 20 }} /> Artwork Image
                </button>
              </div>
            </Grid>
            
            {/* Header Start Here  */}
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
              <div className="Box-table-subtitle">Printing Color</div>
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
              <div className="Box-table-subtitle">Toatl Time</div>
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

            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                if (isAllPrintingCompleted()) {
                  toast.info(
                    "All Printing Process is completed. Please Submit.",
                  );
                  return;
                }
                setOpenPending(true);
              }}
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

export default EditPrintingTeam;
