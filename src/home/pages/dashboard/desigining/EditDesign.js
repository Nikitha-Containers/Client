import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import {
  MenuItem,
  Grid,
  FormGroup,
  Typography,
  TextField,
  Select,
  Checkbox,
  Modal,
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Button from "@mui/material/Button";
import SvgIcon from "@mui/material/SvgIcon";
import { styled } from "@mui/material/styles";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import VisibilityIcon from "@mui/icons-material/Visibility";
import "../../../pages/pagestyle.scss";
import server from "../../../../server/server";
import { toast } from "react-toastify";
import CloseIcon from "@mui/icons-material/Close";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

const getArtWorkClass = (art) => {
  if (!art || art === "NA") return "art-badge art-blue";
  if (art.toLowerCase() === "old") return "art-badge art-red";
  if (art.toLowerCase() === "new") return "art-badge art-green";
  return "art-badge";
};

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

// Component Row Start Here
const ComponentRow = ({
  component,
  name,
  onDataChange,
  onFileUpload,
  onViewFile,
  totalQty,
  isSubmitted,
  resetSubmitState,
}) => {
  const originalSheets =
    component.ups && totalQty
      ? Math.ceil(Number(totalQty) / Number(component.ups))
      : "";

  const lengthRef = useRef(null);

  const isFieldError = (value) =>
    component.selected && isSubmitted && (value === "" || value === null);
  const isFileError =
    component.selected && isSubmitted && !component.file && !component.fileObj;

  return (
    <>
      <Grid size={12} sx={{ borderBottom: "1px solid #dcdddd" }} />

      {/* Checkbox */}
      <Grid size={1}>
        <div className="Box-table-checkbox">
          <Checkbox
            checked={component?.selected}
            onChange={(e) => {
              onDataChange(name, "selected", e.target.checked);
              resetSubmitState();
              if (e.target.checked) {
                setTimeout(() => {
                  lengthRef.current?.focus();
                }, 300);
              }
            }}
            {...label}
          />
        </div>
      </Grid>

      {/* Component Name */}
      <Grid size={2}>
        <div className="Box-table-text">{name}</div>
      </Grid>

      {/* Length */}
      <Grid size={1}>
        <div className="Box-table-content">
          <TextField
            inputRef={lengthRef}
            size="small"
            type="number"
            value={component?.length}
            onChange={(e) => onDataChange(name, "length", e.target.value)}
            disabled={!component.selected}
            error={isFieldError(component?.length)}
            helperText={isFieldError(component?.length) ? "Required" : ""}
          />
        </div>
      </Grid>

      {/* Breadth */}
      <Grid size={1}>
        <div className="Box-table-content">
          <TextField
            size="small"
            type="number"
            value={component?.breadth}
            onChange={(e) => onDataChange(name, "breadth", e.target.value)}
            disabled={!component.selected}
            error={isFieldError(component?.breadth)}
            helperText={isFieldError(component?.breadth) ? "Required" : ""}
          />
        </div>
      </Grid>

      {/* Thickness */}
      <Grid size={1}>
        <div className="Box-table-content">
          <TextField
            size="small"
            type="number"
            value={component.thickness}
            onChange={(e) => onDataChange(name, "thickness", e.target.value)}
            disabled={!component.selected}
            error={isFieldError(component.thickness)}
            helperText={isFieldError(component.thickness) ? "Required" : ""}
          />
        </div>
      </Grid>

      {/* Ups */}
      <Grid size={1.5}>
        <div className="Box-table-content">
          <TextField
            size="small"
            type="number"
            value={component.ups}
            onChange={(e) => onDataChange(name, "ups", e.target.value)}
            disabled={!component.selected}
            error={isFieldError(component.ups)}
            helperText={isFieldError(component.ups) ? "Required" : ""}
          />
        </div>
      </Grid>

      {/* No. of Sheets */}
      <Grid size={1.5}>
        <div className="Box-table-content">
          <TextField
            size="small"
            type="number"
            label={originalSheets}
            value={component?.sheets}
            onChange={(e) => onDataChange(name, "sheets", e.target.value)}
            disabled={!component.selected}
            error={isFieldError(component.sheets)}
            helperText={isFieldError(component.sheets) ? "Required" : ""}
            InputLabelProps={{ shrink: true }}
            sx={{
              "& .MuiInputLabel-root": {
                color: "green",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "green",
              },
            }}
          />
        </div>
      </Grid>

      {/* Source File */}
      <Grid size={3}>
        <FileUpload
          onFileUpload={onFileUpload}
          onViewFile={onViewFile}
          componentName={name}
          file={component.fileObj || component.file}
          disabled={!component.selected}
          error={isFileError}
        />
      </Grid>
    </>
  );
};

// Component Row End Here

// File Upload Component
const FileUpload = ({
  onFileUpload,
  onViewFile,
  componentName,
  file,
  disabled,
  error,
}) => (
  <Box
    className="Box-table-upload"
    sx={{ display: "flex", alignItems: "center", columnGap: 2.5 }}
  >
    <Button
      component="label"
      variant="outlined"
      color={error ? "error" : "inherit"}
      disabled={disabled}
      startIcon={
        <SvgIcon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
            />
          </svg>
        </SvgIcon>
      }
    >
      {file ? "Change" : "Upload"}
      <VisuallyHiddenInput
        type="file"
        onChange={(e) => onFileUpload(componentName, e.target.files[0])}
      />
    </Button>

    {file && (
      <button
        className="gray-md-btn"
        onClick={() => onViewFile(componentName)}
        style={{ cursor: "pointer" }}
      >
        <VisibilityIcon /> View
      </button>
    )}
    {error && (
      <Typography sx={{ color: "#d32f2f", fontSize: "12px" }}>
        File required *
      </Typography>
    )}
  </Box>
);

// Main Component Started Here

function EditDesign() {
  const navigate = useNavigate();
  const location = useLocation();
  const { salesOrder, design } = location.state || {};

  const initialComp = {
    saleorder_no: salesOrder?.saleorder_no || "",
    posting_date: salesOrder?.posting_date
      ? new Date(salesOrder?.posting_date).toISOString().split("T")[0]
      : "",
    item_quantity: salesOrder?.item_quantity || "",
    machine: design?.machine || "",
    art_work: design?.art_work || salesOrder?.art_work || "NA",
    item_description:
      design?.item_description || salesOrder?.item_description || "",
    customer_name: design?.customer_name || salesOrder?.customer_name || "",
    due_date: design?.due_date || salesOrder?.due_date || "",
    sales_person_code:
      design?.sales_person_code || salesOrder?.sales_person_code || "",
    design_pending_details:
      design?.design_pending_details?.pending_reason || "",
  };

  const [formData, setFormData] = useState(initialComp);

  const createComponent = () => ({
    selected: false,
    length: "",
    breadth: "",
    thickness: salesOrder?.thickness || "",
    ups: "",
    sheets: "",
    file: null,
  });

  const initialComponentsState = useMemo(
    () => ({
      Lid: createComponent(),
      Body: createComponent(),
      Bottom: createComponent(),
      "Lid & Body": createComponent(),
      "Lid & Body & Bottom": createComponent(),
      "Body & Bottom": createComponent(),
    }),
    [salesOrder?.thickness]
  );

  const [openPending, setOpenPending] = useState(false);
  const [pendingData, setPendingData] = useState({
    completedWork: "",
    pendingWork: 0,
    reason: "",
  });
  const [open, setOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [components, setComponents] = useState(initialComponentsState);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!design?.components) return;

    const updatedComponents = { ...initialComponentsState };

    Object.entries(design?.components).forEach(([name, comp]) => {
      if (updatedComponents[name]) {
        updatedComponents[name] = {
          ...updatedComponents[name],
          selected: comp?.selected ?? true,
          length: comp?.length || "",
          breadth: comp?.breadth || "",
          thickness: comp?.thickness || salesOrder?.thickness || "",
          ups: comp?.ups || "",
          sheets: comp?.sheets || "",
          file: comp?.file || null,
          fileObj: null,
        };
      }
    });

    setComponents(updatedComponents);
  }, [design, salesOrder, initialComponentsState]);

  useEffect(() => {
    if (design?.design_pending_details?.pending_reason) {
      setPendingData((prev) => ({
        ...prev,
        reason: design.design_pending_details.pending_reason,
      }));
    }
  }, [design]);

  useEffect(() => {
    return () => {
      if (currentImage) URL.revokeObjectURL(currentImage);
    };
  }, [currentImage]);

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    if (currentImage) {
      URL.revokeObjectURL(currentImage);
      setCurrentImage("");
    }
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleComponentChange = (componentName, field, value) => {
    setComponents((prev) => ({
      ...prev,
      [componentName]: {
        ...prev[componentName],
        [field]: value,
      },
    }));
  };

  const handleFileUpload = (componentName, file) => {
    if (!file) return;

    setComponents((prev) => ({
      ...prev,
      [componentName]: {
        ...prev[componentName],
        fileObj: file,
      },
    }));
  };

  const handleViewFile = (componentName) => {
    const { file, fileObj } = components[componentName];
    const fileToView = fileObj || file;

    if (!fileToView) return;

    let imageUrl;
    if (fileToView instanceof File) {
      imageUrl = URL.createObjectURL(fileToView);
    } else if (typeof fileToView === "string") {
      if (fileToView.startsWith("http")) {
        imageUrl = fileToView;
      } else if (fileToView.startsWith("/")) {
        imageUrl = `${server?.defaults?.baseURL}${fileToView}`;
      } else {
        imageUrl = `${server?.defaults?.baseURL}/uploads/${fileToView}`;
      }
    }
    setCurrentImage(imageUrl);
    setOpen(true);
  };

  const handleSubmit = async (type) => {
    setIsSubmitted(true);
    const fullComponents = {};

    const design_status = type === "PENDING" ? 1 : 2;

    const formDataToSend = new FormData();
    for (const [name, data] of Object.entries(components)) {
      if (data.selected) {
        if (
          !data.length ||
          !data.breadth ||
          !data.thickness ||
          !data.ups ||
          !data.sheets ||
          (!data.file && !data.fileObj)
        ) {
          toast.error(`Please complete all fields and upload file for ${name}`);
          return;
        }
      }
    }

    Object.entries(components).forEach(([name, data]) => {
      if (data.selected) {
        fullComponents[name] = {
          selected: data?.selected,
          length: data?.length,
          breadth: data?.breadth,
          thickness: data?.thickness,
          ups: data?.ups,
          sheets: data?.sheets,
          file: data?.fileObj instanceof File ? undefined : data?.file,
        };
        if (data?.fileObj instanceof File) {
          formDataToSend.append(name, data?.fileObj);
        } else if (data.file && typeof data?.file === "string") {
          fullComponents[name].file = data?.file;
        }
      }
    });

    if (Object.keys(fullComponents).length === 0) {
      toast.info("Please select a component");
      return;
    }

    formDataToSend.append("saleorder_no", formData?.saleorder_no);
    formDataToSend.append("posting_date", formData?.posting_date);
    formDataToSend.append("item_quantity", formData?.item_quantity);
    formDataToSend.append("sales_person_code", formData?.sales_person_code);
    formDataToSend.append("machine", formData?.machine);
    formDataToSend.append("components", JSON.stringify(fullComponents));
    formDataToSend.append(
      "art_work",
      formData?.art_work || salesOrder?.art_work || "NA"
    );
    formDataToSend.append(
      "item_description",
      formData?.item_description || salesOrder?.item_description || ""
    );
    formDataToSend.append(
      "customer_name",
      formData?.customer_name || salesOrder?.customer_name || ""
    );
    formDataToSend.append(
      "due_date",
      formData?.due_date || salesOrder?.due_date || ""
    );
    formDataToSend.append("design_status", design_status);

    formDataToSend.append(
      "design_pending_details",
      JSON.stringify({
        pending_reason:
          type === "PENDING"
            ? pendingData.reason
            : design?.design_pending_details?.pending_reason || "",
      })
    );

    try {
      await server.post("/design/add", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (type === "PENDING") {
        toast.info("Design moved to Pending");
      } else {
        toast.success("Design saved successfully");
      }

      navigate("/designing_dashboard");
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      toast.error(errorMessage);
    }
  };

  const resetSubmitState = () => {
    setIsSubmitted(false);
  };

  const handleCancel = () => {
    navigate("/designing_dashboard");
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
              to={"/designing_dashboard"}
            >
              Designing Dashboard
            </Link>
            <KeyboardArrowRightIcon sx={{ color: "#0a85cb" }} />
            <div>Edit Design </div>
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
                  onChange={(e) =>
                    handleFormChange("customer_name", e.target.value)
                  }
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
                  onChange={(e) =>
                    handleFormChange("saleorder_no", e.target.value)
                  }
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
                  value={formData?.posting_date}
                  onChange={(e) =>
                    handleFormChange("posting_date", e.target.value)
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
                  type="number"
                  value={formData?.item_quantity}
                  onChange={(e) =>
                    handleFormChange("item_quantity", e.target.value)
                  }
                  disabled
                />
              </FormGroup>
            </Grid>

            <Grid size={2}>
              <FormGroup>
                <Typography mb={1}>Sales Person</Typography>
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="text"
                  value={formData?.sales_person_code}
                  onChange={(e) =>
                    handleFormChange("sales_person_code", e.target.value)
                  }
                  disabled
                />
              </FormGroup>
            </Grid>
            <Grid size={2}>
              <FormGroup>
                <Typography mb={1}>Machine</Typography>

                <Select
                  value={formData?.machine}
                  size="small"
                  displayEmpty
                  renderValue={
                    formData.machine !== "" ? undefined : () => "Select"
                  }
                  onChange={(e) => {
                    handleFormChange("machine", e.target.value);
                  }}
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="Machine 1">Machine 1</MenuItem>
                  <MenuItem value="Machine 2">Machine 2</MenuItem>
                  <MenuItem value="Machine 3">Machine 3</MenuItem>
                </Select>
              </FormGroup>
            </Grid>
          </Grid>
        </Box>

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
                  <span
                    className={getArtWorkClass(
                      formData?.art_work || salesOrder?.art_work
                    )}
                  >
                    {formData?.art_work || salesOrder?.art_work || "NA"}
                  </span>
                </div>

                <button className="gray-md-btn">
                  <VisibilityIcon style={{ fontSize: 20 }} />
                  Artwork Image
                </button>
              </div>
            </Grid>

            {/* Header Start Here  */}
            <Grid size={1}>
              <div className="Box-table-subtitle">Select Job</div>
            </Grid>
            <Grid size={2}>
              <div className="Box-table-subtitle">Component</div>
            </Grid>
            <Grid size={1}>
              <div className="Box-table-subtitle">Length</div>
            </Grid>
            <Grid size={1}>
              <div className="Box-table-subtitle">Breadth</div>
            </Grid>
            <Grid size={1}>
              <div className="Box-table-subtitle">Thickness</div>
            </Grid>
            <Grid size={1.5}>
              <div className="Box-table-subtitle">Ups</div>
            </Grid>
            <Grid size={1.5}>
              <div className="Box-table-subtitle">No. of Sheets</div>
            </Grid>
            <Grid size={3}>
              <div className="Box-table-subtitle">Source File</div>
            </Grid>
            {/* Header End Here */}

            {/* Render Component Rows */}
            {Object.entries(components).map(([key, component]) => (
              <ComponentRow
                key={key}
                component={component}
                name={key}
                onDataChange={handleComponentChange}
                onFileUpload={handleFileUpload}
                onViewFile={handleViewFile}
                totalQty={formData?.item_quantity}
                isSubmitted={isSubmitted}
                resetSubmitState={resetSubmitState}
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
      </Box>

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
            {/* <Grid size={5}>
              <Typography>No of Completed Works</Typography>
            </Grid>
            <Grid size={7}>
              <Select
                fullWidth
                size="small"
                value={pendingData?.completedWork}
                onChange={(e) =>
                  setPendingData({
                    ...pendingData,
                    completedWork: e.target.value,
                  })
                }
                displayEmpty
              >
                <MenuItem value="">Select</MenuItem>
                <MenuItem value="Coating - TDM">Coating - TDM</MenuItem>
                <MenuItem value="Printing - TDM">Printing - TDM</MenuItem>
              </Select>
            </Grid> */}

            {/* Pending Works */}

            {/* <Grid size={5}>
              <Typography>No of Pending Works</Typography>
            </Grid>
            <Grid size={7}>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={pendingData?.pendingWork}
                onChange={(e) =>
                  setPendingData({
                    ...pendingData,
                    pendingWork: e.target.value,
                  })
                }
              />
            </Grid> */}

            {/* Reason */}

            <Grid size={5}>
              <Typography>Reason for Pending</Typography>
            </Grid>
            <Grid size={7}>
              <Select
                fullWidth
                size="small"
                value={pendingData?.reason}
                displayEmpty
                renderValue={
                  pendingData.reason !== "" ? undefined : () => "Select"
                }
                onChange={(e) =>
                  setPendingData({
                    ...pendingData,
                    reason: e.target.value,
                  })
                }
              >
                <MenuItem value="Sheets Not Available">
                  Sheets Not Available
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
              if (!pendingData?.reason) {
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

// Main Component End Here

export default EditDesign;
