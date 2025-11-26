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
} from "@mui/material";
import Button from "@mui/joy/Button";
import SvgIcon from "@mui/joy/SvgIcon";
import { styled } from "@mui/joy";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import "../../../pages/pagestyle.scss";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import upsImage from "../../../../assets/Pagesimage/ups-image.jpg";
import { useLocation } from "react-router-dom";

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

// Componnet Row Start Here

const ComponentRow = ({
  component,
  name,
  onDataChange,
  onFileUpload,
  onViewFile,
}) => (
  <>
    <Grid size={12} sx={{ borderBottom: "1px solid #dcdddd" }}>
      <Grid size={1}>
        <div className="Box-table-checkbox">
          <Checkbox checked={component.selected} {...label} />
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
            disabled={!component.selected}
          />
        </div>
      </Grid>

      <Grid size={3}>
        <div className="Box-table-content">
          <TextField
            id="outlined-size-small"
            name=""
            size="small"
            type="text"
            value={component.file}
            disabled={!component.selected}
          />
        </div>
      </Grid>
    </Grid>
  </>
);

function UpsDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const rowData = location.state;
  
  console.log("rowData", rowData);

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
              Designing
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
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  value={rowData?.saleorder_no || ""}
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
                  value={rowData?.posting_date}
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
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="number"
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
              <div className="Box-table-subtitle">No.of.Sheets</div>
            </Grid>

            <Grid size={3}>
              <div className="Box-table-subtitle">Source File</div>
            </Grid>
            {/* Header End Here  */}

            {/* First Row start Here  */}

            <Grid size={1}>
              <div className="Box-table-checkbox">
                <Checkbox {...label} />
              </div>
            </Grid>

            <Grid size={2}>
              <div className="Box-table-text">Lid </div>
            </Grid>

            <Grid size={1}>
              <div className="Box-table-content">
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="number"
                />
              </div>
            </Grid>

            <Grid size={1}>
              <div className="Box-table-content">
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="number"
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
                  value={rowData?.thickness || ""}
                />
              </div>
            </Grid>

            <Grid size={1.5}>
              <div className="Box-table-content">
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="number"
                />
              </div>
            </Grid>

            <Grid size={1.5}>
              <div className="Box-table-content">
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="number"
                />
              </div>
            </Grid>

            <Grid size={3}>
              <Box
                className="Box-table-upload"
                sx={{ display: "flex", alignItems: "center", columnGap: 2.5 }}
              >
                <Button
                  component="label"
                  role={undefined}
                  tabIndex={-1}
                  variant="outlined"
                  color="neutral"
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
                  Upload a file
                  <VisuallyHiddenInput type="file" />
                </Button>

                <Link className="gray-md-btn" onClick={handleOpen}>
                  <VisibilityIcon /> View
                </Link>
              </Box>
            </Grid>
            {/* First Row end Here  */}

            {/* Secound Row start Here  */}
            <Grid size={12} sx={{ borderBottom: "1px solid #dcdddd" }}></Grid>

            <Grid size={1}>
              <div className="Box-table-checkbox">
                <Checkbox {...label} />
              </div>
            </Grid>

            <Grid size={2}>
              <div className="Box-table-text">Body</div>
            </Grid>

            <Grid size={1}>
              <div className="Box-table-content">
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="number"
                />
              </div>
            </Grid>

            <Grid size={1}>
              <div className="Box-table-content">
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="number"
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
                  value={rowData?.thickness || ""}
                />
              </div>
            </Grid>

            <Grid size={1.5}>
              <div className="Box-table-content">
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="number"
                />
              </div>
            </Grid>

            <Grid size={1.5}>
              <div className="Box-table-content">
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="number"
                />
              </div>
            </Grid>

            <Grid size={3}>
              <Box
                className="Box-table-upload"
                sx={{ display: "flex", alignItems: "center", columnGap: 2.5 }}
              >
                <Button
                  component="label"
                  role={undefined}
                  tabIndex={-1}
                  variant="outlined"
                  color="neutral"
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
                  Upload a file
                  <VisuallyHiddenInput type="file" />
                </Button>

                <Link className="gray-md-btn" onClick={handleOpen}>
                  <VisibilityIcon /> View
                </Link>
              </Box>
            </Grid>
            {/* Secound Row end Here  */}

            {/* Third Row start Here  */}
            <Grid size={12} sx={{ borderBottom: "1px solid #dcdddd" }}></Grid>

            <Grid size={1}>
              <div className="Box-table-checkbox">
                <Checkbox {...label} />
              </div>
            </Grid>

            <Grid size={2}>
              <div className="Box-table-text">Bottom</div>
            </Grid>

            <Grid size={1}>
              <div className="Box-table-content">
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="number"
                />
              </div>
            </Grid>

            <Grid size={1}>
              <div className="Box-table-content">
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="number"
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
                  value={rowData?.thickness || ""}
                />
              </div>
            </Grid>

            <Grid size={1.5}>
              <div className="Box-table-content">
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="number"
                />
              </div>
            </Grid>

            <Grid size={1.5}>
              <div className="Box-table-content">
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="number"
                />
              </div>
            </Grid>

            <Grid size={3}>
              <Box
                className="Box-table-upload"
                sx={{ display: "flex", alignItems: "center", columnGap: 2.5 }}
              >
                <Button
                  component="label"
                  role={undefined}
                  tabIndex={-1}
                  variant="outlined"
                  color="neutral"
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
                  Upload a file
                  <VisuallyHiddenInput type="file" />
                </Button>

                <Link className="gray-md-btn" onClick={handleOpen}>
                  <VisibilityIcon /> View
                </Link>
              </Box>
            </Grid>
            {/* Third Row end Here  */}

            {/* Forth Row start Here  */}
            <Grid size={12} sx={{ borderBottom: "1px solid #dcdddd" }}></Grid>

            <Grid size={1}>
              <div className="Box-table-checkbox">
                <Checkbox {...label} />
              </div>
            </Grid>

            <Grid size={2}>
              <div className="Box-table-text">Lid & Body</div>
            </Grid>

            <Grid size={1}>
              <div className="Box-table-content">
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="number"
                />
              </div>
            </Grid>

            <Grid size={1}>
              <div className="Box-table-content">
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="number"
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
                  value={rowData?.thickness || ""}
                />
              </div>
            </Grid>

            <Grid size={1.5}>
              <div className="Box-table-content">
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="number"
                />
              </div>
            </Grid>

            <Grid size={1.5}>
              <div className="Box-table-content">
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="number"
                />
              </div>
            </Grid>

            <Grid size={3}>
              <Box
                className="Box-table-upload"
                sx={{ display: "flex", alignItems: "center", columnGap: 2.5 }}
              >
                <Button
                  component="label"
                  role={undefined}
                  tabIndex={-1}
                  variant="outlined"
                  color="neutral"
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
                  Upload a file
                  <VisuallyHiddenInput type="file" />
                </Button>

                <Link className="gray-md-btn" onClick={handleOpen}>
                  <VisibilityIcon /> View
                </Link>
              </Box>
            </Grid>
            {/* Forth Row end Here  */}

            {/* Fifth Row start Here  */}
            <Grid size={12} sx={{ borderBottom: "1px solid #dcdddd" }}></Grid>

            <Grid size={1}>
              <div className="Box-table-checkbox">
                <Checkbox {...label} />
              </div>
            </Grid>

            <Grid size={2}>
              <div className="Box-table-text">Lid & Body & Bottom</div>
            </Grid>

            <Grid size={1}>
              <div className="Box-table-content">
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="number"
                />
              </div>
            </Grid>

            <Grid size={1}>
              <div className="Box-table-content">
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="number"
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
                  value={rowData?.thickness || ""}
                />
              </div>
            </Grid>

            <Grid size={1.5}>
              <div className="Box-table-content">
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="number"
                />
              </div>
            </Grid>

            <Grid size={1.5}>
              <div className="Box-table-content">
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="number"
                />
              </div>
            </Grid>

            <Grid size={3}>
              <Box
                className="Box-table-upload"
                sx={{ display: "flex", alignItems: "center", columnGap: 2.5 }}
              >
                <Button
                  component="label"
                  role={undefined}
                  tabIndex={-1}
                  variant="outlined"
                  color="neutral"
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
                  Upload a file
                  <VisuallyHiddenInput type="file" />
                </Button>

                <Link className="gray-md-btn" onClick={handleOpen}>
                  <VisibilityIcon /> View
                </Link>
              </Box>
            </Grid>
            {/* Fifth Row end Here  */}

            {/* Sixth Row start Here  */}
            <Grid size={12} sx={{ borderBottom: "1px solid #dcdddd" }}></Grid>

            <Grid size={1}>
              <div className="Box-table-checkbox">
                <Checkbox {...label} />
              </div>
            </Grid>

            <Grid size={2}>
              <div className="Box-table-text">Body & Bottom</div>
            </Grid>

            <Grid size={1}>
              <div className="Box-table-content">
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="number"
                />
              </div>
            </Grid>

            <Grid size={1}>
              <div className="Box-table-content">
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="number"
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
                  value={rowData?.thickness || ""}
                />
              </div>
            </Grid>

            <Grid size={1.5}>
              <div className="Box-table-content">
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="number"
                />
              </div>
            </Grid>

            <Grid size={1.5}>
              <div className="Box-table-content">
                <TextField
                  id="outlined-size-small"
                  name=""
                  size="small"
                  type="number"
                />
              </div>
            </Grid>

            <Grid size={3}>
              <Box
                className="Box-table-upload"
                sx={{ display: "flex", alignItems: "center", columnGap: 2.5 }}
              >
                <Button
                  component="label"
                  role={undefined}
                  tabIndex={-1}
                  variant="outlined"
                  color="neutral"
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
                  Upload a file
                  <VisuallyHiddenInput type="file" />
                </Button>

                <Link className="gray-md-btn" onClick={handleOpen}>
                  <VisibilityIcon /> View
                </Link>
              </Box>
            </Grid>
            {/* Sixth Row end Here  */}
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

export default UpsDashboard;
