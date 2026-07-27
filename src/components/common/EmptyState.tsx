import React from 'react';
import { Box, Typography } from '@mui/material';
import { FolderOpen as FolderIcon } from '@mui/icons-material';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({ 
  title = "No data found", 
  description = "Get started by creating a new workspace or uploading a document.", 
  icon 
}: EmptyStateProps) {
  return (
    <Box className="flex flex-col items-center justify-center p-12 text-center h-full w-full bg-white rounded-xl border border-gray-200">
      <Box className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
        {icon || <FolderIcon fontSize="large" />}
      </Box>
      <Typography variant="h6" className="font-semibold text-gray-900 mb-1">
        {title}
      </Typography>
      <Typography variant="body2" className="text-gray-500 max-w-sm">
        {description}
      </Typography>
    </Box>
  );
}
