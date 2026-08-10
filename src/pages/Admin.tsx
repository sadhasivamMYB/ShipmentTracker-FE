import React from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import DocumentTypesTab from '../components/admin/DocumentTypesTab';
// import FieldDefinitionsTab from '../components/admin/FieldDefinitionsTab';
import UserManagementTab from '../components/admin/UserManagementTab';

export default function Admin() {
  const [tabIndex, setTabIndex] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Box className="flex flex-col gap-6 h-full">
      <Typography variant="h5" fontWeight="bold" color="text.primary">
        Administration
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabIndex} onChange={handleTabChange} aria-label="admin tabs">
          <Tab label="Document Types" />
          {/* <Tab label="Field Definitions" /> */}``
          <Tab label="User Management" />
        </Tabs>
      </Box>

      <Box className="flex-1 pb-10">
        {tabIndex === 0 && <DocumentTypesTab />}
        {/* {tabIndex === 1 && <FieldDefinitionsTab />} */}
        {tabIndex === 1 && <UserManagementTab />}
      </Box>
    </Box>
  );
}
