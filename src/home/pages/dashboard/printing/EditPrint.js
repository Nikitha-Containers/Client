import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import { Grid, FormGroup, Typography, TextField, Modal } from "@mui/material";
import { Button } from "@mui/joy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import "../../../pages/pagestyle.scss";
import server from "../../../../server/server";

import { CoatingTypeModal, PrintingColorModal } from "./CoatingColorModal";

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
}) => {
  return (
    <>
      <Grid size={12} sx={{ borderBottom: "1px solid #dcdddd" }} />

      {/* Component Name */}
      <Grid size={2}>
        <div className="Box-table-text"> {name}</div>
      </Grid>

      {/* Length */}
      <Grid size={1}>
        <div className="Box-table-content">
          <TextField
            size="small"
            type="text"
            value={component.length}
            disabled
          />
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
          <TextField
            size="small"
            type="text"
            value={component.sheets}
            disabled
          />
        </div>
      </Grid>

      {/* Source File */}
      <Grid size={1.5}>
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
          <Button
            color={selectedCoating[name] ? "success" : "neutral"}
            variant="outlined"
            onClick={() => onOpenCoating(name)}
          >
            {selectedCoating[name] ? "Selected" : "Select"}
          </Button>
        </div>
      </Grid>

      {/* Printing Color */}
      <Grid size={1}>
        <div className="Box-table-upload">
          <Button
            color={selectedColor[name] ? "success" : "neutral"}
            variant="outlined"
            onClick={() => onOpenColor(name)}
          >
            {selectedColor[name] ? "Selected" : "Select"}
          </Button>
        </div>
      </Grid>
    </>
  );
};
// Component Row End Here

// Main Component Started Here
function EditPrint() {
  const navigate = useNavigate();
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

  // Initial State For Coating Type & Printing Values

  useEffect(() => {
    if (!design?.components) return;

    const coatingInit = {};
    const colorInit = {};

    Object.entries(design.components).forEach(([name, comp]) => {
      if (comp.coating) {
        coatingInit[name] = {
          sizing: comp.coating.sizing ? comp.coating.sizing.split(", ") : [],
          insideColor: comp.coating.insideColor
            ? comp.coating.insideColor.split(", ")
            : [],
          varnish: comp.coating.varnish ? comp.coating.varnish.split(", ") : [],
          coatingColor: comp.coating.coatingColor || "",
          coatingCount: comp.coating.coatingCount || 1,
        };
      }
      if (comp.printingColor) {
        colorInit[name] = {
          normalColor: comp.printingColor.normalColor
            ? comp.printingColor.normalColor.split(", ")
            : [],
          splColor: comp.printingColor.splColor
            ? comp.printingColor.splColor.split(", ")
            : [],
        };
      }
    });

    setSelectedCoating(coatingInit);
    setSelectedColor(colorInit);
  }, [design]);

  // Handle View
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

  const handleSaveCoating = (value) => {
    setSelectedCoating((prev) => ({
      ...prev,
      [selectedComponent]: value,
    }));
    setCoatingModal(false);
  };

  const handleSaveColor = (value) => {
    setSelectedColor((prev) => ({
      ...prev,
      [selectedComponent]: value,
    }));
    setColorModal(false);
  };

  // Hansle Submit
  const handleSubmit = async () => {
    const missingComponents = [];

    Object.entries(design?.components || {}).forEach(
      ([componentName, componentData]) => {
        if (!componentData.selected) return;

        const coating = selectedCoating[componentName];
        const printing = selectedColor[componentName];

        if (!coating || !printing) {
          missingComponents.push(componentName);
        }
      }
    );

    if (missingComponents.length > 0) {
      alert(
        `Please choose Printing Colors & Coating Type for: ${missingComponents.join(
          ", "
        )}`
      );
      return;
    }

    const componentsPayload = {};

    Object.entries(design?.components || {}).forEach(
      ([componentName, componentData]) => {
        const coating = selectedCoating[componentName];
        const printing = selectedColor[componentName];

        componentsPayload[componentName] = { selected: true };

        if (coating) {
          componentsPayload[componentName].coating = {
            sizing: Array.isArray(coating?.sizing)
              ? coating?.sizing.join(", ")
              : "",
            insideColor: Array.isArray(coating?.insideColor)
              ? coating?.insideColor.join(", ")
              : "",
            varnish: Array.isArray(coating?.varnish)
              ? coating?.varnish.join(", ")
              : "",
            coatingColor: coating?.coatingColor || "",
            coatingCount: Number(coating?.coatingCount) || 1,
          };
        }

        if (printing) {
          componentsPayload[componentName].printingColor = {
            normalColor: Array.isArray(printing?.normalColor)
              ? printing?.normalColor.join(", ")
              : "",
            splColor: Array.isArray(printing?.splColor)
              ? printing?.splColor.join(", ")
              : "",
          };
        }
      }
    );

    const payload = {
      saleorder_no: design.saleorder_no,
      components: componentsPayload,
    };
    // Insert  Coating Type And Printing Color Data API
    try {
      const response = await server.put(
        `design/${design.saleorder_no}`,
        payload
      );
      const result = response.data;
      if (result.success) {
        alert(result.message);
        navigate("/printing_manager");
      }
    } catch (error) {
      console.error("Error updating data:", error);
      const errorMessage = error.response?.data?.error || error.message;
      alert(`Error: ${errorMessage}`);
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
            <Grid size={4}>
              <FormGroup>
                <Typography mb={1}>Customer Name</Typography>
                <TextField
                  size="small"
                  value={design?.customer_name || ""}
                  disabled
                />
              </FormGroup>
            </Grid>
            
            <Grid size={2}>
              <FormGroup>
                <Typography mb={1}>SO Number</Typography>
                <TextField
                  size="small"
                  value={design?.saleorder_no || ""}
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

            <Grid size={2}>
              <FormGroup>
                <Typography mb={1}>Machine</Typography>
                <TextField
                  size="small"
                  value={design?.machine || ""}
                  disabled
                />
              </FormGroup>
            </Grid>

            <Grid size={2}>
              <FormGroup>
                <Typography mb={1}>Total Qty</Typography>
                <TextField
                  size="small"
                  value={design?.item_quantity || ""}
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
            <Grid size={1.5}>
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
          onSubmit={handleSaveCoating}
          value={selectedCoating[selectedComponent]}
        />

        {/* Printing Color Modal */}
        <PrintingColorModal
          open={colorModal}
          onClose={handleCloseColor}
          selectedComponent={selectedComponent}
          onSubmit={handleSaveColor}
          value={selectedColor[selectedComponent]}
        />
      </Box>
    </Box>
  );
}

export default EditPrint;
