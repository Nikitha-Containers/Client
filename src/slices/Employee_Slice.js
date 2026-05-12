import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  getEmployee: [],
  loading: true,
  error: null,
};

export const Employee_Slice = createSlice({
  name: "getEmployee",
  initialState,
  reducers: {
    setEmployee: (state, { payload }) => {
      state.getEmployee = payload;
      state.loading = false;
      state.error = null;
    },
    setEmployeeError: (state, { payload }) => {
      state.loading = false;
      state.error = payload;
    },
    clearSetEmployeeError: (state) => {
      state.error = null;
    },
    setEmployeeLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
  },
});

export const {
  setEmployee,
  setEmployeeError,
  clearSetEmployeeError,
  setEmployeeLoading,
} = Employee_Slice.actions;

export default Employee_Slice.reducer;
