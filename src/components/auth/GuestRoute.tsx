import React from 'react';
import { Navigate } from 'react-router-dom';
import { useGetMeQuery } from '../../services/appApi';
import { Box, CircularProgress } from '@mui/material';

interface GuestRouteProps {
  children: React.ReactNode;
}

export default function GuestRoute({ children }: GuestRouteProps) {
  const { data, isLoading, isFetching } = useGetMeQuery();

  if (isLoading || (isFetching && !data)) {
    return (
      <Box sx={{ display: "flex", flexDirection: 'column', width: "100vw", height: "100vh", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
        <p>Loading...</p>
      </Box>
    );
  }

  if (data?.user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
