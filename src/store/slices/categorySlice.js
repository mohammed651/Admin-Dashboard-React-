import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Base URL for category-related endpoints
const API_URL = 'https://coursera-clone-iti-production.up.railway.app/category';

// Helper function to get token from localStorage
const getAuthHeaders = (isFormData = false) => {
  const token = localStorage.getItem('userToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    },
  };
};

// Async Thunks
export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  async (_, { rejectWithValue }) => {
    console.log('Fetching categories...');
    
    try {
      const response = await axios.get(`${API_URL}/allCategories`, getAuthHeaders());
      console.log('Categories fetched successfully:', response.data);
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addCategory = createAsyncThunk(
  'category/addCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      // اكتشف إذا كان categoryData من نوع FormData
      const isFormData = categoryData instanceof FormData;

      const response = await axios.post(
        `${API_URL}/addCategory`,
        categoryData,
        getAuthHeaders(isFormData)
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateCategory = createAsyncThunk(
  'category/updateCategory',
  async ({ id, categoryData }, { rejectWithValue }) => {
    try {
      const isFormData = categoryData instanceof FormData;

      const response = await axios.patch(
        `${API_URL}/${id}`,
        categoryData,
        getAuthHeaders(isFormData)
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'category/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const categorySlice = createSlice({
  name: 'category',
  initialState: {
    categories: [],
    loading: false,
    error: null,
    currentCategory: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    notification: null
  },
  reducers: {
    setCurrentCategory: (state, action) => {
      state.currentCategory = action.payload;
    },
    clearNotification: (state) => {
      state.notification = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.status = 'succeeded';
        state.categories = action.payload;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Add Category
      .addCase(addCategory.pending, (state) => {
        state.loading = true;
        state.status = 'loading';
        state.error = null;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.status = 'succeeded';
        state.categories.push(action.payload);
        state.notification = {
          type: 'success',
          message: 'Category added successfully!'
        };
        state.error = null;
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.loading = false;
        state.status = 'failed';
        state.error = action.payload;
        state.notification = {
          type: 'error',
          message: action.payload || 'Failed to add category'
        };
      })
      
      // Update Category
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.status = 'succeeded';
        const index = state.categories.findIndex(
          category => category._id === action.payload._id
        );
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        state.notification = {
          type: 'success',
          message: 'Category updated successfully!'
        };
        state.error = null;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.status = 'failed';
        state.error = action.payload;
        state.notification = {
          type: 'error',
          message: action.payload || 'Failed to update category'
        };
      })
      
      // Delete Category
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.status = 'succeeded';
        state.categories = state.categories.filter(
          category => category._id !== action.payload
        );
        state.notification = {
          type: 'success',
          message: 'Category deleted successfully!'
        };
        state.error = null;
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.status = 'failed';
        state.error = action.payload;
        state.notification = {
          type: 'error',
          message: action.payload || 'Failed to delete category'
        };
      });
  }
});

// Selectors
export const selectAllCategories = (state) => state.category.categories || [];
export const selectCategoryStatus = (state) => state.category.status;
export const selectCategoryLoading = (state) => state.category.loading;
export const selectCategoryError = (state) => state.category.error;
export const selectCurrentCategory = (state) => state.category.currentCategory;
export const selectCategoryNotification = (state) => state.category.notification;

// Actions
export const { setCurrentCategory, clearNotification } = categorySlice.actions;

export default categorySlice;