import { useDispatch, useSelector } from "react-redux";
import {
  setDesign,
  setDesignError,
  setDesignLoading,
  clearDesignError,
} from "../slices/Design_Slice";
import server from "../server/server";
import socket from "../server/socket"; // NEW
import { useEffect } from "react";

export const useDesign = () => {
  const dispatch = useDispatch();
  const { getDesign, error, loading } = useSelector(
    (state) => state.DesignInfo,
  );

  const fetchDesign = async () => {
    try {
      dispatch(setDesignLoading());
      dispatch(clearDesignError());

      const response = await server.get("/design");
      dispatch(setDesign(response.data.allDesign));
    } catch (error) {
      dispatch(setDesignError(error.message));
    }
  };

  useEffect(() => {
    fetchDesign();

    const handleDesignUpdate = () => {
      console.log("design:updated received — refreshing Design data");
      fetchDesign();
    };

    socket.on("design:updated", handleDesignUpdate);

    return () => {
      socket.off("design:updated", handleDesignUpdate);
    };
  }, []);

  return {
    designs: getDesign || [],
    error,
    loading,
    refetch: fetchDesign,
  };
};
