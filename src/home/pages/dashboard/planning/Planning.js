import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import { IconButton } from "@mui/material";
import SyncIcon from "@mui/icons-material/Sync";
import { MaterialReactTable } from "material-react-table";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import "../../../pages/pagestyle.scss";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";



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

function Planning() {
  const navigate = useNavigate();

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
          <div>Planning</div>
          <Link className="green-md-btn" component={Link} to="/planning">
            <SyncIcon /> Sync With SO
          </Link>
        </Box>
      </Box>

      <Box className="page-layout">
        <Box sx={{ mt: 8 }}>
          <MaterialReactTable
            columns={columns}
            data={data}
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
