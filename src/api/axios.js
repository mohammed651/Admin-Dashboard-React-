// import axios from 'axios';
// import { store } from '@/store/store.ts'; // Import your Redux store
// import { logout } from '@/store/slices/authSlice'; // Import your logout action

// // Create axios instance
// const api = axios.create({
//   baseURL: process.env.REACT_APP_API_BASE_URL || 'https://coursera-clone-iti-production.up.railway.app', // Adjust your base URL
//   withCredentials: true, // If using cookies for authentication
// });

// // Request interceptor to add auth token to requests
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('userToken'); // Get token from local storage or state
    
//     if (token) {
//       config.headers['Authorization'] = `Bearer ${token}`;
//     }
    
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor to handle 401 unauthorized responses
// api.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       // If 401 response, dispatch logout action
//       store.dispatch(logout());
//       // Optionally redirect to login page
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;