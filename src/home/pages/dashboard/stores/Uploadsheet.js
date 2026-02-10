import React, { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import "../../../pages/pagestyle.scss";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import { MaterialReactTable } from "material-react-table";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import sampleFile from "./sample.xlsx";
import { Grid, FormGroup, Typography, Button, Tooltip } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import server from "../../../../server/server";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

function Uploadsheet() {
  const [uploadedData, setUploadedData] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    try {
      const res = await server.get("/store/data");
      setExcelData(res.data.data);
    } catch (error) {
      alert("Error loading data");
    }
  };

  const REQUIRED_COLUMNS = {
    "Doc No": "doc_no",
    "Doc Date": "doc_date",
    Size: "size",
    Location: "location",
    Quantity: "quantity",
    Price: "price",
    "Total Value": "total_value",
  };

  const validateAndTransformExcelData = (data) => {
    if (!data.length) {
      throw new Error("Excel file is empty");
    }

    const excelKeys = Object.keys(data[0]);
    const expectedKeys = Object.keys(REQUIRED_COLUMNS);

    const extraKeys = excelKeys.filter((key) => !expectedKeys.includes(key));

    if (extraKeys.length > 0) {
      throw new Error(`Invalid columns found: ${extraKeys.join(", ")}`);
    }

    const missingKeys = expectedKeys.filter((key) => !excelKeys.includes(key));

    if (missingKeys.length > 0) {
      throw new Error(`Missing required columns: ${missingKeys.join(", ")}`);
    }

    return data.map((row, rowIndex) => {
      const transformedRow = {};

      for (const excelKey of expectedKeys) {
        const value = row[excelKey];

        if (value === undefined || value === null || value === "") {
          throw new Error(
            `Empty value found in row ${rowIndex + 1}, column "${excelKey}"`,
          );
        }

        const normalizedKey = REQUIRED_COLUMNS[excelKey];

        transformedRow[normalizedKey] =
          excelKey === "Doc Date" ? excelDateToJSDate(value) : value;
      }

      return transformedRow;
    });
  };

  const handleExcelUpload = (file) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const bufferArray = e.target.result;
        const workbook = XLSX.read(bufferArray, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(sheet);

        const validatedData = validateAndTransformExcelData(rawData);

        setUploadedData(validatedData);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        alert(error.message);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const excelDateToJSDate = (value) => {
    let date;

    if (typeof value === "number") {
      date = new Date((value - 25569) * 86400 * 1000);
    } else {
      date = new Date(value);
    }

    if (isNaN(date.getTime())) return null;

    return date;
  };

  const downloadSample = () => {
    console.log("downloadSample");
    const link = document.createElement("a");
    link.href = sampleFile;
    link.download = "sample.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Excel Sheet
  const exportToExcel = () => {
    if (!excelData.length) {
      alert("No data to export");
      return;
    }

    const tableColumns = columns.map((col) => ({
      header: col.header,
      key: col.accessorKey,
    }));

    const tableData = excelData.map((row) => {
      const obj = {};
      tableColumns.forEach((col) => {
        let value = row[col.key];

        if (col.key === "doc_date" && value) {
          value = new Date(value)
            .toLocaleDateString("en-GB")
            .replaceAll("/", "-");
        }

        obj[col.header] = value ?? "";
      });
      return obj;
    });

    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Table Data");

    const today = new Date().toLocaleDateString("en-GB").replaceAll("/", "-");

    XLSX.writeFile(workbook, `Store-Data-${today}.xlsx`);
  };

  // Handle Save Upload Files To DB
  const handleSaveDB = async () => {
    if (!uploadedData.length) {
      alert("Please upload excel first");
      return;
    }

    try {
      const res = await server.post("/store/save", {
        rows: uploadedData,
      });

      alert(res.data.message);

      fetchStoreData();
      setUploadedData([]);
    } catch (error) {
      alert(error.response?.data?.message || "Error");
    }
  };

  const formatDate = (value) => {
    if (!value) return "";
    const dateString = value?.$date || value;
    const [y, m, d] = new Date(dateString)
      .toISOString()
      .split("T")[0]
      .split("-");

    return `${d}/${m}/${y}`;
  };

  const columns = useMemo(
    () => [
      {
        id: 1,
        accessorKey: "doc_no",
        header: "Doc No",
        size: 30,
      },
      {
        id: 2,
        accessorKey: "doc_date",
        header: "Doc Date",
        size: 30,
        Cell: ({ cell }) => formatDate(cell.getValue()),
      },

      {
        id: 3,
        accessorKey: "size",
        header: "Size",
        size: 30,
      },
      {
        id: 4,
        accessorKey: "location",
        header: "Location",
        size: 30,
      },
      {
        id: 5,
        accessorKey: "quantity",
        header: "Quantity",
        size: 30,
      },
      {
        id: 6,
        accessorKey: "price",
        header: "Price",
        size: 30,
      },
      {
        id: 7,
        accessorKey: "total_value",
        header: "Total Value",
        size: 30,
      },
    ],
    [],
  );

  return (
    <Box className="Dashboard-con">
      <Box className="breadcrump-con">
        <Box className="main-title">
          <div>Sheet Store</div>
        </Box>
      </Box>

      <Box className="page-layout">
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2.5} alignItems={"end"}>
            <Grid
              size={{
                xl: 2,
                lg: 3,
                md: 3,
                sm: 3,
              }}
            >
              <FormGroup>
                <Typography mb={1}>Upload Excel</Typography>
                <Button
                  component="label"
                  role={undefined}
                  variant="contained"
                  tabIndex={-1}
                  startIcon={<CloudUploadIcon />}
                >
                  Upload files
                  <VisuallyHiddenInput
                    ref={fileInputRef}
                    type="file"
                    accept=".xls,.xlsx"
                    onChange={(e) => handleExcelUpload(e.target.files[0])}
                  />
                </Button>
              </FormGroup>
            </Grid>

            <Grid size={3}>
              <Button variant="contained" size="medium" onClick={handleSaveDB}>
                Save
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 2 }}>
          <MaterialReactTable
            columns={columns}
            data={excelData || []}
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
            renderTopToolbarCustomActions={() => (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  marginLeft: "auto",
                  gap: 2,
                  marginTop: "3px",
                  marginRight: "5px",
                }}
              >
                <Tooltip title="Download Sample">
                  <Button
                    class="gray-md-btn"
                    onClick={downloadSample}
                    startIcon={<NoteAddIcon />}
                  >
                    Download Sample
                  </Button>
                </Tooltip>

                <Tooltip title="Export Excel">
                  <Button
                    class="gray-md-btn"
                    onClick={exportToExcel}
                    startIcon={<NoteAddIcon />}
                  >
                    Export Excel
                  </Button>
                </Tooltip>
              </Box>
            )}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default Uploadsheet;
