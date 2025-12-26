import React, { useMemo, useState } from "react";
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
  const [excelData, setExcelData] = useState([]);

  const REQUIRED_COLUMNS = {
    "DC.No": "dcNo",
    "Dc Date": "dcDate",
    Size: "size",
    Location: "location",
    Quantity: "quantity",
    Price: "price",
    "Total Value": "totalValue",
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
            `Empty value found in row ${rowIndex + 1}, column "${excelKey}"`
          );
        }

        const normalizedKey = REQUIRED_COLUMNS[excelKey];

        transformedRow[normalizedKey] =
          excelKey === "Dc Date" ? excelDateToJSDate(value) : value;
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
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const rawData = XLSX.utils.sheet_to_json(sheet);

        const validatedData = validateAndTransformExcelData(rawData);

        console.log("Validated Excel Data:", validatedData);
        setExcelData(validatedData);
      } catch (error) {
        console.error("Excel Validation Error:", error.message);
        alert(error.message);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const excelDateToJSDate = (serial) => {
    const excelEpoch = new Date(1899, 11, 30);
    return new Date(excelEpoch.getTime() + serial * 86400000);
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

  const columns = useMemo(
    () => [
      {
        id: 1,
        accessorKey: "saleorder_no",
        header: "SO No",
        size: 30,
      },
      {
        id: 2,
        accessorKey: "posting_date",
        header: "SO Date",
        size: 30,
      },
      {
        id: 3,
        accessorKey: "customer_name",
        header: "Customer Name",
        size: 30,
      },
    ],
    []
  );

  return (
    <Box className="Dashboard-con">
      <Box className="breadcrump-con">
        <Box className="main-title">
          <div className="main-inner-txts">
            <Link
              style={{ color: "#0a85cb", textDecoration: "none" }}
              to={"/Stores_dashboard"}
            >
              Stores
            </Link>
            <KeyboardArrowRightIcon sx={{ color: "#0a85cb" }} />
            <div>Upload Sheets</div>
          </div>
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
                    type="file"
                    accept=".xls,.xlsx"
                    onChange={(e) => handleExcelUpload(e.target.files[0])}
                  />
                </Button>
              </FormGroup>
            </Grid>

            <Grid size={3}>
              <Button variant="contained" size="medium">
                Save
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 2 }}>
          <MaterialReactTable
            columns={columns}
            data={[]}
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
                    onClick={downloadSample}
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
