// src/store/slices/successStorySlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store';
import { toast } from '@/hooks/use-toast';
type UpdateStoryData = FormData | Partial<SuccessStory>;
const getAuthHeaders = () => {
  const token = localStorage.getItem('userToken');
  if (!token) {
    throw new Error('No authentication token found in localStorage');
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  };
};
interface SuccessStory {
  _id: string;
  name: string;
  certificateName: string;
  review: string;
  date: string;
  personImage: string;
}

interface SuccessStoryState {
  stories: SuccessStory[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SuccessStoryState = {
  stories: [],
  status: 'idle',
  error: null,
};

// Fetch all success stories
export const fetchSuccessStories = createAsyncThunk(
  'successStories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('https://coursera-clone-iti-production.up.railway.app/successStory/allsuccessStories',getAuthHeaders());
      console.log(response.data);
      
      return response.data;
    } catch (error: any) {
      console.log(error);
      
      return rejectWithValue(error.response?.data?.msgError || 'Failed to fetch success stories');
    }
  }
);

// Add a new success story
export const addSuccessStory = createAsyncThunk(
  'successStories/add',
  async (storyData: FormData, { rejectWithValue }) => {
    
    try {
      const response = await axios.post('https://coursera-clone-iti-production.up.railway.app/successStory/addsuccessStory', storyData,getAuthHeaders());
      return response.data.data;
    } catch (error: any) {
      console.log(error.response?.data?.msgError);
      
      return rejectWithValue(error.response?.data?.msgError || 'Failed to add success story');
    }
  }
);

// Update a success story
export const updateSuccessStory = createAsyncThunk(
  'successStories/update',
  async ({ id, storyData }: { id: string; storyData: FormData | Partial<SuccessStory> }, { rejectWithValue }) => {
    try {
      let config = getAuthHeaders();
      let dataToSend;

      if (storyData instanceof FormData) {
        // For FormData (when image is included)
        config.headers['Content-Type'] = 'multipart/form-data';
        dataToSend = storyData;
      } else {
        // For regular JSON (when no image change)
        config.headers['Content-Type'] = 'application/json';
        dataToSend = storyData;
      }

      const response = await axios.patch(
        `https://coursera-clone-iti-production.up.railway.app/successStory/${id}`, 
        dataToSend,
        config
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Update error:', error.response?.data);
      return rejectWithValue(error.response?.data?.msgError || 'Failed to update success story');
    }
  }
);

// Delete a success story
export const deleteSuccessStory = createAsyncThunk(
  'successStories/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`https://coursera-clone-iti-production.up.railway.app/successStory/${id}`,getAuthHeaders());
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.msgError || 'Failed to delete success story');
    }
  }
);

const successStorySlice = createSlice({
  name: 'successStory',
  initialState,
  reducers: {}, // Empty reducers object since we're removing clearNotification
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchSuccessStories.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSuccessStories.fulfilled, (state, action: PayloadAction<SuccessStory[]>) => {
        state.status = 'succeeded';
        state.stories = action.payload;
      })
      .addCase(fetchSuccessStories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Add new
      .addCase(addSuccessStory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addSuccessStory.fulfilled, (state, action: PayloadAction<SuccessStory>) => {
        state.status = 'succeeded';
        state.stories.push(action.payload);
        toast({
          title: 'Success',
          description: 'Success story added successfully',
          variant: 'default',
        });
      })
      .addCase(addSuccessStory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        toast({
          title: 'Error',
          description: state.error,
          variant: 'destructive',
        });
      })
      
      // Update
      .addCase(updateSuccessStory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateSuccessStory.fulfilled, (state, action: PayloadAction<SuccessStory>) => {
        state.status = 'succeeded';
        const index = state.stories.findIndex(story => story._id === action.payload._id);
        if (index !== -1) {
          state.stories[index] = action.payload;
        }
        toast({
          title: 'Success',
          description: 'Success story updated successfully',
          variant: 'default',
        });
      })
      .addCase(updateSuccessStory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        toast({
          title: 'Error',
          description: state.error,
          variant: 'destructive',
        });
      })
      
      // Delete
      .addCase(deleteSuccessStory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteSuccessStory.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = 'succeeded';
        state.stories = state.stories.filter(story => story._id !== action.payload);
        toast({
          title: 'Success',
          description: 'Success story deleted successfully',
          variant: 'default',
        });
      })
      .addCase(deleteSuccessStory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        toast({
          title: 'Error',
          description: state.error,
          variant: 'destructive',
        });
      });
  },
});

// Remove this line since we're removing clearNotification
// export const { clearNotification } = successStorySlice.actions;

// Selectors remain the same
export const selectAllSuccessStories = (state: RootState): SuccessStory[] =>
  state.successStory.stories;

export const selectSuccessStoryStatus = (state: RootState): 'idle' | 'loading' | 'succeeded' | 'failed' =>
  state.successStory.status;

export const selectSuccessStoryError = (state: RootState): string | null =>
  state.successStory.error;

export default successStorySlice;