import { Box, Typography, Breadcrumbs, Link, Button } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  breadcrumbs: { label: string; path?: string }[];
  showBackButton?: boolean;
}

export default function PageHeader({ title, breadcrumbs, showBackButton = false }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {showBackButton && (
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ mr: 2, color: 'text.secondary' }}
          >
            Back
          </Button>
        )}
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
          {breadcrumbs.map((bc, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return isLast ? (
              <Typography key={index} color="text.primary" fontWeight={500}>
                {bc.label}
              </Typography>
            ) : (
              <Link
                key={index}
                underline="hover"
                color="inherit"
                onClick={() => bc.path && navigate(bc.path)}
                sx={{ cursor: 'pointer' }}
              >
                {bc.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      </Box>
      <Typography variant="h4" component="h1" fontWeight={700} color="text.primary">
        {title}
      </Typography>
    </Box>
  );
}
