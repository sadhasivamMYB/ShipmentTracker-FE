import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useGetMeQuery } from '../../services/appApi';
import { Box, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'admin' | 'user'>;
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  // const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const location = useLocation();

  const { data: data, isLoading } = useGetMeQuery()


  if (isLoading) {
    return <Box sx={{ display: "flex", flexDirection: 'column', width: "100vw", height: "100vh", alignItems: "center", justifyContent: "center" }}>

      <CircularProgress />
      <p>Loading...</p>
    </Box>
  }
  if (!data) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(data?.user?.role)) {
    // If they don't have the required role, redirect to the home page or a not-authorized page
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
