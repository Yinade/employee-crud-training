import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchUnits,
  createUnit,
  updateUnit,
  deleteUnit,
  checkUnitLinked,
} from "../../api/unitApi";
import { Unit } from "../../models/unit.model";

interface UnitsState {
  units: Unit[];
  loading: boolean;
  error: string | null;
}

const initialState: UnitsState = {
  units: [],
  loading: false,
  error: null,
};

export const loadUnits = createAsyncThunk(
  "units/loadUnits",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchUnits();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load units",
      );
    }
  },
);

export const createUnitThunk = createAsyncThunk(
  "units/createUnit",
  async (
    data: { name: string; description: string },
    { rejectWithValue, dispatch },
  ) => {
    try {
      const response = await createUnit(data);
      await dispatch(loadUnits()).unwrap();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create unit",
      );
    }
  },
);

export const updateUnitThunk = createAsyncThunk(
  "units/updateUnit",
  async (
    { id, data }: { id: number; data: { name: string; description: string } },
    { rejectWithValue, dispatch },
  ) => {
    try {
      const response = await updateUnit(id, data);
      await dispatch(loadUnits()).unwrap();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update unit",
      );
    }
  },
);

export const deleteUnitThunk = createAsyncThunk(
  "units/deleteUnit",
  async (id: number, { rejectWithValue, dispatch }) => {
    try {
      await deleteUnit(id);
      await dispatch(loadUnits()).unwrap();
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete unit",
      );
    }
  },
);

const unitsSlice = createSlice({
  name: "units",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadUnits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUnits.fulfilled, (state, action) => {
        state.loading = false;
        state.units = action.payload;
      })
      .addCase(loadUnits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createUnitThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUnitThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createUnitThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUnitThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUnitThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateUnitThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteUnitThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUnitThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteUnitThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default unitsSlice.reducer;
