// userSlice.ts
import { User, UserState, UserUpdateData } from "@/types";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from 'axios';
import { RootState } from "../store";

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
  searchQuery: "",
  roleFilter: "all",
  statusFilter: "all",
};

// Helper function to get auth headers
const getAuthHeaders = (contentType = 'application/json') => {
  const token = localStorage.getItem('userToken');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': contentType,
    },
  };
};

export const fetchUsers = createAsyncThunk<User[], void>(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<{ message: string; data: User[] }>(
        "https://coursera-clone-iti-production.up.railway.app/user/getAllUsers", 
        getAuthHeaders()
      );
      return response.data.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message || "Failed to fetch users");
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const updateUser = createAsyncThunk<User, { id: string; userData: UserUpdateData }>(
  "users/updateUser",
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await axios.patch<User>(
        `https://coursera-clone-iti-production.up.railway.app/user/updateUserByAdmin/${id}`,
        userData,
        getAuthHeaders()
      );
      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message || "Failed to update user");
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const deleteUser = createAsyncThunk<string, string>(
  "users/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      await axios.patch(
        "https://coursera-clone-iti-production.up.railway.app/user/soft-del",
        { id },
        getAuthHeaders()
      );
      return id;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message || "Failed to delete user");
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const createAdmin = createAsyncThunk<User, FormData>(
  "users/createAdmin",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post<{ message: string; data: User }>(
        "https://coursera-clone-iti-production.up.railway.app/user/signup",
        formData,
        getAuthHeaders('multipart/form-data')
      );
      return response.data.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message || "Failed to create admin");
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const selectFilteredUsers = (state: RootState): User[] => {
  const { users, searchQuery, roleFilter, statusFilter } = state.user;
  
  return users.filter((user) => {
    const matchesSearch = 
      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setRoleFilter: (state, action: PayloadAction<UserState['roleFilter']>) => {
      state.roleFilter = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<UserState['statusFilter']>) => {
      state.statusFilter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload || [];
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const updatedUser = action.payload;
        state.users = state.users.map(user => 
          user._id === updatedUser._id ? updatedUser : user
        );
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user._id !== action.payload);
      })
      .addCase(createAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(createAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSearchQuery, setRoleFilter, setStatusFilter } = userSlice.actions;
export default userSlice;