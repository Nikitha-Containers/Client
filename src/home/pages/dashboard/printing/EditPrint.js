import { useState } from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import {
  MenuItem,
  Grid,
  FormGroup,
  Typography,
  TextField,
  Select,
  Modal,
} from "@mui/material";
import Button from "@mui/joy/Button";
import SvgIcon from "@mui/joy/SvgIcon";
import { styled } from "@mui/joy";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import "../../../pages/pagestyle.scss";
import VisibilityIcon from "@mui/icons-material/Visibility";
import upsImage from "../../../../assets/Pagesimage/ups-image.jpg";
import { useLocation } from "react-router-dom";
import server from "../../../../server/server";
import { useDesign } from "../../../../API/Design_API";
const label = { inputProps: { "aria-label": "Checkbox demo" } };

const VisuallyHiddenInput = styled("input")`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

// Component Row Start Here
const ComponentRow = ({ component, name, onDataChange, onViewFile }) => (
  <>
    <Grid size={12} sx={{ borderBottom: "1px solid #dcdddd" }} />
    <Grid size={2}>
      <div className="Box-table-text">{name}</div>
    </Grid>

    <Grid size={1}>
      <div className="Box-table-content">
        <TextField
          id="outlined-size-small"
          name=""
          size="small"
          type="text"
          value={component.length}
          onChange={(e) => onDataChange(name, "length", e.target.value)}
        />
      </div>
    </Grid>

    <Grid size={1}>
      <div className="Box-table-content">
        <TextField
          id="outlined-size-small"
          name=""
          size="small"
          type="text"
          value={component.breadth}
          onChange={(e) => onDataChange(name, "breadth", e.target.value)}
        />
      </div>
    </Grid>

    <Grid size={1}>
      <div className="Box-table-content">
        <TextField
          id="outlined-size-small"
          name=""
          size="small"
          type="text"
          value={component.thickness}
          onChange={(e) => onDataChange(name, "thickness", e.target.value)}
        />
      </div>
    </Grid>

    <Grid size={1.5}>
      <div className="Box-table-content">
        <TextField
          id="outlined-size-small"
          name=""
          size="small"
          type="text"
          value={component.ups}
          onChange={(e) => onDataChange(name, "ups", e.target.value)}
        />
      </div>
    </Grid>

    <Grid size={1.5}>
      <div className="Box-table-content">
        <TextField
          id="outlined-size-small"
          name=""
          size="small"
          type="text"
          value={component.sheets}
          onChange={(e) => onDataChange(name, "sheets", e.target.value)}
        />
      </div>
    </Grid>

    <Grid size={3}>
      <FileUpload
        onViewFile={onViewFile}
        componentName={name}
        file={component.file}
      />
    </Grid>
  </>
);

// File Upload Component
const FileUpload = ({ onViewFile, componentName, file, disabled }) => (
  <Box
    className="Box-table-upload"
    sx={{ display: "flex", alignItems: "center", columnGap: 2.5 }}
  >
    <Button
      component="label"
      variant="outlined"
      color="neutral"
      disabled={disabled}
      startDecorator={
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
      {file && (
        <Link
          className="gray-md-btn"
          onClick={() => onViewFile(componentName)}
          style={{ cursor: "pointer" }}
        >
          <VisibilityIcon /> View
        </Link>
      )}
    </Button>
  </Box>
);

function EditPrint() {
  const location = useLocation();
  const rowData = location.state;

  const { designs } = useDesign();
  console.log("designs", designs);

  const initialFormData = {
    soNumber: rowData?.saleorder_no || "",
    soDate: rowData?.posting_date
      ? new Date(rowData.posting_date).toISOString().split("T")[0]
      : "",
    fabSite: "",
    totalQuantity: rowData?.quantity || "",
  };

  const initialComponentState = {
    length: "",
    breadth: "",
    thickness: rowData?.thickness || "",
    ups: "",
    sheets: "",
    file: null,
  };

  const [open, setOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [formData, setFormData] = useState(initialFormData);
  const [components, setComponents] = useState({
    Lid: initialComponentState,
    Body: initialComponentState,
    Bottom: initialComponentState,
    "Lid & Body": initialComponentState,
    "Lid & Body & Bottom": initialComponentState,
    "Body & Bottom": initialComponentState,
  });

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

  const handleViewFile = (componentName) => {
    const file = components[componentName]?.file;
    if (file) {
      if (file.type.startsWith("image/")) {
        const imageUrl = URL.createObjectURL(file);
        setCurrentImage(imageUrl);
        setOpen(true);
      } else {
        window.open(URL.createObjectURL(file), "_blank");
      }
    } else {
      setCurrentImage(upsImage);
      setOpen(true);
    }
  };

  const handleSubmit = async () => {
    const selectedComponents = Object.entries(components)
      .filter(([_, data]) => data.selected)
      .map(([name, data]) => ({
        name,
        length: data.length,
        breadth: data.breadth,
        thickness: data.thickness,
        ups: data.ups,
        sheets: data.sheets,
        fileName: data.file ? data.file.name : "",
      }));

    if (selectedComponents.length === 0) {
      alert("Please select at least one component");
      return false;
    }

    const incompleteComponents = selectedComponents.filter(
      (comp) =>
        !comp.length ||
        !comp.breadth ||
        !comp.thickness ||
        !comp.ups ||
        !comp.sheets
    );

    if (incompleteComponents.length > 0) {
      alert("Please fill all fields for selected components");
      return false;
    }

    try {
      const response = await server.post("/design/upsDesign", {
        soNumber: formData.soNumber,
        soDate: formData.soDate,
        fabSite: formData.fabSite,
        totalQuantity: formData.totalQuantity,
        components: selectedComponents,
      });

      const result = response.data;

      if (result.success) {
        alert("Design saved successfully!");
        console.log("Saved to MongoDB:", result.design);
        // handleCancel();
      } else {
        throw new Error(result.error || "Failed to save design");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      const errorMessage = error.response?.data?.error || error.message;
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setComponents({
      Lid: initialComponentState,
      Body: initialComponentState,
      Bottom: initialComponentState,
      "Lid & Body": initialComponentState,
      "Lid & Body & Bottom": initialComponentState,
      "Body & Bottom": initialComponentState,
    });

    if (open) {
      handleClose();
    }
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
              to={"/printing_manager"}
            >
              Printing Manager
            </Link>
            <KeyboardArrowRightIcon sx={{ color: "#0a85cb" }} />
            <div>Edit Print </div>
          </div>
        </Box>
      </Box>

      <Box className="page-layout" sx={{ marginTop: 1 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={2.5}>
            <Grid size={3}>
              <FormGroup>
                <Typography mb={1}>SO Number</Typography>
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  value={formData.soNumber}
                  onChange={(e) => handleFormChange("soNumber", e.target.value)}
                />
              </FormGroup>
            </Grid>

            <Grid size={3}>
              <FormGroup>
                <Typography mb={1}>SO Date</Typography>
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="date"
                  value={formData.soDate}
                  onChange={(e) => handleFormChange("soDate", e.target.value)}
                />
              </FormGroup>
            </Grid>

            <Grid size={3}>
              <FormGroup fullWidth>
                <Typography mb={1}>Fab Site</Typography>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={formData.fabSite}
                  size="small"
                  displayEmpty
                  renderValue={
                    formData.fabSite !== "" ? undefined : () => "Select"
                  }
                  onChange={(e) => handleFormChange("fabSite", e.target.value)}
                >
                  <MenuItem value={10}>Site 1</MenuItem>
                  <MenuItem value={20}>Site 2</MenuItem>
                  <MenuItem value={30}>Site 3</MenuItem>
                </Select>
              </FormGroup>
            </Grid>

            <Grid size={3}>
              <FormGroup>
                <Typography mb={1}>Total Qty</Typography>
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="text"
                  value={formData.totalQuantity}
                  onChange={(e) => handleFormChange("jobName", e.target.value)}
                />
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
              <div className="Box-table-title">
                Today's Work - ({new Date().toLocaleDateString()})
              </div>
            </Grid>

            {/* Header Start Here  */}
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
            <Grid size={3}>
              <div className="Box-table-subtitle">Coating Type</div>
            </Grid>
            <Grid size={3}>
              <div className="Box-table-subtitle">Printing Color</div>
            </Grid>
            {/* Header End Here */}

            {/* Render Component Rows */}
            {Object.entries(components).map(([key, component]) => (
              <ComponentRow
                key={key}
                component={component}
                name={key}
                onDataChange={handleComponentChange}
                onViewFile={handleViewFile}
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
              variant="outlined"
              color="danger"
              onClick={handleCancel}
              sx={{ minWidth: 100 }}
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              color="success"
              onClick={handleSubmit}
              sx={{ minWidth: 100 }}
            >
              Submit
            </Button>
          </Box>
        </Box>

        {/* File Preview Modal */}
        <Modal open={open} onClose={handleClose}>
          <Box sx={modalStyle}>
            <img
              src={currentImage || upsImage}
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
    </Box>
  );
}

export default EditPrint;
