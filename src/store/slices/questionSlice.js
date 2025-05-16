import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Base URL for assignment-related endpoints
const API_URL = 'https://coursera-clone-iti-production.up.railway.app/questions';
const getAuthHeaders = () => {
  const token = localStorage.getItem('userToken');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};
// Async Thunks
export const createQuestion = createAsyncThunk(
  'question/create',
  async (questionData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}`, questionData, getAuthHeaders());
      console.log(response.data.data);
      
      return response.data.data;
    } catch (err) {
      console.log(err);

      return rejectWithValue(err.response.data);
    }
  }
);

export const getQuestions = createAsyncThunk(
  'question/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}`, getAuthHeaders());
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const questionSlice = createSlice({
  name: 'question',
  initialState: {
    questions: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearQuestionError: (state) => {
      state.error = null;
    },
    resetQuestionState: (state) => {
      state.questions = [];
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearSuccessState: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Question
      .addCase(createQuestion.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(createQuestion.fulfilled, (state, action) => {
        state.loading = false;
        state.questions.push(action.payload);
        state.success = true;
      })
      .addCase(createQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Get All Questions
      .addCase(getQuestions.pending, (state) => {
        state.loading = true;
      })
      .addCase(getQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = action.payload;
      })
      .addCase(getQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearQuestionError, resetQuestionState, clearSuccessState } = questionSlice.actions;
export default questionSlice;