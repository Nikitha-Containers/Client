import React, { useEffect, useState } from "react";
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

import "../../pages/pagestyle.scss";

function MachineConfig() {
  const [machines, setMachines] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    machine: null,
  });

  const [formValues, setFormValues] = useState({
    _id: "",
    machine_name: "",
    machine_type: "",
    sheets_per_hour: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const res = await server.get("/machine/all");
      setMachines(res.data.data || []);
    } catch (error) {
      showSnackbar("Failed to fetch machines", "error");
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleOpen = () => {
    setIsEdit(false);
    setFormValues({
      _id: "",
      machine_name: "",
      machine_type: "",
      sheets_per_hour: "",
    });
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setIsEdit(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formValues.machine_name.trim()) {
      showSnackbar("Machine Name required", "error");
      return false;
    }

    if (!formValues.machine_type.trim()) {
      showSnackbar("Machine Type required", "error");
      return false;
    }

    if (!formValues.sheets_per_hour) {
      showSnackbar("Sheets Per Hour required", "error");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        machine_name: formValues.machine_name,
        machine_type: formValues.machine_type,
        sheets_per_hour: Number(formValues.sheets_per_hour),
      };

      if (isEdit) {
        await server.put(`/machine/${formValues._id}`, payload);
        showSnackbar("Machine updated successfully");
      } else {
        await server.post("/machine/create", payload);
        showSnackbar("Machine created successfully");
      }

      fetchMachines();
      handleClose();
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || "Failed to save machine",
        "error",
      );
    }
  };

  const handleEdit = (row) => {
    setIsEdit(true);
    setFormValues({
      _id: row._id,
      machine_name: row.machine_name,
      machine_type: row.machine_type,
      sheets_per_hour: row.sheets_per_hour,
    });
    setOpenDialog(true);
  };

  const handleDelete = async () => {
    try {
      await server.delete(`/machine/${deleteDialog.machine._id}`);

      showSnackbar("Machine deleted successfully");
      fetchMachines();

      setDeleteDialog({
        open: false,
        machine: null,
      });
    } catch (error) {
      showSnackbar("Delete failed", "error");
    }
  };

  const columns = [
    {
      accessorKey: "machine_name",
      header: "Machine Name",
    },
    {
      accessorKey: "machine_type",
      header: "Machine Type",
    },
    {
      accessorKey: "sheets_per_hour",
      header: "Sheets / Hour",
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
              setDeleteDialog({
                open: true,
                machine: row.original,
              })
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
          <div>Machine Management</div>

          <Link className="green-md-btn" onClick={handleOpen}>
            <AddSharpIcon /> Add Machine
          </Link>
        </Box>
      </Box>

      <Box className="page-layout">
        <MaterialReactTable columns={columns} data={machines} />
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" fontWeight="bold" color="#0a85cb">
            {isEdit ? "Edit Machine" : "Add Machine"}
          </Typography>

          <IconButton onClick={handleClose} sx={{ color: "#3b3b3b" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={4}>
              <Typography>Machine Name</Typography>
            </Grid>

            <Grid size={8}>
              <TextField
                fullWidth
                size="small"
                name="machine_name"
                value={formValues.machine_name}
                onChange={handleChange}
                placeholder="Enter Machine Name..."
              />
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

            <Grid size={4}>
              <Typography>Sheets / Hour</Typography>
            </Grid>

            <Grid size={8}>
              <TextField
                type="number"
                fullWidth
                size="small"
                name="sheets_per_hour"
                value={formValues.sheets_per_hour}
                onChange={handleChange}
              />
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
        onClose={() =>
          setDeleteDialog({
            open: false,
            machine: null,
          })
        }
      >
        <DialogTitle>Delete Machine</DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure want to delete{" "}
            <strong>{deleteDialog.machine?.machine_name}</strong>?
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setDeleteDialog({
                open: false,
                machine: null,
              })
            }
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
        onClose={() =>
          setSnackbar((prev) => ({
            ...prev,
            open: false,
          }))
        }
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default MachineConfig;
