import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async Thunks
const API_URL = "https://coursera-clone-iti-production.up.railway.app/video";

export interface VideoData {
  _id: string;
  videoTitle: string;
  url: string;
  transeScript: string;
  discuseion: string;
  duration: string;
  public_id: string;
  __v: number;
}

export interface VideoState {
  videos: VideoData[];
  currentVideo: VideoData | null;
  loading: boolean;
  error: string | null | unknown;
  streaming: any;
}

interface UploadVideoParams {
  topicId: string;
  formData: Record<string, any>;
}
const getAuthHeaders = () => {
  const token = localStorage.getItem("userToken");
  if (!token) {
    throw new Error("No authentication token found in localStorage");
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};
export const uploadVideoStream = createAsyncThunk<
  any, // نوع القيمة اللي بترجعها من الـ thunk (ممكن تحددها أدق لو تعرفها)
  UploadVideoParams, // نوع البراميتر
  { rejectValue: any } // نوع rejectValue
>("video/uploadStream", async ({ topicId, formData }, { rejectWithValue }) => {
  console.log("Uploading video with topicId:", topicId);
  console.log("FormData:", formData);

  try {
    const response = await axios.post(
      `${API_URL}/${topicId}`,
      formData,
      getAuthHeaders()
    );
    return response.data;
  } catch (err) {
    console.log("Error uploading video:", err.response.data);

    return rejectWithValue(err.response.data);
  }
});

export const getAllVideos = createAsyncThunk(
  "video/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}`, getAuthHeaders());
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const getVideoById = createAsyncThunk<
  VideoData, 
  string,  
  { rejectValue: string } 
>(
  "video/getById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const streamVideo = createAsyncThunk(
  "video/stream",
  async (filename, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/stream/${filename}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);
  const initialState: VideoState = {
  videos: [],
  currentVideo: null,
  loading: false,
  error: null,
  streaming: null,
};
const videoSlice = createSlice({
  name: "video",
  initialState,
  reducers: {
    clearVideoError: (state) => {
      state.error = null;
    },
    resetVideoState: (state) => {
      state.videos = [];
      state.currentVideo = null;
      state.loading = false;
      state.error = null;
      state.streaming = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload Video
      .addCase(uploadVideoStream.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadVideoStream.fulfilled, (state, action) => {
        state.loading = false;
        state.videos.push(action.payload);
      })
      .addCase(uploadVideoStream.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get All Videos
      .addCase(getAllVideos.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllVideos.fulfilled, (state, action) => {
        state.loading = false;
        state.videos = action.payload;
      })
      .addCase(getAllVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Video By ID
      .addCase(getVideoById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getVideoById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVideo = action.payload;
      })
      .addCase(getVideoById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Stream Video
      .addCase(streamVideo.pending, (state) => {
        state.loading = true;
      })
      .addCase(streamVideo.fulfilled, (state, action) => {
        state.loading = false;
        state.streaming = action.payload;
      })
      .addCase(streamVideo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearVideoError, resetVideoState } = videoSlice.actions;
export default videoSlice;
