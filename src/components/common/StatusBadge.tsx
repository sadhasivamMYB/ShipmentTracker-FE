import React from 'react';
import { Chip } from '@mui/material';

type StatusType = 'Waiting' | 'Uploading' | 'OCR Running' | 'Completed' | 'Failed' | 'In Progress' | 'No Uploads' | 'Complete' | 'active' | 'inactive' | "invite" | 'Uploaded';

interface StatusBadgeProps {
  status: StatusType;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';

  switch (status) {
    case 'Complete':
    case 'Completed':
    case 'Uploaded':
    case 'active':
      color = 'success';
      break;
    case 'Uploading':
    case 'OCR Running':
    case 'In Progress':
    case 'invite':
      color = 'info';
      break;
    case 'Failed':
    case 'inactive':
      color = 'error';
      break;
    case 'Waiting':
    case 'No Uploads':
      color = 'warning';
      break;
    default:
      color = 'default';
  }

  return (
    <Chip
      label={status}
      color={color}
      size="small"
      sx={{
        fontWeight: 600,
        fontSize: '0.75rem',
        borderRadius: '6px'
      }}
    />
  );
}
