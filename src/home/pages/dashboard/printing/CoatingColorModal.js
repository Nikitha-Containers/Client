import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  FormControlLabel,
  IconButton,
  TextField,
  Typography,
  Select,
  MenuItem,
  Checkbox,
  Button,
  Box,
  Stack,
  FormControl,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";

// Coating Type
export const CoatingTypeModal = ({ open, onClose, onSubmit, value }) => {
  // Initial Values
  const coatingInitialVal = {
    insideColor: {},
    outsideColor: {},
  };

  // Static Data
  const getCoatingType = {
    insideColor: ["Gold Lacquer", "Clear Lacquer", "Other"],
    outsideColor: [
      "Gold Lacquer",
      "Clear Lacquer",
      "Vinyl Sizing",
      "Bombay White",
      "Mixing White",
      "Untoned White",
      "Other",
    ],
  };

  const [getCoatingValues, setCoatingValues] = useState(coatingInitialVal);

  useEffect(() => {
    if (open) {
      setCoatingValues({
        insideColor: value?.insideColor || {},
        outsideColor: value?.outsideColor || {},
      });
    }
  }, [open, value]);

  const handleCheckbox = (section, item, checked) => {
    setCoatingValues((prev) => {
      const updated = { ...(prev[section] || {}) };

      if (checked) {
        if (item === "Other") {
          updated[item] = { name: "", count: 1 };
        } else {
          updated[item] = 1;
        }
      } else {
        delete updated[item];
      }

      return {
        ...prev,
        [section]: updated,
      };
    });
  };

  const handleOtherNameChange = (section, value) => {
    setCoatingValues((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        Other: {
          ...prev[section].Other,
          name: value,
        },
      },
    }));
  };

  const handleOtherCountChange = (section, value) => {
    setCoatingValues((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        Other: {
          ...prev[section].Other,
          count: Number(value),
        },
      },
    }));
  };

  const handleCountChange = (section, item, value) => {
    setCoatingValues((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [item]: Number(value),
      },
    }));
  };

  // Handle Submit
  const handleSubmit = () => {
    if (
      Object.keys(getCoatingValues.outsideColor).length === 0 &&
      Object.keys(getCoatingValues.insideColor).length === 0
    ) {
      toast.error("Please select at least one coating option");
      return;
    }

    onSubmit(getCoatingValues);
  };

  // Handle Cancel
  const handleCancel = () => {
    setCoatingValues(coatingInitialVal);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: "16px" } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" fontWeight="bold" color="#0a85cb">
          Coating Type
        </Typography>

        <IconButton onClick={handleCancel}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={1}>
          {/* Inside Color */}
          <Typography variant="subtitle1">Inside :</Typography>

          <Box pl={1}>
            <Grid container spacing={2}>
              {getCoatingType.insideColor.map((item) => {
                const checked = !!getCoatingValues.insideColor[item];

                return (
                  <Grid item xs={6} key={item}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Checkbox
                        color="success"
                        checked={checked}
                        onChange={(e) =>
                          handleCheckbox("insideColor", item, e.target.checked)
                        }
                      />

                      <Typography sx={{ minWidth: 120 }}>{item}</Typography>

                      {checked && item !== "Other" && (
                        <TextField
                          type="number"
                          inputProps={{ min: 1 }}
                          size="small"
                          sx={{ width: 70 }}
                          value={getCoatingValues.insideColor[item]}
                          onChange={(e) =>
                            handleCountChange(
                              "insideColor",
                              item,
                              e.target.value,
                            )
                          }
                        />
                      )}

                      {checked && item === "Other" && (
                        <>
                          <TextField
                            size="small"
                            placeholder="Type"
                            sx={{ width: 120 }}
                            value={
                              getCoatingValues.insideColor.Other?.name || ""
                            }
                            onChange={(e) =>
                              handleOtherNameChange(
                                "insideColor",
                                e.target.value,
                              )
                            }
                          />

                          <TextField
                            type="number"
                            inputProps={{ min: 1 }}
                            size="small"
                            sx={{ width: 70 }}
                            value={
                              getCoatingValues.insideColor.Other?.count || ""
                            }
                            onChange={(e) =>
                              handleOtherCountChange(
                                "insideColor",
                                e.target.value,
                              )
                            }
                          />
                        </>
                      )}
                    </Stack>
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          {/* Outside Color */}

          <Typography variant="subtitle1">Outside :</Typography>

          <Box pl={1}>
            <Grid container spacing={2}>
              {getCoatingType.outsideColor.map((item) => {
                const checked = !!getCoatingValues.outsideColor[item];

                return (
                  <Grid item xs={6} key={item}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Checkbox
                        color="success"
                        checked={checked}
                        onChange={(e) =>
                          handleCheckbox("outsideColor", item, e.target.checked)
                        }
                      />

                      <Typography sx={{ minWidth: 120 }}>{item}</Typography>

                      {checked && item !== "Other" && (
                        <TextField
                          type="number"
                          inputProps={{ min: 1 }}
                          size="small"
                          sx={{ width: 70 }}
                          value={getCoatingValues.outsideColor[item]}
                          onChange={(e) =>
                            handleCountChange(
                              "outsideColor",
                              item,
                              e.target.value,
                            )
                          }
                        />
                      )}

                      {checked && item === "Other" && (
                        <>
                          <TextField
                            size="small"
                            placeholder="Type"
                            sx={{ width: 120 }}
                            value={
                              getCoatingValues.outsideColor.Other?.name || ""
                            }
                            onChange={(e) =>
                              handleOtherNameChange(
                                "outsideColor",
                                e.target.value,
                              )
                            }
                          />

                          <TextField
                            type="number"
                            inputProps={{ min: 1 }}
                            size="small"
                            sx={{ width: 70 }}
                            value={
                              getCoatingValues.outsideColor.Other?.count || ""
                            }
                            onChange={(e) =>
                              handleOtherCountChange(
                                "outsideColor",
                                e.target.value,
                              )
                            }
                          />
                        </>
                      )}
                    </Stack>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Stack>
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
          color="error"
          onClick={handleCancel}
          sx={{ borderRadius: "8px" }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleSubmit}
          sx={{ borderRadius: "8px" }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Printing Type
export const PrintingColorModal = ({ open, onClose, onSubmit, value }) => {
  // Initial Values
  const printingInitVal = {
    normalColor: {},
    splColor: {},
  };

  // Static Data
  const getPrintColors = {
    normalColor: ["TP White", "Cyan", "Magenta", "Yellow", "Black", "Other"],
    splColor: ["SP 1", "SP 2", "SP 3", "SP 4", "SP 5", "SP 6", "Other"],
  };

  const [getPrintingValues, setPrintingValues] = useState(printingInitVal);

  useEffect(() => {
    if (open) {
      setPrintingValues({
        normalColor: value?.normalColor || {},
        splColor: value?.splColor || {},
      });
    }
  }, [open, value]);

  const handleCheckbox = (section, item, checked) => {
    setPrintingValues((prev) => {
      const updated = { ...(prev[section] || {}) };

      if (checked) {
        if (item === "Other") {
          updated[item] = { name: "", count: 1 };
        } else {
          updated[item] = 1;
        }
      } else {
        delete updated[item];
      }

      return {
        ...prev,
        [section]: updated,
      };
    });
  };

  const handleCountChange = (section, item, value) => {
    setPrintingValues((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [item]: Number(value),
      },
    }));
  };

  const handleOtherNameChange = (section, value) => {
    setPrintingValues((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        Other: {
          ...prev[section].Other,
          name: value,
        },
      },
    }));
  };

  const handleOtherCountChange = (section, value) => {
    setPrintingValues((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        Other: {
          ...prev[section].Other,
          count: Number(value),
        },
      },
    }));
  };

  const handleSubmit = () => {
    if (
      Object.keys(getPrintingValues.normalColor).length === 0 &&
      Object.keys(getPrintingValues.splColor).length === 0
    ) {
      toast.error("Please select at least one printing color");
      return;
    }

    onSubmit(getPrintingValues);
  };

  const handleCancel = () => {
    setPrintingValues(printingInitVal);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: "16px" } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" fontWeight="bold" color="#0a85cb">
          Printing Color
        </Typography>

        <IconButton onClick={handleCancel}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={1}>
          {/* Normal Colors */}

          <Typography variant="subtitle1">Normal Colors :</Typography>

          <Grid container spacing={2}>
            {getPrintColors.normalColor.map((item) => {
              const checked = !!getPrintingValues.normalColor[item];

              return (
                <Grid item xs={6} key={item}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Checkbox
                      color="success"
                      checked={checked}
                      onChange={(e) =>
                        handleCheckbox("normalColor", item, e.target.checked)
                      }
                    />

                    <Typography sx={{ minWidth: 120 }}>{item}</Typography>

                    {checked && item !== "Other" && (
                      <TextField
                        type="number"
                        inputProps={{ min: 1 }}
                        size="small"
                        sx={{ width: 70 }}
                        value={getPrintingValues.normalColor[item]}
                        onChange={(e) =>
                          handleCountChange("normalColor", item, e.target.value)
                        }
                      />
                    )}

                    {checked && item === "Other" && (
                      <>
                        <TextField
                          size="small"
                          placeholder="Type"
                          sx={{ width: 120 }}
                          value={
                            getPrintingValues.normalColor.Other?.name || ""
                          }
                          onChange={(e) =>
                            handleOtherNameChange("normalColor", e.target.value)
                          }
                        />

                        <TextField
                          type="number"
                          inputProps={{ min: 1 }}
                          size="small"
                          sx={{ width: 70 }}
                          value={
                            getPrintingValues.normalColor.Other?.count || ""
                          }
                          onChange={(e) =>
                            handleOtherCountChange(
                              "normalColor",
                              e.target.value,
                            )
                          }
                        />
                      </>
                    )}
                  </Stack>
                </Grid>
              );
            })}
          </Grid>

          {/* Special Colors */}

          <Typography variant="subtitle1">Special Colors :</Typography>

          <Grid container spacing={2}>
            {getPrintColors.splColor.map((item) => {
              const checked = !!getPrintingValues.splColor[item];

              return (
                <Grid item xs={6} key={item}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Checkbox
                      color="success"
                      checked={checked}
                      onChange={(e) =>
                        handleCheckbox("splColor", item, e.target.checked)
                      }
                    />

                    <Typography sx={{ minWidth: 120 }}>{item}</Typography>

                    {checked && item !== "Other" && (
                      <TextField
                        type="number"
                        inputProps={{ min: 1 }}
                        size="small"
                        sx={{ width: 70 }}
                        value={getPrintingValues.splColor[item]}
                        onChange={(e) =>
                          handleCountChange("splColor", item, e.target.value)
                        }
                      />
                    )}

                    {checked && item === "Other" && (
                      <>
                        <TextField
                          size="small"
                          placeholder="Type"
                          sx={{ width: 120 }}
                          value={getPrintingValues.splColor.Other?.name || ""}
                          onChange={(e) =>
                            handleOtherNameChange("splColor", e.target.value)
                          }
                        />

                        <TextField
                          type="number"
                          inputProps={{ min: 1 }}
                          size="small"
                          sx={{ width: 70 }}
                          value={getPrintingValues.splColor.Other?.count || ""}
                          onChange={(e) =>
                            handleOtherCountChange("splColor", e.target.value)
                          }
                        />
                      </>
                    )}
                  </Stack>
                </Grid>
              );
            })}
          </Grid>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          padding: "10px 18px 10px 10px",
          justifyContent: "end",
          columnGap: "15px",
        }}
      >
        <Button variant="outlined" color="error" onClick={handleCancel}>
          Cancel
        </Button>

        <Button variant="contained" color="success" onClick={handleSubmit}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Varnish
export const VarnishModal = ({ open, onClose, onSubmit, value }) => {
  // Initial Values
  const varnishInitVal = {
    varnish: {},
  };

  // Static Data
  const getVarnishType = {
    varnish: ["Glossy Finish", "Matte Finish", "Other"],
  };

  const [getVarnishValues, setVarnishValues] = useState(varnishInitVal);

  useEffect(() => {
    if (open) {
      setVarnishValues({
        varnish: value?.varnish || {},
      });
    }
  }, [open, value]);

  const handleCheckbox = (item, checked) => {
    setVarnishValues((prev) => {
      const updated = { ...(prev.varnish || {}) };

      if (checked) {
        if (item === "Other") {
          updated[item] = { name: "", count: 1 };
        } else {
          updated[item] = 1;
        }
      } else {
        delete updated[item];
      }

      return {
        ...prev,
        varnish: updated,
      };
    });
  };

  const handleCountChange = (item, value) => {
    setVarnishValues((prev) => ({
      ...prev,
      varnish: {
        ...prev.varnish,
        [item]: Number(value),
      },
    }));
  };

  const handleOtherNameChange = (value) => {
    setVarnishValues((prev) => ({
      ...prev,
      varnish: {
        ...prev.varnish,
        Other: {
          ...prev.varnish.Other,
          name: value,
        },
      },
    }));
  };

  const handleOtherCountChange = (value) => {
    setVarnishValues((prev) => ({
      ...prev,
      varnish: {
        ...prev.varnish,
        Other: {
          ...prev.varnish.Other,
          count: Number(value),
        },
      },
    }));
  };

  const handleSubmit = () => {
    if (Object.keys(getVarnishValues.varnish).length === 0) {
      toast.error("Please select at least one varnish option");
      return;
    }

    onSubmit(getVarnishValues);
  };

  const handleCancel = () => {
    setVarnishValues(varnishInitVal);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: "16px" } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" fontWeight="bold" color="#0a85cb">
          Varnish Type
        </Typography>

        <IconButton onClick={handleCancel}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={1}>
          <Typography variant="subtitle1">Varnish :</Typography>

          <Box pl={1}>
            <Grid container spacing={2}>
              {getVarnishType.varnish.map((item) => {
                const checked = !!getVarnishValues.varnish[item];

                return (
                  <Grid item xs={6} key={item}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Checkbox
                        color="success"
                        checked={checked}
                        onChange={(e) => handleCheckbox(item, e.target.checked)}
                      />

                      <Typography sx={{ minWidth: 120 }}>{item}</Typography>

                      {checked && item !== "Other" && (
                        <TextField
                          type="number"
                          inputProps={{ min: 1 }}
                          size="small"
                          sx={{ width: 70 }}
                          value={getVarnishValues.varnish[item]}
                          onChange={(e) =>
                            handleCountChange(item, e.target.value)
                          }
                        />
                      )}

                      {checked && item === "Other" && (
                        <>
                          <TextField
                            size="small"
                            placeholder="Type"
                            sx={{ width: 120 }}
                            value={getVarnishValues.varnish.Other?.name || ""}
                            onChange={(e) =>
                              handleOtherNameChange(e.target.value)
                            }
                          />

                          <TextField
                            type="number"
                            inputProps={{ min: 1 }}
                            size="small"
                            sx={{ width: 70 }}
                            value={getVarnishValues.varnish.Other?.count || ""}
                            onChange={(e) =>
                              handleOtherCountChange(e.target.value)
                            }
                          />
                        </>
                      )}
                    </Stack>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          padding: "10px 18px 10px 10px",
          justifyContent: "end",
          columnGap: "15px",
        }}
      >
        <Button variant="outlined" color="error" onClick={handleCancel}>
          Cancel
        </Button>

        <Button variant="contained" color="success" onClick={handleSubmit}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
