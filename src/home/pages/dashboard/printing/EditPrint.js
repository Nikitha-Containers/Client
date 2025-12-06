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
  Modal,
} from "@mui/material";
import Button from "@mui/joy/Button";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import "../../../pages/pagestyle.scss";
import VisibilityIcon from "@mui/icons-material/Visibility";
import upsImage from "../../../../assets/Pagesimage/ups-image.jpg";
import server from "../../../../server/server";
import PrintingColorDialog from "./PrintingColorDialog";
import CoatingTypeDialog from "./CoatingTypeDialog";

// Component Row Start Here
const ComponentRow = ({ component, name, onDataChange, onViewFile }) => {
  const [coatingDialogOpen, setCoatingDialogOpen] = useState(false);
  const [printingDialogOpen, setPrintingDialogOpen] = useState(false);

  const handleCoatingTypeClick = () => {
    setCoatingDialogOpen(true);
  };

  const handlePrintingColorClick = () => {
    setPrintingDialogOpen(true);
  };

  const handleCoatingSelect = (value) => {
    onDataChange(name, "coatingType", value);
  };

  const handlePrintingSelect = (value) => {
    onDataChange(name, "printingColor", value);
  };

  return (
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

      <Grid size={1}>
        <FileUpload
          onViewFile={onViewFile}
          componentName={name}
          file={component.file}
        />
      </Grid>
      <Grid size={1}>
        <div className="Box-table-content">
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={component.coatingType || ""}
            size="small"
            displayEmpty
            fullWidth
            renderValue={
              component.coatingType !== "" ? undefined : () => "Select"
            }
            onClick={handleCoatingTypeClick}
            readOnly
            sx={{
              cursor: "pointer",
              "& .MuiSelect-select": {
                cursor: "pointer !important",
              },
            }}
          >
            <MenuItem value="">Select</MenuItem>
            <MenuItem value="Gloss">Gloss</MenuItem>
            <MenuItem value="Matt">Matt</MenuItem>
            <MenuItem value="Soft Touch">Soft Touch</MenuItem>
            <MenuItem value="UV">UV</MenuItem>
          </Select>
        </div>
      </Grid>

      <Grid size={1}>
        <div className="Box-table-content">
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={component.printingColor || ""}
            size="small"
            displayEmpty
            fullWidth
            renderValue={
              component.printingColor !== "" ? undefined : () => "Select"
            }
            onClick={handlePrintingColorClick}
            readOnly
            sx={{
              cursor: "pointer",
              "& .MuiSelect-select": {
                cursor: "pointer !important",
              },
            }}
          >
            <MenuItem value="">Select</MenuItem>
            <MenuItem value="1 Color">1 Color</MenuItem>
            <MenuItem value="2 Colors">2 Colors</MenuItem>
            <MenuItem value="3 Colors">3 Colors</MenuItem>
            <MenuItem value="4 Colors">4 Colors</MenuItem>
            <MenuItem value="Full Color">Full Color</MenuItem>
          </Select>
        </div>
      </Grid>

      <CoatingTypeDialog
        open={coatingDialogOpen}
        onClose={() => setCoatingDialogOpen(false)}
        onSelect={handleCoatingSelect}
        currentValue={component.coatingType}
      />

      <PrintingColorDialog
        open={printingDialogOpen}
        onClose={() => setPrintingDialogOpen(false)}
        onSelect={handlePrintingSelect}
        currentValue={component.printingColor}
      />
    </>
  );
};

// Component Row End Here

// File Upload Component
const FileUpload = ({ onViewFile, componentName, file, disabled }) => (
  <Box
    className="Box-table-upload"
    sx={{ display: "flex", alignItems: "center", columnGap: 2.5 }}
  >
    <Link
      className="gray-md-btn"
      onClick={() => onViewFile(componentName)}
      style={{ cursor: "pointer" }}
    >
      <VisibilityIcon /> View
    </Link>
  </Box>
);

// Main Component Started Here

function EditPrint() {
  const location = useLocation();
  const { design } = location.state || {};

  console.log("Received design data in EditPrint:", design);

  const initialComponentsState = {
    Lid: {
      length: "",
      breadth: "",
      thickness: "",
      ups: "",
      sheets: "",
      coatingType: "",
      printingColor: "",
      file: null,
    },
    Body: {
      length: "",
      breadth: "",
      thickness: "",
      ups: "",
      sheets: "",
      coatingType: "",
      printingColor: "",
      file: null,
    },
    Bottom: {
      length: "",
      breadth: "",
      thickness: "",
      ups: "",
      sheets: "",
      coatingType: "",
      printingColor: "",
      file: null,
    },
    "Lid & Body": {
      length: "",
      breadth: "",
      thickness: "",
      ups: "",
      sheets: "",
      coatingType: "",
      printingColor: "",
      file: null,
    },
    "Lid & Body & Bottom": {
      length: "",
      breadth: "",
      thickness: "",
      ups: "",
      sheets: "",
      coatingType: "",
      printingColor: "",
      file: null,
    },
    "Body & Bottom": {
      length: "",
      breadth: "",
      thickness: "",
      ups: "",
      sheets: "",
      coatingType: "",
      printingColor: "",
      file: null,
    },
  };

  const [formData, setFormData] = useState({
    soNumber: "",
    soDate: "",
    machine: "",
    totalQty: "",
  });

  const [open, setOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [components, setComponents] = useState(initialComponentsState);

  useEffect(() => {
    if (design) {
      const formatDate = (dateObj) => {
        if (!dateObj) return "";
        try {
          const date = dateObj.$date
            ? new Date(dateObj.$date)
            : new Date(dateObj);
          return date.toISOString().split("T")[0];
        } catch (error) {
          console.error("Error formatting date:", error);
          return "";
        }
      };

      setFormData({
        soNumber: design.saleorder_no || "",
        soDate: formatDate(design.posting_date) || "",
        machine: design.machine || "",
        totalQty: design.totalQty || design.quantity || "",
      });

      const updatedComponents = { ...initialComponentsState };

      if (design.components) {
        const componentEntries = Array.isArray(design.components)
          ? design.components
          : Object.entries(design.components).map(([name, comp]) => ({
              name,
              ...comp,
            }));

        componentEntries.forEach((comp) => {
          const componentName = comp.name;
          if (updatedComponents[componentName]) {
            updatedComponents[componentName] = {
              ...updatedComponents[componentName],
              length: comp.length || "",
              breadth: comp.breadth || "",
              thickness: comp.thickness || "",
              ups: comp.ups || "",
              sheets: comp.sheets || "",
              coatingType: comp.coatingType || "",
              printingColor: comp.printingColor || "",
            };
          }
        });
      }

      setComponents(updatedComponents);
    }
  }, [design]);

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    if (currentImage && currentImage.startsWith("blob:")) {
      URL.revokeObjectURL(currentImage);
    }
    setCurrentImage("");
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
    const selectedComponents = Object.entries(components)
      .filter(([name, data]) => {
        return (
          data.length.trim() !== "" ||
          data.breadth.trim() !== "" ||
          data.thickness.trim() !== "" ||
          data.ups.trim() !== "" ||
          data.sheets.trim() !== "" ||
          data.coatingType.trim() !== "" ||
          data.printingColor.trim() !== ""
        );
      })
      .map(([name, data]) => ({
        name,
        length: data.length,
        breadth: data.breadth,
        thickness: data.thickness,
        ups: data.ups,
        sheets: data.sheets,
        coatingType: data.coatingType,
        printingColor: data.printingColor,
        fileName: data.file ? data.file.name : "",
      }));

    if (selectedComponents.length === 0) {
      alert("Please fill data for at least one component");
      return false;
    }

    const incompleteComponents = selectedComponents.filter(
      (comp) =>
        !comp.length ||
        !comp.breadth ||
        !comp.thickness ||
        !comp.ups ||
        !comp.sheets ||
        !comp.coatingType ||
        !comp.printingColor
    );

    if (incompleteComponents.length > 0) {
      alert("Please fill all fields for the components you've started");
      return false;
    }

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("art_work", design?.art_work || "");
      formDataToSend.append("size", design?.size || "");
      formDataToSend.append("customer_name", design?.customer_name || "");
      formDataToSend.append("start_date", design?.start_date || "");
      formDataToSend.append("end_date", design?.end_date || "");
      formDataToSend.append("soNumber", formData.soNumber);
      formDataToSend.append("soDate", formData.soDate);
      formDataToSend.append("machine", formData.machine);
      formDataToSend.append("totalQty", formData.totalQty);
      formDataToSend.append("components", JSON.stringify(selectedComponents));

      selectedComponents.forEach((comp, index) => {
        const componentData = components[comp.name];
        if (componentData?.file) {
          formDataToSend.append(`file_${index}`, componentData.file);
        }
      });

      const response = await server.put(
        `/design/update/${design._id}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const result = response.data;

      if (result.success) {
        alert("Design updated successfully!");
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
      const formatDate = (dateObj) => {
        if (!dateObj) return "";
        try {
          const date = dateObj.$date
            ? new Date(dateObj.$date)
            : new Date(dateObj);
          return date.toISOString().split("T")[0];
        } catch (error) {
          return "";
        }
      };

      setFormData({
        soNumber: design.saleorder_no || "",
        soDate: formatDate(design.posting_date) || "",
        machine: design.machine || "",
        totalQty: design.totalQty || design.quantity || "",
      });

      const resetComponents = { ...initialComponentsState };

      if (design.components && Array.isArray(design.components)) {
        design.components.forEach((comp) => {
          const componentName = comp.name;
          if (resetComponents[componentName]) {
            resetComponents[componentName] = {
              ...resetComponents[componentName],
              length: comp.length || "",
              breadth: comp.breadth || "",
              thickness: comp.thickness || "",
              ups: comp.ups || "",
              sheets: comp.sheets || "",
              coatingType: comp.coatingType || "",
              printingColor: comp.printingColor || "",
            };
          }
        });
      }

      setComponents(resetComponents);
    } else {
      setFormData({
        soNumber: "",
        soDate: "",
        machine: "",
        totalQty: "",
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
                  value={formData.soDate}
                  onChange={(e) => handleFormChange("soDate", e.target.value)}
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
                  value={formData.totalQty}
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
                <div>Today's Work - ({new Date().toLocaleDateString()})</div>

                <button className="gray-md-btn">
                  <VisibilityIcon style={{ fontSize: 20 }} />
                  Artwork Image
                </button>
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
            <Grid size={1}>
              <div className="Box-table-subtitle">Source File</div>
            </Grid>
            <Grid size={1}>
              <div className="Box-table-subtitle">Coating Type</div>
            </Grid>
            <Grid size={1}>
              <div className="Box-table-subtitle">Printing Color</div>
            </Grid>

            {/* Header End Here */}

            {/* Render Component Rows */}
            {Object.entries(components)
              .filter(([key]) => {
                return Object.keys(design?.components || {}).includes(key);
              })

              .map(([key, component]) => (
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
      </Box>
    </Box>
  );
}

export default EditPrint;
