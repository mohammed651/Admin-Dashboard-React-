import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { Instructor } from '@/types';

// Async Thunks
export const createInstructor = createAsyncThunk(
  'instructor/createInstructor',
  async (instructorData: FormData, { rejectWithValue }) => {
    try {
      const response = await axios.post('https://coursera-clone-iti-production.up.railway.app/instructor/addinstructor', instructorData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      return response.data as Instructor;
    } catch (error) {
      console.log(error.response);
      
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: 'An unknown error occurred' });
    }
  }
);

export const fetchAllInstructors = createAsyncThunk(
  'instructor/fetchAllInstructors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<Instructor[]>('https://coursera-clone-iti-production.up.railway.app/instructor/allInstructors', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: 'Failed to fetch instructors' });
    }
  }
);

export const fetchInstructorById = createAsyncThunk(
  'instructor/fetchInstructorById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get<Instructor>(`https://coursera-clone-iti-production.up.railway.app/instructor/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: 'Failed to fetch instructor' });
    }
  }
);

export const updateInstructor = createAsyncThunk(
  'instructor/updateInstructor',
  async ({ id, instructorData }: { id: string; instructorData: FormData }, { rejectWithValue }) => {
    try {
      const response = await axios.patch<Instructor>(
        `https://coursera-clone-iti-production.up.railway.app/instructor/${id}`,
        instructorData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: 'Failed to update instructor' });
    }
  }
);

export const deleteInstructor = createAsyncThunk(
  'instructor/deleteInstructor',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`https://coursera-clone-iti-production.up.railway.app/instructor/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      return id;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: 'Failed to delete instructor' });
    }
  }
);

interface InstructorState {
  instructors: Instructor[];
  currentInstructor: Instructor | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: InstructorState = {
  instructors: [],
  currentInstructor: null,
  status: 'idle',
  error: null
};

const instructorSlice = createSlice({
  name: 'instructor',
  initialState,
  reducers: {
    clearCurrentInstructor: (state) => {
      state.currentInstructor = null;
    },
    resetInstructorStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Instructor
      .addCase(createInstructor.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createInstructor.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.instructors.push(action.payload);
      })
      .addCase(createInstructor.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as { message?: string })?.message || 'Failed to create instructor';
      })
      
      // Fetch All Instructors
      .addCase(fetchAllInstructors.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAllInstructors.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.instructors = action.payload;
      })
      .addCase(fetchAllInstructors.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as { message?: string })?.message || 'Failed to fetch instructors';
      })
      
      // Fetch Instructor By ID
      .addCase(fetchInstructorById.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchInstructorById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentInstructor = action.payload;
      })
      .addCase(fetchInstructorById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as { message?: string })?.message || 'Failed to fetch instructor';
      })
      
      // Update Instructor
      .addCase(updateInstructor.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateInstructor.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.instructors.findIndex(
          instructor => instructor._id === action.payload._id
        );
        if (index !== -1) {
          state.instructors[index] = action.payload;
        }
        if (state.currentInstructor?._id === action.payload._id) {
          state.currentInstructor = action.payload;
        }
      })
      .addCase(updateInstructor.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as { message?: string })?.message || 'Failed to update instructor';
      })
      
      // Delete Instructor
      .addCase(deleteInstructor.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteInstructor.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.instructors = state.instructors.filter(
          instructor => instructor._id !== action.payload
        );
        if (state.currentInstructor?._id === action.payload) {
          state.currentInstructor = null;
        }
      })
      .addCase(deleteInstructor.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as { message?: string })?.message || 'Failed to delete instructor';
      });
  }
});

// Selectors
export const selectAllInstructors = (state: { instructor: InstructorState }) => state.instructor.instructors;
export const selectCurrentInstructor = (state: { instructor: InstructorState }) => state.instructor.currentInstructor;
export const selectInstructorStatus = (state: { instructor: InstructorState }) => state.instructor.status;
export const selectInstructorError = (state: { instructor: InstructorState }) => state.instructor.error;

export const { clearCurrentInstructor, resetInstructorStatus } = instructorSlice.actions;
export default instructorSlice;