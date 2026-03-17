import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  MenuItem,
  Grid,
  FormGroup,
  Typography,
  TextField,
  Select,
  Modal,
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
import InfoIcon from "@mui/icons-material/Info";

import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import SummarizeIcon from "@mui/icons-material/Summarize";

import { toast } from "react-toastify";

import "../../../pages/pagestyle.scss";
import server from "../../../../server/server";

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
  varnish: {
    title: "Varnish Machine",
    machines: ["Varnish Crab Tree"],
    sheetsPerHour: {
      "Varnish Crab Tree": 3500,
    },
  },
};

const formatDateLocal = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const ComponentRow = ({
  component,
  name,
  onViewFile,
  totalQty,
  processType,
  onPlanningChange,
  existingBookings = [],
  usedShiftMap = {},
}) => {
  const [processRows, setProcessRows] = useState([]);

  const [openShiftDialog, setOpenShiftDialog] = useState(false);

  const [openInfoDialog, setOpenInfoDialog] = useState(false);

  const [openShiftTypeDialog, setOpenShiftTypeDialog] = useState(false);

  const [activeRowIndex, setActiveRowIndex] = useState(null);

  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  const [infoData, setInfoData] = useState(null);

  const currentRow =
    activeRowIndex !== null ? processRows[activeRowIndex] : null;

  const dateRange = useMemo(() => {
    if (!currentRow?.startDate || !currentRow?.endDate) return [];

    const dates = [];
    const current = new Date(currentRow.startDate);
    const last = new Date(currentRow.endDate);

    while (current <= last) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }, [currentRow]);

  const extractKeysWithSequence = (obj) => {
    if (!obj || typeof obj !== "object") return [];

    return Object.entries(obj).flatMap(([key, value]) => {
      // Handle "Other"
      if (key === "Other" && value?.name) {
        const count = value.count || 1;

        return Array.from({ length: count }, (_, i) => {
          return `${value.name} ${i + 1}`;
        });
      }

      // Normal keys
      if (typeof value === "number") {
        return Array.from({ length: value }, (_, i) => {
          return `${key} ${i + 1}`;
        });
      }

      return [];
    });
  };
  useEffect(() => {
    let processes = [];

    if (processType === "coating") {
      const c = component?.coating || {};

      processes = [
        ...extractKeysWithSequence(c.insideColor),
        ...extractKeysWithSequence(c.outsideColor),
      ];
    }

    if (processType === "printing") {
      const p = component?.printingColor || {};

      processes = [
        ...extractKeysWithSequence(p.normalColor),
        ...extractKeysWithSequence(p.splColor),
      ];

      if (processes.length === 0) processes = ["Printing"];
    }

    if (processType === "varnish") {
      const v = component?.varnish?.varnish || {};

      processes = extractKeysWithSequence(v);

      if (processes.length === 0) processes = ["Varnish"];
    }

    const rows = processes.map((process) => {
      // find existing bookings for this component + process
      const matched = existingBookings.filter(
        (b) => b.component === name && b.process === process,
      );

      if (!matched.length) {
        return {
          process,
          machine: "",
          startDate: "",
          endDate: "",
          shifts: {},
        };
      }

      const machine = matched[0].machine;

      const shiftsObj = {};

      matched.forEach((b) => {
        const date = formatDateLocal(b.shift_from_dt);

        if (!shiftsObj[date]) shiftsObj[date] = [];

        shiftsObj[date].push(b.shift);
      });

      const dates = Object.keys(shiftsObj).sort();

      return {
        process,
        machine,
        startDate: dates[0],
        endDate: dates[dates.length - 1],
        shifts: shiftsObj,
      };
    });

    setProcessRows(rows);
  }, [component, processType, name, existingBookings]);

  const originalSheets =
    component.ups && totalQty
      ? Math.ceil(Number(totalQty) / Number(component.ups))
      : "";

  const findNextFreeSlot = (machine, startDate) => {
    let date = new Date(startDate);

    const shiftList = ["Shift 1", "Shift 2", "Shift 3"];

    while (true) {
      const formatted = formatDateLocal(date);

      const key = `${machine}_${formatted}`;

      const used = usedShiftMap[key] || new Set();

      for (let i = 0; i < shiftList.length; i++) {
        const shift = shiftList[i];

        if (!used.has(shift)) {
          return {
            date: formatted,
            shift,
            shiftIndex: i,
          };
        }
      }

      date.setDate(date.getDate() + 1);
    }
  };

  const autoPlanProduction = (rowIndex, shiftType) => {
    setProcessRows((prev) => {
      const updated = [...prev];

      const row = { ...updated[rowIndex] };

      if (!row.machine || !row.startDate) return prev;

      const machineCapacity =
        MACHINE_CONFIG[processType].sheetsPerHour[row.machine];

      const shiftHours = shiftType === "General" ? 9 : 8;

      const perShiftCapacity = machineCapacity * shiftHours;

      const requiredShifts = Math.ceil(component?.sheets / perShiftCapacity);

      let remainingShifts = requiredShifts;

      const nextFree = findNextFreeSlot(row.machine, row.startDate);

      let currentDate = new Date(nextFree.date);

      let startShiftIndex = nextFree.shiftIndex;

      const shiftList = ["Shift 1", "Shift 2", "Shift 3"];

      const shifts = {};

      const localUsed = {};

      Object.keys(usedShiftMap).forEach((k) => {
        localUsed[k] = new Set([...usedShiftMap[k]]);
      });
      while (remainingShifts > 0) {
        const formatted = formatDateLocal(currentDate);

        const key = `${row.machine}_${formatted}`;

        if (!localUsed[key]) {
          localUsed[key] = new Set();
        }

        shifts[formatted] = shifts[formatted] || [];

        if (shiftType === "General") {
          if (!localUsed[key].has("General")) {
            shifts[formatted].push("General");

            localUsed[key].add("General");

            remainingShifts--;
          }
        } else {
          for (let i = startShiftIndex; i < shiftList.length; i++) {
            if (remainingShifts <= 0) break;

            const shift = shiftList[i];

            if (!localUsed[key].has(shift)) {
              shifts[formatted].push(shift);

              localUsed[key].add(shift);

              remainingShifts--;
            }
          }
        }

        currentDate.setDate(currentDate.getDate() + 1);

        startShiftIndex = 0;
      }

      currentDate.setDate(currentDate.getDate() - 1);

      row.shifts = shifts;

      row.startDate = nextFree.date;

      row.endDate = formatDateLocal(currentDate);

      updated[rowIndex] = row;

      if (onPlanningChange) {
        onPlanningChange(updated);
      }

      return updated;
    });
  };

  const calculateInfoData = (row) => {
    if (!row.machine) return null;

    const machineCapacity =
      MACHINE_CONFIG[processType].sheetsPerHour[row.machine];

    let totalPlanned = 0;

    const shiftCounts = {
      General: 0,
      "Shift 1": 0,
      "Shift 2": 0,
      "Shift 3": 0,
    };

    Object.entries(row.shifts || {}).forEach(([date, shifts]) => {
      shifts.forEach((shift) => {
        const hours =
          shift === "General"
            ? SHIFT_CONFIG.General.hours
            : SHIFT_CONFIG["Shift 1"].hours;

        totalPlanned += machineCapacity * hours;
        shiftCounts[shift]++;
      });
    });

    const totalRequired = Number(component?.sheets) || 0;

    const remaining = Math.max(totalRequired - totalPlanned, 0);

    return {
      machineCapacity,
      totalRequired,
      totalPlanned,
      remaining,
      shiftCounts,
    };
  };
  const getRequiredShiftCount = (row) => {
    if (!row?.machine || !component?.sheets) return 0;

    const machineCapacity =
      MACHINE_CONFIG[processType].sheetsPerHour[row.machine];
    const hasGeneral = Object.values(row?.shifts || {})
      .flat()
      .includes("General");

    const hoursPerShift = hasGeneral ? 9 : 8;

    const perShiftCapacity = machineCapacity * hoursPerShift;

    return Math.ceil(Number(component.sheets) / perShiftCapacity);
  };
  const getCurrentShiftCount = (row) => {
    return Object.values(row?.shifts || {}).reduce(
      (total, shifts) => total + shifts.length,
      0,
    );
  };

  const getMachineRunningInfo = (machine, date) => {
    const key = `${machine}_${date}`;

    const used = usedShiftMap[key];

    if (!used || used.size === 0) return null;

    const shiftList = ["Shift 1", "Shift 2", "Shift 3"];

    for (let shift of shiftList) {
      if (used.has(shift)) {
        return {
          machine,
          date,
          shift,
        };
      }
    }

    return null;
  };
  return (
    <>
      {processRows.map((row, index) => {
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
                  value={row.process}
                  disabled
                />
              </div>
            </Grid>

            {/* Machine */}
            <Grid size={1}>
              <div className="Box-table-content">
                <Select
                  size="small"
                  value={row.machine}
                  displayEmpty
                  onChange={(e) => {
                    const value = e.target.value;

                    setProcessRows((prev) => {
                      const updated = prev.map((row, i) =>
                        i === index
                          ? { ...row, machine: value, shifts: {} }
                          : row,
                      );

                      if (onPlanningChange) {
                        onPlanningChange(updated);
                      }

                      return updated;
                    });

                    const currentStartDate = processRows[index]?.startDate;

                    if (value && currentStartDate) {
                      setSelectedRowIndex(index);
                      setOpenShiftTypeDialog(true);
                    }
                  }}
                >
                  <MenuItem value="" disabled>
                    Select
                  </MenuItem>
                  {MACHINE_CONFIG[processType]?.machines?.map((m) => (
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
                  value={row.startDate}
                  onChange={(e) => {
                    const value = e.target.value;

                    setProcessRows((prev) => {
                      const updated = prev.map((row, i) =>
                        i === index
                          ? { ...row, startDate: value, shifts: {} }
                          : row,
                      );

                      if (onPlanningChange) {
                        onPlanningChange(updated);
                      }

                      return updated;
                    });

                    const currentMachine = processRows[index]?.machine;

                    if (value && currentMachine) {
                      setSelectedRowIndex(index);
                      setOpenShiftTypeDialog(true);
                    }
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
                  value={row.endDate}
                  onChange={(e) => {
                    const value = e.target.value;

                    setProcessRows((prev) => {
                      const updated = prev.map((row, i) =>
                        i === index
                          ? { ...row, endDate: value, shifts: {} }
                          : row,
                      );

                      if (onPlanningChange) {
                        onPlanningChange(updated);
                      }

                      return updated;
                    });
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
                  color={
                    Object.keys(row.shifts).length > 0 ? "error" : "inherit"
                  }
                  onClick={() => {
                    if (!row.machine || !row.startDate || !row.endDate) {
                      toast.error("Please select Machine and Dates first");
                      return;
                    }
                    setActiveRowIndex(index);
                    setOpenShiftDialog(true);
                  }}
                >
                  {Object.keys(row.shifts).length > 0 ? "Edit" : "Select"}
                </Button>
              </div>
            </Grid>
            <Grid size={1}>
              <div className="Box-table-content">
                <InfoIcon
                  sx={{ cursor: "pointer", color: "#0a85cb" }}
                  onClick={() => {
                    const data = calculateInfoData(row);
                    setInfoData(data);
                    setOpenInfoDialog(true);
                  }}
                />
              </div>
            </Grid>
          </Fragment>
        );
      })}

      {/* Shift Dialog */}
      <Dialog
        open={openShiftDialog}
        onClose={() => setOpenShiftDialog(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: "16px" } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight="bold" color="#0a85cb">
            Select Shift
          </Typography>

          <IconButton onClick={() => setOpenShiftDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {currentRow && dateRange.length > 0 && (
            <Box display="flex" justifyContent="flex-end">
              <Box
                sx={{
                  color: "#2e7d32",
                }}
              >
                {getCurrentShiftCount(currentRow)} /
                {getRequiredShiftCount(currentRow)} Shifts Selected
              </Box>
            </Box>
          )}

          {dateRange.length === 0 ? (
            <Typography color="error">
              Please select Machine and Date range
            </Typography>
          ) : (
            dateRange.map((dateObj, index) => {
              const formatted = formatDateLocal(dateObj);

              return (
                <Box key={index} mb={2}>
                  <Typography sx={{ fontWeight: 600, color: "#0a85cb" }}>
                    {formatted}
                  </Typography>

                  <Box mt={1} display="flex" gap={2} flexWrap="wrap">
                    {SHIFT_ORDER.map((shift) => {
                      const isChecked =
                        currentRow?.shifts?.[formatted]?.includes(shift) ||
                        false;
                      const machine = currentRow?.machine;

                      const key = `${machine}_${formatted}`;

                      const usedShifts = usedShiftMap[key] || new Set();

                      const isUsedElsewhere =
                        usedShifts.has(shift) &&
                        !currentRow?.shifts?.[formatted]?.includes(shift);

                      const requiredCount = getRequiredShiftCount(currentRow);
                      const currentCount = getCurrentShiftCount(currentRow);
                      const isMaxReached = currentCount >= requiredCount;

                      return (
                        <FormControlLabel
                          key={shift}
                          label={shift}
                          control={
                            <Checkbox
                              color="success"
                              checked={isChecked}
                              disabled={
                                isUsedElsewhere ||
                                (isMaxReached && !isChecked) ||
                                (shift === "General"
                                  ? (
                                      currentRow?.shifts?.[formatted] || []
                                    ).some((s) => s !== "General")
                                  : (
                                      currentRow?.shifts?.[formatted] || []
                                    ).includes("General"))
                              }
                              onChange={(e) => {
                                setProcessRows((prev) => {
                                  const updated = [...prev];

                                  const rowData = {
                                    ...updated[activeRowIndex],
                                  };
                                  const shifts = { ...rowData.shifts };

                                  let prevShifts = shifts[formatted] || [];

                                  if (e.target.checked) {
                                    if (shift === "General") {
                                      shifts[formatted] = ["General"];
                                    } else {
                                      prevShifts = prevShifts.filter(
                                        (s) => s !== "General",
                                      );
                                      shifts[formatted] = [
                                        ...prevShifts,
                                        shift,
                                      ];
                                    }
                                  } else {
                                    shifts[formatted] = prevShifts.filter(
                                      (s) => s !== shift,
                                    );
                                  }

                                  rowData.shifts = shifts;
                                  updated[activeRowIndex] = rowData;
                                  if (onPlanningChange) {
                                    onPlanningChange(updated);
                                  }
                                  return updated;
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

      {/* Shift Type Dialog */}

      <Dialog
        open={openShiftTypeDialog}
        onClose={() => setOpenShiftTypeDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: "16px" } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight="bold" color="#0a85cb">
            Shift Type
          </Typography>

          <IconButton onClick={() => setOpenShiftTypeDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Box display="flex" flexDirection="row" gap={1}>
            <Button
              fullWidth
              variant="contained"
              color="success"
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
                py: 1.2,
              }}
              onClick={() => {
                autoPlanProduction(selectedRowIndex, "General");
                setOpenShiftTypeDialog(false);
              }}
            >
              General - 9H
            </Button>

            <Button
              fullWidth
              variant="outlined"
              color="primary"
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
                py: 1.2,
              }}
              onClick={() => {
                autoPlanProduction(selectedRowIndex, "Shift");
                setOpenShiftTypeDialog(false);
              }}
            >
              Shift - 8H
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Machine Info Dialog */}

      <Dialog
        open={openInfoDialog}
        onClose={() => setOpenInfoDialog(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: "16px",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight="bold" color="#0a85cb">
            Machine Production Info
          </Typography>

          <IconButton onClick={() => setOpenInfoDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {infoData ? (
            <Box display="flex" flexDirection="column" gap={2}>
              {/* Card Item */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: "#f4f9ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <PrecisionManufacturingIcon color="primary" />
                  <Typography color="text.secondary">
                    Machine Capacity
                  </Typography>
                </Box>

                <Typography fontWeight="bold" color="primary">
                  {infoData.machineCapacity.toLocaleString()} sheets/hr
                </Typography>
              </Box>

              {/* Required */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: "#f6fff6",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <AssignmentIcon sx={{ color: "#2e7d32" }} />
                  <Typography color="text.secondary">
                    Required Quantity
                  </Typography>
                </Box>

                <Typography fontWeight="bold" sx={{ color: "#2e7d32" }}>
                  {infoData.totalRequired.toLocaleString()} sheets
                </Typography>
              </Box>

              {/* Planned */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: "#fff8f0",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <PlaylistAddCheckIcon sx={{ color: "#ed6c02" }} />
                  <Typography color="text.secondary">
                    Planned Quantity
                  </Typography>
                </Box>

                <Typography fontWeight="bold" sx={{ color: "#ed6c02" }}>
                  {infoData.totalPlanned.toLocaleString()} sheets
                </Typography>
              </Box>

              {/* Remaining */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: "#fff0f0",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <PendingActionsIcon sx={{ color: "#d32f2f" }} />
                  <Typography color="text.secondary">
                    Remaining Quantity
                  </Typography>
                </Box>

                <Typography fontWeight="bold" sx={{ color: "#d32f2f" }}>
                  {infoData.remaining.toLocaleString()} sheets
                </Typography>
              </Box>
              {/* Shift Summary */}

              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: "#ede7f6",
                  border: "1px solid #d1c4e9",
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <SummarizeIcon sx={{ color: "#5e35b1" }} />

                  <Typography fontWeight="bold" sx={{ color: "#5e35b1" }}>
                    Shift Summary
                  </Typography>
                </Box>

                {Object.entries(infoData.shiftCounts).map(([shift, count]) =>
                  count > 0 ? (
                    <Box
                      key={shift}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ py: 0.5 }}
                    >
                      <Typography sx={{ color: "#4527a0" }}>{shift}</Typography>

                      <Typography fontWeight="bold" sx={{ color: "#5e35b1" }}>
                        {count} - Shift
                      </Typography>
                    </Box>
                  ) : null,
                )}
              </Box>
            </Box>
          ) : (
            <Typography
              color="error"
              textAlign="center"
              fontWeight="bold"
              py={3}
            >
              Machine not selected
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

// Main Component Started Here
function EditPlan() {
  const navigate = useNavigate();
  const location = useLocation();
  const { design } = location?.state || {};

  const [components, setComponents] = useState({});

  const [open, setOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");

  const [formData, setFormData] = useState({
    customer_name: design?.customer_name || "",
    saleorder_no: design?.saleorder_no || "",
    posting_date: design?.posting_date
      ? formatDateLocal(design?.posting_date)
      : "",
    item_quantity: design?.item_quantity || "",
    shift: design?.planning_work_details?.shift || "",
    fab_site: design?.planning_work_details?.fab_site || "",
    sales_employee: design?.sales_employee || "",
    telephone: design?.telephone || "",
    art_work: design?.art_work || "NA",
  });

  const [planningData, setPlanningData] = useState({
    coating: {},
    printing: {},
    varnish: {},
  });
  const coatingBookings = useMemo(() => {
    return design?.planning_work_details?.coating_machine_plan?.bookings ?? [];
  }, [design]);

  const printingBookings = useMemo(() => {
    return design?.planning_work_details?.printing_machine_plan?.bookings ?? [];
  }, [design]);

  const varnishBookings = useMemo(() => {
    return design?.planning_work_details?.varnish_machine_plan?.bookings ?? [];
  }, [design]);

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
    if (!design?.planning_work_details) return;

    const buildPlanningSection = (bookings = []) => {
      const section = {};

      bookings.forEach((b) => {
        if (!section[b.component]) section[b.component] = [];

        let row = section[b.component].find((r) => r.process === b.process);

        if (!row) {
          row = {
            process: b.process,
            machine: b.machine,
            startDate: "",
            endDate: "",
            shifts: {},
          };
          section[b.component].push(row);
        }

        const date = formatDateLocal(b.shift_from_dt);

        if (!row.shifts[date]) row.shifts[date] = [];

        row.shifts[date].push(b.shift);
      });

      // set start & end date
      Object.values(section).forEach((rows) => {
        rows.forEach((row) => {
          const dates = Object.keys(row.shifts).sort();
          if (dates.length) {
            row.startDate = dates[0];
            row.endDate = dates[dates.length - 1];
          }
        });
      });

      return section;
    };

    const coatingSection = buildPlanningSection(
      design.planning_work_details.coating_machine_plan?.bookings || [],
    );

    const printingSection = buildPlanningSection(
      design.planning_work_details.printing_machine_plan?.bookings || [],
    );

    const varnishSection = buildPlanningSection(
      design.planning_work_details.varnish_machine_plan?.bookings || [],
    );

    setPlanningData({
      coating: coatingSection,
      printing: printingSection,
      varnish: varnishSection,
    });
  }, [design]);

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

  const usedShiftMap = useMemo(() => {
    const map = {};

    const addFromPlanningData = (section) => {
      Object.entries(section).forEach(([component, rows]) => {
        rows.forEach((row) => {
          if (!row.machine) return;

          Object.entries(row.shifts || {}).forEach(([date, shifts]) => {
            shifts.forEach((shift) => {
              const key = `${row.machine}_${date}`;

              if (!map[key]) map[key] = new Set();

              map[key].add(shift);
            });
          });
        });
      });
    };

    const addFromExistingBookings = (bookings = []) => {
      bookings.forEach((b) => {
        const date = formatDateLocal(b.shift_from_dt);

        const key = `${b.machine}_${date}`;

        if (!map[key]) map[key] = new Set();

        map[key].add(b.shift);
      });
    };

    // from UI planning
    addFromPlanningData(planningData.coating);
    addFromPlanningData(planningData.printing);
    addFromPlanningData(planningData.varnish);

    // from backend existing bookings
    addFromExistingBookings(
      design?.planning_work_details?.coating_machine_plan?.bookings,
    );

    addFromExistingBookings(
      design?.planning_work_details?.printing_machine_plan?.bookings,
    );

    addFromExistingBookings(
      design?.planning_work_details?.varnish_machine_plan?.bookings,
    );

    return map;
  }, [planningData, design]);

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

  const generateBookings = (planningSection) => {
    const bookings = [];

    Object.entries(planningSection).forEach(([componentName, rows]) => {
      rows.forEach((row) => {
        if (!row.machine) return;

        Object.entries(row.shifts || {}).forEach(([date, shifts]) => {
          if (!shifts?.length) return;

          shifts.forEach((shift) => {
            const shiftConfig = SHIFT_CONFIG[shift];

            let from = `${date}T${shiftConfig.from}:00`;
            let toDate = date;

            if (shiftConfig.crossDay) {
              const temp = new Date(date);
              temp.setDate(temp.getDate() + 1);
              toDate = formatDateLocal(temp);
            }

            let to = `${toDate}T${shiftConfig.to}:00`;

            bookings.push({
              component: componentName,
              process: row.process,
              machine: row.machine,
              shift,
              shift_from_dt: from,
              shift_to_dt: to,
            });
          });
        });
      });
    });

    return bookings;
  };

  const handleArtworkView = () => {
    if (!design?.file_name || !design?.file_ext) return;

    const imageUrl = `${server?.defaults?.baseURL}/artworkImages/${encodeURIComponent(
      design?.file_name,
    )}.${design?.file_ext}`;

    setCurrentImage(imageUrl);
    setOpen(true);
  };

  const handleSubmit = async (status) => {
    try {
      const coatingBookings = generateBookings(planningData.coating);

      const printingBookings = generateBookings(planningData.printing);

      const varnishBookings = generateBookings(planningData.varnish);

      if (
        !coatingBookings.length &&
        !printingBookings.length &&
        !varnishBookings.length
      ) {
        toast.error("Please plan at least one machine shift");
        return;
      }
      const payload = {
        saleorder_no: formData.saleorder_no,

        planning_status: status === "FINAL" ? 2 : status === "PENDING" ? 1 : 0,

        planning_work_details: {
          coating_machine_plan: {
            bookings: coatingBookings,
          },

          printing_machine_plan: {
            bookings: printingBookings,
          },
          varnish_machine_plan: { bookings: varnishBookings },
        },
      };

      await server.post(`/design/add`, payload);

      toast.success("Planning Saved");

      navigate("/planning_dashboard");
    } catch (err) {
      toast.error("Save Failed");
    }
  };
  const handleCancel = () => {
    navigate("/planning_dashboard");
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
              to={"/Planning_dashboard"}
            >
              Planning Dashboard
            </Link>
            <KeyboardArrowRightIcon sx={{ color: "#0a85cb" }} />
            <div>Edit Planning</div>
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
                      ? formatDateLocal(formData?.posting_date)
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
                <Typography mb={1}>SP Contact No</Typography>
                <TextField
                  id="outlined-size-small"
                  size="small"
                  value={formData?.telephone}
                  disabled
                />
              </FormGroup>
            </Grid>

            {/* <Grid size={2}>
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
            </Grid> */}

            <Grid size={12}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "5px",
                }}
              >
                {/* Left Side - Machine Calendar */}
                <button
                  className="gray-md-btn"
                  onClick={() => navigate("/machine_calendar")}
                >
                  <CalendarMonthOutlinedIcon style={{ fontSize: 20 }} /> Machine
                  Calendar
                </button>

                {/* Right Side - Artwork Image */}
                <button className="gray-md-btn" onClick={handleArtworkView}>
                  <VisibilityIcon style={{ fontSize: 20 }} /> Artwork Image
                </button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Coating Machine plan  */}
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
              <div className="Box-table-subtitle">Info</div>
            </Grid>
            {/* Header End Here  */}

            {/* Coating Render Componnet */}
            {Object.entries(components)
              .filter(([key]) =>
                Object.keys(design?.components || {}).includes(key),
              )
              .map(([key, component]) => (
                <MemoComponentRow
                  key={`coating-${key}`}
                  component={component}
                  name={key}
                  onViewFile={handleViewFile}
                  totalQty={design?.item_quantity}
                  processType="coating"
                  existingBookings={coatingBookings}
                  usedShiftMap={usedShiftMap}
                  onPlanningChange={(data) => {
                    setPlanningData((prev) => ({
                      ...prev,
                      coating: {
                        ...prev.coating,
                        [key]: data,
                      },
                    }));
                  }}
                />
              ))}
          </Grid>
        </Box>

        {/* Printing Machine Plan */}
        <Box
          sx={{
            background: "#fff",
            mt: 3,
            boxShadow:
              "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
          }}
        >
          <Grid container spacing={0.5}>
            <Grid size={12}>
              <div className="Box-table-title">Printing Machine Plan</div>
            </Grid>

            {/* Header */}
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
              <div className="Box-table-subtitle">Printing Type</div>
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
              <div className="Box-table-subtitle">Info</div>
            </Grid>

            {/* Printing Render Componnet */}
            {Object.entries(components)
              .filter(([key]) =>
                Object.keys(design?.components || {}).includes(key),
              )
              .map(([key, component]) => (
                <MemoComponentRow
                  key={`printing-${key}`}
                  component={component}
                  name={key}
                  onViewFile={handleViewFile}
                  totalQty={design?.item_quantity}
                  processType="printing"
                  existingBookings={printingBookings}
                  usedShiftMap={usedShiftMap}
                  onPlanningChange={(data) => {
                    setPlanningData((prev) => ({
                      ...prev,
                      printing: {
                        ...prev.printing,
                        [key]: data,
                      },
                    }));
                  }}
                />
              ))}
          </Grid>
        </Box>

        {/* Varnish Machine Plan */}
        <Box
          sx={{
            background: "#fff",
            mt: 3,
            boxShadow:
              "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
          }}
        >
          <Grid container spacing={0.5}>
            <Grid size={12}>
              <div className="Box-table-title">Varnish Machine Plan</div>
            </Grid>

            {/* Header */}
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
              <div className="Box-table-subtitle">Varnish Type</div>
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
              <div className="Box-table-subtitle">Info</div>
            </Grid>

            {/* Printing Render Componnet */}
            {Object.entries(components)
              .filter(([key]) =>
                Object.keys(design?.components || {}).includes(key),
              )
              .map(([key, component]) => (
                <MemoComponentRow
                  key={`varnish-${key}`}
                  component={component}
                  name={key}
                  onViewFile={handleViewFile}
                  totalQty={design?.item_quantity}
                  processType="varnish"
                  existingBookings={varnishBookings}
                  usedShiftMap={usedShiftMap}
                  onPlanningChange={(data) => {
                    setPlanningData((prev) => ({
                      ...prev,
                      varnish: {
                        ...prev.varnish,
                        [key]: data,
                      },
                    }));
                  }}
                />
              ))}
          </Grid>
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
                  <MenuItem value="Material Not Available">
                    Material Not Available
                  </MenuItem>
                  <MenuItem value="No Man Power">No Man Power</MenuItem>
                  <MenuItem value="Machine Breakdown - Mechanical">
                    Machine Breakdown - Mechanical
                  </MenuItem>
                  <MenuItem value="Machine Breakdown - Electrical">
                    Machine Breakdown - Electrical
                  </MenuItem>
                  <MenuItem value="Flim Plate Damage">
                    Flim Plate Damage
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
      {/* Action Buttons */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          p: 2,
          mt: 2,
          gap: 2,
          mr: 6,
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
          sx={{ minWidth: 100 }}
          onClick={() => setOpenPending(true)}
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
  );
}

const MemoComponentRow = React.memo(ComponentRow);

export default EditPlan;
