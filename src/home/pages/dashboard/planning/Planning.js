import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import { IconButton, Button } from "@mui/material";
import SyncIcon from "@mui/icons-material/Sync";
import { MaterialReactTable } from "material-react-table";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import "../../../pages/pagestyle.scss";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import server from "../../../../server/server";

function Planning() {
  const navigate = useNavigate();
  const [getSO, setSO] = useState([]);

  // Fetch Data
  useEffect(() => {
    fetchSO();
  }, []);

  //Sales Order API
  const fetchSO = async () => {
    try {
      const response = await server.get("/salesorder");
      setSO(response.data.data);
      console.log("salesorder: ", response.data.data);
    } catch (error) {
      console.error(error.message);
    }
  };

  //Sync SAP Data
  const sapSync = async () => {
    const response = await server.get("/sap/sync");
    fetchSO();
  };

  const columns = useMemo(
    () => [
      {
        id: 1,
        accessorKey: "invoice_no",
        header: "Invoice No",
        size: 30,
      },
      {
        id: 2,
        accessorKey: "posting_date",
        header: "SO Date",
        size: 30,
      },
      {
        id: 3,
        accessorKey: "customer_name",
        header: "Customer Name",
        size: 30,
      },
      {
        id: 4,
        accessorKey: "item_description",
        header: "Size",
        size: 30,
      },
      {
        id: 5,
        accessorKey: "quantity",
        header: "Qty",
        size: 30,
      },
      {
        id: 6,
        accessorKey: "posting_date",
        header: "Start Date",
        size: 30,
      },
      {
        id: 7,
        accessorKey: "due_date",
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
          <div>Planning</div>
          <Link
            className="gray-md-btn"
            onClick={sapSync}
            to="/planning"
          >
            <SyncIcon /> Sync With SO
          </Link>
        </Box>
      </Box>

      <Box className="page-layout">
        <Box sx={{ mt: 8 }}>
          <MaterialReactTable
            columns={columns}
            data={getSO}
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
            muiTableBodyRowProps={({ row }) => ({
              onClick: () => {
                navigate(`/editplan`);
              },
              sx: {
                cursor: "pointer",
              },
            })}
            muiTableFooterCellProps={{
              sx: {
                backgroundColor: "#f5f7f9",
                color: "#000",
                fontWeight: 500,
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default Planning;
