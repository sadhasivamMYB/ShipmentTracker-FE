import React, { useState } from 'react';
import { Box, Typography, Breadcrumbs, Link, Select, MenuItem, FormControl, InputLabel, Button, TextField, InputAdornment } from '@mui/material';
import { type GridColDef } from '@mui/x-data-grid';
import { 
  NavigateNext as NavigateNextIcon, 
  Search as SearchIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon 
} from '@mui/icons-material';
import DataTable from '../components/common/DataTable';
import UploadCard from '../components/workspace/UploadCard';
import StatusBadge from '../components/common/StatusBadge';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

const columns: GridColDef[] = [
  { field: 'pfiNumber', headerName: 'PFI Number', width: 130 },
  { field: 'pfiInvoice', headerName: 'PFI Invoice', width: 130 },
  { field: 'skuName', headerName: 'SKU Name', width: 150 },
  { field: 'quantity', headerName: 'Quantity', width: 100, type: 'number' },
  { field: 'asforPfi', headerName: 'Asfor PFI', width: 120 },
  { field: 'priceCheck', headerName: 'Price Check', width: 120 },
  { field: 'insuranceDate', headerName: 'Insurance Date', width: 130 },
  { field: 'naicomId', headerName: 'Naicom ID', width: 120 },
  { field: 'premiumAmount', headerName: 'Premium Amount', width: 140, type: 'number' },
  { field: 'blNumber', headerName: 'BL Number', width: 130 },
  { field: 'sealNumber', headerName: 'Seal Number', width: 120 },
  { field: 'containerSize', headerName: 'Container Size', width: 120 },
  { field: 'exportPfi', headerName: 'Export PFI', width: 120 },
  { field: 'formMNumber', headerName: 'Form M Number', width: 130 },
  { field: 'paarNumber', headerName: 'PAAR Number', width: 130 },
  { field: 'dutyAmount', headerName: 'Duty Amount', width: 120, type: 'number' },
  { field: 'cno', headerName: 'CNO', width: 100 },
  { 
    field: 'status', 
    headerName: 'Status', 
    width: 150,
    renderCell: (params) => <StatusBadge status={params.value} />
  },
];

const initialRows = [
  { 
    id: 1, 
    pfiNumber: 'PFI-1001', 
    pfiInvoice: 'INV-1001', 
    skuName: 'Widget A', 
    quantity: 500, 
    asforPfi: 'Yes', 
    priceCheck: 'Passed', 
    insuranceDate: '2024-01-05', 
    naicomId: 'NID-9921', 
    premiumAmount: 250.00, 
    blNumber: 'BL-44912', 
    sealNumber: 'SL-99', 
    containerSize: '40ft', 
    exportPfi: 'EXP-101', 
    formMNumber: 'FM-771', 
    paarNumber: 'PR-882', 
    dutyAmount: 1500.00, 
    cno: 'CNO-1', 
    status: 'Completed' 
  },
  { 
    id: 2, 
    pfiNumber: 'PFI-1002', 
    pfiInvoice: 'INV-1002', 
    skuName: 'Widget B', 
    quantity: 1200, 
    asforPfi: 'Pending', 
    priceCheck: 'Failed', 
    insuranceDate: '2024-01-08', 
    naicomId: 'NID-9922', 
    premiumAmount: 540.00, 
    blNumber: 'BL-44913', 
    sealNumber: 'SL-88', 
    containerSize: '20ft', 
    exportPfi: 'EXP-102', 
    formMNumber: 'FM-772', 
    paarNumber: 'PR-883', 
    dutyAmount: 3200.00, 
    cno: 'CNO-2', 
    status: 'Failed' 
  },
  { 
    id: 3, 
    pfiNumber: 'PFI-1003', 
    pfiInvoice: 'INV-1003', 
    skuName: 'Widget C', 
    quantity: 300, 
    asforPfi: 'Yes', 
    priceCheck: 'Passed', 
    insuranceDate: '2024-01-10', 
    naicomId: 'NID-9923', 
    premiumAmount: 120.00, 
    blNumber: 'BL-44914', 
    sealNumber: 'SL-77', 
    containerSize: '40ft', 
    exportPfi: 'EXP-103', 
    formMNumber: 'FM-773', 
    paarNumber: 'PR-884', 
    dutyAmount: 900.00, 
    cno: 'CNO-3', 
    status: 'Pending OCR' 
  }
];

const documentTypes = [
  'Order', 'Insurance', 'Bill of Lading', 'Export PFI', 'Form M', 'PAAR', 'Export Assessment'
];

export default function Workspace() {
  const [year, setYear] = useState(2024);
  const [month, setMonth] = useState('January');
  const [search, setSearch] = useState('');
  
  const user = useSelector((state: RootState) => state.auth.user);
  const canUpload = user?.role === 'admin';

  return (
    <Box className="flex flex-col gap-6">
      <Box className="flex flex-col gap-4">
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/">
            Workspaces
          </Link>
          <Typography color="text.primary">Monthly Review</Typography>
        </Breadcrumbs>

        <Box className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Typography variant="h5" fontWeight="bold" color="text.primary">
            Workspace: {month} {year}
          </Typography>
          <Box className="flex gap-4">
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Year</InputLabel>
              <Select value={year} label="Year" onChange={(e) => setYear(Number(e.target.value))}>
                <MenuItem value={2023}>2023</MenuItem>
                <MenuItem value={2024}>2024</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Month</InputLabel>
              <Select value={month} label="Month" onChange={(e) => setMonth(e.target.value)}>
                <MenuItem value="January">January</MenuItem>
                <MenuItem value="February">February</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Box>

      <Box className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
        <Box className="flex justify-between items-center">
          <Typography variant="h6" fontWeight="bold">Summary Data</Typography>
          <Box className="flex gap-2">
            <TextField
              size="small"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Button variant="outlined" startIcon={<RefreshIcon />} size="small">
              Refresh
            </Button>
            <Button variant="contained" startIcon={<DownloadIcon />} size="small">
              Export Excel
            </Button>
          </Box>
        </Box>
        
        <DataTable rows={initialRows} columns={columns} />
      </Box>

      {canUpload && (
        <Box>
          <Typography variant="h6" fontWeight="bold" className="mb-4">
            Required Documents (Admin Upload)
          </Typography>
          <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {documentTypes.map((doc, idx) => (
              <UploadCard 
                key={doc}
                documentName={doc}
                status={idx === 0 ? 'Completed' : (idx === 1 ? 'OCR Running' : 'Waiting')}
                currentVersion={idx === 0 ? 'v1.2' : undefined}
                uploadTimestamp={idx === 0 ? 'Jan 10, 2024 10:30 AM' : undefined}
                ocrStatus={idx === 0 ? 'Success' : undefined}
                onUpload={(file) => console.log('Uploading', file.name, 'for', doc)}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
