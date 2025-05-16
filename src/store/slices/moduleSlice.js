// store/slices/moduleSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'https://coursera-clone-iti-production.up.railway.app/module';

const getAuthHeaders = () => {
  const token = localStorage.getItem('userToken');
  if (!token) throw new Error('No auth token found');
  return { headers: { Authorization: `Bearer ${token}` } };
};

// Async Thunks
export const createModule = createAsyncThunk(
  'module/createModule',
  async ({ courseId, moduleData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/${courseId}/addModule`, 
        moduleData, 
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error creating module:', error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchAllModules = createAsyncThunk(
  'module/fetchAllModules',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/allModules`, getAuthHeaders());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchModuleById = createAsyncThunk(
  'module/fetchModuleById',
  async (moduleId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${moduleId}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateModule = createAsyncThunk(
  'module/updateModule',
  async ({ moduleId, moduleData }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_URL}/${moduleId}`,
        moduleData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteModule = createAsyncThunk(
  'module/deleteModule',
  async (moduleId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${moduleId}`, getAuthHeaders());
      return moduleId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Slice Definition
const moduleSlice = createSlice({
  name: 'module',
  initialState: {
    modules: [],
    currentModule: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearModuleState: (state) => {
      state.modules = [];
      state.currentModule = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Module
      .addCase(createModule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createModule.fulfilled, (state, action) => {
        state.loading = false;
        state.modules.push(action.payload);
      })
      .addCase(createModule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch All Modules
      .addCase(fetchAllModules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllModules.fulfilled, (state, action) => {
        state.loading = false;
        state.modules = action.payload;
      })
      .addCase(fetchAllModules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Module By ID
      .addCase(fetchModuleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModuleById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentModule = action.payload;
        
        // Update or add the module in the modules array
        const index = state.modules.findIndex(m => m._id === action.payload._id);
        if (index !== -1) {
          state.modules[index] = action.payload;
        } else {
          state.modules.push(action.payload);
        }
      })
      .addCase(fetchModuleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Module
      .addCase(updateModule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateModule.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.modules.findIndex(m => m._id === action.payload._id);
        if (index !== -1) {
          state.modules[index] = action.payload;
        }
        if (state.currentModule?._id === action.payload._id) {
          state.currentModule = action.payload;
        }
      })
      .addCase(updateModule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Module
      .addCase(deleteModule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteModule.fulfilled, (state, action) => {
        state.loading = false;
        state.modules = state.modules.filter(m => m._id !== action.payload);
        if (state.currentModule?._id === action.payload) {
          state.currentModule = null;
        }
      })
      .addCase(deleteModule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearModuleState } = moduleSlice.actions;
export default moduleSlice;