import React from 'react';
import { DataGrid, GridToolbar, type GridColDef, type GridRowsProp } from '@mui/x-data-grid';
import { Box, Paper, Skeleton } from '@mui/material';

interface DataTableProps {
  rows: GridRowsProp;
  columns: GridColDef[];
  loading?: boolean;
  pageSize?: number;
}

export default function DataTable({ rows, columns, loading, pageSize = 10 }: DataTableProps) {
  
  if (loading) {
    return (
      <Paper elevation={0} className="w-full rounded-xl overflow-hidden shadow-sm border border-gray-200">
        <Box sx={{ p: 2 }}>
          {Array.from(new Array(pageSize)).map((_, index) => (
            <Skeleton key={index} animation="wave" height={52} sx={{ my: 0.5 }} />
          ))}
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} className="w-full h-[600px] rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-white">
      <DataGrid
        rows={rows}
        columns={columns}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        initialState={{
          pagination: {
            paginationModel: { pageSize },
          },
        }}
        pageSizeOptions={[5, 10, 25, 50]}
        disableRowSelectionOnClick
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
        }}
      />
    </Paper>
  );
}
