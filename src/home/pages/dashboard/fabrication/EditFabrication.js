import { useEffect, useMemo, useState } from "react";
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

import { toast } from "react-toastify";
import "../../../pages/pagestyle.scss";
import server from "../../../../server/server";

// Constants
const COLUMNS = [
  { label: "Component", w: 130 },
  { label: "Sheet Size", w: 180 },
  { label: "No of Sheets", w: 140 },
  { label: "Source File", w: 120 },
  { label: "Printed Sheets", w: 160 },
  { label: "Rejected Sheets", w: 160 },
  { label: "Status", w: 130 },
];

const TOTAL_WIDTH = COLUMNS.reduce((sum, c) => sum + c.w, 0);

const PENDING_REASONS = [
  "Material Not Available",
  "Machine Breakdown - Mechanical",
  "Machine Breakdown - Electrical",
  "No Man Power",
  "Flim Plate Damage",
];

const COMPONENT_NAMES = [
  "Lid",
  "Body",
  "Bottom",
  "Lid & Body",
  "Lid & Body & Bottom",
  "Body & Bottom",
];

// Helper Functions
const getArtWorkClass = (art) => {
  if (!art || art === "NA") return "art-badge art-blue";
  if (art.toLowerCase() === "old") return "art-badge art-red";
  if (art.toLowerCase() === "new") return "art-badge art-green";
  return "art-badge";
};

// Cell Component
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

// ComponentRow
const ComponentRow = ({
  component,
  name,
  onViewFile,
  totalQty,
  statusMap,
  setStatusMap,
  outputMap,
  setOutputMap,
  outputErrors,
  setOutputErrors,
  design,
}) => {
  const handleStatusChange = (newValue) => {
    if (newValue !== null) {
      setStatusMap((prev) => ({ ...prev, [name]: newValue }));
    }
  };

  // No of Sheets = varnish printed sheets (after varnish)
  const varnishPrintedSheets =
    design?.varnish_work_details?.components?.[name]?.printed_sheets || "";

  const originalSheets =
    component.ups && totalQty
      ? Math.ceil(Number(totalQty) / Number(component.ups))
      : "";

  const status = statusMap[name] || "No";
  const printedError = !!outputErrors[`${name}_printed`];
  const rejectedError = !!outputErrors[`${name}_rejected`];

  return (
    <Box
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
          sx={{ "& .MuiInputBase-input": { fontSize: "14px" } }}
          disabled
        />
      </Cell>

      {/* No of Sheets — shows varnish printed sheets */}
      <Cell colIndex={2}>
        <TextField
          size="small"
          fullWidth
          type="number"
          label={originalSheets ? String(originalSheets) : ""}
          value={varnishPrintedSheets}
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

      {/* Printed Sheets */}
      <Cell colIndex={4}>
        <TextField
          size="small"
          fullWidth
          type="number"
          value={outputMap[name]?.printed || ""}
          error={printedError}
          helperText={printedError ? "Required" : ""}
          onChange={(e) => {
            setOutputMap((prev) => ({
              ...prev,
              [name]: { ...prev[name], printed: e.target.value },
            }));
            if (e.target.value !== "") {
              setOutputErrors((prev) => ({
                ...prev,
                [`${name}_printed`]: false,
              }));
            }
          }}
        />
      </Cell>

      {/* Rejected Sheets */}
      <Cell colIndex={5}>
        <TextField
          size="small"
          fullWidth
          type="number"
          value={outputMap[name]?.rejected || ""}
          error={rejectedError}
          helperText={rejectedError ? "Required" : ""}
          onChange={(e) => {
            setOutputMap((prev) => ({
              ...prev,
              [name]: { ...prev[name], rejected: e.target.value },
            }));
            if (e.target.value !== "") {
              setOutputErrors((prev) => ({
                ...prev,
                [`${name}_rejected`]: false,
              }));
            }
          }}
        />
      </Cell>

      {/* Status */}
      <Cell colIndex={6}>
        <ToggleButtonGroup
          value={status}
          exclusive
          onChange={(e, val) => handleStatusChange(val)}
          size="small"
        >
          <ToggleButton
            value="Yes"
            sx={{
              "&.Mui-selected": { backgroundColor: "green", color: "white" },
              "&:hover": { backgroundColor: "#008000db" },
              "&.Mui-selected:hover": { backgroundColor: "#008000" },
            }}
          >
            Yes
          </ToggleButton>
          <ToggleButton
            value="No"
            sx={{
              "&.Mui-selected": { backgroundColor: "red", color: "white" },
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
};

// Main Component
function EditFabrication() {
  const navigate = useNavigate();
  const location = useLocation();
  const { design } = location?.state || {};

  const draftKey = `fabrication_draft_${design?.unique_id}`;

  // State
  const [open, setOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [components, setComponents] = useState({});
  const [statusMap, setStatusMap] = useState({});
  const [outputMap, setOutputMap] = useState({});
  const [openPending, setOpenPending] = useState(false);
  const [pendingData, setPendingData] = useState({
    reason: "",
    otherReason: "",
  });

  // Validation Error State
  const [outputErrors, setOutputErrors] = useState({});

  // Static derived data
  const formData = {
    customer_name: design?.customer_name || "",
    saleorder_no: design?.saleorder_no || "",
    posting_date: design?.posting_date
      ? new Date(design.posting_date).toISOString().split("T")[0]
      : "",
    item_quantity: design?.item_quantity || "",
    sales_employee: design?.sales_employee || "",
    telephone: design?.telephone || "",
    art_work: design?.art_work || "NA",
  };

  // Initial component structure
  const initialComponentsState = useMemo(() => {
    const obj = {};
    COMPONENT_NAMES.forEach((name) => {
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

  // Effects

  // Redirect if no design
  useEffect(() => {
    if (!design) {
      toast.error("No design selected. Redirecting to dashboard.");
      navigate("/fabrication_dashboard", { replace: true });
    }
  }, [design, navigate]);

  // Load components
  useEffect(() => {
    if (!design?.components) return;
    const updatedComponents = { ...initialComponentsState };
    Object.entries(design.components).forEach(([name, comp]) => {
      if (updatedComponents[name] !== undefined) {
        updatedComponents[name] = { ...comp };
      }
    });
    setComponents(updatedComponents);
  }, [design, initialComponentsState]);

  // Load output map from existing fabrication work details
  useEffect(() => {
    if (!design?.components) return;
    const cwd = design?.fabrication_work_details?.components || {};
    const map = {};
    Object.keys(design.components).forEach((name) => {
      map[name] = {
        printed: cwd[name]?.printed_sheets || "",
        rejected: cwd[name]?.rejected_sheets || "",
      };
    });
    setOutputMap(map);
  }, [design]);

  // Load status map
  useEffect(() => {
    if (!design?.components) return;
    const cwd = design?.fabrication_work_details?.components || {};
    const map = {};
    Object.keys(design.components).forEach((name) => {
      map[name] = cwd[name]?.status === 1 ? "Yes" : "No";
    });
    setStatusMap(map);
  }, [design]);

  // Load pending reason
  useEffect(() => {
    const reason = design?.fabrication_pending_details?.pending_reason;
    if (!reason) return;
    setPendingData({
      reason: PENDING_REASONS.includes(reason) ? reason : "Others",
      otherReason: PENDING_REASONS.includes(reason) ? "" : reason,
    });
  }, [design]);

  // Restore session draft
  useEffect(() => {
    if (!design?.unique_id) return;
    const savedDraft = sessionStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setOutputMap(parsed?.outputMap || {});
        setStatusMap(parsed?.statusMap || {});
      } catch (error) {
        console.error("Session restore failed", error);
      }
    }
  }, [design]);

  // Save session draft
  useEffect(() => {
    if (!design?.unique_id) return;
    const saveData = { outputMap, statusMap };
    sessionStorage.setItem(draftKey, JSON.stringify(saveData));
  }, [outputMap, statusMap, design]);

  // Cleanup blob URL
  useEffect(() => {
    return () => {
      if (currentImage?.startsWith("blob:")) URL.revokeObjectURL(currentImage);
    };
  }, [currentImage]);

  // Handler Functions
  const handleViewFile = (componentName) => {
    const comp = components[componentName];
    if (!comp?.file) return;
    const { file } = comp;
    const imageUrl =
      file instanceof File
        ? URL.createObjectURL(file)
        : file.startsWith("http")
          ? file
          : `${server?.defaults?.imageURL}/uploads/${file}`;
    setCurrentImage(imageUrl);
    setOpen(true);
  };

  const handleArtworkView = () => {
    if (!design?.file_name || !design?.file_ext) return;
    const imageUrl = `${server?.defaults?.imageURL}/artworkImages/${encodeURIComponent(
      design.file_name,
    )}.${design.file_ext}`;
    setCurrentImage(imageUrl);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    if (currentImage?.startsWith("blob:")) URL.revokeObjectURL(currentImage);
    setCurrentImage("");
  };

  // Validation
  const validateComponentOutput = () => {
    let hasError = false;
    const newOutputErrors = {};

    Object.keys(design?.components || {}).forEach((name) => {
      const printed = outputMap[name]?.printed;
      const rejected = outputMap[name]?.rejected;

      if (printed === "" || printed === undefined || printed === null) {
        newOutputErrors[`${name}_printed`] = true;
        hasError = true;
      }
      if (rejected === "" || rejected === undefined || rejected === null) {
        newOutputErrors[`${name}_rejected`] = true;
        hasError = true;
      }
    });

    setOutputErrors(newOutputErrors);
    return !hasError;
  };

  const validateFabrication = (type) => {
    if (type === "PENDING") return true;
    for (const compName of Object.keys(design?.components || {})) {
      if (statusMap[compName] !== "Yes") return false;
    }
    return true;
  };

  const handleSubmit = async (type) => {
    try {
      const outputValid = validateComponentOutput();

      if (!outputValid) {
        toast.warning("Please fill all required fields");
        return;
      }

      if (!validateFabrication(type)) {
        toast.warning("Complete all Fabrication processes before submitting");
        return;
      }

      // Build fabrication_work_details.components
      const cwdComponents = {};
      Object.keys(design?.components || {}).forEach((compName) => {
        cwdComponents[compName] = {
          printed_sheets: outputMap[compName]?.printed || "",
          rejected_sheets: outputMap[compName]?.rejected || "",
          status: statusMap[compName] === "Yes" ? 1 : 0,
        };
      });

      const payload = {
        unique_id: design.unique_id,
        saleorder_no: design.saleorder_no,
        item_line_no: design.item_line_no,
        fabrication_status: type === "PENDING" ? 1 : 2,
        fabrication_pending_details: JSON.stringify(
          type === "PENDING"
            ? {
                pending_reason:
                  pendingData.reason === "Others"
                    ? pendingData.otherReason
                    : pendingData.reason,
              }
            : design?.fabrication_pending_details || {},
        ),
        fabrication_work_details: JSON.stringify({
          components: cwdComponents,
        }),
      };

      await server.post("/design/add", payload);
      sessionStorage.removeItem(draftKey);
      toast[type === "PENDING" ? "info" : "success"](
        type === "PENDING"
          ? "Moved to Pending"
          : "Fabrication Saved Successfully",
      );
      navigate("/fabrication_dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Failed to Save Fabrication");
    }
  };

  const handleCancel = () => {
    sessionStorage.removeItem(draftKey);
    navigate("/fabrication_dashboard");
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
              to="/fabrication_dashboard"
            >
              Fabrication Dashboard
            </Link>
            <KeyboardArrowRightIcon sx={{ color: "#0a85cb" }} />
            <div>Edit Fabrication</div>
          </div>
        </Box>
      </Box>

      <Box className="page-layout" sx={{ marginTop: 2 }}>
        {/* Top Form Fields */}
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={2.5}>
            {[
              { label: "Customer Name", value: formData.customer_name },
              { label: "SO Number", value: formData.saleorder_no },
              { label: "Total Qty", value: formData.item_quantity },
              { label: "Sales Person", value: formData.sales_employee },
              { label: "SP Contact No", value: formData.telephone },
            ].map(({ label, value }) => (
              <Grid size={2} key={label}>
                <FormGroup>
                  <Typography mb={1}>{label}</Typography>
                  <TextField size="small" value={value} disabled />
                </FormGroup>
              </Grid>
            ))}
            <Grid size={2}>
              <FormGroup>
                <Typography mb={1}>SO Date</Typography>
                <TextField
                  size="small"
                  type="date"
                  value={formData.posting_date}
                  disabled
                />
              </FormGroup>
            </Grid>
          </Grid>
        </Box>

        {/* Today's Work Table */}
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
                  statusMap={statusMap}
                  setStatusMap={setStatusMap}
                  outputMap={outputMap}
                  setOutputMap={setOutputMap}
                  outputErrors={outputErrors}
                  setOutputErrors={setOutputErrors}
                />
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
                  {PENDING_REASONS.map((reason) => (
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

export default EditFabrication;
