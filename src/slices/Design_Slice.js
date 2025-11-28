import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  getDesign: [],
  loading: false,
  error: null,
};

export const Design_Slice = createSlice({
  name: "getDesign",
  initialState,
  reducers: {
    setDesign: (state, { payload }) => {
      state.getDesign = payload;
      state.loading = false;
      state.error = null;
    },
    setDesignError: (state, { payload }) => {
      state.loading = false;
      state.error = payload;
    },
    clearDesignError: (state) => {
      state.error = null;
    },
    setDesignLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
  },
});

export const { setDesign, setDesignError, clearDesignError, setDesignLoading } =
  Design_Slice.actions;

export default Design_Slice.reducer;
