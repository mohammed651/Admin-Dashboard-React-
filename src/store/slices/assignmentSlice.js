import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Base URL for assignment-related endpoints
const API_URL = 'https://coursera-clone-iti-production.up.railway.app/assignments';

const getAuthHeaders = () => {
  const token = localStorage.getItem('userToken');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};
// Async Thunks
export const createAssignment = createAsyncThunk(
  'assignment/create',
  async (assignmentData, { rejectWithValue }) => {
    try {
      console.log(assignmentData);
      
      const response = await axios.post(`${API_URL}`, assignmentData , getAuthHeaders());
      return response.data;
    } catch (err) {
      console.log(err);
      return rejectWithValue(err.response.data);
    }
  }
);

export const getAssignment = createAsyncThunk(
  'assignment/get',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${id}` , getAuthHeaders());
      return response.data;
    } catch (err) {
      console.log(err);
      
      return rejectWithValue(err.response.data);
    }
  }
);

export const submitAssignment = createAsyncThunk(
  'assignment/submit',
  async (submissionData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/submit`, submissionData , getAuthHeaders());
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const getUserAttempts = createAsyncThunk(
  'assignment/attempts',
  async (assignmentId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${assignmentId}/attempts` , getAuthHeaders());
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const assignmentSlice = createSlice({
  name: 'assignment',
  initialState: {
    assignments: [],
    currentAssignment: null,
    userAttempts: [],
    loading: false,
    error: null,
    submissionResult: null,
  },
  reducers: {
    clearAssignmentError: (state) => {
      state.error = null;
    },
    resetAssignmentState: (state) => {
      state.assignments = [];
      state.currentAssignment = null;
      state.userAttempts = [];
      state.loading = false;
      state.error = null;
      state.submissionResult = null;
    },
    clearSubmissionResult: (state) => {
      state.submissionResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Assignment
      .addCase(createAssignment.pending, (state) => {
        state.loading = true;
      })
      .addCase(createAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments.push(action.payload);
      })
      .addCase(createAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Assignment
      .addCase(getAssignment.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAssignment = action.payload;
      })
      .addCase(getAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Submit Assignment
      .addCase(submitAssignment.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.submissionResult = action.payload;
      })
      .addCase(submitAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get User Attempts
      .addCase(getUserAttempts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserAttempts.fulfilled, (state, action) => {
        state.loading = false;
        state.userAttempts = action.payload;
      })
      .addCase(getUserAttempts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAssignmentError, resetAssignmentState, clearSubmissionResult } = assignmentSlice.actions;
export default assignmentSlice;