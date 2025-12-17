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
  Tab,
  Tabs,
  Grid,
} from "@mui/material";
import { MaterialReactTable } from "material-react-table";
import CloseIcon from "@mui/icons-material/Close";
import AddSharpIcon from "@mui/icons-material/AddSharp";
import "../../pages/pagestyle.scss";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const UserDialog = React.memo(
  ({
    handleClose,
    handleChange,
    formValues,
    handleSave,
    openDialog,
    isEdit,
    showPassword,
    toggleShowPassword,
  }) => {
    return (
      <Dialog
        open={openDialog}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: "16px" } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" fontWeight="bold" color="#0a85cb">
            {isEdit ? "Edit User" : "Add New User"}
          </Typography>
          <IconButton onClick={handleClose} sx={{ color: "#3b3b3b" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* Employee ID */}
            <Grid size={4}>
              <Typography>Employee ID</Typography>
            </Grid>
            <Grid size={8}>
              <TextField
                size="small"
                fullWidth
                name="empID"
                value={formValues.empID || ""}
                onChange={handleChange}
              />
            </Grid>

            {/* Employee Name */}
            <Grid size={4}>
              <Typography>Employee Name</Typography>
            </Grid>
            <Grid size={8}>
              <TextField
                size="small"
                fullWidth
                name="empName"
                value={formValues.empName || ""}
                onChange={handleChange}
              />
            </Grid>

            {/* Email */}
            <Grid size={4}>
              <Typography>Email</Typography>
            </Grid>
            <Grid size={8}>
              <TextField
                size="small"
                type="email"
                fullWidth
                name="email"
                value={formValues.email || ""}
                onChange={handleChange}
              />
            </Grid>

            {/* Password */}
            <Grid size={4}>
              <Typography>Password</Typography>
            </Grid>
            <Grid size={8}>
              <TextField
                size="small"
                fullWidth
                type={showPassword ? "text" : "password"}
                name="password"
                value={formValues.password || ""}
                onChange={handleChange}
                helperText="Leave blank to keep current password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={toggleShowPassword}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Department */}
            <Grid size={4}>
              <Typography>Department</Typography>
            </Grid>
            <Grid size={8}>
              <TextField
                size="small"
                fullWidth
                name="department"
                value={formValues.department || ""}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions
          sx={{
            padding: "10px 18px 10px 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "end",
            columnGap: "15px",
          }}
        >
          <Button
            onClick={handleClose}
            variant="outlined"
            color="error"
            sx={{
              borderRadius: "8px",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="success"
            sx={{
              borderRadius: "8px",
            }}
          >
            {isEdit ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

// Delete Confirmation Dialog
const DeleteConfirmationDialog = ({ open, onClose, onConfirm, user }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "16px" } }}
    >
      <DialogTitle>
        <Typography sx={{ fontWeight: "bold", color: "#d32f2f" }}>
          Confirm Permanent Delete
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to permanently delete user :{" "}
          <strong>{user?.empName}</strong> ?
        </Typography>
      </DialogContent>
      <DialogActions
        sx={{
          padding: "10px 18px 10px 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "end",
          columnGap: "15px",
        }}
      >
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          sx={{
            borderRadius: "8px",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          sx={{
            borderRadius: "8px",
          }}
        >
          Delete
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
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    user: null,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [formValues, setFormValues] = useState({
    empID: "",
    empName: "",
    email: "",
    password: "",
    department: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  // Separate users by status
  const activeUsers = useMemo(
    () => users.filter((user) => user.status === 1),
    [users]
  );

  const inactiveUsers = useMemo(
    () => users.filter((user) => user.status === 0),
    [users]
  );

  // Helper functions
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // API functions
  const fetchUsers = async () => {
    try {
      const response = await server.get("/user/all");
      setUsers(response.data.allUsers);
    } catch (error) {
      showSnackbar("Failed to fetch users", "error");
    }
  };

  // Password visibility
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Dialog handlers
  const handleOpen = () => {
    setIsEdit(false);
    setFormValues({
      empID: "",
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
    }
  };

  // User actions
  const handleEdit = (user) => {
    setIsEdit(true);
    setFormValues({
      userID: user.userID,
      empID: user.empID || "",
      empName: user.empName || "",
      email: user.email || "",
      password: "",
      department: user.department || "",
    });
    setShowPassword(false);
    setOpenDialog(true);
  };

  // Direct status change handler
  const handleStatusChange = async (user, actionType) => {
    try {
      const endpoint =
        actionType === "activate"
          ? `/user/${user.userID}/activate`
          : `/user/${user.userID}/deactivate`;

      await server.put(endpoint);

      showSnackbar(
        `User ${
          actionType === "activate" ? "activated" : "deactivated"
        } successfully`
      );
      fetchUsers();
    } catch (error) {
      console.error("Error changing user status:", error);
      showSnackbar("Failed to change user status", "error");
    }
  };

  // Delete handlers
  const handleDeleteClick = (user) => {
    setDeleteDialog({
      open: true,
      user,
    });
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialog((prev) => ({ ...prev }));

    try {
      await server.delete(`/user/${deleteDialog.user.userID}`);
      showSnackbar("User deleted permanently");
      fetchUsers();
      handleDeleteClose();
    } catch (error) {
      console.error("Error deleting user:", error);
      showSnackbar("Failed to delete user", "error");
      setDeleteDialog((prev) => ({ ...prev }));
    }
  };

  const handleDeleteClose = () => {
    setDeleteDialog({
      open: false,
      user: null,
    });
  };

  // Active & Inactive Table Coloumns
  
  const getColumns = (userType) => [
    {
      id: 1,
      accessorKey: "userID",
      header: "User ID",
      size: 30,
    },
    {
      id: 2,
      accessorKey: "empID",
      header: "Employee ID",
      size: 30,
    },
    {
      id: 3,
      accessorKey: "empName",
      header: "Name",
      size: 30,
    },
    {
      id: 4,
      accessorKey: "email",
      header: "Email",
      size: 30,
    },
    {
      id: 5,
      accessorKey: "department",
      header: "Department",
      size: 30,
    },
    {
      id: 6,
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
            columnGap: "10px",
          }}
        >
          <IconButton
            onClick={() => handleEdit(row.original)}
            color="primary"
            title="Edit User"
            size="small"
          >
            <EditIcon />
          </IconButton>

          {userType === "active" ? (
            <IconButton
              onClick={() => handleStatusChange(row.original, "deactivate")}
              color="error"
              title="Deactivate User"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          ) : (
            <>
              <IconButton
                onClick={() => handleStatusChange(row.original, "activate")}
                color="success"
                title="Activate User"
                size="small"
              >
                <CheckCircleIcon />
              </IconButton>
              <IconButton
                onClick={() => handleDeleteClick(row.original)}
                color="error"
                title="Delete User Permanently"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </>
          )}
        </Box>
      ),
    },
  ];

  // Snackbar close handler
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box className="Dashboard-con">
      <Box className="breadcrump-con">
        <Box className="main-title">
          <div>User Management</div>
          <Link className="green-md-btn" onClick={handleOpen}>
            <AddSharpIcon /> Add User
          </Link>
        </Box>
      </Box>

      <Box className="page-layout">
        <Box sx={{ mt: 3 }}>
          {/* Tabs for Active/Inactive Users */}
          <Box sx={{ width: "100%", mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
              <Tab
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={{ textTransform: "none" }}>
                      Active Users - ({activeUsers.length})
                    </Typography>
                  </Box>
                }
              />
              <Tab
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={{ textTransform: "none" }}>
                      Inactive Users - ({inactiveUsers.length})
                    </Typography>
                  </Box>
                }
              />
            </Tabs>

            {/* Active Users Table */}
            {activeTab === 0 && (
              <MaterialReactTable
                columns={getColumns("active")}
                data={activeUsers}
                positionActionsColumn="last"
                initialState={{
                  showGlobalFilter: true,
                }}
                muiTableHeadCellProps={{
                  align: "center",
                  sx: {
                    backgroundColor: "#f5f7f9",
                    color: "#000",
                    fontWeight: "bold",
                  },
                }}
                muiTableBodyCellProps={{
                  align: "center",
                }}
                muiTableBodyRowProps={{
                  sx: {
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
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
            )}

            {/* Inactive Users Table */}
            {activeTab === 1 && (
              <MaterialReactTable
                columns={getColumns("inactive")}
                data={inactiveUsers}
                positionActionsColumn="last"
                initialState={{
                  showGlobalFilter: true,
                }}
                muiTableHeadCellProps={{
                  align: "center",
                  sx: {
                    backgroundColor: "#f5f7f9",
                    color: "#000",
                    fontWeight: "bold",
                  },
                }}
                muiTableBodyCellProps={{
                  align: "center",
                }}
                muiTableBodyRowProps={{
                  sx: {
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
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
            )}
          </Box>
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
        showPassword={showPassword}
        toggleShowPassword={toggleShowPassword}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
        user={deleteDialog.user}
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
