import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../api/departmentApi";
import { Department } from "../../models/department.model";

interface DepartmentsState {
  departments: Department[];
  loading: boolean;
  error: string | null;
}

const initialState: DepartmentsState = {
  departments: [],
  loading: false,
  error: null,
};

export const loadDepartments = createAsyncThunk(
  "departments/loadDepartments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchDepartments();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch departments"
      );
    }
  }
);

export const createDepartmentThunk = createAsyncThunk(
  "departments/createDepartment",
  async (data: { name: string }, { rejectWithValue, dispatch }) => {
    try {
      const response = await createDepartment(data);
      await dispatch(loadDepartments()).unwrap();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create department"
      );
    }
  }
);

export const updateDepartmentThunk = createAsyncThunk(
  "departments/updateDepartment",
  async (
    { id, data }: { id: number; data: { name: string } },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await updateDepartment(id, data);
      await dispatch(loadDepartments()).unwrap();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update department"
      );
    }
  }
);

export const deleteDepartmentThunk = createAsyncThunk(
  "departments/deleteDepartment",
  async (id: number, { rejectWithValue, dispatch }) => {
    try {
      await deleteDepartment(id);
      await dispatch(loadDepartments()).unwrap();
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete department"
      );
    }
  }
);

const departmentsSlice = createSlice({
  name: "departments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload;
      })
      .addCase(loadDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createDepartmentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDepartmentThunk.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createDepartmentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateDepartmentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDepartmentThunk.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updateDepartmentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteDepartmentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDepartmentThunk.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(deleteDepartmentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default departmentsSlice.reducer;
