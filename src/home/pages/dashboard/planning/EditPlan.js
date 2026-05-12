import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  FormGroup,
  Typography,
  TextField,
  Modal,
  Button,
  Select,
  MenuItem,
} from "@mui/material";

import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

import { toast } from "react-toastify";

import "../../../pages/pagestyle.scss";
import server from "../../../../server/server";

import {
  MemoComponentRow,
  formatDateLocal,
  SHIFT_CONFIG,
  EPSILON,
  useMachineConfig,
} from "./ComponentRow";
import { PendingDialog } from "./PlanningDialogs";

const COMPONENT_NAMES = [
  "Lid",
  "Body",
  "Bottom",
  "Lid & Body",
  "Lid & Body & Bottom",
  "Body & Bottom",
];

const PENDING_REASONS = [
  "Material Not Available",
  "Machine Breakdown - Mechanical",
  "Machine Breakdown - Electrical",
  "No Man Power",
  "Flim Plate Damage",
];

const FORM_FIELDS = [
  { label: "SO Number", key: "saleorder_no" },
  { label: "SO Date", key: "posting_date", type: "date" },
  { label: "Customer Name", key: "customer_name" },
  { label: "Total Qty", key: "item_quantity" },
  { label: "Sales Person", key: "sales_employee" },
  { label: "SP Contact No", key: "telephone" },
];

// Machine column removed from TABLE_HEADERS
const TABLE_HEADERS = [
  { label: "Component", size: 1 },
  { label: "Sheet Size", size: 1.5 },
  { label: "No of Sheets", size: 1 },
  { label: "Source File", size: 1 },
  { label: "Process", size: 1.5 },
  { label: "Start Date", size: 1.5 },
  { label: "End Date", size: 1.5 },
  { label: "Shift", size: 1 },
  { label: "Info", size: 1 },
];

// Helper Function

const getBookings = (design, planKey) =>
  design?.planning_work_details?.[planKey]?.bookings ?? [];

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
        slots: {},
      };
      section[b.component].push(row);
    }

    const date = formatDateLocal(b.shift_from_dt);
    const shiftHours = SHIFT_CONFIG[b.shift]?.hours ?? 8;
    const allocH = b.allocated_hours ?? shiftHours;

    if (!row.slots[date]) row.slots[date] = {};
    row.slots[date][b.shift] = {
      allocatedHours: allocH,
      shiftCapacityHours: shiftHours,
      remainingHours: shiftHours - allocH,
      plannedSheets: b.planned_sheets ?? null,
      isManual: false,
    };
  });

  Object.values(section).forEach((rows) => {
    rows.forEach((row) => {
      const dates = Object.keys(row.slots).sort();
      if (dates.length) {
        row.startDate = dates[0];
        row.endDate = dates[dates.length - 1];
      }
    });
  });

  return section;
};

const generateBookings = (planningSection) => {
  const bookings = [];

  Object.entries(planningSection).forEach(([componentName, rows]) => {
    rows.forEach((row) => {
      if (!row.machine) return;

      Object.entries(row.slots || {}).forEach(([date, shifts]) => {
        Object.entries(shifts).forEach(([shift, slot]) => {
          if (!slot || slot.allocatedHours <= EPSILON) return;

          const cfg = SHIFT_CONFIG[shift];
          const toDate = cfg.crossDay
            ? formatDateLocal(
                new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
              )
            : date;

          bookings.push({
            component: componentName,
            process: row.process,
            machine: row.machine,
            shift,
            allocated_hours: parseFloat(slot.allocatedHours.toFixed(6)),
            planned_sheets: slot.plannedSheets ?? null,
            shift_from_dt: `${date}T${cfg.from}:00`,
            shift_to_dt: `${toDate}T${cfg.to}:00`,
          });
        });
      });
    });
  });

  return bookings;
};

function EditPlan() {
  const navigate = useNavigate();
  const { design } = useLocation()?.state || {};
  const machineConfig = useMachineConfig();

  useEffect(() => {
    if (!design) {
      toast.error("No design selected. Redirecting to dashboard.");
      navigate("/planning_dashboard", { replace: true });
    }
  }, [design, navigate]);

  const [components, setComponents] = useState({});
  const [open, setOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [openPending, setOpenPending] = useState(false);
  const [pendingData, setPendingData] = useState({
    reason: "",
    otherReason: "",
  });

  const [sectionMachines, setSectionMachines] = useState({
    coating: "",
    printing: "",
    varnish: "",
  });

  // formData is read-only
  const [formData] = useState({
    customer_name: design?.customer_name || "",
    saleorder_no: design?.saleorder_no || "",
    posting_date: design?.posting_date
      ? formatDateLocal(design.posting_date)
      : "",
    item_quantity: design?.item_quantity || "",
    sales_employee: design?.sales_employee || "",
    telephone: design?.telephone || "",
  });

  const [planningData, setPlanningData] = useState({
    coating: {},
    printing: {},
    varnish: {},
  });

  // Stable booking arrays
  const coatingBookings = useMemo(
    () => getBookings(design, "coating_machine_plan"),
    [design],
  );
  const printingBookings = useMemo(
    () => getBookings(design, "printing_machine_plan"),
    [design],
  );
  const varnishBookings = useMemo(
    () => getBookings(design, "varnish_machine_plan"),
    [design],
  );

  // Initial empty component map
  const initialComponentsState = useMemo(
    () =>
      Object.fromEntries(
        COMPONENT_NAMES.map((n) => [
          n,
          {
            length: "",
            breadth: "",
            thickness: "",
            ups: "",
            sheets: "",
            file: null,
          },
        ]),
      ),
    [],
  );

  // Effects

  useEffect(() => {
    if (!design?.components) return;
    setComponents(() => {
      const updated = { ...initialComponentsState };
      Object.entries(design.components).forEach(([name, comp]) => {
        if (updated[name]) updated[name] = { ...comp };
      });
      return updated;
    });
  }, [design, initialComponentsState]);

  useEffect(() => {
    if (!design?.planning_work_details) return;
    setPlanningData({
      coating: buildPlanningSection(coatingBookings),
      printing: buildPlanningSection(printingBookings),
      varnish: buildPlanningSection(varnishBookings),
    });

    const getFirstMachine = (bookings) =>
      bookings.length ? bookings[0].machine : "";

    setSectionMachines({
      coating: getFirstMachine(coatingBookings),
      printing: getFirstMachine(printingBookings),
      varnish: getFirstMachine(varnishBookings),
    });
  }, [design, coatingBookings, printingBookings, varnishBookings]);

  useEffect(() => {
    const reason = design?.planning_pending_details?.pending_reason;
    if (!reason) return;
    setPendingData({
      reason: PENDING_REASONS.includes(reason) ? reason : "Others",
      otherReason: PENDING_REASONS.includes(reason) ? "" : reason,
    });
  }, [design]);

  useEffect(() => {
    return () => {
      if (currentImage?.startsWith("blob:")) URL.revokeObjectURL(currentImage);
    };
  }, [currentImage]);

  // User Shift Order

  const usedShiftMap = useMemo(() => {
    const map = {};

    const add = (machine, date, shift, hours) => {
      const key = `${machine}_${date}_${shift}`;
      if (!map[key]) map[key] = { usedHours: 0 };
      map[key].usedHours += hours;
    };

    Object.values(planningData).forEach((section) => {
      Object.values(section).forEach((rows) => {
        rows.forEach((row) => {
          if (!row.machine) return;
          Object.entries(row.slots || {}).forEach(([date, shifts]) => {
            Object.entries(shifts).forEach(([shift, slot]) => {
              add(row.machine, date, shift, slot.allocatedHours || 0);
            });
          });
        });
      });
    });

    [...coatingBookings, ...printingBookings, ...varnishBookings].forEach(
      (b) => {
        const date = formatDateLocal(b.shift_from_dt);
        const hours = b.allocated_hours ?? SHIFT_CONFIG[b.shift]?.hours ?? 8;
        add(b.machine, date, b.shift, hours);
      },
    );

    return map;
  }, [planningData, coatingBookings, printingBookings, varnishBookings]);

  // Filtered component list

  const filteredComponents = useMemo(
    () =>
      Object.entries(components).filter(([key]) =>
        Object.keys(design?.components || {}).includes(key),
      ),
    [components, design],
  );

  const openImageModal = (url) => {
    setCurrentImage(url);
    setOpen(true);
  };

  const handleViewFile = (componentName) => {
    const { file } = components[componentName];
    if (!file) return;
    const url =
      file instanceof File
        ? URL.createObjectURL(file)
        : file.startsWith("http")
          ? file
          : `${server?.defaults?.baseURL}/uploads/${file}`;
    openImageModal(url);
  };

  const handleArtworkView = () => {
    if (!design?.file_name || !design?.file_ext) return;
    openImageModal(
      `${server?.defaults?.baseURL}/artworkImages/${encodeURIComponent(design.file_name)}.${design.file_ext}`,
    );
  };

  const handleClose = () => {
    setOpen(false);
    if (currentImage?.startsWith("blob:")) URL.revokeObjectURL(currentImage);
    setCurrentImage("");
  };

  const validatePending = () => {
    if (!pendingData?.reason) {
      toast.error("Please Select Pending Reason");
      return false;
    }
    if (pendingData.reason === "Others" && !pendingData.otherReason.trim()) {
      toast.error("Please Enter Pending Reason");
      return false;
    }
    return true;
  };

  // Handle Submit

  const handleSubmit = async (status) => {
    try {
      if (status === "FINAL") {
        const hasIncomplete = Object.values(planningData).some((section) =>
          Object.values(section).some((rows) =>
            rows.some((row) => {
              const touched = row.machine || row.startDate || row.endDate;
              const valid =
                row.machine &&
                row.startDate &&
                row.endDate &&
                Object.keys(row.slots || {}).length > 0;
              return touched && !valid;
            }),
          ),
        );
        if (hasIncomplete) {
          toast.error("Incomplete planning: select machine, dates and shifts");
          return;
        }
      }

      const coatingBk = generateBookings(planningData.coating);
      const printingBk = generateBookings(planningData.printing);
      const varnishBk = generateBookings(planningData.varnish);

      if (
        status !== "PENDING" &&
        !coatingBk.length &&
        !printingBk.length &&
        !varnishBk.length
      ) {
        toast.error("Please plan at least one machine shift");
        return;
      }

      if (status === "PENDING" && !validatePending()) return;

      const payload = {
        unique_id: design.unique_id,
        planning_status: status === "FINAL" ? 2 : status === "PENDING" ? 1 : 0,
        planning_work_details: {
          coating_machine_plan: { bookings: coatingBk },
          printing_machine_plan: { bookings: printingBk },
          varnish_machine_plan: { bookings: varnishBk },
        },
        planning_pending_details:
          status === "PENDING"
            ? {
                pending_reason:
                  pendingData.reason === "Others"
                    ? pendingData.otherReason
                    : pendingData.reason,
              }
            : design?.planning_pending_details || {},
      };

      await server.post(`/design/add`, payload);

      toast[status === "PENDING" ? "error" : "success"](
        status === "PENDING"
          ? "Design moved to Pending"
          : "Design saved successfully",
      );
      navigate("/planning_dashboard");
    } catch (err) {
      toast.error(
        err.response?.data?.error || err.message || "Something went wrong",
      );
    }
  };

  const renderMachineSection = (
    title,
    processType,
    existingBookings,
    planningKey,
  ) => (
    <Box
      sx={{
        background: "#fff",
        mt: 3,
        boxShadow:
          "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(27,31,35,0.15) 0px 0px 0px 1px",
      }}
    >
      <Grid container spacing={0.5}>
        {/* Section title */}
        <Grid
          size={12}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            borderBottom: "1px solid #ddd",
          }}
        >
          <Typography sx={{ fontSize: "18px", color: "#0a85cb" }}>
            {title}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography>Machine :</Typography>

            <Select
              size="small"
              value={sectionMachines[planningKey]}
              displayEmpty
              onChange={(e) => {
                const machine = e.target.value;
                setSectionMachines((prev) => ({
                  ...prev,
                  [planningKey]: machine,
                }));
              }}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="" disabled>
                Select Machine
              </MenuItem>

              {machineConfig[processType]?.machines?.map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Grid>

        {/* Column headers */}
        {TABLE_HEADERS.map(({ label, size }) => (
          <Grid key={label} size={size}>
            <div className="Box-table-subtitle">{label}</div>
          </Grid>
        ))}

        {/* Rows */}
        {filteredComponents.map(([key, component]) => (
          <MemoComponentRow
            key={`${processType}-${key}`}
            component={component}
            name={key}
            onViewFile={handleViewFile}
            totalQty={design?.item_quantity}
            processType={processType}
            existingBookings={existingBookings}
            usedShiftMap={usedShiftMap}
            currentUniqueId={design?.unique_id}
            sectionMachine={sectionMachines[planningKey]}
            onPlanningChange={(data) =>
              setPlanningData((prev) => ({
                ...prev,
                [planningKey]: { ...prev[planningKey], [key]: data },
              }))
            }
          />
        ))}
      </Grid>
    </Box>
  );

  if (!design) return null;

  return (
    <Box className="Dashboard-con">
      {/* Breadcrumb */}
      <Box className="breadcrump-con">
        <Box className="main-title">
          <div className="main-inner-txts">
            <Link
              style={{ color: "#0a85cb", textDecoration: "none" }}
              to="/Planning_dashboard"
            >
              Planning Dashboard
            </Link>
            <KeyboardArrowRightIcon sx={{ color: "#0a85cb" }} />
            <div>Edit Planning</div>
          </div>
        </Box>
      </Box>

      <Box className="page-layout" sx={{ marginTop: 1 }}>
        {/* Form header */}
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={2.5}>
            {FORM_FIELDS.map(({ label, key, type }) => (
              <Grid key={key} size={2}>
                <FormGroup>
                  <Typography mb={1}>{label}</Typography>
                  <TextField
                    size="small"
                    type={type || "text"}
                    value={formData[key]}
                    disabled
                  />
                </FormGroup>
              </Grid>
            ))}

            <Grid size={12}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: "5px",
                }}
              >
                <button
                  className="gray-md-btn"
                  onClick={() => navigate("/machine_calendar")}
                >
                  <CalendarMonthOutlinedIcon style={{ fontSize: 20 }} /> Machine
                  Calendar
                </button>
                <button className="gray-md-btn" onClick={handleArtworkView}>
                  <VisibilityIcon style={{ fontSize: 20 }} /> Artwork Image
                </button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Machine plan sections */}
        {renderMachineSection(
          "Coating Machine Plan",
          "coating",
          coatingBookings,
          "coating",
        )}
        {renderMachineSection(
          "Printing Machine Plan",
          "printing",
          printingBookings,
          "printing",
        )}
        {renderMachineSection(
          "Varnish Machine Plan",
          "varnish",
          varnishBookings,
          "varnish",
        )}

        {/* Image / artwork preview */}
        <Modal open={open} onClose={handleClose}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              outline: 0,
              maxWidth: "90vw",
              maxHeight: "90vh",
            }}
          >
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

        {/* Pending dialog */}
        <PendingDialog
          open={openPending}
          onClose={() => setOpenPending(false)}
          pendingData={pendingData}
          setPendingData={setPendingData}
          onSave={() => {
            if (!validatePending()) return;
            setOpenPending(false);
            handleSubmit("PENDING");
          }}
        />
      </Box>

      {/* Action buttons */}
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
          onClick={() => navigate("/planning_dashboard")}
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

export default EditPlan;
