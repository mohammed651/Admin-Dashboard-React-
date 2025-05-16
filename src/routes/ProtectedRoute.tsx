// src/routes/ProtectedRoute.tsx
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children }) => {
  // Get token from localStorage
  const token = localStorage.getItem('userToken');

  // Function to check token expiry
  const isTokenExpired = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decode token payload
      const expiry = payload.exp * 1000; // Convert to milliseconds
      return Date.now() > expiry; // Check if current time is past expiry
    } catch (err) {
      console.error("Error decoding token:", err);
      return true; // Treat invalid tokens as expired
    }
  };

  // Check token and expiry
  useEffect(() => {
    if (token && isTokenExpired(token)) {
      localStorage.removeItem('userToken'); // Remove expired token
      window.location.href = '/login'; // Force redirect to login
    }
  }, [token]);

  // If no token or token is expired, redirect to login
  if (!token || (token && isTokenExpired(token))) {
    return <Navigate to="/login" replace />;
  }

  return children;
};