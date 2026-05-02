import { useMemo, useState } from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import {
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Tooltip,
} from "@mui/material";
import Completed from "../../../../assets/icons/circle-check-solid.svg";
import Pending from "../../../../assets/icons/hourglass-half-solid.svg";
import Todaywork from "../../../../assets/icons/list-check-solid.svg";
import { MaterialReactTable } from "material-react-table";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDesign } from "../../../../API/Design_API";
import { useNavigate } from "react-router-dom";
import StatusChip from "../../../components/StatusChip";

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

const Varnish = () => {
  const navigate = useNavigate();

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

  // Process checkers
  const hasCoating = (d) => {
    if (!d?.components) return false;
    return Object.values(d.components).some((comp) => {
      const c = comp?.coating || {};
      const inside = Object.values(c.insideColor || {}).some((v) =>
        typeof v === "number" ? v > 0 : v?.count > 0,
      );
      const outside = Object.values(c.outsideColor || {}).some((v) =>
        typeof v === "number" ? v > 0 : v?.count > 0,
      );
      return inside || outside;
    });
  };

  const hasPrinting = (d) => {
    if (!d?.components) return false;
    return Object.values(d.components).some((comp) => {
      const p = comp?.printingColor || {};
      const normal = Object.values(p.normalColor || {}).some((v) =>
        typeof v === "number" ? v > 0 : v?.count > 0,
      );
      const spl = Object.values(p.splColor || {}).some((v) =>
        typeof v === "number" ? v > 0 : v?.count > 0,
      );
      return normal || spl;
    });
  };

  const hasVarnish = (d) => {
    if (!d?.components) return false;
    return Object.values(d.components).some((comp) => {
      const v = comp?.varnish?.varnish || {};
      return Object.values(v).some((val) =>
        typeof val === "number" ? val > 0 : val?.count > 0,
      );
    });
  };

  // Varnish dashboard: show only orders that have varnish process
  // Previous step: printing → printingteam_status===2
  //                no printing but coating → coating_status===2
  //                no printing, no coating → planning_status===2
  const isReadyForVarnish = (d) => {
    if (!hasVarnish(d)) return false;
    if (hasPrinting(d)) return d.printingteam_status === 2;
    if (hasCoating(d)) return d.coating_status === 2;
    return d.planning_status === 2;
  };

  const getStatusText = (row) => {
    if (row.varnish_status === 2) return "COMPLETED";
    if (row.varnish_status === 1) return "PENDING";
    return "NEW";
  };

  // Filter Varnish Team For Dashboard
  const filterDesigns = useMemo(() => {
    if (getStatus === "all") {
      return (designs || []).filter((d) => isReadyForVarnish(d));
    }
    if (getStatus === "pending") {
      return (designs || []).filter(
        (d) => isReadyForVarnish(d) && d.varnish_status === 1,
      );
    }
    if (getStatus === "completed") {
      return (designs || []).filter(
        (d) => isReadyForVarnish(d) && d.varnish_status === 2,
      );
    }
    return [];
  }, [getStatus, designs]);

  // Count for Cards
  const allCount = useMemo(() => {
    return (designs || []).filter((d) => isReadyForVarnish(d)).length;
  }, [designs]);

  const pendingCount = useMemo(() => {
    return (designs || []).filter(
      (d) => isReadyForVarnish(d) && d.varnish_status === 1,
    ).length;
  }, [designs]);

  const completedCount = useMemo(() => {
    return (designs || []).filter(
      (d) => isReadyForVarnish(d) && d.varnish_status === 2,
    ).length;
  }, [designs]);

  const getPendingReason = (row) => {
    return row?.varnish_pending_details?.pending_reason || "";
  };

  const columns = useMemo(
    () => [
      {
        id: 1,
        accessorKey: "saleorder_no",
        header: "SO.No",
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
      {
        id: 4,
        accessorKey: "item_description",
        header: "Size",
        size: 150,
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
          return formatDate(row.original.posting_date);
        },
      },
      {
        id: 7,
        accessorKey: "due_date",
        header: "End Date",
        size: 30,
        Cell: ({ row }) => {
          return formatDate(row.original.due_date);
        },
      },
      {
        id: 8,
        header: "Status",
        size: 20,
        Cell: ({ row }) => {
          const status = getStatusText(row.original);
          const reason = getPendingReason(row.original);

          if (status === "PENDING" && reason) {
            return (
              <Tooltip
                title={reason}
                arrow
                slotProps={{
                  tooltip: {
                    sx: {
                      fontSize: "15px",
                      padding: "8px 12px",
                    },
                  },
                }}
              >
                <span>
                  <StatusChip status={status} />
                </span>
              </Tooltip>
            );
          }

          return <StatusChip status={status} />;
        },
      },
      // {
      //   id: 9,
      //   accessorKey: "actions",
      //   header: "Actions",
      //   size: 30,
      //   Cell: ({ row }) => (
      //     <Box
      //       sx={{
      //         display: "flex",
      //         alignItems: "center",
      //         justifyContent: "center",
      //         columnGap: "20px",
      //       }}
      //     >
      //       <IconButton>
      //         <EditIcon />
      //       </IconButton>
      //       <IconButton>
      //         <DeleteIcon />
      //       </IconButton>
      //     </Box>
      //   ),
      // },
    ],
    [],
  );

  return (
    <Box className="Dashboard-con">
      <Box className="breadcrump-con">
        <Box className="main-title">
          <div>Varnish Dashboard</div>
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
                  <Box>
                    <img src={Todaywork} alt="image" className="dash-icon" />
                  </Box>

                  <Box className="dash-txt">All</Box>
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
                  <Box>
                    <img src={Pending} alt="image" className="dash-icon" />
                  </Box>

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
                  <Box>
                    <img src={Completed} alt="image" className="dash-icon" />
                  </Box>

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
            data={filterDesigns}
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
                navigate(`/edit_varnish`, {
                  state: { design: row.original },
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
            renderTopToolbarCustomActions={() => (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "65%",
                  padding: "0px",
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

export default Varnish;
