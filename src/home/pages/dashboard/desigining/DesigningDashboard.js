import React, { useMemo, useState } from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import { IconButton } from "@mui/material";
import Completed from "../../../../assets/icons/circle-check-solid.svg";
import Pending from "../../../../assets/icons/hourglass-half-solid.svg";
import Todaywork from "../../../../assets/icons/list-check-solid.svg";
import { MaterialReactTable } from "material-react-table";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { SalesOrder } from "../../../../API/Salesorder";
import { useDesign } from "../../../../API/Design_API";
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
  const { salesOrders } = SalesOrder();
  const { designs } = useDesign();

  const navigate = useNavigate();

  const [getStatus, setStatus] = useState("all");

  const filterStatus = useMemo(() => {
    if (!getStatus) return [];

    if (getStatus === "all") {
      return salesOrders || [];
    }

    return (salesOrders || []).filter((so) => {
      const design = designs?.find((d) => d.saleorder_no === so.saleorder_no);

      if (!design) return false;

      if (getStatus === "pending") return design.design_status === 1;
      if (getStatus === "completed") return design.design_status === 2;

      return false;
    });
  }, [getStatus, salesOrders, designs]);

  const completedCount = useMemo(() => {
    return designs?.filter((d) => d?.design_status === 2).length || 0;
  }, [designs]);

  const pendingCount = useMemo(() => {
    return designs?.filter((d) => d?.design_status === 1).length || 0;
  }, [designs]);

  const allCount = salesOrders?.length || 0;

  const formatDate = (value) => {
    if (!value) return "";
    const d = new Date(value?.$date || value);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const columns = useMemo(
    () => [
      {
        id: 1,
        accessorKey: "saleorder_no",
        header: "SO No",
        size:0,
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
        Cell: ({ row }) => {
          const status = getStatusText(row.original);
          return (
            <Box
              sx={{
                ...getStatusStyle(status),
                padding: "4px 10px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              {status}
            </Box>
          );
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

  const getStatusText = (row) => {
    const design = designs?.find((d) => d.saleorder_no === row.saleorder_no);

    if (!design) return "NEW";
    if (design.design_status === 1) return "PENDING";
    if (design.design_status === 2) return "COMPLETED";
    return "-";
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "NEW":
        return {
          color: "#1976d2",
          background: "#e3f2fd",
        };
      case "PENDING":
        return {
          color: "#d32f2f",
          background: "#fdecea",
        };
      case "COMPLETED":
        return {
          color: "#2e7d32",
          background: "#edf7ed",
        };
      default:
        return {};
    }
  };

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
                className="box-con"
                sx={{
                  backgroundColor: "#725A7B",
                  color: "#fff",
                  position: "relative",
                }}
                onClick={() => setStatus("all")}
              >
                <Box className="inner-card">
                  <img src={Todaywork} className="dash-icon" />
                  <Box className="dash-txt">All</Box>
                  <Box>{allCount}</Box>
                </Box>
              </Item>
            </Grid>

            <Grid size={4}>
              <Item
                className="box-con"
                sx={{
                  backgroundColor: "#F67280",
                  color: "#fff",
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
                className="box-con"
                sx={{
                  backgroundColor: "#FEB298",
                  color: "#fff",
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

        <Box className="Dashboard-table" sx={{ mt: 1 }}>
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
                const relatedDesign = designs?.find(
                  (design) => design?.saleorder_no === salesOrderNo
                );

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
                <div className="table-title">Processing Team</div>
              </Box>
            )}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DesigningDashboard;
