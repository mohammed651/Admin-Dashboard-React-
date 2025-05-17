import { createSlice } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
// 🔽 Login Thunk (uses email + password)
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch('https://coursera-clone-iti-production.up.railway.app/user/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Login response:', data); // Debugging line
      

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.message === 'Valid Credentials') {
        console.log('Login successful:', data); // Debugging line
        
        const token = data.userToken;
        const email = data.user.email;
        const username = data.user.username;
        const role = data.user.role;
        const userImage = data.user.userImage;

        // Save token to localStorage
        localStorage.setItem('userToken', token);
        localStorage.setItem('email', email);
        localStorage.setItem('username', username);
        localStorage.setItem('role', role);
        localStorage.setItem('userImage', userImage);


        return {
          token,
        };
      } else {
        throw new Error(data.message || 'Invalid Credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      return rejectWithValue(err.message || 'An unexpected error occurred');
    }
  }
);

// Helper: Load auth state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('auth');
    return serializedState ? JSON.parse(serializedState) : undefined;
  } catch (err) {
    console.warn("Could not load auth state", err);
    return undefined;
  }
};

// Initial State
const initialState = loadState() || {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isLoggedIn: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Manual logout
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.token = null;

      // Remove from localStorage
      localStorage.removeItem('auth');
    },

    // Clear any errors
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔁 Login Pending
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      // ✅ Login Success
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoggedIn = true;
        state.user = action.payload.user;
        state.token = action.payload.token;

        // Save to localStorage
        localStorage.setItem('auth', JSON.stringify(state));
      })
      // ❌ Login Failed
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;

export default authSlice.reducer;