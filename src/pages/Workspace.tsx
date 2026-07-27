import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Breadcrumbs, Link, Select, MenuItem, FormControl, InputLabel, Button, TextField, InputAdornment, CircularProgress } from '@mui/material';
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
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const documentTypes = [
  { id: 1, name: 'Order' },
  { id: 2, name: 'Insurance' },
  { id: 3, name: 'Bill of Lading' },
  { id: 4, name: 'Export PFI' },
  { id: 5, name: 'Form M' },
  { id: 6, name: 'PAAR' },
  { id: 7, name: 'Export Assessment' }
];

export default function Workspace() {
  const [year, setYear] = useState(2024);
  const [month, setMonth] = useState('January');
  const [search, setSearch] = useState('');

  const [workspace, setWorkspace] = useState<any>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const user = useSelector((state: RootState) => state.auth.user);
  const canUpload = user?.role?.toLowerCase() === 'admin';

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Workspace
      const wsRes = await api.get(`/workspace?year=${year}&month=${month}`);
      const wsData = wsRes.data.data;
      setWorkspace(wsData);

      console.log(wsData, "✅✅✅")

      if (wsData) {
        // 2. Fetch Summary
        const sumRes = await api.get(`/summary?workspaceId=${wsData.id}`);
        console.log(sumRes)
        setRows(sumRes.data.data);
      } else {
        setRows([]);
      }
    } catch (error) {
      console.error("Failed to fetch workspace data", error);
      setWorkspace(null);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [year, month]);

  const handleUpload = async (file: File, documentTypeId: number) => {
    if (!workspace) {
      toast.error("Workspace not found for this month.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('workspaceId', workspace.id.toString());
    formData.append('documentTypeId', documentTypeId.toString());

    try {
      const toastId = toast.loading(`Uploading ${file.name}...`);
      await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Upload successful and OCR processing started", { id: toastId });
      fetchData(); // Refresh summary table
    } catch (error) {
      console.error("Upload error", error);
      toast.error("Upload failed");
    }
  };

  const handleExport = async () => {
    if (!workspace) return;
    try {
      const response = await api.get(`/summary/export?workspaceId=${workspace.id}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Summary_${month}_${year}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Export error", error);
      toast.error("Failed to export Excel");
    }
  };

  const dynamicColumns: GridColDef[] = useMemo(() => {
    if (rows.length === 0) return [];
    const allKeys = new Set<string>();
    rows.forEach(row => Object.keys(row).forEach(k => k !== 'id' && allKeys.add(k)));

    const cols = Array.from(allKeys).map(key => {
      let renderCell = undefined;
      
      if (key === 'status') {
        renderCell = (params: any) => <StatusBadge status={params.value} />;
      } else {
        renderCell = (params: any) => {
          const val = params.value;
          if (val === null || val === undefined || String(val).trim() === '') {
            return <span className="text-gray-400">-</span>;
          }
          return <span>{String(val)}</span>;
        };
      }

      return {
        field: key,
        headerName: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        width: 150,
        renderCell
      };
    });

    // Ensure PFI Number is first
    const pfiIndex = cols.findIndex(c => c.field === 'pfiNumber');
    if (pfiIndex > -1) {
      const pfiCol = cols.splice(pfiIndex, 1)[0];
      cols.unshift(pfiCol);
    }
    return cols;
  }, [rows]);

  const filteredRows = rows.filter(row =>
    Object.values(row).some(val =>
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

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
                <MenuItem value={2025}>2025</MenuItem>
                <MenuItem value={2026}>2026</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Month</InputLabel>
              <Select value={month} label="Month" onChange={(e) => setMonth(e.target.value)}>
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                  <MenuItem key={m} value={m}>{m}</MenuItem>
                ))}
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
            <Button variant="outlined" startIcon={<RefreshIcon />} size="small" onClick={fetchData}>
              Refresh
            </Button>
            <Button variant="contained" startIcon={<DownloadIcon />} size="small" onClick={handleExport} disabled={!workspace || rows.length === 0}>
              Export Excel
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box className="flex justify-center p-8"><CircularProgress /></Box>
        ) : !workspace ? (
          <Box className="flex flex-col items-center justify-center p-8 gap-4 text-gray-500">
            <Typography>Workspace not created for this month yet.</Typography>
            {canUpload && (
              <Button variant="contained" onClick={async () => {
                try {
                  const toastId = toast.loading("Creating workspace...");
                  await api.post('/workspace', { year, month });
                  toast.success("Workspace created!", { id: toastId });
                  fetchData();
                } catch (e) {
                  toast.error("Failed to create workspace");
                }
              }}>Initialize Workspace</Button>
            )}
          </Box>
        ) : (
          <DataTable rows={filteredRows} columns={dynamicColumns} />
        )}
      </Box>

      {canUpload && (
        <Box>
          <Typography variant="h6" fontWeight="bold" className="mb-4">
            Required Documents (Admin Upload)
          </Typography>
          <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {documentTypes.map((doc) => (
              <UploadCard
                key={doc.id}
                documentName={doc.name}
                status={'Waiting'}
                onUpload={(file) => handleUpload(file, doc.id)}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
