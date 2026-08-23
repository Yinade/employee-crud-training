import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as userApi from "../../api/usersApi";
import { UserModel } from "../../models/user.model";
import { RoleForFilter } from "../../models/role.model";
import { RootState } from "../../rootReducer";
import { updateInternalUser } from "../auth/core/_requests";
import { LeanUserModel } from "../../models/user.model";

export interface UserState {
  users: UserModel[];
  roleTypes: RoleForFilter[];
  leanUsers: LeanUserModel[];
  userTypes: string[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  roleTypes: [],
  leanUsers: [],
  userTypes: [],
  loading: false,
  error: null,
};
export const fetchAllUsers = createAsyncThunk<
  UserModel[],
  void,
  { rejectValue: string }
>("users/fetchAllUsers", async (_, { rejectWithValue }) => {
  try {
    const response = await userApi.fetchAllUsers();
    // response.data.forEach((users) => {
    //   console.log(users.profilePictureUrl);
    // });
    return response.data; // This returns an array of UserModel
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "An error occurred",
    );
  }
});

export const fetchLeanUsers = createAsyncThunk<
  LeanUserModel[],
  void,
  { rejectValue: string }
>("users/fetchLeanUsers", async (_, { rejectWithValue }) => {
  try {
    const response = await userApi.fetchLeanUsers();
    return response.data;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "An error occurred",
    );
  }
});

export const selectUserById = (
  state: RootState,
  id: number,
): UserModel | undefined => {
  return state.users.users.find((user) => user.accountId === id);
};

export const fetchRoleTypes = createAsyncThunk(
  "users/fetchRoleTypes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.fetchRoleTypes(); // Define this API
      return response.data;
    } catch (error) {
      return rejectWithValue(error || "An error occurred");
    }
  },
);

// export const updateUser = createAsyncThunk<
//   UserModel,
//   { accountId: number; payload: Partial<UserModel>; profilePicture?: File },
//   { rejectValue: string }
// >(
//   "users/updateUser",
//   async ({ accountId, payload, profilePicture }, { rejectWithValue }) => {
//     try {
//       const response = await userApi.updateUser(accountId, payload);
//       return response; // Return response directly, as it is UserModel
//     } catch (error) {
//       return rejectWithValue(
//         error instanceof Error ? error.message : "An error occurred"
//       );
//     }
//   }
// );
export const updateInternalUserThunk = createAsyncThunk<
  UserModel,
  {
    accountId: number;
    payload: {
      username: string;
      firstName: string;
      lastName: string;
      email: string;
      password?: string;
      roleIds: number[];
      departmentId: number;
    };
    profilePicture?: File | null;
  },
  { rejectValue: string }
>(
  "users/updateInternalUser",
  async ({ accountId, payload, profilePicture }, { rejectWithValue }) => {
    try {
      const updated = await updateInternalUser(
        accountId,
        payload,
        profilePicture ?? null,
      );
      return updated;
    } catch (error: any) {
      return rejectWithValue(
        error instanceof Error ? error.message : "An error occurred",
      );
    }
  },
);

export const updateProfilePicture = createAsyncThunk<
  string,
  { accountId: number; profilePicture: File },
  { rejectValue: string }
>(
  "users/updateProfilePicture",
  async ({ accountId, profilePicture }, { rejectWithValue }) => {
    try {
      const response = await userApi.updateProfilePicture(
        accountId,
        profilePicture,
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "An error occurred",
      );
    }
  },
);

export const fetchUserTypes = createAsyncThunk(
  "users/fetchUserTypes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.fetchUserTypes(); // Define this API
      return response;
    } catch (error) {
      return rejectWithValue(error || "An error occurred");
    }
  },
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id: number, thunkAPI) => {
    try {
      await userApi.deleteUserApi(id);
      return id; // Return the deleted role ID to update the state
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

// Slice
const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    resetUserState(state) {
      state.users = [];
      state.roleTypes = [];
      state.userTypes = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, { payload }) => {
        state.users = payload;
        state.loading = false;
      })
      .addCase(fetchAllUsers.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })
      .addCase(fetchRoleTypes.fulfilled, (state, { payload }) => {
        state.roleTypes = payload;
      })
      .addCase(fetchUserTypes.fulfilled, (state, { payload }) => {
        state.userTypes = payload;
      })
      .addCase(updateProfilePicture.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })
      .addCase(fetchLeanUsers.fulfilled, (state, { payload }) => {
        state.leanUsers = payload;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      .addCase(updateInternalUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInternalUserThunk.fulfilled, (state, { payload }) => {
        state.loading = false;
        const idx = state.users.findIndex(
          (u) => u.accountId === payload.accountId,
        );
        if (idx !== -1) state.users[idx] = payload;
        else state.users.unshift(payload);
      })
      .addCase(updateInternalUserThunk.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })

      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(
          (user) => user.accountId !== action.payload,
        );
      });
  },
});

export const { resetUserState } = userSlice.actions;
export default userSlice.reducer;
