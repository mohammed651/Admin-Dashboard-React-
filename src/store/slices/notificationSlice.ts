// store/notificationSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface Notification {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  notification: {
    type: 'success' | 'error' | null;
    message: string | null;
  } | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  status: 'idle',
  error: null,
  notification: null,
};

// Base URL
const API_BASE = 'https://coursera-clone-iti-production.up.railway.app';

// Async Thunks
const getAuthHeaders = () => {
  const token = localStorage.getItem('userToken');
  if (!token) {
    throw new Error('No authentication token found in localStorage');
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

// Async Thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const [notifsRes, countRes] = await Promise.all([
        axios.get(`${API_BASE}/notifications?limit=5`, getAuthHeaders()),
        axios.get(`${API_BASE}/notifications/unread-count`, getAuthHeaders()),
      ]);

      return {
        notifications: notifsRes.data.notifications,
        unreadCount: countRes.data.unreadCount,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markNotificationAsRead',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.patch(`${API_BASE}/notifications/${id}/mark-read`, {}, getAuthHeaders());
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllNotificationsAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await axios.patch(`${API_BASE}/notifications/mark-all-read`, {}, getAuthHeaders());
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Slice
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    receiveNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    clearNotification: (state) => {
      state.notification = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.status = 'succeeded';
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // Mark One As Read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const id = action.payload;
        state.notifications = state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        );
        state.unreadCount = Math.max(state.unreadCount - 1, 0);
      })

      // Mark All As Read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({
          ...n,
          isRead: true,
        }));
        state.unreadCount = 0;
        state.notification = {
          type: 'success',
          message: 'All notifications marked as read.',
        };
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.notification = {
          type: 'error',
          message: action.payload as string,
        };
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.notification = {
          type: 'error',
          message: action.payload as string,
        };
      });
  },
});

// Actions
export const { receiveNotification, clearNotification } = notificationSlice.actions;

// Selectors
export const selectNotifications = (state: any) => state.notifications.notifications;
export const selectUnreadCount = (state: any) => state.notifications.unreadCount;
export const selectNotificationLoading = (state: any) => state.notifications.loading;
export const selectNotificationStatus = (state: any) => state.notifications.status;
export const selectNotificationError = (state: any) => state.notifications.error;
export const selectNotificationToast = (state: any) => state.notifications.notification;

export default notificationSlice;
