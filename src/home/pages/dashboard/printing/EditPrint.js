import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import {
  Grid,
  FormGroup,
  Typography,
  TextField,
  Modal,
  Button,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import "../../../pages/pagestyle.scss";
import server from "../../../../server/server";

import { CoatingTypeModal,PrintingColorModal } from "./CoatingColorModal";

const getArtWorkClass = (art) => {
  if (!art || art === "NA") return "art-badge art-blue";
  if (art.toLowerCase() === "old") return "art-badge art-red";
  if (art.toLowerCase() === "new") return "art-badge art-green";
  return "art-badge";
};

// Component Row Start Here
const ComponentRow = ({
  component,
  name,
  onViewFile,
  onOpenCoating,
  onOpenColor,
  selectedCoating,
  selectedColor,
}) => (
  <>
    <Grid size={12} sx={{ borderBottom: "1px solid #dcdddd" }} />

    {/* Component Name */}
    <Grid size={2}>
      <div className="Box-table-text"> {name}</div>
    </Grid>

    {/* Length */}
    <Grid size={1}>
      <div className="Box-table-content">
        <TextField size="small" type="text" value={component.length} disabled />
      </div>
    </Grid>

    {/* Breadth */}
    <Grid size={1}>
      <div className="Box-table-content">
        <TextField
          size="small"
          type="text"
          value={component.breadth}
          disabled
        />
      </div>
    </Grid>

    {/* Thickness */}
    <Grid size={1}>
      <div className="Box-table-content">
        <TextField
          size="small"
          type="text"
          value={component.thickness}
          disabled
        />
      </div>
    </Grid>

    {/* Ups */}
    <Grid size={1.5}>
      <div className="Box-table-content">
        <TextField size="small" type="text" value={component.ups} disabled />
      </div>
    </Grid>

    {/* No. of Sheets */}
    <Grid size={1.5}>
      <div className="Box-table-content">
        <TextField size="small" type="text" value={component.sheets} disabled />
      </div>
    </Grid>

    {/* Source File */}
    <Grid size={1}>
      <Box sx={{ display: "flex", alignItems: "center", columnGap: 2.5 }}>
        <div className="Box-table-content">
          <div
            className="gray-md-btn"
            onClick={() => onViewFile(name)}
            style={{ cursor: "pointer" }}
          >
            <VisibilityIcon /> View
          </div>
        </div>
      </Box>
    </Grid>

    {/* Coating Type */}
    <Grid size={1}>
      <div className="Box-table-upload">
        <Button onClick={() => onOpenCoating(name)}>
          {selectedCoating[name] || "Select"}
        </Button>
      </div>
    </Grid>

    {/* Printing Color */}
    <Grid size={1}>
      <div className="Box-table-upload">
        <Button onClick={() => onOpenColor(name)}>
          {selectedColor[name] || "Select"}
        </Button>
      </div>
    </Grid>
  </>
);
// Component Row End Here

// Main Component Started Here
function EditPrint() {
  const location = useLocation();
  const { design } = location.state || {};
  const [components, setComponents] = useState({});
  const [open, setOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");

  // Coating & Color
  const [selectedComponent, setSelectedComponent] = useState("");
  const [selectedCoating, setSelectedCoating] = useState({});
  const [selectedColor, setSelectedColor] = useState({});

  const [coatingModal, setCoatingModal] = useState(false);
  const [colorModal, setColorModal] = useState(false);

  const initialComponentsState = useMemo(() => {
    const compNames = [
      "Lid",
      "Body",
      "Bottom",
      "Lid & Body",
      "Lid & Body & Bottom",
      "Body & Bottom",
    ];
    const obj = {};
    compNames.forEach((name) => {
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

  useEffect(() => {
    if (!design?.components) return;
    const updatedComponents = { ...initialComponentsState };
    Object.entries(design.components).forEach(([name, comp]) => {
      if (updatedComponents[name]) updatedComponents[name] = { ...comp };
    });
    setComponents(updatedComponents);
  }, [design, initialComponentsState]);

  const handleViewFile = (componentName) => {
    const { file } = components[componentName];
    if (!file) return;

    let imageUrl;
    if (file instanceof File) {
      imageUrl = URL.createObjectURL(file);
    } else if (typeof file === "string") {
      imageUrl = file.startsWith("http")
        ? file
        : `${server?.defaults?.baseURL}/uploads/${file}`;
    }
    setCurrentImage(imageUrl);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    if (currentImage) URL.revokeObjectURL(currentImage);
    setCurrentImage("");
  };

  // Handle Coating & Color
  const handleCoatingModal = (name) => {
    setSelectedComponent(name);
    setCoatingModal(true);
  };

  const handleColorModal = (name) => {
    setSelectedComponent(name);
    setColorModal(true);
  };

  const handleCloseCoating = () => setCoatingModal(false);
  const handleCloseColor = () => setColorModal(false);

  const handleSubmitCoating = (value) => {
    setSelectedCoating((prev) => ({
      ...prev,
      [selectedComponent]: value,
    }));
    setCoatingModal(false);
  };

  const handleSubmitColor = (value) => {
    setSelectedColor((prev) => ({
      ...prev,
      [selectedComponent]: value,
    }));
    setColorModal(false);
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
                  size="small"
                  value={design?.saleorder_no || ""}
                  disabled
                />
              </FormGroup>
            </Grid>

            <Grid size={3}>
              <FormGroup>
                <Typography mb={1}>SO Date</Typography>
                <TextField
                  size="small"
                  type="date"
                  value={
                    design?.posting_date
                      ? new Date(design.posting_date)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  disabled
                />
              </FormGroup>
            </Grid>

            <Grid size={3}>
              <FormGroup>
                <Typography mb={1}>Machine</Typography>
                <TextField
                  size="small"
                  value={design?.machine || ""}
                  disabled
                />
              </FormGroup>
            </Grid>

            <Grid size={3}>
              <FormGroup>
                <Typography mb={1}>Total Qty</Typography>
                <TextField
                  size="small"
                  value={design?.quantity || ""}
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
                  <span className={getArtWorkClass(design?.art_work)}>
                    {design?.art_work || "NA"}
                  </span>
                </div>
                <button className="gray-md-btn">
                  <VisibilityIcon style={{ fontSize: 20 }} /> Artwork Image
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
              .filter(([key]) =>
                Object.keys(design?.components || {}).includes(key)
              )
              .map(([key, component]) => (
                <ComponentRow
                  key={key}
                  component={component}
                  name={key}
                  onViewFile={handleViewFile}
                  onOpenCoating={handleCoatingModal}
                  onOpenColor={handleColorModal}
                  selectedCoating={selectedCoating}
                  selectedColor={selectedColor}
                />
              ))}
          </Grid>
        </Box>

        {/* File Preview Modal */}
        <Modal open={open} onClose={handleClose}>
          <Box sx={modalStyle}>
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

        {/* Coating Type Modal */}
        <CoatingTypeModal
          open={coatingModal}
          onClose={handleCloseCoating}
          selectedComponent={selectedComponent}
          onSubmit={handleSubmitCoating}
        />

        {/* Printing Color Modal */}
        <PrintingColorModal
          open={colorModal}
          onClose={handleCloseColor}
          selectedComponent={selectedComponent}
          onSubmit={handleSubmitColor}
        />
      </Box>
    </Box>
  );
}

export default EditPrint;
