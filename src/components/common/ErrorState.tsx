import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ErrorOutline as ErrorIcon } from '@mui/icons-material';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ 
  title = "Something went wrong", 
  message = "An error occurred while loading the data. Please try again.", 
  onRetry 
}: ErrorStateProps) {
  return (
    <Box className="flex flex-col items-center justify-center p-12 text-center h-full w-full bg-white rounded-xl border border-red-100">
      <Box className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4">
        <ErrorIcon fontSize="large" />
      </Box>
      <Typography variant="h6" className="font-semibold text-gray-900 mb-1">
        {title}
      </Typography>
      <Typography variant="body2" className="text-gray-500 max-w-sm mb-6">
        {message}
      </Typography>
      {onRetry && (
        <Button variant="outlined" color="primary" onClick={onRetry} sx={{ borderRadius: '8px' }}>
          Try Again
        </Button>
      )}
    </Box>
  );
}
