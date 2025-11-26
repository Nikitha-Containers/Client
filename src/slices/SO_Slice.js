import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  getSO: [],
  loading: false,
  error: null,
};

export const SO_Slice = createSlice({
  name: "getSO",
  initialState,
  reducers: {
    setSO: (state, { payload }) => {
      state.getSO = payload;
      state.loading = false;
      state.error = null;
    },
    setError: (state, { payload }) => {
      state.loading = false;
      state.error = payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setSO, setError, clearError } = SO_Slice.actions;

export default SO_Slice.reducer;
