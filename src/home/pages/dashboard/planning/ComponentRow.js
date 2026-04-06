import React, { Fragment, useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Tooltip,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import InfoIcon from "@mui/icons-material/Info";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { useDesign } from "../../../../API/Design_API";
import {
  ShiftDialog,
  ShiftTypeDialog,
  InfoDialog,
  MachineAvailabilityDialog,
} from "./PlanningDialogs";

export const EPSILON = 0.0001;

export const SHIFT_CONFIG = {
  General: { from: "09:00", to: "18:00", hours: 9, crossDay: false },
  "Shift 1": { from: "06:00", to: "14:00", hours: 8, crossDay: false },
  "Shift 2": { from: "14:00", to: "22:00", hours: 8, crossDay: false },
  "Shift 3": { from: "22:00", to: "06:00", hours: 8, crossDay: true },
};

export const MACHINE_CONFIG = {
  coating: {
    title: "Coating Machine",
    machines: ["Crab Tree"],
    sheetsPerHour: { "Crab Tree": 3500 },
  },
  printing: {
    title: "Printing Machine",
    machines: ["IGK", "DC", "NIGK", "RTCPL-DC"],
    sheetsPerHour: { IGK: 1600, DC: 3500, NIGK: 3500, "RTCPL-DC": 2500 },
  },
  varnish: {
    title: "Varnish Machine",
    machines: ["Var Crab Tree"],
    sheetsPerHour: { "Var Crab Tree": 3500 },
  },
};

// Helper Functions

export const formatDateLocal = (date) => {
  const d = new Date(date);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
};

const expandKeysWithSequence = (obj) => {
  if (!obj || typeof obj !== "object") return [];
  return Object.entries(obj).flatMap(([key, value]) => {
    if (key === "Other" && value?.name) {
      return Array.from(
        { length: value.count || 1 },
        (_, i) => `${value.name} - ${i + 1}`,
      );
    }
    if (typeof value === "number") {
      return Array.from({ length: value }, (_, i) => `${key} - ${i + 1}`);
    }
    return [];
  });
};

const getProcessLabels = (component, processType) => {
  if (processType === "coating") {
    const c = component?.coating || {};
    const insideLabels = expandKeysWithSequence(c.insideColor).map(
      (label) => `In - ${label}`,
    );
    const outsideLabels = expandKeysWithSequence(c.outsideColor).map(
      (label) => `Out - ${label}`,
    );
    const labels = [...insideLabels, ...outsideLabels];
    return labels.length ? labels : [];
  }
  if (processType === "printing") {
    const p = component?.printingColor || {};
    const labels = [
      ...expandKeysWithSequence(p.normalColor),
      ...expandKeysWithSequence(p.splColor),
    ];
    return labels.length ? labels : ["Printing"];
  }
  if (processType === "varnish") {
    const labels = expandKeysWithSequence(component?.varnish?.varnish || {});
    return labels.length ? labels : ["Varnish"];
  }
  return [];
};

const buildRowFromBookings = (process, matched) => {
  if (!matched.length) {
    return { process, machine: "", startDate: "", endDate: "", slots: {} };
  }

  const machine = matched[0].machine;
  const slots = {};

  matched.forEach((b) => {
    const date = formatDateLocal(b.shift_from_dt);
    const shiftHours = SHIFT_CONFIG[b.shift]?.hours ?? 8;
    const allocatedHours = b.allocated_hours ?? shiftHours;
    const plannedSheets = b.planned_sheets ?? null;

    if (!slots[date]) slots[date] = {};
    slots[date][b.shift] = {
      allocatedHours,
      shiftCapacityHours: shiftHours,
      remainingHours: shiftHours - allocatedHours,
      plannedSheets,
      isManual: false,
    };
  });

  const dates = Object.keys(slots).sort();
  return {
    process,
    machine,
    startDate: dates[0],
    endDate: dates[dates.length - 1],
    slots,
  };
};

const cloneUsedMap = (map) =>
  Object.fromEntries(Object.entries(map).map(([k, v]) => [k, { ...v }]));

const PLAN_SECTION_KEYS = [
  "coating_machine_plan",
  "printing_machine_plan",
  "varnish_machine_plan",
];

const buildCrossOrderShiftMap = (designs, currentUniqueId) => {
  const map = {};
  if (!designs?.length) return map;

  designs.forEach((d) => {
    if (d.unique_id === currentUniqueId) return;
    if (!d.planning_work_details) return;

    PLAN_SECTION_KEYS.forEach((key) => {
      const bookings = d.planning_work_details?.[key]?.bookings;
      if (!bookings?.length) return;

      bookings.forEach((b) => {
        if (!b.machine || !b.shift || !b.shift_from_dt) return;
        const date = formatDateLocal(b.shift_from_dt);
        const mapKey = `${b.machine}_${date}_${b.shift}`;
        const hours = b.allocated_hours ?? SHIFT_CONFIG[b.shift]?.hours ?? 8;

        if (!map[mapKey]) map[mapKey] = { usedHours: 0 };
        map[mapKey].usedHours += hours;
      });
    });
  });

  return map;
};

const checkMachineAvailability = (machine, date, crossOrderMap) => {
  const allCheckShifts = ["General", "Shift 1", "Shift 2", "Shift 3"];
  const productionShifts = ["Shift 1", "Shift 2", "Shift 3"];

  const shiftStatus = allCheckShifts.map((shift) => {
    const key = `${machine}_${date}_${shift}`;
    const usedHours = crossOrderMap[key]?.usedHours || 0;
    const shiftCap = SHIFT_CONFIG[shift].hours;
    const freeHours = shiftCap - usedHours;
    return { shift, usedHours, freeHours, isFull: freeHours <= EPSILON };
  });

  const allProdFull = productionShifts.every(
    (s) => shiftStatus.find((x) => x.shift === s)?.isFull,
  );

  if (allProdFull) return { status: "full", shiftStatus };

  const busyShifts = shiftStatus.filter((s) => s.isFull);
  const freeShifts = shiftStatus.filter((s) => !s.isFull);

  if (busyShifts.length === 0) return { status: "available", shiftStatus };
  return { status: "partial", shiftStatus, freeShifts, busyShifts };
};

// ComponentRow
const ComponentRow = ({
  component,
  name,
  onViewFile,
  totalQty,
  processType,
  onPlanningChange,
  existingBookings = [],
  usedShiftMap = {},
  currentUniqueId,
  sectionMachine,
}) => {
  const navigate = useNavigate();
  const { designs } = useDesign();

  const [processRows, setProcessRows] = useState([]);
  const [openShiftDialog, setOpenShiftDialog] = useState(false);
  const [openInfoDialog, setOpenInfoDialog] = useState(false);
  const [openShiftType, setOpenShiftType] = useState(false);
  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [infoData, setInfoData] = useState(null);

  const [availabilityDialog, setAvailabilityDialog] = useState({
    open: false,
    info: null,
  });

  const currentRow =
    activeRowIndex !== null ? processRows[activeRowIndex] : null;

  const crossOrderShiftMap = useMemo(
    () => buildCrossOrderShiftMap(designs, currentUniqueId),
    [designs, currentUniqueId],
  );

  const dateRange = useMemo(() => {
    if (!currentRow?.startDate || !currentRow?.endDate) return [];
    const dates = [];
    const cur = new Date(currentRow.startDate);
    const last = new Date(currentRow.endDate);
    while (cur <= last) {
      dates.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return dates;
  }, [currentRow?.startDate, currentRow?.endDate]);

  useEffect(() => {
    const labels = getProcessLabels(component, processType);
    setProcessRows(
      labels.map((process) => {
        const matched = existingBookings.filter(
          (b) => b.component === name && b.process === process,
        );
        const row = buildRowFromBookings(process, matched);
        if (!row.machine && sectionMachine) row.machine = sectionMachine;
        return row;
      }),
    );
  }, [component, processType, name, existingBookings]);

  useEffect(() => {
    if (!sectionMachine) return;
    setProcessRows((prev) => {
      const updated = prev.map((row) => ({
        ...row,
        machine: sectionMachine,
        slots: {},
        startDate: row.startDate,
        endDate: row.endDate,
      }));
      onPlanningChange?.(updated);
      return updated;
    });
  }, [sectionMachine]);

  const getCapacity = (machine) =>
    MACHINE_CONFIG[processType]?.sheetsPerHour?.[machine] ?? 0;

  const getRequiredHours = (machine) => {
    const cap = getCapacity(machine);
    if (!cap || !component?.sheets) return 0;
    return Number(component.sheets) / cap;
  };

  const getRequiredShiftCount = (row) => {
    if (!row?.machine || !component?.sheets) return 0;
    const reqH = getRequiredHours(row.machine);
    const shiftHours = 8;
    return Math.max(1, Math.ceil(reqH / shiftHours));
  };

  const getCurrentShiftCount = (row) =>
    Object.values(row?.slots || {}).reduce(
      (sum, shifts) => sum + Object.keys(shifts).length,
      0,
    );

  const getAllocatedHours = (row) =>
    Object.values(row?.slots || {}).reduce(
      (sum, shifts) =>
        sum +
        Object.values(shifts).reduce(
          (s2, sl) => s2 + (sl.allocatedHours || 0),
          0,
        ),
      0,
    );

  // Machine availability check
  const checkAndShowAvailability = (machine, date) => {
    if (!machine || !date) return true;

    const result = checkMachineAvailability(machine, date, crossOrderShiftMap);
    if (result.status === "available") return true;

    setAvailabilityDialog({
      open: true,
      info: {
        machine,
        date,
        status: result.status,
        shiftStatus: result.shiftStatus,
        freeShifts: result.freeShifts,
        busyShifts: result.busyShifts,
      },
    });

    return result.status !== "full";
  };

  // Info panel data
  const calculateInfoData = (row) => {
    if (!row.machine) return null;

    const capacity = getCapacity(row.machine);
    const requiredSheets = Number(component?.sheets) || 0;
    const actualHoursNeeded = requiredSheets / capacity;

    let totalPlannedSheets = 0;
    let totalAllocatedHours = 0;
    const shiftBreakdown = {};

    Object.entries(row.slots || {}).forEach(([, shifts]) => {
      Object.entries(shifts).forEach(([shift, slot]) => {
        const hours = slot.allocatedHours || 0;
        const sheets = slot.plannedSheets ?? Math.round(capacity * hours);

        totalPlannedSheets += sheets;
        totalAllocatedHours += hours;

        if (!shiftBreakdown[shift])
          shiftBreakdown[shift] = { count: 0, hours: 0, plannedSheets: 0 };
        shiftBreakdown[shift].count++;
        shiftBreakdown[shift].hours += hours;
        shiftBreakdown[shift].plannedSheets += sheets;
      });
    });

    const utilizationPercent =
      totalAllocatedHours > EPSILON
        ? Math.min(
            Math.round((actualHoursNeeded / totalAllocatedHours) * 100),
            100,
          )
        : 0;

    return {
      machineCapacity: capacity,
      totalRequired: requiredSheets,
      totalPlanned: totalPlannedSheets,
      remaining: Math.max(requiredSheets - totalPlannedSheets, 0),
      actualHoursNeeded,
      totalAllocatedHours,
      utilizationPercent,
      shiftBreakdown,
    };
  };

  const findNextFreeSlot = (machine, startDate, shiftList) => {
    let date = new Date(startDate);
    const MAX_DAYS = 365;

    for (let i = 0; i < MAX_DAYS; i++) {
      const formatted = formatDateLocal(date);
      for (const shift of shiftList) {
        const key = `${machine}_${formatted}_${shift}`;
        const usedH = usedShiftMap[key]?.usedHours || 0;
        const freeH = SHIFT_CONFIG[shift].hours - usedH;
        if (freeH > EPSILON)
          return { date: formatted, shift, freeHours: freeH };
      }
      date.setDate(date.getDate() + 1);
    }

    return {
      date: formatDateLocal(new Date(startDate)),
      shift: shiftList[0],
      freeHours: 0,
    };
  };

  const autoPlanProduction = (rowIndex, shiftType) => {
    setProcessRows((prev) => {
      const updated = [...prev];
      const row = { ...updated[rowIndex] };
      if (!row.machine || !row.startDate) return prev;

      const canProceed = checkAndShowAvailability(row.machine, row.startDate);
      if (!canProceed) return prev;

      const capacity = getCapacity(row.machine);
      const shiftList =
        shiftType === "General"
          ? ["General"]
          : ["Shift 1", "Shift 2", "Shift 3"];

      let remainingHours = Number(component?.sheets) / capacity;
      const slots = {};
      const localUsed = cloneUsedMap(usedShiftMap);

      const first = findNextFreeSlot(row.machine, row.startDate, shiftList);
      let cur = new Date(first.date);

      while (remainingHours > EPSILON) {
        const formatted = formatDateLocal(cur);

        for (const shift of shiftList) {
          if (remainingHours <= EPSILON) break;

          const key = `${row.machine}_${formatted}_${shift}`;
          const usedH = localUsed[key]?.usedHours || 0;
          const shiftCap = SHIFT_CONFIG[shift].hours;
          const freeH = shiftCap - usedH;

          if (freeH <= EPSILON) continue;

          const toAllocate = Math.min(remainingHours, freeH);
          const sheetsDone = Math.round(toAllocate * capacity);

          if (!slots[formatted]) slots[formatted] = {};
          slots[formatted][shift] = {
            allocatedHours: toAllocate,
            shiftCapacityHours: shiftCap,
            remainingHours: freeH - toAllocate,
            plannedSheets: sheetsDone,
            isManual: false,
          };

          if (!localUsed[key]) localUsed[key] = { usedHours: 0 };
          localUsed[key].usedHours += toAllocate;
          remainingHours -= toAllocate;
        }

        cur.setDate(cur.getDate() + 1);
      }

      const allDates = Object.keys(slots).sort();
      row.slots = slots;
      row.startDate = allDates[0] ?? row.startDate;
      row.endDate = allDates[allDates.length - 1] ?? row.startDate;
      updated[rowIndex] = row;

      onPlanningChange?.(updated);
      return updated;
    });
  };

  const updateRow = (index, patch) => {
    setProcessRows((prev) => {
      const updated = prev.map((r, i) =>
        i === index ? { ...r, ...patch } : r,
      );
      onPlanningChange?.(updated);
      return updated;
    });
  };

  const getShiftSummary = (row) => {
    const slotCount = getCurrentShiftCount(row);
    if (slotCount === 0) return null;
    const allocH = getAllocatedHours(row);
    const reqH = row.machine ? getRequiredHours(row.machine) : 0;
    if (reqH < 1 && allocH < 1) return `${Math.round(allocH * 60)} min`;
    return `${slotCount} shift${slotCount > 1 ? "s" : ""}`;
  };

  const originalSheets =
    component.ups && totalQty
      ? Math.ceil(Number(totalQty) / Number(component.ups))
      : "";

  return (
    <>
      {processRows.map((row, index) => {
        const slotCount = getCurrentShiftCount(row);
        const summary = getShiftSummary(row);

        return (
          <Fragment key={index}>
            <Grid size={12} sx={{ borderBottom: "1px solid #dcdddd" }} />

            {/* Component Name */}
            <Grid size={1}>
              <div className="Box-table-text">{name}</div>
            </Grid>

            {/* Sheet Size */}
            <Grid size={1.5}>
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
                <Tooltip
                  title={
                    row.machine
                      ? (() => {
                          const mins =
                            (Number(component?.sheets) /
                              getCapacity(row.machine)) *
                            60;
                          return mins < 60
                            ? `~${mins.toFixed(1)} min on ${row.machine}`
                            : `~${(mins / 60).toFixed(2)} hrs on ${row.machine}`;
                        })()
                      : "Select machine to see time estimate"
                  }
                  arrow
                >
                  <TextField
                    size="small"
                    type="number"
                    label={originalSheets ? `${originalSheets}` : ""}
                    value={component?.sheets}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      "& .MuiInputLabel-root.Mui-disabled": { color: "green" },
                      "& .MuiInputLabel-root": { color: "green" },
                      "& .MuiInputLabel-root.Mui-focused": { color: "green" },
                    }}
                    disabled
                  />
                </Tooltip>
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

            {/* Process label */}
            <Grid size={1.5}>
              <div className="Box-table-content">
                <TextField size="small" value={row.process} disabled />
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
                    const startDate = e.target.value;
                    updateRow(index, { startDate, slots: {} });
                    if (startDate && row.machine) {
                      checkAndShowAvailability(row.machine, startDate);
                      setSelectedRowIndex(index);
                      setOpenShiftType(true);
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
                  onChange={(e) =>
                    updateRow(index, { endDate: e.target.value, slots: {} })
                  }
                />
              </div>
            </Grid>

            {/* Shift button + summary */}
            <Grid size={1}>
              <div className="Box-table-content">
                <Tooltip
                  title={
                    summary ? `Allocated: ${summary}` : "Select dates first"
                  }
                  arrow
                  placement="top"
                >
                  <Button
                    variant="outlined"
                    size="small"
                    color={slotCount > 0 ? "error" : "inherit"}
                    onClick={() => {
                      if (!row.machine) {
                        toast.error(
                          "Please select a Machine for this section first",
                        );
                        return;
                      }
                      if (!row.startDate || !row.endDate) {
                        toast.error("Please select Start and End Dates first");
                        return;
                      }
                      setActiveRowIndex(index);
                      setOpenShiftDialog(true);
                    }}
                  >
                    {slotCount > 0 ? "Edit" : "Select"}
                  </Button>
                </Tooltip>
                {summary && (
                  <Typography
                    variant="caption"
                    display="block"
                    color="text.secondary"
                    mt={0.25}
                  >
                    {summary}
                  </Typography>
                )}
              </div>
            </Grid>

            {/* Info */}
            <Grid size={1}>
              <div className="Box-table-content">
                <InfoIcon
                  sx={{ cursor: "pointer", color: "#0a85cb" }}
                  onClick={() => {
                    setInfoData(calculateInfoData(row));
                    setOpenInfoDialog(true);
                  }}
                />
              </div>
            </Grid>
          </Fragment>
        );
      })}

      <ShiftDialog
        open={openShiftDialog}
        onClose={() => setOpenShiftDialog(false)}
        currentRow={currentRow}
        dateRange={dateRange}
        usedShiftMap={usedShiftMap}
        activeRowIndex={activeRowIndex}
        getRequiredShiftCount={getRequiredShiftCount}
        getCurrentShiftCount={getCurrentShiftCount}
        requiredHours={
          currentRow?.machine ? getRequiredHours(currentRow.machine) : undefined
        }
        getAllocatedHours={getAllocatedHours}
        setProcessRows={setProcessRows}
        onPlanningChange={onPlanningChange}
      />

      <ShiftTypeDialog
        open={openShiftType}
        onClose={() => setOpenShiftType(false)}
        selectedRowIndex={selectedRowIndex}
        autoPlanProduction={autoPlanProduction}
      />

      <InfoDialog
        open={openInfoDialog}
        onClose={() => setOpenInfoDialog(false)}
        infoData={infoData}
      />

      <MachineAvailabilityDialog
        open={availabilityDialog.open}
        info={availabilityDialog.info}
        onClose={() => setAvailabilityDialog({ open: false, info: null })}
        onGoToCalendar={() => {
          setAvailabilityDialog({ open: false, info: null });
          navigate("/machine_calendar");
        }}
      />
    </>
  );
};

export const MemoComponentRow = React.memo(ComponentRow);
export default ComponentRow;
