import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Box, CircularProgress } from '@mui/material';

/**
 * Route protection wrapper that enforces authentication and authorization rules
 * @param {React.ReactNode} children - The component to render
 * @param {Array<string>} allowedRoles - Optional list of roles permitted to view this route
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#0d0e12'
        }}
      >
        <CircularProgress sx={{ color: '#635bff' }} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login, storing original location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to unauthorized route
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
