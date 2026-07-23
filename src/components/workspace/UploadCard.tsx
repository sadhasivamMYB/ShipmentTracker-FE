import React, { useCallback } from 'react';
import { Card, CardContent, Typography, Box, Button, IconButton } from '@mui/material';
import { CloudUpload as CloudUploadIcon, CheckCircle as CheckCircleIcon, Refresh as RefreshIcon, FileDownload as FileDownloadIcon, Visibility } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import StatusBadge from '../common/StatusBadge';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

interface UploadCardProps {
  documentName: string;
  status: 'Waiting' | 'Uploading' | 'OCR Running' | 'Completed' | 'Failed';
  ocrStatus?: string;
  currentVersion?: string;
  uploadTimestamp?: string;
  onUpload: (file: File) => void;
}

export default function UploadCard({ documentName, status, ocrStatus, currentVersion, uploadTimestamp, onUpload }: UploadCardProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const canUpload = user?.role === 'admin';

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0 && canUpload) {
      onUpload(acceptedFiles[0]);
    }
  }, [canUpload, onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    disabled: !canUpload
  });

  return (
    <Card className={`border ${isDragActive ? 'border-primary bg-blue-50' : 'border-gray-200'}`}>
      <CardContent className="p-4">
        <Box className="flex justify-between items-start mb-3">
          <Typography fontWeight={600} color="text.primary">
            {documentName}
          </Typography>
          {/* <StatusBadge status={status} /> */}
          <IconButton>
            <Visibility />
          </IconButton>
        </Box>

        <Box className="flex flex-col gap-1 mb-4">

          {uploadTimestamp && (
            <Typography variant="body2" color="text.secondary">
              Updated: {uploadTimestamp}
            </Typography>
          )}
          {ocrStatus && (
            <Typography variant="body2" color="text.secondary">
              OCR: <span className={ocrStatus === 'Success' ? 'text-green-600 font-medium' : 'text-gray-900 font-medium'}>{ocrStatus}</span>
            </Typography>
          )}
        </Box>

        {canUpload ? (
          <Box className="flex gap-2">
            <Box {...getRootProps()} className="w-full">
              <input {...getInputProps()} />
              <Button
                variant={status === 'Completed' ? 'outlined' : 'contained'}
                color="primary"
                fullWidth
                startIcon={status === 'Completed' ? <RefreshIcon /> : <CloudUploadIcon />}
                size="small"
                sx={{ borderRadius: '6px' }}
              >
                {status === 'Completed' ? 'Replace' : 'Upload'}
              </Button>
            </Box>
          </Box>
        ) : (
          <Box>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              startIcon={<FileDownloadIcon />}
              size="small"
              sx={{ borderRadius: '6px' }}
              disabled={status !== 'Completed'}
            >
              Download
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
