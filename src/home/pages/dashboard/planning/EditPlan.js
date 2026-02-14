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
  Checkbox,
} from "@mui/material";

import { toast } from "react-toastify";

import "../Dashboard.scss";
import upsImage from "../../../../assets/Pagesimage/ups-image.jpg";
import server from "../../../../server/server";
import { useDesign } from "../../../../API/Design_API";

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

// Util Functions

const generateShiftDateTime = (plan) => {
  if (!plan.start_date || !plan.shift?.length) return plan;

  // If General selected
  if (plan.shift.includes("General")) {
    const cfg = SHIFT_CONFIG["General"];

    return {
      ...plan,
      shift_from: cfg.from,
      shift_to: cfg.to,
      shift_from_dt: `${plan.start_date}T${cfg.from}:00`,
      shift_to_dt: `${plan.start_date}T${cfg.to}:00`,
    };
  }

  // If multiple shifts selected
  const firstShift = plan.shift[0];
  const lastShift = plan.shift[plan.shift.length - 1];

  const firstCfg = SHIFT_CONFIG[firstShift];
  const lastCfg = SHIFT_CONFIG[lastShift];

  let toDate = plan.start_date;

  if (lastCfg.crossDay) {
    const d = new Date(plan.start_date);
    d.setDate(d.getDate() + 1);
    toDate = d.toISOString().split("T")[0];
  }

  return {
    ...plan,
    shift_from: firstCfg.from,
    shift_to: lastCfg.to,
    shift_from_dt: `${plan.start_date}T${firstCfg.from}:00`,
    shift_to_dt: `${toDate}T${lastCfg.to}:00`,
  };
};

const calculateRequiredShifts = (plan, type, quantity) => {
  const qty = Number(quantity);
  if (qty <= 0 || !plan.machine || !plan.shift.length) return 0;

  // If General selected
  if (plan.shift.includes("General")) {
    const hours = SHIFT_CONFIG["General"].hours;

    const perDayCapacity =
      MACHINE_CONFIG[type].sheetsPerHour[plan.machine] * hours;

    return Math.ceil(qty / perDayCapacity);
  }

  const totalHoursPerDay = plan.shift.reduce((total, shiftName) => {
    return total + SHIFT_CONFIG[shiftName].hours;
  }, 0);

  const perDayCapacity =
    MACHINE_CONFIG[type].sheetsPerHour[plan.machine] * totalHoursPerDay;

  return Math.ceil(qty / perDayCapacity);
};

const generateMultiShiftBookings = (plan, requiredDays) => {
  const bookings = [];

  if (!plan.start_date || !requiredDays || !plan.machine) return bookings;

  // ✅ 🔹 PLACE GENERAL LOGIC HERE
  if (plan.shift.includes("General")) {
    let currentDate = new Date(plan.start_date);

    for (let i = 0; i < requiredDays; i++) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const cfg = SHIFT_CONFIG["General"];

      bookings.push({
        machine: plan.machine,
        shift: "General",
        shift_from_dt: `${dateStr}T${cfg.from}:00`,
        shift_to_dt: `${dateStr}T${cfg.to}:00`,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return bookings; // 🔴 IMPORTANT
  }

  // 🔹 Your existing multi-shift logic continues below
  let currentDate = new Date(plan.start_date);

  for (let day = 0; day < requiredDays; day++) {
    const dateStr = currentDate.toISOString().split("T")[0];

    plan.shift.forEach((shiftName) => {
      const cfg = SHIFT_CONFIG[shiftName];

      let endDateStr = dateStr;

      if (cfg.crossDay) {
        const nextDay = new Date(currentDate);
        nextDay.setDate(nextDay.getDate() + 1);
        endDateStr = nextDay.toISOString().split("T")[0];
      }

      bookings.push({
        machine: plan.machine,
        shift: shiftName,
        shift_from_dt: `${dateStr}T${cfg.from}:00`,
        shift_to_dt: `${endDateStr}T${cfg.to}:00`,
      });
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return bookings;
};

function EditPlan() {
  const { designs } = useDesign();

  console.log("Designsss", designs);

  const navigate = useNavigate();
  const location = useLocation();

  const design = location.state?.design;

  const [getFormData, setFormData] = useState({});
  const [open, setOpen] = useState(false);

  const [openPending, setOpenPending] = useState(false);
  const [pendingData, setPendingData] = useState({ pending_reason: "" });

  const [coatingPlan, setCoatingPlan] = useState({
    machine: "",
    shift: [],
    start_date: "",
    end_date: "",
    shift_from: "",
    shift_to: "",
    shift_from_dt: "",
    shift_to_dt: "",
  });

  const [printingPlan, setPrintingPlan] = useState({
    machine: "",
    shift: [],
    start_date: "",
    end_date: "",
    shift_from: "",
    shift_to: "",
    shift_from_dt: "",
    shift_to_dt: "",
  });

  const [coatingManualEnd, setCoatingManualEnd] = useState(false);
  const [printingManualEnd, setPrintingManualEnd] = useState(false);

  const getRunningMachines = (machines, newBookings, machineBookings) => {
    const conflictsMap = new Map();

    machines.forEach((machine) => {
      machineBookings.forEach((existing) => {
        if (!newBookings?.length) {
          if (existing.machine === machine) {
            conflictsMap.set(existing.machine + existing.saleorder_no, {
              machine: existing.machine,
              saleorder_no: existing.saleorder_no,
              start: existing.start,
              end: existing.end,
            });
          }
        }

        newBookings?.forEach((newBook) => {
          const overlap =
            existing.machine === machine &&
            new Date(existing.start) < new Date(newBook.shift_to_dt) &&
            new Date(existing.end) > new Date(newBook.shift_from_dt);

          if (overlap) {
            conflictsMap.set(existing.machine + existing.saleorder_no, {
              machine: existing.machine,
              saleorder_no: existing.saleorder_no,
              start: existing.start,
              end: existing.end,
            });
          }
        });
      });
    });

    return Array.from(conflictsMap.values());
  };

  const machineBookings = useMemo(() => {
    if (!designs?.length) return [];

    return designs.flatMap((d) => {
      if (d.planning_status !== 2) return [];

      if (d.saleorder_no === getFormData.saleorder_no) return [];

      const coating =
        d?.planning_work_details?.coating_machine_plan?.bookings || [];

      const printing =
        d?.planning_work_details?.printing_machine_plan?.bookings || [];

      return [...coating, ...printing].map((b) => ({
        machine: b.machine,
        start: b.shift_from_dt,
        end: b.shift_to_dt,
        saleorder_no: d.saleorder_no,
      }));
    });
  }, [designs, getFormData.saleorder_no]);

  const coatingRequiredShifts = useMemo(
    () =>
      calculateRequiredShifts(
        coatingPlan,
        "coating",
        getFormData.item_quantity,
      ),
    [coatingPlan.machine, coatingPlan.shift, getFormData.item_quantity],
  );

  const printingRequiredShifts = useMemo(
    () =>
      calculateRequiredShifts(
        printingPlan,
        "printing",
        getFormData.item_quantity,
      ),
    [printingPlan.machine, printingPlan.shift, getFormData.item_quantity],
  );

  const coatingNewBookings = useMemo(() => {
    const startDate =
      coatingPlan.start_date ||
      getFormData.posting_date ||
      new Date().toISOString().split("T")[0];

    if (!coatingPlan.shift) return [];

    const tempPlan = {
      ...coatingPlan,
      start_date: startDate,
    };

    return generateMultiShiftBookings(tempPlan, coatingRequiredShifts || 1);
  }, [coatingPlan, coatingRequiredShifts, getFormData.posting_date]);

  const printingNewBookings = useMemo(() => {
    const startDate =
      printingPlan.start_date ||
      getFormData.posting_date ||
      new Date().toISOString().split("T")[0];

    if (!printingPlan.shift) return [];

    const tempPlan = {
      ...printingPlan,
      start_date: startDate,
    };

    return generateMultiShiftBookings(tempPlan, printingRequiredShifts || 1);
  }, [printingPlan, printingRequiredShifts, getFormData.posting_date]);

  const coatingRunningMachines = useMemo(
    () =>
      getRunningMachines(
        MACHINE_CONFIG.coating.machines,
        coatingNewBookings,
        machineBookings,
      ),
    [coatingNewBookings, machineBookings],
  );

  const printingRunningMachines = useMemo(
    () =>
      getRunningMachines(
        MACHINE_CONFIG.printing.machines,
        printingNewBookings,
        machineBookings,
      ),
    [printingNewBookings, machineBookings],
  );

  const coatingAvailableMachines = useMemo(() => {
    const runningNames = coatingRunningMachines.map((m) => m.machine);

    return MACHINE_CONFIG.coating.machines.filter(
      (m) => !runningNames.includes(m),
    );
  }, [coatingRunningMachines]);

  const printingAvailableMachines = useMemo(() => {
    const runningNames = printingRunningMachines.map((m) => m.machine);

    return MACHINE_CONFIG.printing.machines.filter(
      (m) => !runningNames.includes(m),
    );
  }, [printingRunningMachines]);

  // Calculate printable sheets based on machine and shift

  const CoatingPrintableSheets = useMemo(() => {
    const { machine, shift } = coatingPlan;

    if (!machine || !shift.length) return 0;

    const totalHours = shift.reduce((sum, s) => {
      return sum + SHIFT_CONFIG[s].hours;
    }, 0);

    return MACHINE_CONFIG.coating.sheetsPerHour[machine] * totalHours;
  }, [coatingPlan.machine, coatingPlan.shift]);

  const PrintingPrintableSheets = useMemo(() => {
    const { machine, shift } = printingPlan;

    if (!machine || !shift.length) return 0;

    const totalHours = shift.reduce((sum, s) => {
      return sum + SHIFT_CONFIG[s].hours;
    }, 0);

    return MACHINE_CONFIG.printing.sheetsPerHour[machine] * totalHours;
  }, [printingPlan.machine, printingPlan.shift]);

  useEffect(() => {
    if (design) {
      setFormData({
        saleorder_no: design.saleorder_no || "",
        posting_date: design.posting_date
          ? new Date(design.posting_date).toISOString().split("T")[0]
          : "",
        customer_name: design.customer_name || "",
        sales_employee: design.sales_employee || "",
        sales_person_code: design.sales_person_code || "",
        item_description: design.item_description || "",
        item_quantity: design.item_quantity || "",
      });
    }
  }, [design]);

  useEffect(() => {
    if (design?.planning_work_details) {
      const { coating_machine_plan, printing_machine_plan } =
        design.planning_work_details;

      if (coating_machine_plan) {
        setCoatingPlan({
          machine: coating_machine_plan.machine || "",
          shift: Array.isArray(coating_machine_plan.shift)
            ? coating_machine_plan.shift
            : coating_machine_plan.shift
              ? [coating_machine_plan.shift]
              : [],
          start_date: coating_machine_plan.start_date || "",
          end_date: coating_machine_plan.end_date || "",
          shift_from: coating_machine_plan.shift_from || "",
          shift_to: coating_machine_plan.shift_to || "",
          shift_from_dt: coating_machine_plan.shift_from_dt || "",
          shift_to_dt: coating_machine_plan.shift_to_dt || "",
        });
      }

      if (printing_machine_plan) {
        setPrintingPlan({
          machine: printing_machine_plan.machine || "",
          shift: Array.isArray(printing_machine_plan.shift)
            ? printing_machine_plan.shift
            : printing_machine_plan.shift
              ? [printing_machine_plan.shift]
              : [],

          start_date: printing_machine_plan.start_date || "",
          end_date: printing_machine_plan.end_date || "",
          shift_from: printing_machine_plan.shift_from || "",
          shift_to: printing_machine_plan.shift_to || "",
          shift_from_dt: printing_machine_plan.shift_from_dt || "",
          shift_to_dt: printing_machine_plan.shift_to_dt || "",
        });
      }
    }
  }, [design]);

  useEffect(() => {
    if (design?.planning_pending_details?.pending_reason) {
      setPendingData({
        pending_reason: design.planning_pending_details.pending_reason,
      });
    }
  }, [design]);

  useEffect(() => {
    if (coatingManualEnd) return;

    if (!coatingPlan.start_date || !coatingRequiredShifts) return;

    const bookings = generateMultiShiftBookings(
      coatingPlan,
      coatingRequiredShifts,
    );

    if (bookings.length > 0) {
      const last = bookings[bookings.length - 1];
      const endDate = last.shift_to_dt.split("T")[0];

      setCoatingPlan((prev) => ({
        ...prev,
        end_date: endDate,
      }));
    }
  }, [
    coatingRequiredShifts,
    coatingPlan.start_date,
    coatingPlan.shift,
    coatingManualEnd,
  ]);

  useEffect(() => {
    if (printingManualEnd) return;

    if (!printingPlan.start_date || !printingRequiredShifts) return;

    const bookings = generateMultiShiftBookings(
      printingPlan,
      printingRequiredShifts,
    );

    if (bookings.length > 0) {
      const last = bookings[bookings.length - 1];
      const endDate = last.shift_to_dt.split("T")[0];

      setPrintingPlan((prev) => ({
        ...prev,
        end_date: endDate,
      }));
    }
  }, [
    printingRequiredShifts,
    printingPlan.start_date,
    printingPlan.shift,
    printingManualEnd,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    navigate("/planning_dashboard");
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handlePlanShiftChange = (setPlan) => (e) => {
    const shift = e.target.value;
    const cfg = SHIFT_CONFIG[shift];

    setPlan((prev) => {
      const baseDate = prev.start_date || getFormData.posting_date;
      if (!cfg || !baseDate) return prev;

      let toDate = baseDate;

      if (cfg.crossDay) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + 1);
        toDate = d.toISOString().split("T")[0];
      }

      return {
        ...prev,
        shift,
        shift_from: cfg.from,
        shift_to: cfg.to,
        shift_from_dt: `${baseDate}T${cfg.from}:00`,
        shift_to_dt: `${toDate}T${cfg.to}:00`,
      };
    });
  };

  const handlePlanDateChange = (setPlan, type) => (e) => {
    const { name, value } = e.target;

    // Reset manual override if start date changes
    if (name === "start_date") {
      if (type === "coating") setCoatingManualEnd(false);
      if (type === "printing") setPrintingManualEnd(false);
    }

    setPlan((prev) => {
      const updated = { ...prev, [name]: value };

      // Only update shift timings if start date changed
      if (name === "start_date" && prev.shift?.length) {
        // If General selected
        if (prev.shift.includes("General")) {
          const cfg = SHIFT_CONFIG["General"];

          updated.shift_from_dt = `${value}T${cfg.from}:00`;
          updated.shift_to_dt = `${value}T${cfg.to}:00`;

          return updated;
        }

        // Multi-shift logic
        const firstShift = prev.shift[0];
        const lastShift = prev.shift[prev.shift.length - 1];

        const firstCfg = SHIFT_CONFIG[firstShift];
        const lastCfg = SHIFT_CONFIG[lastShift];

        if (firstCfg && lastCfg) {
          let toDate = value;

          if (lastCfg.crossDay) {
            const d = new Date(value);
            d.setDate(d.getDate() + 1);
            toDate = d.toISOString().split("T")[0];
          }

          updated.shift_from_dt = `${value}T${firstCfg.from}:00`;
          updated.shift_to_dt = `${toDate}T${lastCfg.to}:00`;
        }
      }

      return updated;
    });
  };

  // Handles Submission for both Pending
  const handleSubmit = async (type) => {
    const planning_status = type === "PENDING" ? 1 : 2;
    const coatingBookings = generateMultiShiftBookings(
      coatingPlan,
      coatingRequiredShifts,
    );

    const printingBookings = generateMultiShiftBookings(
      printingPlan,
      printingRequiredShifts,
    );

    if (!coatingPlan.machine || !coatingPlan.shift || !coatingPlan.start_date) {
      toast.error("Please complete Coating Plan");
      return;
    }

    if (
      !printingPlan.machine ||
      !printingPlan.shift ||
      !printingPlan.start_date
    ) {
      toast.error("Please complete Printing Plan");
      return;
    }

    const payload = {
      saleorder_no: getFormData.saleorder_no,
      posting_date: getFormData.posting_date,
      customer_name: getFormData.customer_name,
      sales_employee: getFormData?.sales_employee,
      sales_person_code: getFormData.sales_person_code,
      item_description: getFormData.item_description,
      item_quantity: getFormData.item_quantity,

      planning_status,

      planning_pending_details:
        type === "PENDING"
          ? { pending_reason: pendingData.pending_reason }
          : design?.planning_pending_details || {},

      planning_work_details: {
        coating_machine_plan: {
          ...generateShiftDateTime(coatingPlan),
          required_shifts: coatingRequiredShifts,
          bookings: coatingBookings,
        },
        printing_machine_plan: {
          ...generateShiftDateTime(printingPlan),
          required_shifts: printingRequiredShifts,
          bookings: printingBookings,
        },
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

  // Handle shift change to auto-calculate shift timings

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
          <Button
            variant="contained"
            color="info"
            onClick={() => navigate("/machine_calendar")}
          >
            Machine Calendar
          </Button>
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
                  name="sales_employee"
                  size="small"
                  type="text"
                  value={getFormData?.sales_employee}
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

              <Grid container size={12} spacing={2.5} p={2} pt={0}>
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
                      {coatingRequiredShifts > 0 && (
                        <span style={{ marginLeft: 10, color: "#d32f2f" }}>
                          ({coatingRequiredShifts} Shifts Required)
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
                      {MACHINE_CONFIG.coating.machines.map((m) => (
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
                      multiple
                      name="shift"
                      value={coatingPlan?.shift}
                      size="small"
                      // onChange={handlePlanShiftChange(setCoatingPlan)}
                      onChange={(e) => {
                        const value = e.target.value;

                        if (value.includes("General")) {
                          setCoatingPlan((prev) => ({
                            ...prev,
                            shift: ["General"],
                          }));
                        } else {
                          const filtered = value.filter((v) => v !== "General");

                          const sorted = SHIFT_ORDER.filter((s) =>
                            filtered.includes(s),
                          );

                          setCoatingPlan((prev) => ({
                            ...prev,
                            shift: sorted,
                          }));
                        }
                      }}
                      renderValue={(selected) => selected.join(", ")}
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        Select
                      </MenuItem>
                      {SHIFT_ORDER.map((shiftName) => {
                        const isGeneralSelected =
                          coatingPlan.shift.includes("General");
                        const isOtherShiftSelected =
                          coatingPlan.shift.length > 0 &&
                          !coatingPlan.shift.includes("General");

                        const disableOption =
                          (shiftName === "General" && isOtherShiftSelected) ||
                          (shiftName !== "General" && isGeneralSelected);

                        return (
                          <MenuItem
                            key={shiftName}
                            value={shiftName}
                            disabled={disableOption}
                          >
                            <Checkbox
                              checked={
                                coatingPlan.shift.indexOf(shiftName) > -1
                              }
                            />
                            <Typography>{shiftName}</Typography>
                          </MenuItem>
                        );
                      })}
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
                      inputProps={{
                        min: new Date().toISOString().split("T")[0],
                      }}
                      onChange={handlePlanDateChange(setCoatingPlan, "coating")}
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
                      inputProps={{
                        min: new Date().toISOString().split("T")[0],
                      }}
                      // onChange={handlePlanDateChange(setCoatingPlan)}
                      onChange={(e) => {
                        setCoatingManualEnd(true);
                        handlePlanDateChange(setCoatingPlan)(e);
                      }}
                    />
                  </FormGroup>
                </Grid>

                <Grid size={9}>
                  <Typography fontWeight={600} color="error">
                    Running Machines
                  </Typography>

                  <Box mt={1}>
                    {coatingRunningMachines.length === 0 ? (
                      <Typography color="text.secondary">
                        No machines running
                      </Typography>
                    ) : (
                      coatingRunningMachines.map((m, index) => (
                        <Box
                          key={index}
                          sx={{
                            p: 1,
                            mb: 1,
                            background: "#ffebee",
                            borderRadius: 1,
                            width: "40%",
                          }}
                        >
                          <Typography fontWeight={600}>{m.machine}</Typography>
                          <Typography variant="body2">
                            SO: {m.saleorder_no}
                          </Typography>
                        </Box>
                      ))
                    )}
                  </Box>
                </Grid>

                <Grid size={3}>
                  <Typography fontWeight={600} color="success.main">
                    Available Machines
                  </Typography>

                  <Box mt={1}>
                    {coatingAvailableMachines.length === 0 ? (
                      <Typography color="text.secondary">
                        Not Available
                      </Typography>
                    ) : (
                      coatingAvailableMachines.map((m) => (
                        <Box
                          key={m}
                          sx={{
                            p: 1,
                            mb: 1,
                            background: "#e8f5e9",
                            borderRadius: 1,
                            width: "65%",
                          }}
                        >
                          {m}
                        </Box>
                      ))
                    )}
                  </Box>
                </Grid>
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

              <Grid container size={12} spacing={2.5} p={2} pt={0}>
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
                      {printingRequiredShifts > 0 && (
                        <span style={{ marginLeft: 10, color: "#d32f2f" }}>
                          ({printingRequiredShifts} Shifts Required)
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
                      multiple
                      name="shift"
                      value={printingPlan?.shift}
                      size="small"
                      onChange={(e) => {
                        const value = e.target.value;

                        if (value.includes("General")) {
                          setPrintingPlan((prev) => ({
                            ...prev,
                            shift: ["General"],
                          }));
                        } else {
                          const filtered = value.filter((v) => v !== "General");

                          // ✅ Always maintain correct shift order
                          const sorted = SHIFT_ORDER.filter((s) =>
                            filtered.includes(s),
                          );

                          setPrintingPlan((prev) => ({
                            ...prev,
                            shift: sorted,
                          }));
                        }
                      }}
                      renderValue={(selected) => selected.join(", ")}
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        Select
                      </MenuItem>

                      {SHIFT_ORDER.map((shiftName) => {
                        const isGeneralSelected =
                          printingPlan.shift.includes("General");

                        const isOtherShiftSelected =
                          printingPlan.shift.length > 0 &&
                          !printingPlan.shift.includes("General");

                        const disableOption =
                          (shiftName === "General" && isOtherShiftSelected) ||
                          (shiftName !== "General" && isGeneralSelected);

                        return (
                          <MenuItem
                            key={shiftName}
                            value={shiftName}
                            disabled={disableOption}
                          >
                            <Checkbox
                              checked={
                                printingPlan.shift.indexOf(shiftName) > -1
                              }
                            />
                            <Typography>{shiftName}</Typography>
                          </MenuItem>
                        );
                      })}
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
                      inputProps={{
                        min: new Date().toISOString().split("T")[0],
                      }}
                      onChange={handlePlanDateChange(
                        setPrintingPlan,
                        "printing",
                      )}
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
                      inputProps={{
                        min: new Date().toISOString().split("T")[0],
                      }}
                      // onChange={handlePlanDateChange(setPrintingPlan)}
                      onChange={(e) => {
                        setPrintingManualEnd(true);
                        handlePlanDateChange(setPrintingPlan)(e);
                      }}
                    />
                  </FormGroup>
                </Grid>

                <Grid size={9}>
                  <Typography fontWeight={600} color="error">
                    Running Machines
                  </Typography>

                  <Box mt={1} sx={{}}>
                    {printingRunningMachines.length === 0 ? (
                      <Typography color="text.secondary">
                        No machines running
                      </Typography>
                    ) : (
                      printingRunningMachines.map((m, index) => (
                        <Box
                          key={index}
                          sx={{
                            p: 1,
                            mb: 1,
                            background: "#ffebee",
                            borderRadius: 1,
                            width: "40%",
                          }}
                        >
                          <Typography fontWeight={600}>{m.machine}</Typography>
                          <Typography variant="body2">
                            SO: {m.saleorder_no}
                          </Typography>
                        </Box>
                      ))
                    )}
                  </Box>
                </Grid>

                <Grid size={3}>
                  <Typography fontWeight={600} color="success.main">
                    Available Machines
                  </Typography>

                  <Box mt={1}>
                    {printingAvailableMachines.length === 0 ? (
                      <Typography> Not Available</Typography>
                    ) : (
                      printingAvailableMachines.map((m) => (
                        <Box
                          key={m}
                          sx={{
                            p: 1,
                            mb: 1,
                            background: "#e8f5e9",
                            borderRadius: 1,
                            width: "65%",
                          }}
                        >
                          {m}
                        </Box>
                      ))
                    )}
                  </Box>
                </Grid>
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

                <MenuItem value="Machine Not Available">
                  Machine Not Available
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
  );
}

export default EditPlan;
