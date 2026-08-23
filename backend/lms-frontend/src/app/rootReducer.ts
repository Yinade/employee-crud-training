// src/app/rootReducer.ts
import { combineReducers } from "@reduxjs/toolkit";

import unitesReducer from "./payment-service/modules/unit/unitsSlice";

const rootReducer = combineReducers({
  // core

  units: unitesReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
