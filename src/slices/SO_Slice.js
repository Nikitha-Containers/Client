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
    setSOError: (state, { payload }) => {
      state.loading = false;
      state.error = payload;
    },
    clearSOError: (state) => {
      state.error = null;
    },
    setSOLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
  },
});

export const { setSO, setSOError, clearSOError, setSOLoading } =
  SO_Slice.actions;

export default SO_Slice.reducer;
