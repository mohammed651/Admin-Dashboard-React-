// store/slices/topicSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'https://coursera-clone-iti-production.up.railway.app/topic';

const getAuthHeaders = () => {
  const token = localStorage.getItem('userToken');
  if (!token) throw new Error('No auth token found');
  return { headers: { Authorization: `Bearer ${token}` } };
};

// Async Thunks

/**
 * Create Topic
 */
export const createTopic = createAsyncThunk(
  'topic/createTopic',
  async ({ moduleId, topicData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/${moduleId}/addTopic`, topicData, getAuthHeaders());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Get All Topics
 */
export const fetchAllTopics = createAsyncThunk(
  'topic/fetchAllTopics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/allTopics`, getAuthHeaders());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Get Topic by ID
 */
export const fetchTopicById = createAsyncThunk(
  'topic/fetchTopicById',
  async (topicId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${topicId}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Update Topic by ID
 */
export const updateTopic = createAsyncThunk(
  'topic/updateTopic',
  async ({ topicId, topicData }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/${topicId}`, topicData, getAuthHeaders());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Delete Topic by ID
 */
export const deleteTopic = createAsyncThunk(
  'topic/deleteTopic',
  async (topicId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${topicId}`, getAuthHeaders());
      return topicId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Slice Definition
const topicSlice = createSlice({
  name: 'topic',
  initialState: {
    topics: [],
    currentTopic: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // Create Topic
    builder.addCase(createTopic.fulfilled, (state, action) => {
      state.topics.push(action.payload);
    });

    // Fetch All Topics
    builder.addCase(fetchAllTopics.fulfilled, (state, action) => {
      state.topics = action.payload;
    });

    // Fetch Topic By ID
    builder.addCase(fetchTopicById.fulfilled, (state, action) => {
      state.currentTopic = action.payload;
    });

    // Update Topic
    builder.addCase(updateTopic.fulfilled, (state, action) => {
      const index = state.topics.findIndex(t => t._id === action.payload._id);
      if (index !== -1) {
        state.topics[index] = action.payload;
      }
      if (state.currentTopic?._id === action.payload._id) {
        state.currentTopic = action.payload;
      }
    });

    // Delete Topic
    builder.addCase(deleteTopic.fulfilled, (state, action) => {
      state.topics = state.topics.filter(t => t._id !== action.payload);
      if (state.currentTopic?._id === action.payload) {
        state.currentTopic = null;
      }
    });

    // Loading & Error Handling
    builder
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export default topicSlice;

