import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import toast from 'react-hot-toast';
import { useUploadTemplateMutation, useUpdateTemplateMutation } from '../services/templateApi';

interface TemplateUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  templateId?: number | null;
  initialName?: string;
}

export default function TemplateUploadDialog({ open, onClose, onSuccess, templateId, initialName }: TemplateUploadDialogProps) {
  const [templateName, setTemplateName] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [uploadTemplate, { isLoading: isUploading }] = useUploadTemplateMutation();
  const [updateTemplate, { isLoading: isUpdating }] = useUpdateTemplateMutation();
  const isLoading = isUploading || isUpdating;

  useEffect(() => {
    if (open) {
      if (templateId && initialName) {
        setTemplateName(initialName);
      } else {
        setTemplateName('');
      }
      setSelectedFile(null);
    }
  }, [open, templateId, initialName]);

  const handleClose = () => {
    if (!isLoading) {
      setTemplateName('');
      setSelectedFile(null);
      onClose();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.docx')) {
        setSelectedFile(file);
      } else {
        toast.error('Invalid file type. Only .docx files are accepted.');
        e.target.value = ''; // clear input
      }
    }
  };

  const handleSubmit = async () => {
    if (!templateName) return;
    if (!templateId && !selectedFile) return; // File is required for new

    const formData = new FormData();
    formData.append('templateName', templateName);
    if (selectedFile) {
      formData.append('template', selectedFile);
    }

    try {
      if (templateId) {
        await updateTemplate({ id: String(templateId), formData }).unwrap();
        toast.success('Template updated successfully.');
      } else {
        await uploadTemplate(formData).unwrap();
        toast.success('Template uploaded successfully.');
      }
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(`Failed to ${templateId ? 'update' : 'upload'} template. Please try again.`);
    }
  };

  const isValid = templateName.trim() !== '' && (templateId ? true : selectedFile !== null);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {templateId ? 'Update Template' : 'Upload New Template'}
        <IconButton onClick={handleClose} disabled={isLoading} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <TextField
          fullWidth
          label="Template Name"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          disabled={isLoading}
          sx={{ mb: 3 }}
          required
        />

        <Box
          sx={{
            border: '2px dashed',
            borderColor: 'grey.300',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            bgcolor: 'grey.50',
            position: 'relative'
          }}
        >
          {!selectedFile ? (
            <>
              <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
              <Typography variant="body1" gutterBottom>
                {templateId ? 'Replace DOCX Template (Optional)' : 'Upload DOCX Template'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Click to select a file
              </Typography>
              <Button
                variant="outlined"
                component="label"
                disabled={isLoading}
              >
                Select File
                <input
                  type="file"
                  hidden
                  accept=".docx"
                  onChange={handleFileChange}
                />
              </Button>
            </>
          ) : (
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Selected: {selectedFile.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {(selectedFile.size / 1024).toFixed(2)} KB
              </Typography>
              <Button
                color="error"
                size="small"
                onClick={() => setSelectedFile(null)}
                disabled={isLoading}
              >
                Remove File
              </Button>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!isValid || isLoading}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isLoading ? (templateId ? 'Updating...' : 'Uploading...') : (templateId ? 'Update' : 'Upload')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
