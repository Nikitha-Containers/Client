import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import {
  IconButton,
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
import SvgIcon from "@mui/joy/SvgIcon";
import { styled } from "@mui/joy";
import { MaterialReactTable } from "material-react-table";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import "../../../pages/pagestyle.scss";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import upsImage from "../../../../assets/Pagesimage/ups-image.jpg";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const data = [
  { id: 1, item: "NK25127", steel: "Alloy", size: "M12", date: "10-12-2025" },
  { id: 2, item: "NK25128", steel: "Carbon", size: "M14", date: "11-12-2025" },
  {
    id: 3,
    item: "NK25129",
    steel: "Tool Steel",
    size: "M16",
    date: "12-12-2025",
  },
  {
    id: 4,
    item: "NK25130",
    steel: "Stainless",
    size: "M18",
    date: "13-12-2025",
  },
  { id: 5, item: "NK25131", steel: "Alloy", size: "M20", date: "14-12-2025" },
  { id: 6, item: "NK25132", steel: "Carbon", size: "M22", date: "15-12-2025" },
  {
    id: 7,
    item: "NK25133",
    steel: "Stainless",
    size: "M24",
    date: "16-12-2025",
  },
  {
    id: 8,
    item: "NK25134",
    steel: "Tool Steel",
    size: "M26",
    date: "17-12-2025",
  },
  {
    id: 9,
    item: "NK25134",
    steel: "Tool Steel",
    size: "M26",
    date: "17-12-2025",
  },
  {
    id: 10,
    item: "NK25134",
    steel: "Tool Steel",
    size: "M26",
    date: "17-12-2025",
  },
  {
    id: 11,
    item: "NK25134",
    steel: "Tool Steel",
    size: "M26",
    date: "17-12-2025",
  },
  {
    id: 12,
    item: "NK25134",
    steel: "Tool Steel",
    size: "M26",
    date: "17-12-2025",
  },
];

const groupedNames = [
  { label: "Inside Food - Grade Locqur" },
  { label: "Vinyl Sizing" },
  { label: "White" },
  { type: "header", label: "Varnish" },
  { type: "item", label: "Glass Finish" },
  { type: "item", label: "Matte Finish" },
];

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

function CoatingDashboard() {
  const navigate = useNavigate();

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

  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    outline: 0,
    maxWidth: "90vw",
    maxHeight: "90vh",
  };

  const columns = useMemo(
    () => [
      {
        id: 1,
        accessorKey: "id",
        header: "SO.No",
        size: 30,
      },
      {
        id: 2,
        accessorKey: "item",
        header: "SO Date",
        size: 30,
      },
      {
        id: 3,
        accessorKey: "steel",
        header: "Customer Name",
        size: 30,
      },
      {
        id: 4,
        accessorKey: "size",
        header: "Size",
        size: 30,
      },
      {
        id: 5,
        accessorKey: "date",
        header: "Qty",
        size: 30,
      },
      {
        id: 6,
        accessorKey: "date",
        header: "Start Date",
        size: 30,
      },
      {
        id: 7,
        accessorKey: "date",
        header: "End Date",
        size: 30,
      },
      {
        id: 8,
        accessorKey: "actions",
        header: "Actions",
        size: 30,
        Cell: ({ row }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              columnGap: "20px",
            }}
          >
            <IconButton>
              <EditIcon />
            </IconButton>
            <IconButton>
              <DeleteIcon />
            </IconButton>
          </Box>
        ),
      },
    ],
    []
  );

  return (
    <Box className="Dashboard-con">
      <Box className="breadcrump-con">
        <Box className="main-title">
          <div className="main-inner-txts">
            <Link
              style={{ color: "#0a85cb", textDecoration: "none" }}
              to={"/planning"}
            >
              Coating
            </Link>
            <KeyboardArrowRightIcon sx={{ color: "#0a85cb" }} />
            <div>Edit </div>
          </div>
        </Box>
      </Box>

      <Box className="page-layout" sx={{ marginTop: 1 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={2.5}>
            <Grid size={3}>
              <FormGroup>
                <Typography mb={1}>SO Number</Typography>
                <TextField id="outlined-size-small" name="" size="small" />
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
                />
              </FormGroup>
            </Grid>

            <Grid size={3}>
              <FormGroup fullWidth>
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

            <Grid size={3}>
              <FormGroup>
                <Typography mb={1}>Job Name</Typography>
                <TextField id="outlined-size-small" name="" size="small" />
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
              <div className="Box-table-title">
                Todays' Work - ( 10-09-2025 )
              </div>
            </Grid>

            {/* Header Start Here  */}
            <Grid size={1}>
              <div className="Box-table-subtitle">Select Job</div>
            </Grid>

            <Grid size={2}>
              <div className="Box-table-subtitle">Component</div>
            </Grid>

            <Grid size={2}>
              <div className="Box-table-subtitle">Sheet Size</div>
            </Grid>

            <Grid size={2}>
              <div className="Box-table-subtitle">No of Sheets</div>
            </Grid>

            <Grid size={3}>
              <div className="Box-table-subtitle">Coating Type</div>
            </Grid>

            <Grid size={2}>
              <div className="Box-table-subtitle">Status</div>
            </Grid>
            {/* Header End Here  */}

            {/* First Row start Here  */}
            <Grid size={12} sx={{ borderBottom: "1px solid #dcdddd" }}></Grid>

            <Grid size={1}>
              <div className="Box-table-checkbox">
                <Checkbox {...label} />
              </div>
            </Grid>

            <Grid size={2}>
              <div className="Box-table-text">Lid </div>
            </Grid>

            <Grid size={2}>
              <div className="Box-table-content">
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  value={"1000 x 1024 x 0.24"}
                  disabled
                />
              </div>
            </Grid>

            <Grid size={2}>
              <div className="Box-table-content">
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="number"
                  value={1000}
                  disabled
                />
              </div>
            </Grid>

            <Grid size={3}>
              <div className="Box-table-multiselect">
                <FormControl sx={{ m: 1, width: 300 }}>
                  <Select
                    multiple
                    value={personName}
                    onChange={handleChange}
                    input={<OutlinedInput />}
                    renderValue={(selected) => selected.join(", ")}
                    size="small"
                    style={{ width: 300 }}
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

            <Grid size={2}>
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
          </Grid>
        </Box>

        <Modal open={open} onClose={handleClose}>
          <Box sx={modalStyle}>
            <img
              src={upsImage}
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

export default CoatingDashboard;
