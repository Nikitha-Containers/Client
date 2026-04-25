import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSO, setSOError, setSOLoading } from "../slices/SO_Slice";
import server from "../server/server";
import socket from "../server/socket"; // NEW
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
      setLastSync(response?.data?.lastSync);
    } catch (error) {
      toast.error("Failed to fetch Sales Orders");
      dispatch(setSOError(error.message));
    }
  };

  const sapSync = async () => {
    let interval;
    try {
      setIsSyncing(true);
      setSyncProgress(0);
      interval = setInterval(() => {
        setSyncProgress((prev) => Math.min(prev + 5, 90));
      }, 300);

      const response = await server.post("/sap/sapSync");
      clearInterval(interval);

      if (response.data.success) {
        setSyncProgress(100);
        toast.success(
          `Data was successfully synced: ${response.data.TotalRec}`,
        );
      }

      await fetchSO();

      setTimeout(() => {
        setIsSyncing(false);
        setSyncProgress(0);
      }, 800);
    } catch (error) {
      toast.error("SAP Sync Failed");
      dispatch(setSOError(error.message));
      setIsSyncing(false);
    } finally {
      clearInterval(interval);
    }
  };

  useEffect(() => {
    fetchSO();

    const handleSOUpdate = () => {
      console.log("so:updated received — refreshing Sales Orders");
      fetchSO();
    };

    socket.on("so:updated", handleSOUpdate);

    return () => {
      socket.off("so:updated", handleSOUpdate);
    };
  }, []);

  return {
    salesOrders: getSO || [],
    loading,
    error,
    refetch: fetchSO,
    sync: sapSync,
    lastSync,
    syncProgress,
    isSyncing,
  };
};

export const SalesOrderAll = () => {
  const dispatch = useDispatch();
  const { getSO, error, loading } = useSelector((state) => state.SO_Info);

  const [lastSync, setLastSync] = useState(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchSO = async () => {
    try {
      dispatch(setSOLoading());
      const response = await server.get("/salesorder/all");
      const data = response?.data?.data;
      dispatch(setSO(data));

      setLastSync(response?.data?.lastSync);
    } catch (error) {
      toast.error("Failed to fetch Sales Orders");
      dispatch(setSOError(error.message));
    }
  };

  const sapSync = async () => {
    let interval;
    try {
      setIsSyncing(true);
      setSyncProgress(0);

      interval = setInterval(() => {
        setSyncProgress((prev) => Math.min(prev + 5, 90));
      }, 300);
      
      const response = await server.post("/sap/sapSync");

      clearInterval(interval);

      if (response.data.success) {
        setSyncProgress(100);
        toast.success(
          `Data was successfully synced: ${response.data.TotalRec}`,
        );
      }

      await fetchSO();

      setTimeout(() => {
        setIsSyncing(false);
        setSyncProgress(0);
      }, 800);
    } catch (error) {
      toast.error("SAP Sync Failed");
      dispatch(setSOError(error.message));
      setIsSyncing(false);
    } finally {
      clearInterval(interval);
    }
  };

  useEffect(() => {
    fetchSO();

    const handleSOUpdate = () => {
      console.log("📡 so:updated received — refreshing All Sales Orders");
      fetchSO();
    };

    socket.on("so:updated", handleSOUpdate);

    return () => {
      socket.off("so:updated", handleSOUpdate);
    };
  }, []);

  return {
    salesOrders: getSO || [],
    loading,
    error,
    refetch: fetchSO,
    sync: sapSync,
    lastSync,
    syncProgress,
    isSyncing,
  };
};
