import React, { useMemo, useState } from "react";
import { styled } from "@mui/material/styles";
import { Box, Paper, Grid, IconButton } from "@mui/material";
import { MaterialReactTable } from "material-react-table";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";

import Completed from "../../../../assets/icons/circle-check-solid.svg";
import Pending from "../../../../assets/icons/hourglass-half-solid.svg";
import Todaywork from "../../../../assets/icons/list-check-solid.svg";

import { SalesOrder } from "../../../../API/Salesorder";
import { useDesign } from "../../../../API/Design_API";
import StatusChip from "../../../components/StatusChip";
import "../../../pages/pagestyle.scss";

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
  const navigate = useNavigate();
  const { salesOrders } = SalesOrder();
  const { designs } = useDesign();

  const [getStatus, setStatus] = useState("all");

  // Helper Function
  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value?.$date || value);
    if (isNaN(date)) return "-";

    const [y, m, d] = date.toISOString().split("T")[0].split("-");
    return `${d}/${m}/${y}`;
  };

  // Table Title
  const tableTitle = {
    all: "All Process",
    pending: "Pending Process",
    completed: "Completed Process",
  };

  const designMap = useMemo(() => {
    const map = {};
    designs?.forEach((d) => {
      map[String(d.saleorder_no).trim()] = d;
    });
    return map;
  }, [designs]);

  const filterStatus = useMemo(() => {
    if (getStatus === "all") return salesOrders || [];

    return (salesOrders || []).filter((so) => {
      const design = designMap[String(so.saleorder_no).trim()];

      if (!design) return false;
      if (getStatus === "pending") return design.design_status === 1;
      if (getStatus === "completed") return design.design_status === 2;

      return false;
    });
  }, [getStatus, salesOrders, designMap]);

  const completedCount = useMemo(() => {
    return designs?.filter((d) => d?.design_status === 2).length || 0;
  }, [designs]);

  const pendingCount = useMemo(() => {
    return designs?.filter((d) => d?.design_status === 1).length || 0;
  }, [designs]);

  const allCount = salesOrders?.length || 0;

  // Chip For Status
  const getStatusText = (row) => {
    const design = designMap[String(row.saleorder_no).trim()];

    if (!design) return "NEW";
    if (design?.design_status === 1) return "PENDING";
    if (design?.design_status === 2) return "COMPLETED";
    return "NEW";
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
          return formatDate(row.original.posting_date);
        },
      },
      {
        id: 3,
        accessorKey: "customer_name",
        header: "Customer Name",
        size: 30,
      },
      { id: 4, accessorKey: "item_description", header: "Size", size: 30 },
      { id: 5, accessorKey: "item_quantity", header: "Quantity", size: 30 },
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
        header: "Status",
        size: 20,
        Cell: ({ row }) => <StatusChip status={getStatusText(row.original)} />,
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
    [designMap]
  );

  return (
    <Box className="Dashboard-con">
      <Box className="breadcrump-con">
        <Box className="main-title">
          <div>Designing Dashboard</div>
        </Box>
      </Box>

      <Box className="page-layout">
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={2}>
            <Grid size={4}>
              <Item
                className={`box-con ${getStatus === "all" ? "active" : ""}`}
                sx={{
                  backgroundColor: "#725A7B",
                  color: "#fff",
                  "--box-bg": "#725A7B",
                }}
                onClick={() => setStatus("all")}
              >
                <Box className="inner-card">
                  <img src={Todaywork} className="dash-icon" />
                  <Box className="dash-txt">All Process</Box>
                  <Box className="dash-count">{allCount}</Box>
                </Box>
              </Item>
            </Grid>

            <Grid size={4}>
              <Item
                className={`box-con ${getStatus === "pending" ? "active" : ""}`}
                sx={{
                  backgroundColor: "#F67280",
                  color: "#fff",
                  "--box-bg": "#F67280",
                }}
                onClick={() => setStatus("pending")}
              >
                <Box className="inner-card">
                  <img src={Pending} className="dash-icon" />
                  <Box className="dash-txt">Pending Process</Box>
                  <Box className="dash-count">{pendingCount}</Box>
                </Box>
              </Item>
            </Grid>

            <Grid size={4}>
              <Item
                className={`box-con ${
                  getStatus === "completed" ? "active" : ""
                }`}
                sx={{
                  backgroundColor: "#FEB298",
                  color: "#fff",
                  "--box-bg": "#FEB298",
                }}
                onClick={() => setStatus("completed")}
              >
                <Box className="inner-card">
                  <img src={Completed} className="dash-icon" />
                  <Box className="dash-txt">Completed Process</Box>
                  <Box className="dash-count">{completedCount}</Box>
                </Box>
              </Item>
            </Grid>
          </Grid>
        </Box>

        <Box className="Dashboard-table" sx={{ mt: 4 }}>
          <MaterialReactTable
            columns={columns}
            data={filterStatus}
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
                const salesOrderNo = row?.original?.saleorder_no;

                const relatedDesign =
                  designMap[String(salesOrderNo).trim()] || null;

                navigate(`/edit_design`, {
                  state: {
                    salesOrder: row?.original,
                    design: relatedDesign || null,
                  },
                });
              },
              sx: {
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              },
            })}
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
                <div className="table-title">{tableTitle[getStatus]}</div>
              </Box>
            )}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DesigningDashboard;
