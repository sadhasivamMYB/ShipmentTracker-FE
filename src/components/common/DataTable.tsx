import React from 'react';
import { DataGrid, type GridColDef, type GridRowsProp } from '@mui/x-data-grid';
import { Paper } from '@mui/material';

interface DataTableProps {
  rows: GridRowsProp;
  columns: GridColDef[];
  loading?: boolean;
}

export default function DataTable({ rows, columns, loading }: DataTableProps) {

  if (loading) {
    return (
      <Paper elevation={0} className="w-full rounded-xl overflow-hidden shadow-sm border border-gray-200">
      </Paper>
    );
  }

  return (
    <Paper className="w-full  min-h-37.5 rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-white">
      <DataGrid
        rows={rows}
        columns={columns}
        sx={{
          border: 0,
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#F8FAFC',
            borderBottom: '1px solid #E5E7EB',
            color: '#6B7280',
            fontWeight: 600,
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #E5E7EB',
            color: '#111827',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#F3F4F6',
          },
          '& .MuiDataGrid-row': {
            minHeight: '62.5px',
          },
        }}
      />
    </Paper>
  );
}
