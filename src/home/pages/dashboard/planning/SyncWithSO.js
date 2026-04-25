import React, { useState, useMemo, useCallback } from "react";
import Box from "@mui/material/Box";
import { IconButton, Tooltip, Typography } from "@mui/material";
import SyncIcon from "@mui/icons-material/Sync";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { SalesOrderAll } from "../../../../API/Salesorder";
import server from "../../../../server/server";

// Helpers
const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value?.$date || value);
  if (isNaN(date)) return "—";
  const [y, m, d] = date.toISOString().split("T")[0].split("-");
  return `${d}/${m}/${y}`;
};

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  const h = date.getHours();
  const min = String(date.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const fh = h % 12 || 12;
  return `${d}-${m}-${y}  ${fh}:${min} ${ampm}`;
};

// Sub-components

const StatusChip = ({ status }) => {
  const isActive = status === 1;
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        px: "9px",
        py: "3px",
        borderRadius: "20px",
        fontSize: "14px",
        fontWeight: 500,
        letterSpacing: "0.2px",
        background: isActive ? "#EAF3DE" : "#FCEBEB",
        color: isActive ? "#27500A" : "#501313",
      }}
    >
      <Box
        sx={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: isActive ? "#639922" : "#E24B4A",
          flexShrink: 0,
        }}
      />
      {isActive ? "Active" : "Cancelled"}
    </Box>
  );
};

const StatCard = ({ label, value, sub, highlight }) => (
  <Box
    sx={{
      background: highlight ? "#EAF3DE" : "white",
      border: `0.5px solid ${highlight ? "#C0DD97" : "#e5e7eb"}`,
      borderRadius: "12px",
      p: "14px 16px",
      flex: 1,
    }}
  >
    <Typography
      sx={{
        fontSize: "14px",
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        color: highlight ? "#3B6D11" : "#6b7280",
        mb: "6px",
      }}
    >
      {label}
    </Typography>
    <Typography
      sx={{
        fontSize: "22px",
        fontWeight: 600,
        letterSpacing: "-0.5px",
        fontFamily: "'DM Mono', monospace",
        color: highlight ? "#27500A" : "#111827",
      }}
    >
      {value}
    </Typography>
    <Typography
      sx={{
        fontSize: "14px",
        color: highlight ? "#3B6D11" : "#9ca3af",
        mt: "2px",
      }}
    >
      {sub}
    </Typography>
  </Box>
);

const FilterPill = ({ label, active, onClick }) => (
  <Box
    component="button"
    onClick={onClick}
    sx={{
      fontSize: "14px",
      fontWeight: 500,
      px: "12px",
      py: "5px",
      borderRadius: "20px",
      border: "0.5px solid",
      borderColor: active ? "#111827" : "#d1d5db",
      background: active ? "#111827" : "white",
      color: active ? "white" : "#6b7280",
      cursor: "pointer",
      transition: "all 0.1s ease",
      fontFamily: "inherit",
      "&:hover": {
        background: active ? "#111827" : "#f9fafb",
      },
    }}
  >
    {label}
  </Box>
);

// Main Component
function SyncWithSO() {
  const {
    salesOrders = [],
    sync,
    lastSync,
    syncProgress,
    isSyncing,
    refetch,
  } = SalesOrderAll();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const handleDeleteSO = useCallback(
    async (id) => {
      try {
        await server.put(`/salesorder/${id}`, { status: 0 });
        refetch();
      } catch (error) {
        console.error("Error cancelling SO", error);
      }
    },
    [refetch],
  );

  // Derived stats
  const stats = useMemo(() => {
    const active = salesOrders.filter((r) => r.status !== 0).length;
    const cancelled = salesOrders.filter((r) => r.status === 0).length;
    const totalQty = salesOrders.reduce(
      (s, r) => s + (Number(r.item_quantity) || 0),
      0,
    );
    return { total: salesOrders.length, active, cancelled, totalQty };
  }, [salesOrders]);

  // Filtered rows
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return salesOrders.filter((r) => {
      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && r.status !== 0) ||
        (filterStatus === "cancel" && r.status === 0);
      const matchQ =
        !q ||
        String(r.saleorder_no ?? "")
          .toLowerCase()
          .includes(q) ||
        String(r.customer_name ?? "")
          .toLowerCase()
          .includes(q);
      return matchStatus && matchQ;
    });
  }, [salesOrders, search, filterStatus]);

  // Column definitions
  const columns = [
    { label: "SO No", key: "saleorder_no", width: "110px" },
    { label: "Date", key: "posting_date", width: "90px" },
    { label: "Customer", key: "customer_name", width: "220px" },
    { label: "Size / Description", key: "item_description", width: "200px" },
    { label: "Qty", key: "item_quantity", width: "70px" },
    { label: "Start Date", key: "posting_date_start", width: "90px" },
    { label: "End Date", key: "due_date", width: "90px" },
    { label: "Status", key: "status", width: "100px" },
    { label: "Actions", key: "actions", width: "80px" },
  ];

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        .so-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        .so-table-row:hover td { background: #f9fafb !important; }
      `}</style>

      <Box
        className="so-root"
        sx={{ background: "#f3f4f6", minHeight: "100vh", pb: 4 }}
      >
        {/*  Header */}
        <Box
          sx={{
            background: "white",
            borderBottom: "0.5px solid #e5e7eb",
            px: "28px",
            py: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: "20px",
                fontWeight: 600,
                color: "#111827",
                letterSpacing: "-0.3px",
              }}
            >
              Sales Orders
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: "16px",
                mt: "6px",
                alignItems: "center",
              }}
            >
              {lastSync && (
                <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
                  Last sync: {formatDateTime(lastSync)}
                </Typography>
              )}
              <Box
                sx={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "#d1d5db",
                }}
              />
              <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
                {salesOrders.length} records
              </Typography>
            </Box>
          </Box>

          <Box
            component="button"
            onClick={sync}
            disabled={isSyncing}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              px: "18px",
              py: "9px",
              borderRadius: "8px",
              border: "0.5px solid #d1d5db",
              background: "white",
              color: "#374151",
              fontSize: "14px",
              fontWeight: 500,
              cursor: isSyncing ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              opacity: isSyncing ? 0.7 : 1,
              transition: "all 0.15s ease",
              "&:hover": { background: "#f9fafb", borderColor: "#9ca3af" },
            }}
          >
            <SyncIcon
              sx={{
                fontSize: 16,
                animation: isSyncing ? "spin 1s linear infinite" : "none",
                "@keyframes spin": {
                  from: { transform: "rotate(0deg)" },
                  to: { transform: "rotate(360deg)" },
                },
              }}
            />
            {isSyncing ? `Syncing… ${syncProgress}%` : "Sync with SO"}
          </Box>
        </Box>

        {/* Stats Row */}
        <Box sx={{ display: "flex", gap: "12px", px: "28px", pt: "20px" }}>
          <StatCard
            label="Total Orders"
            value={stats.total}
            sub="All time records"
          />
          <StatCard
            label="Active"
            value={stats.active}
            sub="In progress"
            highlight
          />
          <StatCard
            label="Cancelled"
            value={stats.cancelled}
            sub="Soft deleted"
          />
          <StatCard
            label="Total Qty"
            value={stats.totalQty.toLocaleString()}
            sub="Units ordered"
          />
        </Box>

        {/* Table Section */}
        <Box sx={{ px: "28px", pt: "20px" }}>
          {/* Toolbar */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: "12px",
            }}
          >
            {/* Search */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "white",
                border: "0.5px solid #e5e7eb",
                borderRadius: "8px",
                px: "12px",
                py: "7px",
                width: 240,
              }}
            >
              <SearchIcon sx={{ fontSize: 24, color: "#9ca3af" }} />
              <Box
                component="input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders…"
                sx={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "14px",
                  color: "#111827",
                  fontFamily: "inherit",
                  width: "100%",
                  "::placeholder": { color: "#9ca3af" },
                }}
              />
            </Box>

            {/* Filter pills */}
            <Box sx={{ display: "flex", gap: "6px" }}>
              <FilterPill
                label="All"
                active={filterStatus === "all"}
                onClick={() => setFilterStatus("all")}
              />
              <FilterPill
                label="Active"
                active={filterStatus === "active"}
                onClick={() => setFilterStatus("active")}
              />
              <FilterPill
                label="Cancelled"
                active={filterStatus === "cancel"}
                onClick={() => setFilterStatus("cancel")}
              />
            </Box>
          </Box>

          {/* Table */}
          <Box
            sx={{
              background: "white",
              border: "0.5px solid #e5e7eb",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <Box
              component="table"
              sx={{ width: "100%", borderCollapse: "collapse" }}
            >
              <Box component="thead">
                <Box
                  component="tr"
                  sx={{
                    background: "#f9fafb",
                    borderBottom: "0.5px solid #e5e7eb",
                  }}
                >
                  {columns.map((col) => (
                    <Box
                      component="th"
                      key={col.key}
                      sx={{
                        px: "14px",
                        py: "10px",
                        textAlign: "left",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        whiteSpace: "nowrap",
                        width: col.width,
                      }}
                    >
                      {col.label}
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box component="tbody">
                {filtered.length === 0 ? (
                  <Box component="tr">
                    <Box
                      component="td"
                      colSpan={columns.length}
                      sx={{
                        py: 5,
                        textAlign: "center",
                        color: "#9ca3af",
                        fontSize: "14px",
                      }}
                    >
                      No records found
                    </Box>
                  </Box>
                ) : (
                  filtered.map((row, idx) => {
                    const isActive = row.status !== 0;

                    return (
                      <Box
                        component="tr"
                        key={row.unique_id || idx}
                        className="so-table-row"
                        sx={{
                          borderBottom:
                            idx < filtered.length - 1
                              ? "0.5px solid #f3f4f6"
                              : "none",
                          transition: "background 0.1s",
                        }}
                      >
                        {/* SO No */}
                        <Box
                          component="td"
                          sx={{
                            px: "14px",
                            py: "11px",
                            verticalAlign: "middle",
                          }}
                        >
                          <Typography
                            sx={{
                              fontFamily: "'DM Mono', monospace",
                              fontSize: "14px",
                              fontWeight: 500,
                              color: "#185FA5",
                            }}
                          >
                            {row.saleorder_no || "—"}
                          </Typography>
                        </Box>

                        {/* Date */}
                        <Box
                          component="td"
                          sx={{
                            px: "14px",
                            py: "11px",
                            verticalAlign: "middle",
                          }}
                        >
                          <Typography
                            sx={{
                              fontFamily: "'DM Mono', monospace",
                              fontSize: "14px",
                              color: "#6b7280",
                            }}
                          >
                            {formatDate(row.posting_date)}
                          </Typography>
                        </Box>

                        {/* Customer */}
                        <Box
                          component="td"
                          sx={{
                            px: "14px",
                            py: "11px",
                            verticalAlign: "middle",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "14px",
                              color: "#111827",
                              fontWeight: 500,
                            }}
                          >
                            {row.customer_name || "—"}
                          </Typography>
                        </Box>

                        {/* Size / Description */}
                        <Box
                          component="td"
                          sx={{
                            px: "14px",
                            py: "11px",
                            verticalAlign: "middle",
                          }}
                        >
                          <Tooltip
                            title={row.item_description || "—"}
                            arrow
                            placement="top"
                          >
                            <Typography
                              sx={{
                                fontSize: "14px",
                                color: "#6b7280",
                                maxWidth: 200,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                cursor: "pointer",
                              }}
                            >
                              {row.item_description || "—"}
                            </Typography>
                          </Tooltip>
                        </Box>

                        {/* Qty */}
                        <Box
                          component="td"
                          sx={{
                            px: "14px",
                            py: "11px",
                            verticalAlign: "middle",
                          }}
                        >
                          <Typography
                            sx={{
                              fontFamily: "'DM Mono', monospace",
                              fontSize: "14px",
                              fontWeight: 500,
                              color: "#111827",
                            }}
                          >
                            {Number(row.item_quantity || 0).toLocaleString()}
                          </Typography>
                        </Box>

                        {/* Start Date */}
                        <Box
                          component="td"
                          sx={{
                            px: "14px",
                            py: "11px",
                            verticalAlign: "middle",
                          }}
                        >
                          <Typography
                            sx={{
                              fontFamily: "'DM Mono', monospace",
                              fontSize: "14px",
                              color: "#6b7280",
                            }}
                          >
                            {formatDate(row.posting_date)}
                          </Typography>
                        </Box>

                        {/* End Date */}
                        <Box
                          component="td"
                          sx={{
                            px: "14px",
                            py: "11px",
                            verticalAlign: "middle",
                          }}
                        >
                          <Typography
                            sx={{
                              fontFamily: "'DM Mono', monospace",
                              fontSize: "14px",
                              color: "#6b7280",
                            }}
                          >
                            {formatDate(row.due_date)}
                          </Typography>
                        </Box>

                        {/* Status */}
                        <Box
                          component="td"
                          sx={{
                            px: "14px",
                            py: "11px",
                            verticalAlign: "middle",
                          }}
                        >
                          <StatusChip status={row.status} />
                        </Box>

                        {/* Actions */}
                        <Box
                          component="td"
                          sx={{
                            px: "14px",
                            py: "11px",
                            verticalAlign: "middle",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: "2px",
                            }}
                          >
                            <IconButton
                              size="small"
                              title="Edit SO"
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: "8px",
                                color: "#6b7280",
                                "&:hover": {
                                  color: "#185FA5",
                                  background: "#E6F1FB",
                                },
                              }}
                            >
                              <EditIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                            <IconButton
                              size="small"
                              title="Cancel SO"
                              disabled={!isActive}
                              onClick={() => handleDeleteSO(row.unique_id)}
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: "8px",
                                color: "#6b7280",
                                "&:hover": {
                                  color: "#A32D2D",
                                  background: "#FCEBEB",
                                },
                                "&.Mui-disabled": { opacity: 0.3 },
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })
                )}
              </Box>
            </Box>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: "12px",
            }}
          >
            <Typography sx={{ fontSize: "12px", color: "#9ca3af" }}>
              Showing {filtered.length} of {salesOrders.length} records
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default SyncWithSO;
