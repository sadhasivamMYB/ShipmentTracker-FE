import React, { useState } from 'react';
import { Box, Button, TextField, FormControlLabel, Switch, Typography } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { type GridColDef } from '@mui/x-data-grid';
import { useForm, Controller } from 'react-hook-form';
import DataTable from '../common/DataTable';
import FormDialog from './FormDialog';
import ConfirmDialog from '../common/ConfirmDialog';
import StatusBadge from '../common/StatusBadge';
import toast from 'react-hot-toast';

type FormData = {
  name: string;
  code: string;
  description: string;
  isActive: boolean;
};

const initialData = [
  { id: 1, name: 'Purchase Order', code: 'PO', description: 'Standard PO', isActive: true, lastUpdated: '2024-01-10' },
  { id: 2, name: 'Bill of Lading', code: 'BOL', description: 'Shipping BOL', isActive: true, lastUpdated: '2024-01-11' },
];

export default function DocumentTypesTab() {
  const [rows, setRows] = useState(initialData);
  const [openForm, setOpenForm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: { name: '', code: '', description: '', isActive: true }
  });

  const handleAdd = () => {
    reset({ name: '', code: '', description: '', isActive: true });
    setEditingId(null);
    setOpenForm(true);
  };

  const handleEdit = (row: any) => {
    reset(row);
    setEditingId(row.id);
    setOpenForm(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
    setOpenConfirm(true);
  };

  const onConfirmDelete = () => {
    setRows(rows.filter(r => r.id !== deletingId));
    toast.success('Document Type deleted');
    setOpenConfirm(false);
  };

  const onSubmit = (data: FormData) => {
    if (editingId) {
      setRows(rows.map(r => r.id === editingId ? { ...r, ...data, lastUpdated: new Date().toISOString().split('T')[0] } : r));
      toast.success('Document Type updated');
    } else {
      setRows([...rows, { ...data, id: Date.now(), lastUpdated: new Date().toISOString().split('T')[0] }]);
      toast.success('Document Type created');
    }
    setOpenForm(false);
  };

  const columns: GridColDef[] = [
    { field: 'code', headerName: 'Code', width: 120 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
    { 
      field: 'isActive', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => <StatusBadge status={params.value ? 'Completed' : 'Failed'} />
    },
    { field: 'lastUpdated', headerName: 'Last Updated', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box className="flex gap-2 h-full items-center">
          <Button size="small" onClick={() => handleEdit(params.row)} startIcon={<EditIcon />}>Edit</Button>
          <Button size="small" color="error" onClick={() => handleDeleteClick(params.row.id)} startIcon={<DeleteIcon />}>Del</Button>
        </Box>
      )
    }
  ];

  return (
    <Box className="flex flex-col gap-4">
      <Box className="flex justify-between items-center">
        <Typography variant="h6" fontWeight="bold">Manage Document Types</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAdd}>
          Add Document Type
        </Button>
      </Box>

      <DataTable rows={rows} columns={columns} />

      <FormDialog
        open={openForm}
        title={editingId ? 'Edit Document Type' : 'Add Document Type'}
        onClose={() => setOpenForm(false)}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Box className="flex flex-col gap-4 mt-2">
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Name is required' }}
            render={({ field }) => (
              <TextField {...field} label="Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />
            )}
          />
          <Controller
            name="code"
            control={control}
            rules={{ required: 'Code is required' }}
            render={({ field }) => (
              <TextField {...field} label="Code" fullWidth error={!!errors.code} helperText={errors.code?.message} />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Description" fullWidth multiline rows={3} />
            )}
          />
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                label="Active"
              />
            )}
          />
        </Box>
      </FormDialog>

      <ConfirmDialog
        open={openConfirm}
        title="Delete Document Type"
        message="Are you sure you want to delete this document type? This action cannot be undone."
        onClose={() => setOpenConfirm(false)}
        onConfirm={onConfirmDelete}
      />
    </Box>
  );
}
