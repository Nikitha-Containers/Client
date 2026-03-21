import { useState, useEffect, useMemo } from "react";
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
  ToggleButtonGroup,
  ToggleButton,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import "../../../pages/pagestyle.scss";
import server from "../../../../server/server";
import { toast } from "react-toastify";

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
  onViewPMDetails,
  totalQty,
  onChangeField,
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

      {/* L X B X T */}
      <Grid size={2}>
        <div className="Box-table-content">
          <TextField
            size="small"
            value={`${component?.length} X ${component?.breadth} X ${component?.thickness}`}
            disabled
          />
        </div>
      </Grid>

      {/* Ups */}
      <Grid size={1}>
        <div className="Box-table-content">
          <TextField
            size="small"
            type="number"
            value={component.ups}
            disabled
          />
        </div>
      </Grid>

      {/* No. of Sheets */}
      <Grid size={1}>
        <div className="Box-table-content">
          <TextField
            size="small"
            type="number"
            label={originalSheets}
            value={component?.sheets}
            InputLabelProps={{ shrink: true }}
            sx={{
              "& .MuiInputLabel-root": {
                color: "green",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "green",
              },
            }}
            disabled
          />
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

      {/* Printing Manager Details */}
      <Grid size={1}>
        <Box sx={{ display: "flex", alignItems: "center", columnGap: 2.5 }}>
          <div className="Box-table-content">
            <div
              className="gray-md-btn"
              style={{ cursor: "pointer" }}
              onClick={() => onViewPMDetails(name)}
            >
              <VisibilityIcon /> View
            </div>
          </div>
        </Box>
      </Grid>

      {/* Flim Availablity */}
      <Grid size={1}>
        <div className="Box-table-content">
          <ToggleButtonGroup
            exclusive
            size="small"
            value={component?.filmAvailable || "No"}
            onChange={(e, value) => {
              onChangeField(name, "filmAvailable", value);

              if (value === "No") {
                onChangeField(name, "filmPlateNo", "");
              }
            }}
          >
            <ToggleButton
              value="Yes"
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "green",
                  color: "white",
                },
                "&:hover": {
                  backgroundColor: "#008000db",
                },
                "&.Mui-selected:hover": {
                  backgroundColor: "#008000",
                },
              }}
            >
              Yes
            </ToggleButton>

            <ToggleButton
              value="No"
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "red",
                  color: "white",
                },
                "&:hover": {
                  backgroundColor: "#ff0000bf",
                },
                "&.Mui-selected:hover": {
                  backgroundColor: "#ff0000",
                },
              }}
            >
              No
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
      </Grid>

      {/* Flim Plate No */}
      <Grid size={1}>
        <div className="Box-table-content">
          <TextField
            size="small"
            type="text"
            value={component?.filmPlateNo || ""}
            disabled={component.filmAvailable !== "Yes"}
            onChange={(e) => onChangeField(name, "filmPlateNo", e.target.value)}
          />
        </div>
      </Grid>
    </>
  );
};
// Component Row End Here

// Main Component Started Here
function EditFlimPlate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { design } = location?.state || {};

  const [formData, setFormData] = useState({
    customer_name: design?.customer_name || "",
    saleorder_no: design?.saleorder_no,
    posting_date: design?.posting_date
      ? new Date(design?.posting_date).toISOString().split("T")[0]
      : "",
    item_quantity: design?.item_quantity || "",
    sales_employee: design?.sales_employee || "",
    telephone: design?.telephone || "",
    art_work: design?.art_work || "NA",
  });

  const [components, setComponents] = useState({});
  const [initialComponents, setInitialComponents] = useState({});

  const [openPMModal, setOpenPMModal] = useState(false);
  const [pmDetails, setPmDetails] = useState(null);

  // Preview Modal
  const [open, setOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");

  // Coating & Color
  const [selectedComponent, setSelectedComponent] = useState("");

  //Pending Dialog
  const [openPending, setOpenPending] = useState(false);
  const [pendingData, setPendingData] = useState({
    reason: "",
    otherReason: "",
  });

  // Common Pending Reasons
  const pendingReasons = [
    "Flim Plate Not Available",
    "Artwork Change",
    "SO Correction",
  ];

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
          filmAvailable: "No",
          filmPlateNo: "",
        },
      ]),
    );
  }, []);

  useEffect(() => {
    if (!design?.components) return;

    const updatedComponents = { ...initialComponentsState };

    Object.entries(design?.components).forEach(([name, comp]) => {
      if (updatedComponents[name]) {
        updatedComponents[name] = {
          ...comp,
          filmAvailable: comp?.filmAvailable || "No",
          filmPlateNo: comp?.filmPlateNo || "",
        };
      }
    });

    setComponents(updatedComponents);
    setInitialComponents(updatedComponents);
  }, [design, initialComponentsState]);

  useEffect(() => {
    const reason = design?.flimplate_pending_reason?.pending_reason;
    if (!reason) return;

    setPendingData({
      reason: pendingReasons?.includes(reason) ? reason : "Others",
      otherReason: pendingReasons?.includes(reason) ? "" : reason,
    });
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

  const handleArtworkView = () => {
    if (!design?.file_name || !design?.file_ext) return;

    const imageUrl = `${server?.defaults?.baseURL}/artworkImages/${encodeURIComponent(
      design?.file_name,
    )}.${design?.file_ext}`;

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

  const handleViewPMDetails = (componentName) => {
    const component = components[componentName];

    if (!component) return;

    setPmDetails({
      name: componentName,
      coating: component?.coating || {},
      printingColor: component?.printingColor || {},
      varnish: component?.varnish || {},
    });

    setOpenPMModal(true);
  };

  const handleSubmit = async (type) => {
    const flim_plate_status = type === "PENDING" ? 1 : 2;
    const componentsPayload = {};
    const missingFilmPlate = [];

    Object.entries(components).forEach(([name, comp]) => {
      const original = design?.components?.[name];

      if (!original?.selected) return;

      if (type === "FINAL" && comp.filmAvailable === "No") {
        missingFilmPlate.push(name);
        return;
      }
      if (
        type === "FINAL" &&
        comp.filmAvailable === "Yes" &&
        !comp.filmPlateNo?.trim()
      ) {
        missingFilmPlate.push(name);
        return;
      }
      componentsPayload[name] = {
        ...original,
        filmAvailable: comp.filmAvailable || "No",
        filmPlateNo: comp.filmPlateNo || "",
      };
    });

    if (type === "FINAL" && missingFilmPlate.length) {
      toast.error(
        `Film Plate not available for: ${missingFilmPlate.join(
          ", ",
        )}. Move this to Pending.`,
      );
      return;
    }

    const payload = {
      unique_id: design.unique_id,
      ...formData,
      components: componentsPayload,
      flim_plate_status,
      flimplate_pending_reason:
        type === "PENDING"
          ? {
              pending_reason:
                pendingData.reason === "Others"
                  ? pendingData.otherReason
                  : pendingData.reason,
            }
          : design?.flimplate_pending_reason || {},
    };

    try {
      await server.post("/design/add", payload);

      if (type === "PENDING") {
        toast.error("Design moved to Pending");
      } else {
        toast.success("Design saved successfully");
      }
      navigate("/flimplate_dashboard");
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    navigate("/flimplate_dashboard");
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
              to={"/flimplate_dashboard"}
            >
              Flim Plate
            </Link>
            <KeyboardArrowRightIcon sx={{ color: "#0a85cb" }} />
            <div>Edit Flimplate </div>
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
                  value={formData?.sales_employee}
                  onChange={(e) =>
                    handleFormChange("sales_employee", e.target.value)
                  }
                  disabled
                />
              </FormGroup>
            </Grid>

            <Grid size={2}>
              <FormGroup>
                <Typography mb={1}>SP Contact No</Typography>
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="text"
                  value={formData?.telephone}
                  onChange={(e) =>
                    handleFormChange("telephone", e.target.value)
                  }
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
                  <span className={getArtWorkClass(formData?.art_work)}>
                    {formData?.art_work || "NA"}
                  </span>
                </div>
                <button className="gray-md-btn" onClick={handleArtworkView}>
                  <VisibilityIcon style={{ fontSize: 20 }} /> Artwork Image
                </button>
              </div>
            </Grid>

            {/* Header Start Here  */}
            <Grid size={2}>
              <div className="Box-table-subtitle">Component</div>
            </Grid>
            <Grid size={2}>
              <div className="Box-table-subtitle">L X B X T</div>
            </Grid>
            <Grid size={1}>
              <div className="Box-table-subtitle">Ups</div>
            </Grid>
            <Grid size={1}>
              <div className="Box-table-subtitle">No. of Sheets</div>
            </Grid>
            <Grid size={1}>
              <div className="Box-table-subtitle">Source File</div>
            </Grid>
            <Grid size={1}>
              <div className="Box-table-subtitle">PM details</div>
            </Grid>
            <Grid size={1}>
              <div className="Box-table-subtitle">Flim Avl</div>
            </Grid>
            <Grid size={1}>
              <div className="Box-table-subtitle">Flim Plate No</div>
            </Grid>

            {/* Header End Here */}

            {/* Render Component Rows */}
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
                  onChangeField={handleComponentChange}
                  onViewPMDetails={handleViewPMDetails}
                  totalQty={design?.item_quantity}
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
              alt="Image Not Available"
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "8px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
              }}
            />
          </Box>
        </Modal>

        {/* Printing Manager Modal */}

        <Dialog
          open={openPMModal}
          onClose={() => setOpenPMModal(false)}
          fullWidth
          maxWidth="md"
          PaperProps={{ sx: { borderRadius: "16px" } }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" fontWeight="bold" color="#0a85cb">
              Printing Manager Details
            </Typography>

            <IconButton onClick={() => setOpenPMModal(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            <Stack spacing={2}>
              {/* COATING */}
              <Typography
                color="primary"
                variant="subtitle1"
                sx={{ fontSize: 18, fontWeight: "bold" }}
              >
                Coating
              </Typography>

              {/* Inside */}
              <Typography variant="body1" fontWeight="bold">
                Inside :
              </Typography>

              <Grid container spacing={2}>
                {Object.entries(pmDetails?.coating?.insideColor || {}).map(
                  ([key, val]) => (
                    <Grid item xs={6} key={key}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography sx={{ minWidth: 120 }}>
                          {key === "Other" ? val.name : key}
                        </Typography>

                        <TextField
                          size="small"
                          value={key === "Other" ? val.count : val}
                          sx={{ width: 50 }}
                          disabled
                        />
                      </Stack>
                    </Grid>
                  ),
                )}
              </Grid>

              {/* Outside */}
              <Typography variant="body1" fontWeight="bold">
                Outside :
              </Typography>

              <Grid container spacing={2}>
                {Object.entries(pmDetails?.coating?.outsideColor || {}).map(
                  ([key, val]) => (
                    <Grid item xs={6} key={key}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography sx={{ minWidth: 120 }}>
                          {key === "Other" ? val.name : key}
                        </Typography>

                        <TextField
                          size="small"
                          value={key === "Other" ? val.count : val}
                          sx={{ width: 50 }}
                          disabled
                        />
                      </Stack>
                    </Grid>
                  ),
                )}
              </Grid>

              {/* PRINTING */}
              <Typography
                color="primary"
                variant="subtitle1"
                sx={{ fontSize: 18, fontWeight: "bold" }}
              >
                Printing Color
              </Typography>

              {/* Normal */}
              <Typography variant="body1" fontWeight="bold">
                Normal :
              </Typography>

              <Grid container spacing={2}>
                {Object.entries(
                  pmDetails?.printingColor?.normalColor || {},
                ).map(([key, val]) => (
                  <Grid item xs={6} key={key}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography sx={{ minWidth: 120 }}>
                        {key === "Other" ? val.name : key}
                      </Typography>

                      <TextField
                        size="small"
                        value={key === "Other" ? val.count : val}
                        sx={{ width: 50 }}
                        disabled
                      />
                    </Stack>
                  </Grid>
                ))}
              </Grid>

              {/* Special */}
              <Typography variant="body1" fontWeight="bold">
                Special :
              </Typography>

              <Grid container spacing={2}>
                {Object.entries(pmDetails?.printingColor?.splColor || {}).map(
                  ([key, val]) => (
                    <Grid item xs={6} key={key}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography sx={{ minWidth: 120 }}>
                          {key === "Other" ? val.name : key}
                        </Typography>

                        <TextField
                          size="small"
                          value={key === "Other" ? val.count : val}
                          sx={{ width: 50 }}
                          disabled
                        />
                      </Stack>
                    </Grid>
                  ),
                )}
              </Grid>

              {/* VARNISH */}
              <Typography
                color="primary"
                variant="subtitle1"
                sx={{ fontSize: 18, fontWeight: "bold" }}
              >
                Varnish
              </Typography>

              <Grid container spacing={2}>
                {Object.entries(pmDetails?.varnish?.varnish || {}).map(
                  ([key, val]) => (
                    <Grid item xs={6} key={key}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography sx={{ minWidth: 120 }}>
                          {key === "Other" ? val.name : key}
                        </Typography>

                        <TextField
                          size="small"
                          value={key === "Other" ? val.count : val}
                          sx={{ width: 50 }}
                          disabled
                        />
                      </Stack>
                    </Grid>
                  ),
                )}
              </Grid>
            </Stack>
          </DialogContent>
        </Dialog>

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
                    setPendingData({
                      ...pendingData,
                      reason: e.target.value,
                    })
                  }
                >
                  <MenuItem value="" disabled>
                    Select
                  </MenuItem>

                  {pendingReasons.map((reason) => (
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

export default EditFlimPlate;
