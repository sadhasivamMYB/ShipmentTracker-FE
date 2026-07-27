import React from 'react';
import { Box, Button, TextField, Typography, Card, CardContent, Divider, FormControlLabel, Switch } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';

type FormData = {
  companyName: string;
  supportEmail: string;
  ocrConfidenceThreshold: number;
  enableEmailNotifications: boolean;
  requireAdminApproval: boolean;
};

export default function SettingsTab() {
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: {
      companyName: 'DocTracker Enterprise',
      supportEmail: 'support@doctracker.com',
      ocrConfidenceThreshold: 85,
      enableEmailNotifications: true,
      requireAdminApproval: false,
    }
  });

  const onSubmit = (data: FormData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        toast.success('Global settings updated successfully');
        resolve(true);
      }, 1000);
    });
  };

  return (
    <Box className="flex flex-col gap-6 max-w-4xl">
      <Box className="flex justify-between items-center mb-2">
        <Typography variant="h6" fontWeight="bold">Global Settings</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<SaveIcon />} 
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
            General Information
          </Typography>
          <Divider />
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <Controller
              name="companyName"
              control={control}
              rules={{ required: 'Company name is required' }}
              render={({ field }) => (
                <TextField {...field} label="Company Name" fullWidth error={!!errors.companyName} helperText={errors.companyName?.message} />
              )}
            />
            <Controller
              name="supportEmail"
              control={control}
              rules={{ 
                required: 'Support email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
              }}
              render={({ field }) => (
                <TextField {...field} label="Support Email" type="email" fullWidth error={!!errors.supportEmail} helperText={errors.supportEmail?.message} />
              )}
            />
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
            OCR & Workflow Configuration
          </Typography>
          <Divider />
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <Controller
              name="ocrConfidenceThreshold"
              control={control}
              rules={{ 
                required: 'Threshold is required',
                min: { value: 0, message: 'Minimum is 0' },
                max: { value: 100, message: 'Maximum is 100' }
              }}
              render={({ field }) => (
                <TextField 
                  {...field} 
                  label="OCR Confidence Threshold (%)" 
                  type="number" 
                  fullWidth 
                  error={!!errors.ocrConfidenceThreshold} 
                  helperText={errors.ocrConfidenceThreshold?.message || "Minimum confidence to skip manual review"} 
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            <Box className="flex flex-col justify-center">
              <Controller
                name="requireAdminApproval"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                    label="Require admin approval for all failed OCR extractions"
                  />
                )}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
            Notifications
          </Typography>
          <Divider />
          <Box className="mt-2">
            <Controller
              name="enableEmailNotifications"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label="Enable system-wide email notifications for errors"
                />
              )}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
