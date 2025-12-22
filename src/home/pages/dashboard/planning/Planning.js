import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import { IconButton, Button } from "@mui/material";
import SyncIcon from "@mui/icons-material/Sync";
import { MaterialReactTable } from "material-react-table";
import "../../../pages/pagestyle.scss";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { SalesOrder } from "../../../../API/Salesorder";
import "../../../pages/pagestyle.scss";

function Planning() {
  const { salesOrders, sync } = SalesOrder();

  const navigate = useNavigate();

  const columns = useMemo(
    () => [
      {
        id: 1,
        accessorKey: "saleorder_no",
        header: "SO No",
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
          <button className="gray-md-btn" onClick={sync}>
            <SyncIcon /> Sync With SO
          </button>
        </Box>
      </Box>

      <Box className="page-layout">
        <Box sx={{ mt: 8 }}>
          <MaterialReactTable
            columns={columns}
            data={salesOrders}
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
                navigate(`/editplan`, { state: row?.original });
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
