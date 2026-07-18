import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Spin } from 'antd';

export async function loader() {
  return null;
}

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/system/login" replace />;
  }

  return <Outlet />;
};


export default ProtectedRoute;
