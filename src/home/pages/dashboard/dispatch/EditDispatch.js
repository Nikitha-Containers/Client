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
const ComponentRow = ({ component, name, onViewFile, totalQty, design }) => {
  const designSheets = component.sheets || "";
  const calculatedSheets =
    component.ups && totalQty
      ? Math.ceil(Number(totalQty) / Number(component.ups))
      : "";

  // Printed & Rejected Sheets from fabrication (final process)
  const fabComp = design?.fabrication_work_details?.components?.[name] || {};
  const printedSheets = fabComp.printed_sheets || "";
  const rejectedSheets = fabComp.rejected_sheets || "";

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

      {/* No of Sheets — value = design initial sheets, label = calculated qty/ups */}
      <Cell colIndex={2}>
        <TextField
          size="small"
          fullWidth
          type="number"
          label={calculatedSheets ? String(calculatedSheets) : ""}
          value={designSheets}
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

      {/* Total Printed Sheets */}
      <Cell colIndex={4}>
        <TextField
          size="small"
          fullWidth
          type="number"
          value={printedSheets}
          disabled
        />
      </Cell>

      {/* Total Rejected Sheets */}
      <Cell colIndex={5}>
        <TextField
          size="small"
          fullWidth
          type="number"
          value={rejectedSheets}
          disabled
        />
      </Cell>
    </Box>
  );
};

// Main Component
function EditDispatch() {
  const navigate = useNavigate();
  const location = useLocation();
  const { design } = location?.state || {};

  const draftKey = `dispatch_draft_${design?.unique_id}`;

  // State
  const [open, setOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [components, setComponents] = useState({});
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
      navigate("/dispatch_dashboard", { replace: true });
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

  // Load output map from existing dispatch work details
  useEffect(() => {
    if (!design?.components) return;
    const cwd = design?.dispatch_work_details?.components || {};
    const map = {};
    Object.keys(design.components).forEach((name) => {
      map[name] = {
        printed: cwd[name]?.printed_sheets || "",
        rejected: cwd[name]?.rejected_sheets || "",
      };
    });
    setOutputMap(map);
  }, [design]);

  // Load pending reason
  useEffect(() => {
    const reason = design?.dispatch_pending_details?.pending_reason;
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
      } catch (error) {
        console.error("Session restore failed", error);
      }
    }
  }, [design]);

  // Save session draft
  useEffect(() => {
    if (!design?.unique_id) return;
    const saveData = { outputMap };
    sessionStorage.setItem(draftKey, JSON.stringify(saveData));
  }, [outputMap, design]);

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

  const handleSubmit = async (type) => {
    try {
      const fabComponents = design?.fabrication_work_details?.components || {};
      const cwdComponents = {};
      Object.keys(design?.components || {}).forEach((compName) => {
        cwdComponents[compName] = {
          printed_sheets: fabComponents[compName]?.printed_sheets || "",
          rejected_sheets: fabComponents[compName]?.rejected_sheets || "",
        };
      });

      const payload = {
        unique_id: design.unique_id,
        saleorder_no: design.saleorder_no,
        item_line_no: design.item_line_no,
        dispatch_status: type === "PENDING" ? 1 : 2,
        dispatch_pending_details: JSON.stringify(
          type === "PENDING"
            ? {
                pending_reason:
                  pendingData.reason === "Others"
                    ? pendingData.otherReason
                    : pendingData.reason,
              }
            : design?.dispatch_pending_details || {},
        ),
        dispatch_work_details: JSON.stringify({
          components: cwdComponents,
        }),
      };

      await server.post("/design/add", payload);
      sessionStorage.removeItem(draftKey);
      toast[type === "PENDING" ? "info" : "success"](
        type === "PENDING" ? "Moved to Pending" : "Dispatch Saved Successfully",
      );
      navigate("/dispatch_dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Failed to Save Dispatch");
    }
  };

  const handleCancel = () => {
    sessionStorage.removeItem(draftKey);
    navigate("/dispatch_dashboard");
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
              to="/dispatch_dashboard"
            >
              Dispatch Dashboard
            </Link>
            <KeyboardArrowRightIcon sx={{ color: "#0a85cb" }} />
            <div>Edit Dispatch</div>
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

export default EditDispatch;
