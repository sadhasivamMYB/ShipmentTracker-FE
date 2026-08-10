import { useParams } from 'react-router-dom';
import { Box, Paper, CircularProgress, Alert } from '@mui/material';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import DynamicForm from '../components/DynamicForm';
import type { RenderTemplateRequest } from '../types/template';
import { useGetTemplateQuery, useRenderTemplateMutation } from '../services/templateApi';

export default function TemplateDetails() {
  const { id } = useParams<{ id: string }>();

  const { data: response, isLoading: isFetching, isError } = useGetTemplateQuery(id || '', {
    skip: !id,
  });
  const template = response?.data;

  const [renderTemplate, { isLoading: isRendering }] = useRenderTemplateMutation();

  const handleFormSubmit = async (formData: RenderTemplateRequest) => {
    if (!id || !template) return;

    try {
      const blob = await renderTemplate({ id, data: formData }).unwrap();

      // Download logic
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = template.file_name ? `generated-${template.file_name}` : "document.docx";
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      URL.revokeObjectURL(url);

      toast.success('Document generated successfully!');
    } catch (err) {
      console.error('Render error:', err);
      toast.error('Failed to generate document. Please try again.');
    }
  };

  if (isFetching) {
    return (
      <Box display="flex" justifyContent="center" my={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !template) {
    return (
      <Box p={3}>
        <Alert severity="error">Failed to load template details.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <PageHeader
        title={template.name || 'Template'}
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Templates', path: '/template' },
          { label: template.name || 'Details' },
        ]}
        showBackButton
      />

      <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
        {template.formKeys && template.formKeys.length > 0 ? (
          <DynamicForm
            formKeys={template.formKeys}
            onSubmit={handleFormSubmit}
            isLoading={isRendering}
          />
        ) : (
          <Alert severity="info">This template does not have any configurable fields.</Alert>
        )}
      </Paper>
    </Box>
  );
}
