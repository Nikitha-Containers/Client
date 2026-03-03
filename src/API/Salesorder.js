import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSO, setSOError, setSOLoading } from "../slices/SO_Slice";
import server from "../server/server";
import { toast } from "react-toastify";

export const SalesOrder = () => {
  const dispatch = useDispatch();
  const { getSO, error, loading } = useSelector((state) => state.SO_Info);

  const [lastSync, setLastSync] = useState(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchSO = async () => {
    try {
      dispatch(setSOLoading());
      const response = await server.get("/salesorder");
      const data = response?.data?.data;
      dispatch(setSO(data));

      if (data && data.length > 0) {
        const latestRecord = data.reduce((a, b) =>
          new Date(a.updatedAt) > new Date(b.updatedAt) ? a : b,
        );

        setLastSync(latestRecord.updatedAt);
      }
    } catch (error) {
      dispatch(setSOError(error.message));
    }
  };

  const sapSync = async () => {
    try {
      setIsSyncing(true);
      setSyncProgress(0);

      const interval = setInterval(() => {
        setSyncProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 300);

      const response = await server.post("/sap/sapSync");

      clearInterval(interval);

      if (response.data.success) {
        setSyncProgress(100);
        toast.success(
          `Data was successfully synced :${response.data.TotalRec}`,
        );
      }
      await fetchSO();

      setTimeout(() => {
        setIsSyncing(false);
        setSyncProgress(0);
      }, 800);
    } catch (error) {
      dispatch(setSOError(error.message));
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchSO();
  }, []);

  return {
    salesOrders: getSO,
    loading,
    error,
    refetch: fetchSO,
    sync: sapSync,
    lastSync,
    syncProgress,
    isSyncing,
  };
};
