import { TextField } from '@mui/material';
import { useFormContext, Controller } from 'react-hook-form';
import type { FormFieldDefinition } from '../types/template';

interface FormFieldProps {
  fieldDef: FormFieldDefinition;
}

export default function FormField({ fieldDef }: FormFieldProps) {
  const { control } = useFormContext();

  // Map backend field_type to HTML input type
  const getInputType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'number':
        return 'number';
      case 'date':
        return 'date';
      case 'email':
        return 'email';
      default:
        return 'text';
    }
  };

  return (
    <Controller
      name={fieldDef.field_name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          fullWidth
          type={getInputType(fieldDef.field_type)}
          label={fieldDef.field_label}
          required={fieldDef.required}
          error={!!error}
          helperText={error?.message}
          variant="outlined"
          InputLabelProps={
            fieldDef.field_type.toLowerCase() === 'date' ? { shrink: true } : undefined
          }
        />
      )}
    />
  );
}
