import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import { IconButton } from "@mui/material";
import Completed from "../../../assets/icons/circle-check-solid.svg";
import Pending from "../../../assets/icons/hourglass-half-solid.svg";
import Todaywork from "../../../assets/icons/list-check-solid.svg";
import AddSharpIcon from "@mui/icons-material/AddSharp";
import { MaterialReactTable } from "material-react-table";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
// import "../../pages/pagestyle.scss";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import excelExportI from "../../../assets/icons/icons8-export-excel-50.png";
import { SalesOrder } from "../../../API/Salesorder";
import { useNavigate } from "react-router-dom";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: (theme.vars ?? theme).palette.text.secondary,
  ...theme.applyStyles("dark", {
    backgroundColor: "#1A2027",
  }),
}));

const DesigningDashboard = () => {
  const { salesOrders } = SalesOrder();
  console.log("salesOrders", salesOrders);

  const navigate = useNavigate();

  const columns = useMemo(
    () => [
      { id: 1, accessorKey: "invoice_no", header: "Invoice No", size: 30 },
      { id: 2, accessorKey: "posting_date", header: "SO Date", size: 30 },
      {
        id: 3,
        accessorKey: "customer_name",
        header: "Customer Name",
        size: 30,
      },
      { id: 4, accessorKey: "item_description", header: "Size", size: 30 },
      { id: 5, accessorKey: "quantity", header: "Qty", size: 30 },
      { id: 6, accessorKey: "posting_date", header: "Start Date", size: 30 },
      { id: 7, accessorKey: "due_date", header: "End Date", size: 30 },
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
          <div>Designing Dashboard</div>
          <Link className="gray-md-btn" component={Link} to="/planning">
            <AddSharpIcon /> Add Plan
          </Link>
        </Box>
      </Box>

      <Box className="page-layout">
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={2}>
            <Grid size={4}>
              <Item
                className="box-con"
                sx={{ backgroundColor: "#FEB298", color: "#fff" }}
              >
                <Box className="inner-card">
                  <Box>
                    <img src={Completed} alt="image" className="dash-icon" />
                  </Box>

                  <Box className="dash-txt">Completed Process</Box>
                </Box>
              </Item>
            </Grid>

            <Grid size={4}>
              <Item
                className="box-con"
                sx={{ backgroundColor: "#F67280", color: "#fff" }}
              >
                <Box className="inner-card">
                  <Box>
                    <img src={Pending} alt="image" className="dash-icon" />
                  </Box>

                  <Box className="dash-txt">Pending Process</Box>
                </Box>
              </Item>
            </Grid>

            <Grid size={4}>
              <Item
                className="box-con"
                sx={{ backgroundColor: "#725A7B", color: "#fff" }}
              >
                <Box className="inner-card">
                  <Box>
                    <img src={Todaywork} alt="image" className="dash-icon" />
                  </Box>

                  <Box className="dash-txt">Today's Process</Box>
                </Box>
              </Item>
            </Grid>
          </Grid>
        </Box>

        <Box className="Dashboard-table" sx={{ mt: 1 }}>
          <MaterialReactTable
            columns={columns}
            data={salesOrders}
            muiTableBodyRowProps={({ row }) => ({
              onClick: () =>
                navigate("/UpsDesignplan", { state: row.original }),
              style: { cursor: "pointer" },
            })}
            positionActionsColumn="last"
            initialState={{
              showGlobalFilter: true,
            }}
            muiTableHeadCellProps={{
              sx: {
                backgroundColor: "#f5f7f9",
                color: "#000",
                fontWeight: "bold",
              },
            }}
            muiTableFooterCellProps={{
              sx: {
                backgroundColor: "#f5f7f9",
                color: "#000",
                fontWeight: 500,
              },
            }}
            renderTopToolbarCustomActions={({ table }) => (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "65%",
                  padding: "0px 0px 0px 0px",
                }}
              >
                <div className="table-title">Processing Team</div>

                <button className="export-btn">
                  <img
                    src={excelExportI}
                    alt="Export Excel"
                    style={{ width: 30, height: 30 }}
                  />
                </button>
              </Box>
            )}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DesigningDashboard;
