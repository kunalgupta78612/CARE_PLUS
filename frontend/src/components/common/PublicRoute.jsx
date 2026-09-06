import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getAuthToken } from '../../api/authApi';

export const getDashboardForRole = (role) => {
  switch (role) {
    case 'patient':
      return '/patient-dashboard';
    case 'doctor':
      return '/doctor-dashboard';
    case 'admin':
      return '/admin-dashboard';
    case 'receptionist':
      return '/receptionist-dashboard';
    default:
      return '/patient-dashboard';
  }
};

export const PublicRoute = () => {
  const token = getAuthToken();
  const storedUserJson = localStorage.getItem('careplus_patient_user');
  const user = storedUserJson ? JSON.parse(storedUserJson) : null;

  // If user is already logged in, block access to Login/Register and redirect to their role dashboard
  if (token && user) {
    const dashboardPath = getDashboardForRole(user.role);
    return <Navigate to={dashboardPath} replace />;
  }

  return <Outlet />;
};
