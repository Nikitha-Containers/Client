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
  Checkbox,
  Modal,
  FormControl,
  OutlinedInput,
  ListItemText,
  ListSubheader,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import Button from "@mui/joy/Button";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import "../../../pages/pagestyle.scss";
import VisibilityIcon from "@mui/icons-material/Visibility";
import upsImage from "../../../../assets/Pagesimage/ups-image.jpg";
import server from "../../../../server/server";

const getArtWorkClass = (art) => {
  if (!art || art === "NA") return "art-badge art-blue";
  if (art.toLowerCase() === "old") return "art-badge art-red";
  if (art.toLowerCase() === "new") return "art-badge art-green";
  return "art-badge";
};

const groupedNames = [
  { label: "Inside Food - Grade Locqur" },
  { label: "Vinyl Sizing" },
  { label: "White" },
  { type: "header", label: "Varnish" },
  { type: "item", label: "Glass Finish" },
  { type: "item", label: "Matte Finish" },
];

const ComponentRow = ({ component, name, onViewFile }) => {
  const [personName, setPersonName] = useState([]);

  const handleChange = (event) => {
    const { value } = event.target;
    setPersonName(typeof value === "string" ? value.split(",") : value);
  };

  const [value, setValue] = useState("Yes");

  const handleChange1 = (event, newValue) => {
    if (newValue !== null) {
      setValue(newValue);
    }
  };
  return (
    <>
      <Grid size={12} sx={{ borderBottom: "1px solid #dcdddd" }}></Grid>
      {/* Component Name */}
      <Grid size={2}>
        <div className="Box-table-text">{name} </div>
      </Grid>
      {/* Sheet Size */}
      <Grid size={1.5}>
        <div className="Box-table-content">
          <TextField
            id="outlined-size-small"
            size="small"
            value={`${component?.length} X ${component?.breadth} X ${component?.thickness}`}
            disabled
          />
        </div>
      </Grid>
      {/* No. of Sheets */}
      <Grid size={1.5}>
        <div className="Box-table-content">
          <TextField
            size="small"
            type="text"
            value={component?.sheets}
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
      <Grid size={1.5}>
        <div className="Box-table-multiselect">
          <FormControl fullWidth>
            <Select
              multiple
              value={personName}
              onChange={handleChange}
              input={<OutlinedInput />}
              renderValue={(selected) => selected.join(", ")}
              size="small"
            >
              {groupedNames.map((item, index) =>
                item.type === "header" ? (
                  <ListSubheader key={index}>{item.label}</ListSubheader>
                ) : (
                  <MenuItem key={index} value={item.label}>
                    <Checkbox checked={personName.includes(item.label)} />
                    <ListItemText primary={item.label} />
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>
        </div>
      </Grid>

      <Grid size={1.3}>
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

      <Grid size={1.3}>
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

      <Grid size={1.3}>
        <div className="Box-table-content">
          <ToggleButtonGroup
            value={value}
            exclusive
            onChange={handleChange1}
            size="small"
          >
            <ToggleButton
              value="Yes"
              sx={{
                backgroundColor: value === "Yes" ? "green" : "",
                color: value === "Yes" ? "white" : "",
                "&.Mui-selected": {
                  backgroundColor: "green",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "darkgreen",
                  },
                },
              }}
            >
              Yes
            </ToggleButton>

            <ToggleButton
              value="No"
              sx={{
                backgroundColor: value === "No" ? "red" : "",
                color: value === "No" ? "white" : "",
                "&.Mui-selected": {
                  backgroundColor: "red",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "darkred",
                  },
                },
              }}
            >
              No
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
      </Grid>
      {/* First Row end Here  */}
    </>
  );
};

// Main Component Started Here
function EditCoating() {
  const navigate = useNavigate();
  const location = useLocation();
  const { design } = location.state || {};


  const [components, setComponents] = useState({});
  const [open, setOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");

  const handleOpen = () => setOpen(true);

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
              to={"/coating_dashboard"}
            >
              Coating Dashboard
            </Link>
            <KeyboardArrowRightIcon sx={{ color: "#0a85cb" }} />
            <div>Edit Coating</div>
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
                  id="outlined-size-small"
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
                  id="outlined-size-small"
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
                  id="outlined-size-small"
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
              <FormGroup >
                <Typography mb={1}>Fab Site</Typography>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={10}
                  size="small"
                >
                  <MenuItem value={10}>1.</MenuItem>
                  <MenuItem value={20}>2.</MenuItem>
                  <MenuItem value={30}>3.</MenuItem>
                </Select>
              </FormGroup>
            </Grid>

            <Grid size={2}>
              <FormGroup>
                <Typography mb={1}>Total Qty</Typography>
                <TextField
                  id="outlined-size-small"
                  name=""
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
            mt: 1,
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
            <Grid size={1.5}>
              <div className="Box-table-subtitle">Sheet Size</div>
            </Grid>
            <Grid size={1.5}>
              <div className="Box-table-subtitle">No of Sheets</div>
            </Grid>
            <Grid size={1.5}>
              <div className="Box-table-subtitle">Source File</div>
            </Grid>
            <Grid size={1.5}>
              <div className="Box-table-subtitle">Coating Type</div>
            </Grid>
            <Grid size={1.3}>
              <div className="Box-table-subtitle">Start Time</div>
            </Grid>
            <Grid size={1.3}>
              <div className="Box-table-subtitle">End Time</div>
            </Grid>
            <Grid size={1.3}>
              <div className="Box-table-subtitle">Status</div>
            </Grid>
            {/* Header End Here  */}
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
              // onClick={handleSubmit}
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
      </Box>
    </Box>
  );
}

export default EditCoating;
