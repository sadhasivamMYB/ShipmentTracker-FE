import { useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Button, Grid, CircularProgress } from '@mui/material';
import type { FormFieldDefinition } from '../types/template';
import FormField from './FormField';

interface DynamicFormProps {
  formKeys: FormFieldDefinition[];
  onSubmit: (data: Record<string, string | number | boolean>) => void;
  isLoading: boolean;
}

export default function DynamicForm({ formKeys, onSubmit, isLoading }: DynamicFormProps) {
  // Generate Zod Schema based on formKeys
  const validationSchema = useMemo(() => {
    const schemaShape: Record<string, z.ZodTypeAny> = {};

    formKeys.forEach((key) => {
      let fieldSchema = z.string();

      if (key.required) {
        fieldSchema = fieldSchema.min(1, `${key.field_label} is required`);
      } else {
        fieldSchema = fieldSchema.optional();
      }

      // We handle everything as string on the form initially, 
      // coercions can be added here if we want strict typing.
      // E.g. for numbers we can use z.coerce.number() if needed.
      if (key.field_type.toLowerCase() === 'number') {
         let numSchema = z.coerce.number({ invalid_type_error: "Must be a number" });
         if (key.required) {
            // we can just stick to min/optional logic if we want
            // but Zod handles it cleanly this way:
            schemaShape[key.field_name] = numSchema;
         } else {
            schemaShape[key.field_name] = numSchema.optional();
         }
      } else {
         schemaShape[key.field_name] = fieldSchema;
      }
    });

    return z.object(schemaShape);
  }, [formKeys]);

  // Set default values
  const defaultValues = useMemo(() => {
    const defaults: Record<string, any> = {};
    formKeys.forEach((key) => {
      defaults[key.field_name] = key.default_value || '';
    });
    return defaults;
  }, [formKeys]);

  const methods = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues,
  });

  return (
    <FormProvider {...methods}>
      <Box component="form" onSubmit={methods.handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={3}>
          {formKeys.map((field) => (
            <Grid item xs={12} md={6} key={field.id}>
              <FormField fieldDef={field} />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {isLoading ? 'Generating...' : 'Generate Document'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </FormProvider>
  );
}
