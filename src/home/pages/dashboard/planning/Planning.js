import { useMemo, useState } from "react";
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

const Planning = () => {
  const navigate = useNavigate();

  const { designs } = useDesign();

  const [getStatus, setStatus] = useState("all");

  // Filter Planning For Dashboard
  const filterDesigns = useMemo(() => {
    if (getStatus === "all") {
      return (designs || []).filter((d) => d.printingmanager_status === 2);
    }

    if (getStatus === "pending") {
      return (designs || []).filter(
        (d) => d.printingmanager_status === 2 && d.planning_status === 1
      );
    }

    if (getStatus === "completed") {
      return (designs || []).filter(
        (d) => d.printingmanager_status === 2 && d.planning_status === 2
      );
    }
    return [];
  }, [getStatus, designs]);

  // Count for Cards
  const allCount = useMemo(() => {
    return (designs || []).filter((d) => d.printingmanager_status === 2).length;
  }, [designs]);

  const pendingCount = useMemo(() => {
    return (designs || []).filter(
      (d) => d.printingmanager_status === 2 && d.planning_status === 1
    ).length;
  }, [designs]);

  const completedCount = useMemo(() => {
    return (designs || []).filter(
      (d) => d.printingmanager_status === 2 && d.planning_status === 2
    ).length;
  }, [designs]);

  // Table Title
  const tableTitle = {
    all: "All Process",
    pending: "Pending Process",
    completed: "Completed Process",
  };

  const getStatusText = (row) => {
    if (row.planning_status === 2) return "COMPLETED";
    if (row.planning_status === 1) return "PENDING";
    if (row.printingmanager_status === 2) return "NEW";

    return "NEW";
  };

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value?.$date || value);
    if (isNaN(date)) return "-";

    const [y, m, d] = date.toISOString().split("T")[0].split("-");
    return `${d}/${m}/${y}`;
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
        size: 30,
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
    [navigate]
  );

  return (
    <Box className="Dashboard-con">
      <Box className="breadcrump-con">
        <Box className="main-title">
          <div>Planning Dashboard</div>
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
                navigate(`/edit_plan`, { state: { design: row.original } });
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

export default Planning;
