import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSO, setSOError } from "../slices/SO_Slice";
import server from "../server/server";

export const SalesOrder = () => {
  const dispatch = useDispatch();
  const { getSO, error } = useSelector((state) => state.SO_Info);

  const [lastSync, setLastSync] = useState(null);

  const fetchSO = async () => {
    try {
      const response = await server.get("/salesorder");
      const data = response?.data?.data;
      dispatch(setSO(data));

      if (data && data.length > 0) {
        const latestRecord = data.reduce((a, b) =>
          new Date(a.updatedAt) > new Date(b.updatedAt) ? a : b
        );

        setLastSync(latestRecord.updatedAt);
      }
    } catch (error) {
      dispatch(setSOError(error.message));
    }
  };

  const sapSync = async () => {
    try {
      const response = await server.post("/sap/sapSync");
      if (response.data.success) {
        alert(`Data was successfully synced :${response.data.TotalRec}`);
      }
      await fetchSO();
    } catch (error) {
      dispatch(setSOError(error.message));
    }
  };

  useEffect(() => {
    fetchSO();
  }, []);

  return {
    salesOrders: getSO,
    error,
    refetch: fetchSO,
    sync: sapSync,
    lastSync,
  };
};
