import { useState } from 'react';
import { Box, Grid, Typography, CircularProgress, Alert, Button } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useNavigate } from 'react-router-dom';
import type { Template } from '../types/template';
import TemplateCard from '../components/templateCard';
import PageHeader from '../components/PageHeader';
import TemplateUploadDialog from '../components/TemplateUploadDialog';
import { useGetTemplatesQuery } from '../services/templateApi';

export default function TemplateList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editTemplateId, setEditTemplateId] = useState<number | null>(null);
  const [editTemplateName, setEditTemplateName] = useState<string>('');
  const navigate = useNavigate();

  const { data: response, isLoading, isError, refetch: fetchTemplates } = useGetTemplatesQuery();
  const templates = response?.data as Template[];

  const handleOpenCreate = () => {
    setEditTemplateId(null);
    setEditTemplateName('');
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (template: Template) => {
    setEditTemplateId(template.id);
    setEditTemplateName(template.name);
    setIsDialogOpen(true);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <PageHeader
          title="Templates"
          breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'Templates' }]}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<UploadFileIcon />}
          onClick={handleOpenCreate}
        >
          Upload New Template
        </Button>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load templates. Please try again later.
        </Alert>
      )}

      {!isLoading && !isError && (!templates || templates.length === 0) && (
        <Box sx={{ textAlign: 'center', py: 5, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography color="text.secondary">No templates found.</Typography>
        </Box>
      )}

      {templates && templates.length > 0 && (
        <Grid container spacing={3} sx={{ marginTop: "20px" }}>
          {templates.map((template) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={template.id}>
              <TemplateCard
                name={template.name}
                createdAt={template.createdAt || 'N/A'}
                updatedAt={template.updatedAt || 'N/A'}
                onClick={() => navigate(`/template/${template.id}`)}
                onEdit={() => handleOpenEdit(template)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <TemplateUploadDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={fetchTemplates}
        templateId={editTemplateId}
        initialName={editTemplateName}
      />
    </Box>
  );
}
