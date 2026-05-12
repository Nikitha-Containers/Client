import { useDispatch, useSelector } from "react-redux";
import {
  clearSetEmployeeError,
  setEmployee,
  setEmployeeLoading,
  setEmployeeError,
} from "../slices/Employee_Slice";
import server from "../server/server";
import { useEffect, useMemo } from "react";

export const useEmployee = () => {
  const dispatch = useDispatch();

  const { getEmployee, error, loading } = useSelector(
    (state) => state.EmployeeInfo,
  );

  const fetchEmployee = async () => {
    try {
      dispatch(setEmployeeLoading());
      dispatch(clearSetEmployeeError());
      const response = await server.get("/employee/all");
      dispatch(setEmployee(response.data.data || []));
    } catch (error) {
      dispatch(setEmployeeError(error.message));
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, []);

  const getByType = (emp_type, machine_type) =>
    (getEmployee || []).filter(
      (e) => e.emp_type === emp_type && e.machine_type === machine_type,
    );

  return {
    employees: getEmployee || [],
    error,
    loading,
    refetch: fetchEmployee,
    getByType,
  };
};
