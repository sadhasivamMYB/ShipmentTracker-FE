import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface FormDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
  submitText?: string;
  cancelText?: string;
  isSubmitting?: boolean;
}

export default function FormDialog({
  open,
  title,
  onClose,
  onSubmit,
  children,
  submitText = 'Save',
  cancelText = 'Cancel',
  isSubmitting = false
}: FormDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle className="flex justify-between items-center border-b border-gray-100 pb-3">
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {children}
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} color="inherit" variant="text" disabled={isSubmitting}>
          {cancelText}
        </Button>
        <Button 
          onClick={onSubmit} 
          color="primary" 
          variant="contained"
          disableElevation
          disabled={isSubmitting}
        >
          {submitText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
