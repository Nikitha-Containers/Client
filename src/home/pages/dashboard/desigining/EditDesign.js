import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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
} from "@mui/material";
import Button from "@mui/joy/Button";
import SvgIcon from "@mui/joy/SvgIcon";
import { styled } from "@mui/joy";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import "../../../pages/pagestyle.scss";
import VisibilityIcon from "@mui/icons-material/Visibility";
import upsImage from "../../../../assets/Pagesimage/ups-image.jpg";
import server from "../../../../server/server";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

const getArtWorkClass = (art) => {
  if (!art || art === "NA") return "art-badge art-blue";
  if (art.toLowerCase() === "old") return "art-badge art-red";
  if (art.toLowerCase() === "new") return "art-badge art-green";
  return "art-badge";
};

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
const ComponentRow = ({
  component,
  name,
  onDataChange,
  onFileUpload,
  onViewFile,
}) => (
  <>
    <Grid size={12} sx={{ borderBottom: "1px solid #dcdddd" }} />

    <Grid size={1}>
      <div className="Box-table-checkbox">
        <Checkbox
          checked={component.selected}
          onChange={(e) => onDataChange(name, "selected", e.target.checked)}
          {...label}
        />
      </div>
    </Grid>

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
          disabled={!component.selected}
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
          disabled={!component.selected}
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
          disabled={!component.selected}
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
          disabled={!component.selected}
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
          disabled={!component.selected}
        />
      </div>
    </Grid>

    <Grid size={3}>
      <FileUpload
        onFileUpload={onFileUpload}
        onViewFile={onViewFile}
        componentName={name}
        file={component.file}
        disabled={!component.selected}
      />
    </Grid>
  </>
);

// Component Row End Here

// File Upload Component
const FileUpload = ({
  onFileUpload,
  onViewFile,
  componentName,
  file,
  disabled,
}) => (
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
      {file ? "Change File" : "Upload a file"}
      <VisuallyHiddenInput
        type="file"
        onChange={(e) => onFileUpload(componentName, e.target.files[0])}
      />
    </Button>

    {file && (
      <Link
        className="gray-md-btn"
        onClick={() => onViewFile(componentName)}
        style={{ cursor: "pointer" }}
      >
        <VisibilityIcon /> View
      </Link>
    )}
  </Box>
);

// Main Component Started Here

function EditDesign() {
  const location = useLocation();
  const { salesOrder, design } = location.state || {};

  console.log("Edit Design SO:", salesOrder);
  console.log("Edit Design Design", design);

  const [formData, setFormData] = useState({
    saleorder_no: salesOrder?.saleorder_no || "",
    posting_date: salesOrder?.posting_date
      ? new Date(salesOrder?.posting_date).toISOString().split("T")[0]
      : "",
    quantity: salesOrder?.quantity || "",
    machine: design?.machine || "",
  });

  const createComponent = () => ({
    selected: false,
    length: "",
    breadth: "",
    thickness: salesOrder?.thickness || "",
    ups: "",
    sheets: "",
    file: null,
  });

  const initialComponentsState = {
    Lid: createComponent(),
    Body: createComponent(),
    Bottom: createComponent(),
    "Lid & Body": createComponent(),
    "Lid & Body & Bottom": createComponent(),
    "Body & Bottom": createComponent(),
  };

  const [open, setOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [components, setComponents] = useState(initialComponentsState);

  useEffect(() => {
    if (!design?.components) return;

    const updatedComponents = { ...initialComponentsState };

    const componentsArray = Array.isArray(design.components)
      ? design.components
      : Object.entries(design.components).map(([name, data]) => ({
          name,
          ...data,
        }));

    componentsArray.forEach((comp) => {
      const { name } = comp;
      if (name && updatedComponents[name]) {
        updatedComponents[name] = {
          ...updatedComponents[name],
          selected: comp?.selected !== undefined ? comp.selected : true,
          length: comp?.length || "",
          breadth: comp?.breadth || "",
          thickness: comp?.thickness || salesOrder?.thickness || "",
          ups: comp?.ups || "",
          sheets: comp?.sheets || "",
          file: comp?.file || null,
        };
      }
    });

    setComponents(updatedComponents);
  }, [design]);

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
    if (file) {
      handleComponentChange(componentName, "file", file);
    }
  };

  const handleViewFile = (componentName) => {
    const file = components[componentName]?.file;
    if (file) {
      if (file.type?.startsWith("image/")) {
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
    const fullComponents = {};

    Object.entries(components).forEach(([name, data]) => {
      if (data.selected) {
        fullComponents[name] = {
          selected: data?.selected,
          length: data?.length,
          breadth: data?.breadth,
          thickness: data?.thickness,
          ups: data?.ups,
          sheets: data?.sheets,
          fileName: data.file ? data.file.name : "",
        };
      }
    });

    if (Object.keys(fullComponents).length === 0) {
      alert("Please select at least one component");
      return;
    }

    // Validation
    for (const key in fullComponents) {
      const item = fullComponents[key];
      if (
        !item.length ||
        !item.breadth ||
        !item.thickness ||
        !item.ups ||
        !item.sheets
      ) {
        alert(`Please fill all fields for component: ${key}`);
        return;
      }
    }

    try {
      const response = await server.post("/design/add", {
        saleorder_no: formData?.saleorder_no,
        posting_date: formData?.posting_date,
        quantity: formData?.quantity,
        machine: formData?.machine,
        components: fullComponents,
        art_work: salesOrder?.art_work,
        item_description: salesOrder?.item_description,
        customer_name: salesOrder?.customer_name,
        due_date: salesOrder?.due_date,
      });

      const result = response.data;
      console.log(result);

      if (result.success) {
        alert("Design updated successfully!");
        console.log("Updated in MongoDB:", result.design);
      } else {
        throw new Error(result.error || "Failed to update design");
      }
    } catch (error) {
      console.error("Error updating data:", error);
      const errorMessage = error.response?.data?.error || error.message;
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleCancel = () => {
    if (design) {
      setFormData({
        saleorder_no: salesOrder?.saleorder_no || "",
        posting_date: salesOrder?.posting_date
          ? new Date(salesOrder?.posting_date).toISOString().split("T")[0]
          : "",
        machine: design?.machine || "",
        quantity: salesOrder?.quantity || "",
      });

      if (design.components) {
        const resetComponents = { ...initialComponentsState };

        if (Array.isArray(design.components)) {
          design.components.forEach((comp) => {
            if (comp.name && resetComponents[comp.name]) {
              resetComponents[comp.name] = {
                ...resetComponents[comp.name],
                selected: comp.selected !== undefined ? comp.selected : true,
                length: comp.length || "",
                breadth: comp.breadth || "",
                thickness: comp.thickness || salesOrder?.thickness || "",
                ups: comp.ups || "",
                sheets: comp.sheets || "",
                file: comp.file || null,
              };
            }
          });
        }
        setComponents(resetComponents);
      }
    } else {
      setFormData({
        saleorder_no: "",
        posting_date: "",
        machine: "",
        quantity: "",
      });
      setComponents(initialComponentsState);
    }

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
              to={"/desigining_dashboard"}
            >
              Design Dashboard
            </Link>
            <KeyboardArrowRightIcon sx={{ color: "#0a85cb" }} />
            <div>Edit Design </div>
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
                  value={formData.saleorder_no}
                  onChange={(e) =>
                    handleFormChange("saleorder_no", e.target.value)
                  }
                  disabled
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
                  value={formData.posting_date}
                  onChange={(e) =>
                    handleFormChange("posting_date", e.target.value)
                  }
                  disabled
                />
              </FormGroup>
            </Grid>

            <Grid size={3}>
              <FormGroup fullWidth>
                <Typography mb={1}>Machine</Typography>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={formData.machine}
                  size="small"
                  displayEmpty
                  renderValue={
                    formData.machine !== "" ? undefined : () => "Select"
                  }
                  onChange={(e) => handleFormChange("machine", e.target.value)}
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="Machine 1">Machine 1</MenuItem>
                  <MenuItem value="Machine 2">Machine 2</MenuItem>
                  <MenuItem value="Machine 3">Machine 3</MenuItem>
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
                  value={formData.quantity}
                  onChange={(e) => handleFormChange("totalQty", e.target.value)}
                  disabled
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
                  <span className={getArtWorkClass(salesOrder?.art_work)}>
                    {salesOrder?.art_work || "NA"}
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

// Main Component End Here

export default EditDesign;
