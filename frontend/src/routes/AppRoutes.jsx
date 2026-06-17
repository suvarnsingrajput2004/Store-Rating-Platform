import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from '../layouts/MainLayout';

// Pages
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import ChangePassword from '../pages/ChangePassword';
import Unauthorized from '../pages/Unauthorized';

// Admin Pages
import AdminDashboard from '../pages/AdminDashboard';
import ManageUsers from '../pages/ManageUsers';
import ManageStores from '../pages/ManageStores';
import UserDetails from '../pages/UserDetails';
import StoreDetails from '../pages/StoreDetails';
import StoreListing from '../pages/StoreListing';
import UserStoreDetails from '../pages/UserStoreDetails';
import MyRatings from '../pages/MyRatings';
import OwnerDashboard from '../pages/OwnerDashboard';

// Simple placeholder page components for roles (fully fleshed out in Phase 3)
const UserDashboardPlaceholder = () => (
  <Box sx={{ textAlign: 'center', mt: 5 }}>
    <Typography variant="h4">User Dashboard</Typography>
    <Typography variant="body1">Welcome! (Phase 3 will implement store listing and ratings here)</Typography>
  </Box>
);

const StoreListingPlaceholder = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h2>Store Listing</h2>
    <p>Welcome! Phase 1 & 2 complete. Store rating features will be enabled in Phase 3.</p>
  </div>
);

// Route redirection based on role
const RoleHomeRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'ADMIN':
      return <Navigate to="/admin/dashboard" replace />;
    case 'STORE_OWNER':
      return <Navigate to="/owner/dashboard" replace />;
    case 'USER':
    default:
      return <Navigate to="/stores" replace />;
  }
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Shared Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout>
              <RoleHomeRedirect />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ChangePassword />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Protected Admin Routes (Phase 2 Target) */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <MainLayout>
              <AdminDashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <MainLayout>
              <ManageUsers />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/:id"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <MainLayout>
              <UserDetails />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/stores"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <MainLayout>
              <ManageStores />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/stores/:id"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <MainLayout>
              <StoreDetails />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Protected Store Owner Routes (Phase 3) */}
      <Route
        path="/owner/dashboard"
        element={
          <ProtectedRoute allowedRoles={['STORE_OWNER']}>
            <MainLayout>
              <OwnerDashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Protected Shared User/Admin/Owner Routes (Phase 3) */}
      <Route
        path="/stores"
        element={
          <ProtectedRoute allowedRoles={['USER', 'ADMIN', 'STORE_OWNER']}>
            <MainLayout>
              <StoreListing />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/stores/:id"
        element={
          <ProtectedRoute allowedRoles={['USER', 'ADMIN', 'STORE_OWNER']}>
            <MainLayout>
              <UserStoreDetails />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Protected Normal User Only Routes (Phase 3) */}
      <Route
        path="/my-ratings"
        element={
          <ProtectedRoute allowedRoles={['USER']}>
            <MainLayout>
              <MyRatings />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
