import React, { useCallback } from 'react';
import { Card, CardContent, Typography, Box, Button, IconButton, Paper, alpha, useTheme } from '@mui/material';
import { CloudUpload as CloudUploadIcon, CheckCircle as CheckCircleIcon, Refresh as RefreshIcon, FileDownload as FileDownloadIcon, Visibility, Description as DescriptionIcon, UploadFile as UploadFileIcon } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import StatusBadge from '../common/StatusBadge';

interface UploadCardProps {
  documentName: string;
  status: 'Waiting' | 'Uploading' | 'OCR Running' | 'Completed' | 'Failed' | 'Uploaded';
  ocrStatus?: string;
  uploadTimestamp?: string;
  fileUrl?: string;
  onUpload: (file: File) => void;
}

export default function UploadCard({ documentName, status, ocrStatus, uploadTimestamp, fileUrl, onUpload }: UploadCardProps) {
  const theme = useTheme();
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

  const handleView = () => {
    if (fileUrl) {
      window.open(`http://localhost:5000/${fileUrl}`, '_blank');
    }
  };

  return (
    <Card 
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: isDragActive ? 'primary.main' : 'divider',
        bgcolor: isDragActive ? alpha(theme.palette.primary.main, 0.04) : 'background.paper',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`,
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardContent sx={{ p: '24px !important', display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header Section */}
        <Box className="flex justify-between items-start mb-4">
          <Box className="flex gap-3 items-center">
            <Box 
              sx={{ 
                p: 1.2, 
                borderRadius: 2, 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <DescriptionIcon />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ fontSize: '1.1rem', lineHeight: 1.2 }}>
                {documentName}
              </Typography>
              {uploadTimestamp && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Updated: {uploadTimestamp}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton size="small" sx={{ bgcolor: 'grey.50', '&:hover': { bgcolor: 'grey.200' }, visibility: fileUrl ? 'visible' : 'hidden' }} onClick={handleView}>
            <Visibility fontSize="small" />
          </IconButton>
        </Box>

        <Box className="flex gap-2 items-center mb-5">
          <StatusBadge status={status} />
          {ocrStatus && (
            <StatusBadge status={ocrStatus as any} />
          )}
        </Box>

        {/* Action Section */}
        <Box sx={{ mt: 'auto' }}>
          {canUpload ? (
            <Paper
              {...getRootProps()}
              elevation={0}
              sx={{
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'grey.300',
                bgcolor: isDragActive ? alpha(theme.palette.primary.main, 0.04) : 'grey.50',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                }
              }}
            >
              <input {...getInputProps()} />
              <Box className="flex flex-col items-center justify-center gap-1">
                <UploadFileIcon sx={{ fontSize: 32, color: isDragActive ? 'primary.main' : 'text.secondary', mb: 1 }} />
                <Typography variant="body2" fontWeight={600} color="text.primary">
                  {status === 'Completed' || status === 'Uploaded' ? 'Drop file to replace' : 'Click or drop file here'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  PDF or image files (max 10MB)
                </Typography>
              </Box>
            </Paper>
          ) : (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<FileDownloadIcon />}
              sx={{ 
                borderRadius: 2, 
                py: 1.2,
                boxShadow: 'none',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                }
              }}
              disabled={status !== 'Completed' && status !== 'Uploaded'}
              onClick={handleView}
            >
              Download Document
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
