import React, { useState } from "react";
import { Link } from "react-router-dom";
import server from "../../../server/server";
import Box from "@mui/material/Box";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Snackbar,
  Alert,
  IconButton,
  Grid,
  MenuItem,
} from "@mui/material";
import AddSharpIcon from "@mui/icons-material/AddSharp";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { MaterialReactTable } from "material-react-table";
import { useEmployee } from "../../../API/Employee_API";
import "../../pages/pagestyle.scss";

function EmployeeConfig() {
  const { employees, loading, refetch } = useEmployee();

  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    employee: null,
  });

  const [formValues, setFormValues] = useState({
    _id: "",
    emp_id: "",
    name: "",
    emp_type: "",
    machine_type: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  const handleOpen = () => {
    setIsEdit(false);
    setFormValues({
      _id: "",
      emp_id: "",
      name: "",
      emp_type: "",
      machine_type: "",
    });
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setIsEdit(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formValues.emp_id.trim()) {
      showSnackbar("Employee ID required", "error");
      return false;
    }
    if (!formValues.name.trim()) {
      showSnackbar("Name required", "error");
      return false;
    }
    if (!formValues.emp_type) {
      showSnackbar("Employee Type required", "error");
      return false;
    }
    if (!formValues.machine_type) {
      showSnackbar("Machine Type required", "error");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      const payload = {
        emp_id: formValues.emp_id,
        name: formValues.name,
        emp_type: formValues.emp_type,
        machine_type: formValues.machine_type,
      };
      if (isEdit) {
        await server.put(`/employee/${formValues._id}`, payload);
        showSnackbar("Employee updated successfully");
      } else {
        await server.post("/employee/create", payload);
        showSnackbar("Employee created successfully");
      }
      refetch();
      handleClose();
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || "Failed to save employee",
        "error",
      );
    }
  };

  const handleEdit = (row) => {
    setIsEdit(true);
    setFormValues({
      _id: row._id,
      emp_id: row.emp_id,
      name: row.name,
      emp_type: row.emp_type,
      machine_type: row.machine_type,
    });
    setOpenDialog(true);
  };

  const handleDelete = async () => {
    try {
      await server.delete(`/employee/${deleteDialog.employee._id}`);
      showSnackbar("Employee deleted successfully");
      refetch();
      setDeleteDialog({ open: false, employee: null });
    } catch {
      showSnackbar("Delete failed", "error");
    }
  };

  const columns = [
    { accessorKey: "emp_id", header: "Emp ID" },
    { accessorKey: "name", header: "Name" },
    {
      accessorKey: "emp_type",
      header: "Type",
      Cell: ({ cell }) => (
        <span
          style={{
            padding: "2px 10px",
            borderRadius: 20,
            fontSize: 12,
            background:
              cell.getValue() === "instructor" ? "#e3f2fd" : "#e8f5e9",
            color: cell.getValue() === "instructor" ? "#1565c0" : "#2e7d32",
            textTransform: "capitalize",
          }}
        >
          {cell.getValue()}
        </span>
      ),
    },
    {
      accessorKey: "machine_type",
      header: "Machine Type",
      Cell: ({ cell }) => (
        <span style={{ textTransform: "capitalize" }}>{cell.getValue()}</span>
      ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      Cell: ({ row }) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton color="primary" onClick={() => handleEdit(row.original)}>
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() =>
              setDeleteDialog({ open: true, employee: row.original })
            }
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box className="Dashboard-con">
      <Box className="breadcrump-con">
        <Box className="main-title">
          <div>Employee Management</div>
          <Link className="green-md-btn" onClick={handleOpen}>
            <AddSharpIcon /> Add Employee
          </Link>
        </Box>
      </Box>

      <Box className="page-layout">
        <MaterialReactTable
          columns={columns}
          data={employees}
          state={{ isLoading: loading }}
        />
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight="bold" color="#0a85cb">
            {isEdit ? "Edit Employee" : "Add Employee"}
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={4}>
              <Typography>Employee ID</Typography>
            </Grid>
            <Grid size={8}>
              <TextField
                fullWidth
                size="small"
                name="emp_id"
                value={formValues.emp_id}
                onChange={handleChange}
                disabled={isEdit}
              />
            </Grid>

            <Grid size={4}>
              <Typography>Name</Typography>
            </Grid>
            <Grid size={8}>
              <TextField
                fullWidth
                size="small"
                name="name"
                value={formValues.name}
                onChange={handleChange}
              />
            </Grid>

            <Grid size={4}>
              <Typography>Employee Type</Typography>
            </Grid>
            <Grid size={8}>
              <TextField
                select
                fullWidth
                size="small"
                name="emp_type"
                value={formValues.emp_type}
                onChange={handleChange}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="" disabled>
                  Select
                </MenuItem>
                <MenuItem value="instructor">Instructor</MenuItem>
                <MenuItem value="operator">Operator</MenuItem>
              </TextField>
            </Grid>

            <Grid size={4}>
              <Typography>Machine Type</Typography>
            </Grid>
            <Grid size={8}>
              <TextField
                select
                fullWidth
                size="small"
                name="machine_type"
                value={formValues.machine_type}
                onChange={handleChange}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="" disabled>
                  Select
                </MenuItem>
                <MenuItem value="coating">Coating</MenuItem>
                <MenuItem value="printing">Printing</MenuItem>
                <MenuItem value="varnish">Varnish</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button color="error" variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
          <Button color="success" variant="contained" onClick={handleSave}>
            {isEdit ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, employee: null })}
      >
        <DialogTitle>Delete Employee</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure want to delete{" "}
            <strong>{deleteDialog.employee?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, employee: null })}
          >
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default EmployeeConfig;
