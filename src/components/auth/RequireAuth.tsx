import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface RequireAuthProps {
  allowedRole: 'client' | 'host';
}

const RequireAuth: React.FC<RequireAuthProps> = ({ allowedRole }) => {
  const { userRole } = useAuthStore();
  const location = useLocation();

  if (userRole !== allowedRole) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default RequireAuth;