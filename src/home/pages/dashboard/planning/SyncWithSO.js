import React, { useState, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import { IconButton, Typography } from "@mui/material";
import SyncIcon from "@mui/icons-material/Sync";
import { MaterialReactTable } from "material-react-table";
import "../../../pages/pagestyle.scss";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { SalesOrder } from "../../../../API/Salesorder";
import server from "../../../../server/server";
import StatusChip from "../../../components/StatusChip";

function SyncWithSO() {
  const { salesOrders, sync, lastSync, syncProgress, isSyncing, refetch } =
    SalesOrder();

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value?.$date || value);
    if (isNaN(date)) return "-";

    const [y, m, d] = date.toISOString().split("T")[0].split("-");
    return `${d}/${m}/${y}`;
  };

  const formatDateTime = (value) => {
    if (!value) return "";

    const date = new Date(value);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHour = hours % 12 || 12;

    return `${day}-${month}-${year} ${formattedHour}:${minutes} ${ampm}`;
  };

  const getStatusText = (row) => {
    if (row.status === 0) return "CANCEL";
    if (row.status === 1) return "ACTIVE";

    return "ACTIVE";
  };

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
        Cell: ({ row }) => {
          return formatDate(row?.original?.posting_date);
        },
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
        size: 200,
      },
      {
        id: 5,
        accessorKey: "item_quantity",
        header: "Quantity",
        size: 30,
      },
      {
        id: 6,
        accessorKey: "posting_date",
        header: "Start Date",
        size: 30,
        Cell: ({ row }) => {
          return formatDate(row?.original?.posting_date);
        },
      },
      {
        id: 7,
        accessorKey: "due_date",
        header: "End Date",
        size: 30,
        Cell: ({ row }) => {
          return formatDate(row?.original?.due_date);
        },
      },
      {
        id: 8,
        accessorKey: "status",
        header: "Status",
        size: 30,
        Cell: ({ row }) => {
          const statusText = getStatusText(row.original);
          return <StatusChip status={statusText} />;
        },
      },
      {
        id: 9,
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
            <IconButton color="primary" title="Edit SO" size="small">
              <EditIcon />
            </IconButton>
            <IconButton
              onClick={() => handleDeleteSO(row?.original?.unique_id)}
            >
              <DeleteIcon color="error" title="Delete SO" size="small" />
            </IconButton>
          </Box>
        ),
      },
    ],
    [],
  );

  // Soft Delete SO

  const handleDeleteSO = async (id) => {
    try {
      await server.put(`/salesorder/${id}`, { status: 0 });
      refetch();
    } catch (error) {
      console.error("Error cancelling SO", error);
    }
  };

  return (
    <Box className="Dashboard-con">
      <Box className="breadcrump-con">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#ffffff",
            padding: "20px 24px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <Box>
            <Typography className="main-title">Sales Order</Typography>

            {lastSync && (
              <Typography style={{ fontSize: "14px", marginTop: "6px" }}>
                Last Sync : {formatDateTime(lastSync)}
              </Typography>
            )}

            <Typography style={{ fontSize: "14px", marginTop: "4px" }}>
              Total Records : {salesOrders?.length || 0}
            </Typography>
          </Box>

          <button
            className="gray-md-btn"
            onClick={sync}
            disabled={isSyncing}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: "600",
            }}
          >
            <SyncIcon
              sx={{
                animation: isSyncing ? "spin 1s linear infinite" : "none",
                "@keyframes spin": {
                  from: { transform: "rotate(0deg)" },
                  to: { transform: "rotate(360deg)" },
                },
              }}
            />
            {isSyncing ? ` Syncing... ${syncProgress}%` : " Sync With SO"}
          </button>
        </Box>
      </Box>

      <Box className="page-layout">
        <Box sx={{ mt: 5 }}>
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

export default SyncWithSO;
