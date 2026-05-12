import React from "react";
import {
  Box,
  Grid,
  MenuItem,
  Typography,
  Select,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  FormControlLabel,
  Checkbox,
  LinearProgress,
  Chip,
  Alert,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import SummarizeIcon from "@mui/icons-material/Summarize";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SpeedIcon from "@mui/icons-material/Speed";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import BlockIcon from "@mui/icons-material/Block";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { formatDateLocal, SHIFT_CONFIG } from "./ComponentRow";

// Constants
const SHIFT_ORDER = ["General", "Shift 1", "Shift 2", "Shift 3"];
const PENDING_REASONS = [
  "Material Not Available",
  "Machine Breakdown - Mechanical",
  "Machine Breakdown - Electrical",
  "No Man Power",
  "Flim Plate Damage",
];

// Utility: format decimal hours
export const formatHours = (hours) => {
  if (hours < 1 / 60) return `${Math.round(hours * 3600)}s`;
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const formatHoursShort = (hours) => {
  if (hours <= 0) return "Full";
  if (hours < 1) return `${Math.round(hours * 60)}m free`;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}m free` : `${h}h free`;
};

const DialogShell = ({
  open,
  onClose,
  title,
  maxWidth = "sm",
  children,
  actions,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    fullWidth
    maxWidth={maxWidth}
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
        {title}
      </Typography>
      <IconButton onClick={onClose}>
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent dividers>{children}</DialogContent>
    {actions && <DialogActions sx={{ pr: 3 }}>{actions}</DialogActions>}
  </Dialog>
);

const InfoCard = ({ bg, border, icon, label, value }) => (
  <Box
    sx={{
      p: 2,
      borderRadius: 3,
      background: bg,
      border: border || "none",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <Box display="flex" alignItems="center" gap={1}>
      {icon}
      <Typography color="text.secondary">{label}</Typography>
    </Box>
    {value}
  </Box>
);

// Machine Availability Dialog

export const MachineAvailabilityDialog = ({
  open,
  onClose,
  info,
  onGoToCalendar,
}) => {
  if (!info) return null;
  const { machine, date, status, shiftStatus } = info;
  const isFull = status === "full";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: "16px",
          overflow: "hidden",
          border: isFull ? "2px solid #fca5a5" : "2px solid #fde68a",
        },
      }}
    >
      {/* Coloured header */}
      <Box
        sx={{
          background: isFull
            ? "linear-gradient(135deg,#ef4444,#dc2626)"
            : "linear-gradient(135deg,#f59e0b,#d97706)",
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          {isFull ? (
            <BlockIcon sx={{ color: "#fff", fontSize: 26 }} />
          ) : (
            <WarningAmberIcon sx={{ color: "#fff", fontSize: 26 }} />
          )}
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="#fff"
              lineHeight={1.2}
            >
              {isFull ? "Machine Fully Booked" : "Partial Availability"}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.8)" }}
            >
              {machine} · {date}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon sx={{ color: "#fff" }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 2.5, pb: 1 }}>
        {/* Summary alert */}
        <Alert
          severity={isFull ? "error" : "warning"}
          icon={isFull ? <BlockIcon /> : <WarningAmberIcon />}
          sx={{ mb: 2, borderRadius: 2, fontWeight: 500 }}
        >
          {isFull
            ? "All shifts are booked by other orders. Please choose a different date or check the Machine Calendar."
            : "Some shifts are already booked by other orders. Only free shifts can be selected below."}
        </Alert>

        {/* Per-shift status */}
        <Typography
          variant="caption"
          fontWeight={700}
          color="text.secondary"
          sx={{
            textTransform: "uppercase",
            letterSpacing: 1,
            mb: 1,
            display: "block",
          }}
        >
          Shift availability on {date}
        </Typography>

        <Box display="flex" flexDirection="column" gap={1}>
          {shiftStatus.map(({ shift, freeHours, isFull: shiftFull }) => (
            <Box
              key={shift}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                px: 2,
                py: 1,
                borderRadius: 2,
                background: shiftFull ? "#fff1f1" : "#f0fdf4",
                border: `1.5px solid ${shiftFull ? "#fca5a5" : "#bbf7d0"}`,
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                {shiftFull ? (
                  <BlockIcon sx={{ fontSize: 16, color: "#ef4444" }} />
                ) : (
                  <CheckCircleIcon sx={{ fontSize: 16, color: "#22c55e" }} />
                )}
                <Typography variant="body2" fontWeight={600}>
                  {shift}
                </Typography>
              </Box>
              <Chip
                size="small"
                label={shiftFull ? "Fully Booked" : formatHoursShort(freeHours)}
                sx={{
                  fontWeight: 700,
                  fontSize: 11,
                  background: shiftFull ? "#fee2e2" : "#dcfce7",
                  color: shiftFull ? "#b91c1c" : "#15803d",
                  border: "none",
                }}
              />
            </Box>
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
        >
          {isFull ? "Choose Another Date" : "Continue Anyway"}
        </Button>
        <Button
          variant="contained"
          startIcon={<CalendarMonthIcon />}
          onClick={onGoToCalendar}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            background: "linear-gradient(135deg,#2563eb,#0ea5e9)",
            boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
          }}
        >
          Machine Calendar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ShiftDialog

export const ShiftDialog = ({
  open,
  onClose,
  currentRow,
  dateRange,
  usedShiftMap,
  activeRowIndex,
  getRequiredShiftCount,
  getCurrentShiftCount,
  requiredHours,
  getAllocatedHours,
  setProcessRows,
  onPlanningChange,
}) => {
  const requiredCount = getRequiredShiftCount(currentRow);
  const currentCount = getCurrentShiftCount(currentRow);
  const allocatedHours = getAllocatedHours ? getAllocatedHours(currentRow) : 0;

  return (
    <DialogShell
      open={open}
      onClose={onClose}
      title="Select Shift"
      actions={
        <>
          <Button variant="outlined" color="error" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" color="success" onClick={onClose}>
            Save
          </Button>
        </>
      }
    >
      {/* Progress header */}
      {currentRow && (
        <Box mb={2}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={0.5}
          >
            <Typography variant="body2" color="text.secondary">
              Shifts selected:{" "}
              <strong>
                {currentCount} / {requiredCount}
              </strong>
            </Typography>
            {requiredHours !== undefined && (
              <Chip
                size="small"
                icon={<AccessTimeIcon />}
                label={`Need ${formatHours(requiredHours)}`}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
          {requiredCount > 0 && (
            <LinearProgress
              variant="determinate"
              value={Math.min((currentCount / requiredCount) * 100, 100)}
              color={currentCount >= requiredCount ? "success" : "primary"}
              sx={{ borderRadius: 4, height: 6 }}
            />
          )}
        </Box>
      )}

      {dateRange.length === 0 ? (
        <Typography color="error">
          Please select Machine and Date range
        </Typography>
      ) : (
        dateRange.map((dateObj, i) => {
          const formatted = formatDateLocal(dateObj);
          const rowShiftsOnDate = currentRow?.slots?.[formatted] || {};
          const isMaxReached =
            requiredCount > 0 && currentCount >= requiredCount;

          return (
            <Box key={i} mb={2}>
              <Typography sx={{ fontWeight: 600, color: "#0a85cb", mb: 0.5 }}>
                {formatted}
              </Typography>

              <Box display="flex" gap={2} flexWrap="wrap">
                {SHIFT_ORDER.map((shift) => {
                  const key = `${currentRow?.machine}_${formatted}_${shift}`;
                  const usedEntry = usedShiftMap[key];
                  const usedHours = usedEntry?.usedHours || 0;
                  const shiftCapacity = SHIFT_CONFIG[shift].hours;
                  const freeHours = shiftCapacity - usedHours;
                  const isChecked = !!rowShiftsOnDate[shift];
                  const isFullyBooked = freeHours <= 0.0001 && !isChecked;
                  const generalConflict =
                    shift === "General"
                      ? Object.keys(rowShiftsOnDate).some(
                          (s) => s !== "General",
                        )
                      : !!rowShiftsOnDate["General"];

                  return (
                    <Box key={shift}>
                      <FormControlLabel
                        label={
                          <Box>
                            <Typography variant="body2">{shift}</Typography>
                            {usedHours > 0 && !isChecked && (
                              <Typography
                                variant="caption"
                                color="warning.main"
                              >
                                {formatHours(freeHours)} free
                              </Typography>
                            )}
                          </Box>
                        }
                        control={
                          <Checkbox
                            color="success"
                            checked={isChecked}
                            disabled={
                              isFullyBooked ||
                              (!isChecked && isMaxReached) ||
                              generalConflict
                            }
                            onChange={(e) => {
                              setProcessRows((prev) => {
                                const updated = [...prev];
                                const rowData = { ...updated[activeRowIndex] };
                                const slots = { ...rowData.slots };
                                const daySlots = {
                                  ...(slots[formatted] || {}),
                                };

                                if (e.target.checked) {
                                  if (shift === "General") {
                                    slots[formatted] = {
                                      General: {
                                        allocatedHours:
                                          SHIFT_CONFIG.General.hours,
                                        shiftCapacityHours:
                                          SHIFT_CONFIG.General.hours,
                                        remainingHours: 0,
                                        plannedSheets: null,
                                        isManual: true,
                                      },
                                    };
                                  } else {
                                    const { General: _g, ...rest } = daySlots;
                                    slots[formatted] = {
                                      ...rest,
                                      [shift]: {
                                        allocatedHours:
                                          SHIFT_CONFIG[shift].hours,
                                        shiftCapacityHours:
                                          SHIFT_CONFIG[shift].hours,
                                        remainingHours: 0,
                                        plannedSheets: null,
                                        isManual: true,
                                      },
                                    };
                                  }
                                } else {
                                  const { [shift]: _removed, ...rest } =
                                    daySlots;
                                  slots[formatted] = rest;
                                  if (
                                    Object.keys(slots[formatted]).length === 0
                                  )
                                    delete slots[formatted];
                                }

                                rowData.slots = slots;
                                updated[activeRowIndex] = rowData;
                                onPlanningChange?.(updated);
                                return updated;
                              });
                            }}
                          />
                        }
                      />
                    </Box>
                  );
                })}
              </Box>
            </Box>
          );
        })
      )}
    </DialogShell>
  );
};

// ShiftTypeDialog

export const ShiftTypeDialog = ({
  open,
  onClose,
  selectedRowIndex,
  autoPlanProduction,
}) => (
  <DialogShell open={open} onClose={onClose} title="Shift Type" maxWidth="xs">
    <Typography variant="body2" color="text.secondary" mb={2}>
      Select the shift duration for auto-planning. Short jobs will only use the
      fraction of the shift they actually need.
    </Typography>
    <Box display="flex" gap={1}>
      {[
        {
          label: "General — 9 hrs",
          type: "General",
          variant: "contained",
          color: "success",
        },
        {
          label: "Shift — 8 hrs",
          type: "Shift",
          variant: "outlined",
          color: "primary",
        },
      ].map(({ label, type, variant, color }) => (
        <Button
          key={type}
          fullWidth
          variant={variant}
          color={color}
          sx={{
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 600,
            py: 1.2,
          }}
          onClick={() => {
            autoPlanProduction(selectedRowIndex, type);
            onClose();
          }}
        >
          {label}
        </Button>
      ))}
    </Box>
  </DialogShell>
);

// InfoDialog

export const InfoDialog = ({ open, onClose, infoData }) => (
  <DialogShell open={open} onClose={onClose} title="Machine Production Info">
    {infoData ? (
      <Box display="flex" flexDirection="column" gap={2}>
        {/* Machine capacity */}
        <InfoCard
          bg="#f4f9ff"
          icon={<PrecisionManufacturingIcon color="primary" />}
          label="Machine Capacity"
          value={
            <Typography fontWeight="bold" color="primary">
              {infoData.machineCapacity.toLocaleString()} sheets/hr
            </Typography>
          }
        />

        {/* Actual time needed */}
        <InfoCard
          bg="#f0f4ff"
          icon={<AccessTimeIcon sx={{ color: "#1565c0" }} />}
          label="Actual Time Needed"
          value={
            <Box textAlign="right">
              <Typography fontWeight="bold" color="#1565c0">
                {formatHours(infoData.actualHoursNeeded)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ({infoData.actualHoursNeeded.toFixed(4)} hrs)
              </Typography>
            </Box>
          }
        />

        {/* Required */}
        <InfoCard
          bg="#f6fff6"
          icon={<AssignmentIcon sx={{ color: "#2e7d32" }} />}
          label="Required Quantity"
          value={
            <Typography fontWeight="bold" sx={{ color: "#2e7d32" }}>
              {infoData.totalRequired.toLocaleString()} sheets
            </Typography>
          }
        />

        {/* Planned */}
        <InfoCard
          bg="#fff8f0"
          icon={<PlaylistAddCheckIcon sx={{ color: "#ed6c02" }} />}
          label="Planned Quantity"
          value={
            <Typography fontWeight="bold" sx={{ color: "#ed6c02" }}>
              {infoData.totalPlanned.toLocaleString()} sheets
            </Typography>
          }
        />

        {/* Remaining */}
        <InfoCard
          bg="#fff0f0"
          icon={<PendingActionsIcon sx={{ color: "#d32f2f" }} />}
          label="Remaining Quantity"
          value={
            <Typography fontWeight="bold" sx={{ color: "#d32f2f" }}>
              {infoData.remaining.toLocaleString()} sheets
            </Typography>
          }
        />

        {/* Shift utilization */}
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            background: "#f3ffe0",
            border: "1px solid #c5e1a5",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={1}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <SpeedIcon sx={{ color: "#558b2f" }} />
              <Typography fontWeight="bold" sx={{ color: "#558b2f" }}>
                Shift Utilization
              </Typography>
            </Box>
            <Typography
              fontWeight="bold"
              fontSize="1.1rem"
              sx={{ color: "#558b2f" }}
            >
              {infoData.utilizationPercent}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(infoData.utilizationPercent, 100)}
            sx={{
              borderRadius: 4,
              height: 8,
              backgroundColor: "#dcedc8",
              "& .MuiLinearProgress-bar": { backgroundColor: "#558b2f" },
            }}
          />
          <Box display="flex" justifyContent="space-between" mt={0.5}>
            <Typography variant="caption" color="text.secondary">
              Allocated: {formatHours(infoData.totalAllocatedHours)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Needed: {formatHours(infoData.actualHoursNeeded)}
            </Typography>
          </Box>
        </Box>

        {/* Shift breakdown */}
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
              Shift Breakdown
            </Typography>
          </Box>

          {Object.entries(infoData.shiftBreakdown).map(([shift, info]) =>
            info.count > 0 ? (
              <Box
                key={shift}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  py: 0.5,
                  borderBottom: "1px solid #d1c4e9",
                  "&:last-child": { borderBottom: 0 },
                }}
              >
                <Typography sx={{ color: "#4527a0" }}>{shift}</Typography>
                <Box textAlign="right">
                  <Typography fontWeight="bold" sx={{ color: "#5e35b1" }}>
                    {info.count} slot{info.count > 1 ? "s" : ""} ·{" "}
                    {formatHours(info.hours)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {info.plannedSheets?.toLocaleString()} sheets
                  </Typography>
                </Box>
              </Box>
            ) : null,
          )}
        </Box>
      </Box>
    ) : (
      <Typography color="error" textAlign="center" fontWeight="bold" py={3}>
        Machine not selected
      </Typography>
    )}
  </DialogShell>
);

// Pending Dialog

export const PendingDialog = ({
  open,
  onClose,
  pendingData,
  setPendingData,
  onSave,
}) => (
  <DialogShell
    open={open}
    onClose={onClose}
    title="Pending"
    actions={
      <>
        <Button
          variant="contained"
          color="error"
          onClick={onClose}
          sx={{ minWidth: 100 }}
        >
          Cancel
        </Button>
        <Button variant="contained" color="success" onClick={onSave}>
          Save
        </Button>
      </>
    }
  >
    <Grid container spacing={2} alignItems="center">
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
          {PENDING_REASONS.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
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
                setPendingData({ ...pendingData, otherReason: e.target.value })
              }
            />
          </Grid>
        </>
      )}
    </Grid>
  </DialogShell>
);
