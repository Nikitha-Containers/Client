import { configureStore } from "@reduxjs/toolkit";
import SO_Reducer from "../slices/SO_Slice";
import DesignReducer from "../slices/Design_Slice";

const store = configureStore({
  reducer: {
    SO_Info: SO_Reducer,
    DesignInfo: DesignReducer,
  },
});

export default store;
