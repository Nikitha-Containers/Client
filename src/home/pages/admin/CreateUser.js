import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import server from "../../../server/server";
import Box from "@mui/material/Box";
import {
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Grid,
  FormControl,
} from "@mui/material";
import { MaterialReactTable } from "material-react-table";
import CloseIcon from "@mui/icons-material/Close";
import AddSharpIcon from "@mui/icons-material/AddSharp";
import "../../pages//pagestyle.scss";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect } from "react";

const UserDialog = React.memo(
  ({ handleClose, handleChange, formValues, handleSave, openDialog }) => {
    return (
      <Dialog open={openDialog} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography sx={{ color: "#3b3b3b", fontSize: "18px" }}>
            Add New User
          </Typography>
          <IconButton onClick={handleClose} sx={{ color: "#3b3b3b" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <TextField
            margin="normal"
            label="Username"
            name="username"
            size="small"
            fullWidth
            value={formValues.username}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            label="Email"
            name="email"
            size="small"
            fullWidth
            value={formValues.email}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            label="Password"
            type="password"
            name="password"
            size="small"
            fullWidth
            value={formValues.password}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

function CreateUser() {
  const navigate = useNavigate();

  const [getdata, setData] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [formValues, setFormValues] = useState({
    username: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  console.log("getdata", getdata);

  // custom functions start here

  const fetchUsers = async () => {
    try {
      const users = await server.get("/user/allusers");
      setData(users.data);
    } catch (error) {
      console.log("Error Fetching in Get All users ... 😶", error);
    }
  };

  const handleOpen = () => {
    setOpenDialog(true);
  };
  const handleClose = () => {
    setFormValues({});
    setOpenDialog(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formValues?.email && !formValues.password) {
      alert("Please fill the mandatory fields..!");
    }

    try {
      const res = await server.post("/user/register", {
        email: formValues?.email,
        password: formValues.password,
      });
      fetchUsers();
    } catch (error) {
      console.log("Error Fetching in Get All Register ... 😶", error);
    }

    console.log("Form Data:", formValues);
  };

  const columns = useMemo(
    () => [
      {
        id: 1,
        accessorKey: "userID",
        header: "userID",
        size: 30,
      },
      {
        id: 2,
        accessorKey: "email",
        header: "email",
        size: 30,
      },
      {
        id: 3,
        accessorKey: "createdAt",
        header: "createdAt",
        size: 30,
      },
      // {
      //   id: 4,
      //   accessorKey: "size",
      //   header: "Size",
      //   size: 30,
      // },
      // {
      //   id: 5,
      //   accessorKey: "date",
      //   header: "Qty",
      //   size: 30,
      // },
      // {
      //   id: 6,
      //   accessorKey: "date",
      //   header: "Start Date",
      //   size: 30,
      // },
      // {
      //   id: 7,
      //   accessorKey: "date",
      //   header: "End Date",
      //   size: 30,
      // },
      {
        id: 4,
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
          <Link className="gray-md-btn" onClick={handleOpen}>
            <AddSharpIcon /> Add User
          </Link>
        </Box>
      </Box>

      <Box className="page-layout">
        <Box sx={{ mt: 8 }}>
          <MaterialReactTable
            columns={columns}
            data={getdata}
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
                console.log(row.original);
                setOpenDialog(true);

                let val = {
                  username: row?.original?.status,
                  email: row?.original?.email,
                  password: row?.original?.email,
                };

                setFormValues(val);
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

      <UserDialog
        handleClose={handleClose}
        handleChange={handleChange}
        formValues={formValues}
        handleSave={handleSave}
        openDialog={openDialog}
      />
    </Box>
  );
}

export default CreateUser;
