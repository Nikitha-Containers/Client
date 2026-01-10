import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import {
  Grid,
  FormGroup,
  Typography,
  TextField,
  Modal,
  Button,
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
  Select,
  MenuItem,
  DialogActions,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import "../../../pages/pagestyle.scss";
import server from "../../../../server/server";
import { toast } from "react-toastify";

// Lazy Loading
const CoatingTypeModal = lazy(() =>
  import("./CoatingColorModal").then((m) => ({
    default: m.CoatingTypeModal,
  }))
);

const PrintingColorModal = lazy(() =>
  import("./CoatingColorModal").then((m) => ({
    default: m.PrintingColorModal,
  }))
);

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
  totalQty,
  onChangeField,
  isFieldModified,
}) => {
  const originalSheets =
    component.ups && totalQty
      ? Math.ceil(Number(totalQty) / Number(component.ups))
      : "";
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
            type="number"
            value={component?.length}
            onChange={(e) => onChangeField(name, "length", e.target.value)}
            sx={
              isFieldModified(name, "length")
                ? { backgroundColor: "#fff9c4" }
                : {}
            }
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
            onChange={(e) => onChangeField(name, "breadth", e.target.value)}
            sx={
              isFieldModified(name, "breadth")
                ? { backgroundColor: "#fff9c4" }
                : {}
            }
          />
        </div>
      </Grid>

      {/* Thickness */}
      <Grid size={1}>
        <div className="Box-table-content">
          <TextField
            size="small"
            type="number"
            value={component?.thickness}
            onChange={(e) => onChangeField(name, "thickness", e.target.value)}
            sx={
              isFieldModified(name, "thickness")
                ? { backgroundColor: "#fff9c4" }
                : {}
            }
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
            onChange={(e) => onChangeField(name, "ups", e.target.value)}
            sx={
              isFieldModified(name, "ups") ? { backgroundColor: "#fff9c4" } : {}
            }
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
            onChange={(e) => onChangeField(name, "sheets", e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              "& .MuiInputLabel-root": {
                color: "green",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "green",
              },
              ...(isFieldModified(name, "sheets") && {
                backgroundColor: "#fff9c4",
              }),
            }}
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
  const { design } = location?.state || {};

  const [formData, setFormData] = useState({
    customer_name: design?.customer_name || "",
    saleorder_no: design?.saleorder_no || "",
    posting_date: design?.posting_date
      ? new Date(design?.posting_date).toISOString().split("T")[0]
      : "",
    item_quantity: design?.item_quantity || "",
    sales_person_code: design?.sales_person_code || "",
    machine: design?.machine,
    art_work: design?.art_work || "NA",
    printingmanager_pending_details: design?.pending_reason || "",
  });

  const [components, setComponents] = useState({});
  const [initialComponents, setInitialComponents] = useState({});

  // Preview Modal
  const [open, setOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");

  // Coating & Color
  const [selectedComponent, setSelectedComponent] = useState("");
  const [selectedCoating, setSelectedCoating] = useState({});
  const [selectedColor, setSelectedColor] = useState({});
  const [coatingModal, setCoatingModal] = useState(false);
  const [colorModal, setColorModal] = useState(false);

  //Pending Dialog
  const [openPending, setOpenPending] = useState(false);
  const [pendingData, setPendingData] = useState({
    completedWork: "",
    pendingWork: 0,
    pending_reason: "",
  });

  const initialComponentsState = useMemo(() => {
    const names = [
      "Lid",
      "Body",
      "Bottom",
      "Lid & Body",
      "Lid & Body & Bottom",
      "Body & Bottom",
    ];

    return Object.fromEntries(
      names.map((n) => [
        n,
        {
          length: "",
          breadth: "",
          thickness: "",
          ups: "",
          sheets: "",
          file: null,
        },
      ])
    );
  }, []);

  useEffect(() => {
    if (!design?.components) return;

    const updatedComponents = { ...initialComponentsState };

    Object.entries(design?.components).forEach(([name, comp]) => {
      if (updatedComponents[name]) updatedComponents[name] = { ...comp };
    });

    setComponents(updatedComponents);
    setInitialComponents(updatedComponents);
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

  useEffect(() => {
    if (design?.printingmanager_pending_details?.pending_reason) {
      setPendingData((prev) => ({
        ...prev,
        pending_reason: design.printingmanager_pending_details.pending_reason,
      }));
    }
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

  const handleComponentChange = (componentName, field, value) => {
    setComponents((prev) => ({
      ...prev,
      [componentName]: {
        ...prev[componentName],
        [field]: value,
      },
    }));
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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

  const handleSubmit = async (type) => {
    const printingmanager_status = type === "PENDING" ? 1 : 2;

    const componentsPayload = {};
    const missingComponents = [];

    Object.entries(components).forEach(([name, data]) => {
      const original = design?.components?.[name];
      if (!original?.selected) return;

      const coating = selectedCoating[name];
      const printing = selectedColor[name];

      if (!coating || !printing) {
        missingComponents.push(name);
        return;
      }

      componentsPayload[name] = {
        selected: true,
        length: data.length,
        breadth: data.breadth,
        thickness: data.thickness,
        ups: data.ups,
        sheets: data.sheets,
        coating: {
          sizing: coating.sizing?.join(", ") || "",
          insideColor: coating.insideColor?.join(", ") || "",
          varnish: coating.varnish?.join(", ") || "",
          coatingColor: coating.coatingColor || "",
          coatingCount: Number(coating.coatingCount) || 1,
        },
        printingColor: {
          normalColor: printing.normalColor?.join(", ") || "",
          splColor: printing.splColor?.join(", ") || "",
        },
      };
    });

    if (missingComponents.length) {
      toast.error(
        `Select coating & printing color for: ${missingComponents.join(", ")}`
      );
      return;
    }

    const payload = {
      ...formData,
      components: componentsPayload,
      printingmanager_status,
      printingmanager_pending_details:
        type === "PENDING"
          ? { pending_reason: pendingData.pending_reason }
          : design?.printingmanager_pending_details || {},
    };

    try {
      await server.post("/design/add", payload);

      if (type === "PENDING") {
        toast.info("Design moved to Pending");
      } else {
        toast.success("Design saved successfully");
      }
      navigate("/printingmanager_dashboard");
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    navigate("/printingmanager_dashboard");
  };

  const isFieldModified = (name, field) => {
    return initialComponents?.[name]?.[field] !== components?.[name]?.[field];
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
              to={"/printingmanager_dashboard"}
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
                  value={formData?.machine ?? ""}
                  size="small"
                  displayEmpty
                  onChange={(e) => {
                    handleFormChange("machine", e.target.value);
                  }}
                >
                  <MenuItem value="" disabled>
                    Select
                  </MenuItem>
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
                  <span className={getArtWorkClass(formData?.art_work)}>
                    {formData?.art_work || "NA"}
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
                  onChangeField={handleComponentChange}
                  totalQty={design?.item_quantity}
                  isFieldModified={isFieldModified}
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
                  <MenuItem value="Print Color Not Availbale">
                    Print Color Not Availbale
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

        {/* Coating Type & Printing Color Modal */}
        <Suspense fallback={null}>
          {coatingModal && (
            <CoatingTypeModal
              open={coatingModal}
              onClose={handleCloseCoating}
              selectedComponent={selectedComponent}
              onSubmit={handleSaveCoating}
              value={selectedCoating[selectedComponent]}
            />
          )}

          {colorModal && (
            <PrintingColorModal
              open={colorModal}
              onClose={handleCloseColor}
              selectedComponent={selectedComponent}
              onSubmit={handleSaveColor}
              value={selectedColor[selectedComponent]}
            />
          )}
        </Suspense>
      </Box>
    </Box>
  );
}

export default EditPrint;
