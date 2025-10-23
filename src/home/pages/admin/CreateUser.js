import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  Snackbar,
  Alert,
  InputAdornment,
} from "@mui/material";
import { MaterialReactTable } from "material-react-table";
import CloseIcon from "@mui/icons-material/Close";
import AddSharpIcon from "@mui/icons-material/AddSharp";
import "../../pages/pagestyle.scss";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const UserDialog = React.memo(
  ({
    handleClose,
    handleChange,
    formValues,
    handleSave,
    openDialog,
    isEdit,
    loading,
    showPassword,
    toggleShowPassword,
  }) => {
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
            {isEdit ? "Edit User" : "Add New User"}
          </Typography>
          <IconButton onClick={handleClose} sx={{ color: "#3b3b3b" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <TextField
            margin="normal"
            label="Employee Name"
            name="empName"
            size="small"
            fullWidth
            value={formValues.empName || ""}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            label="Email"
            name="email"
            type="email"
            size="small"
            fullWidth
            required
            value={formValues.email || ""}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            size="small"
            fullWidth
            required={!isEdit}
            helperText={isEdit ? "Leave blank to keep current password" : ""}
            value={formValues.password || ""}
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={toggleShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="normal"
            label="Department"
            name="department"
            size="small"
            fullWidth
            value={formValues.department || ""}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? "Saving..." : isEdit ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

// Delete Confirmation Dialog
const DeleteConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  user,
  loading,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography sx={{ fontWeight: "bold", color: "#d32f2f" }}>
          Confirm Delete
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete user : <strong>{user?.empName}</strong>
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={loading}
          startIcon={<DeleteIcon />}
        >
          {loading ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// CreateUser Component
function CreateUser() {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    user: null,
    loading: false,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [formValues, setFormValues] = useState({
    empName: "",
    email: "",
    password: "",
    department: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  // Helper functions
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // API functions
  const fetchUsers = async () => {
    try {
      const response = await server.get("/user/allusers");
      setUsers(response.data.usersList);
    } catch (error) {
      console.log("Error Fetching in Get All users ... 😶", error);
      showSnackbar("Failed to fetch users", "error");
    }
  };

  // Password visibility
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Dialog handlers
  const handleOpen = () => {
    setIsEdit(false);
    setFormValues({
      empName: "",
      email: "",
      password: "",
      department: "",
    });
    setShowPassword(false);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setFormValues({});
    setOpenDialog(false);
    setIsEdit(false);
    setShowPassword(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // Validation
  const validateForm = () => {
    if (!formValues.email) {
      showSnackbar("Email is required", "error");
      return false;
    }
    if (!isEdit && !formValues.password) {
      showSnackbar("Password is required", "error");
      return false;
    }
    return true;
  };

  // Save handler
  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isEdit) {
        const updateData = { ...formValues };
        if (!updateData.password) {
          delete updateData.password;
        }

        await server.put(`/user/${formValues.userID}`, updateData);
        showSnackbar("User updated successfully");
      } else {
        await server.post("/user/register", formValues);
        showSnackbar("User created successfully");
      }

      fetchUsers();
      handleClose();
    } catch (error) {
      console.error("Error saving user:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to save user";
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  // User actions
  const handleEdit = (user) => {
    setIsEdit(true);
    setFormValues({
      userID: user.userID,
      empName: user.empName || "",
      email: user.email || "",
      password: "", 
      department: user.department || "",
    });
    setShowPassword(false);
    setOpenDialog(true);
  };

  // Delete handlers
  const handleDeleteClick = (user) => {
    setDeleteDialog({
      open: true,
      user,
      loading: false,
    });
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialog((prev) => ({ ...prev, loading: true }));

    try {
      await server.delete(`/user/${deleteDialog.user.userID}`);
      showSnackbar("User deleted successfully");
      fetchUsers();
      handleDeleteClose();
    } catch (error) {
      console.error("Error deleting user:", error);
      showSnackbar("Failed to delete user", "error");
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteClose = () => {
    setDeleteDialog({
      open: false,
      user: null,
      loading: false,
    });
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        id: 1,
        accessorKey: "userID",
        header: "User ID",
        size: 30,
      },
      {
        id: 2,
        accessorKey: "empName",
        header: "Name",
        size: 30,
      },
      {
        id: 3,
        accessorKey: "email",
        header: "Email",
        size: 30,
      },
      {
        id: 4,
        accessorKey: "department",
        header: "Department",
        size: 30,
      },
      {
        id: 5,
        accessorKey: "actions",
        header: "Actions",
        size: 30,
        Header: () => (
          <Box sx={{ textAlign: "center", width: "100%" }}>Actions</Box>
        ),
        Cell: ({ row }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              columnGap: "20px",
            }}
          >
            <IconButton
              onClick={() => handleEdit(row.original)}
              color="primary"
              title="Edit User"
            >
              <EditIcon />
            </IconButton>
            <IconButton
              onClick={() => handleDeleteClick(row.original)}
              color="error"
              title="Delete User"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ),
      },
    ],
    []
  );

  // Snackbar close handler
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box className="Dashboard-con">

      {/* Header Section */}
      <Box className="breadcrump-con">
        <Box className="main-title">
          <div>User Management</div>
          <Link className="gray-md-btn" onClick={handleOpen}>
            <AddSharpIcon /> Add User
          </Link>
        </Box>
      </Box>

      {/* Main Content */}
      <Box className="page-layout">
        <Box sx={{ mt: 8 }}>
          <MaterialReactTable
            columns={columns}
            data={users}
            positionActionsColumn="last"
            initialState={{
              showGlobalFilter: true,
            }}
            muiTableHeadCellProps={{
              sx: {
                backgroundColor: "#f5f7f9",
                color: "#000",
                fontWeight: "bold",
                textAlign: "center",
                "& .Mui-TableHeadCell-Content": {
                  justifyContent: "center",
                },
              },
            }}
            muiTableBodyCellProps={{
              sx: {
                textAlign: "center",
              },
            }}
            muiTableBodyRowProps={({ row }) => ({
              sx: {
                cursor: "pointer",
              },
            })}
            muiTableFooterCellProps={{
              sx: {
                backgroundColor: "#f5f7f9",
                color: "#000",
                fontWeight: 500,
                textAlign: "center",
              },
            }}
          />
        </Box>
      </Box>

      {/* User Dialog */}
      <UserDialog
        handleClose={handleClose}
        handleChange={handleChange}
        formValues={formValues}
        handleSave={handleSave}
        openDialog={openDialog}
        isEdit={isEdit}
        loading={loading}
        showPassword={showPassword}
        toggleShowPassword={toggleShowPassword}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
        user={deleteDialog.user}
        loading={deleteDialog.loading}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default CreateUser;
