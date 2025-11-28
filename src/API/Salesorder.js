import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSO, setSOError } from "../slices/SO_Slice";
import server from "../server/server";

export const SalesOrder = () => {
  const dispatch = useDispatch();
  const { getSO, error } = useSelector((state) => state.SO_Info);

  const fetchSO = async () => {
    try {
      const response = await server.get("/salesorder");
      dispatch(setSO(response.data.data));
    } catch (error) {
      dispatch(setSOError(error.message));
    }
  };

  const sapSync = async () => {
    try {
      await server.get("/sap/sync");
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
  };
};
