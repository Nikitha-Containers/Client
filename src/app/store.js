import { configureStore } from "@reduxjs/toolkit";
import SO_Reducer from "../slices/SO_Slice";

const store = configureStore({
  reducer: {
    SO_Info: SO_Reducer,
  },
});

export default store;
