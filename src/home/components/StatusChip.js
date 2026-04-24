import { Chip } from "@mui/material";

const STATUS_CONFIG = {
  // For All Dashboard
  NEW: {
    label: "New",
    color: "primary",
  },
  PENDING: {
    label: "Pending",
    color: "error",
  },
  COMPLETED: {
    label: "Completed",
    color: "success",
  },

  // For Sales Order Dashboard
  ACTIVE: {
    label: "Active",
    color: "success",
  },
  CANCEL: {
    label: "Cancel",
    color: "error",
  },
};

const StatusChip = ({ status }) => {
  const cfg = STATUS_CONFIG[status];

  if (!cfg) return null;

  return (
    <Chip
      label={cfg.label}
      color={cfg.color}
      variant={cfg.variant || "filled"}
      size="small"
      sx={{ fontWeight: 600 }}
    />
  );
};

export default StatusChip;
