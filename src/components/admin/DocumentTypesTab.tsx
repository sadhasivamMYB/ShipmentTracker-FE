import React, { useState } from 'react';
import { Box, Button, TextField, FormControlLabel, Switch, Typography, CircularProgress } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { type GridColDef } from '@mui/x-data-grid';
import { useForm, Controller } from 'react-hook-form';
import DataTable from '../common/DataTable';
import FormDialog from './FormDialog';
// import ConfirmDialog from '../common/ConfirmDialog';
import StatusBadge from '../common/StatusBadge';
import toast from 'react-hot-toast';
import {
  useGetDocumentTypesQuery,
  useCreateDocumentTypeMutation,
  useUpdateDocumentTypeMutation,
  useDeleteDocumentTypeMutation
} from '../../services/appApi';

type FormData = {
  name: string;
  documentCode: string;
  description: string;
  isActive: boolean;
};

export default function DocumentTypesTab() {
  const { data: response, isLoading } = useGetDocumentTypesQuery();
  const [createDocumentType] = useCreateDocumentTypeMutation();
  const [updateDocumentType] = useUpdateDocumentTypeMutation();
  // const [deleteDocumentType] = useDeleteDocumentTypeMutation();

  const rows = response?.data || [];

  const [openForm, setOpenForm] = useState(false);
  // const [openConfirm, setOpenConfirm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  // const [deletingId, setDeletingId] = useState<number | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: { name: '', documentCode: '', description: '', isActive: true }
  });

  const handleAdd = () => {
    reset({ name: '', documentCode: '', description: '', isActive: true });
    setEditingId(null);
    setOpenForm(true);
  };

  const handleEdit = (row: any) => {
    reset({
      name: row.name,
      documentCode: row.documentCode,
      description: row.description || '',
      isActive: row.status === 'active'
    });
    setEditingId(row.id);
    setOpenForm(true);
  };

  // const handleDeleteClick = (id: number) => {
  //   setDeletingId(id);
  //   setOpenConfirm(true);
  // };

  // const onConfirmDelete = async () => {
  //   if (deletingId) {
  //     try {
  //       await deleteDocumentType(deletingId).unwrap();
  //       toast.success('Document Type deleted');
  //     } catch (error: any) {
  //       toast.error(error?.data?.message || 'Failed to delete Document Type');
  //     }
  //   }
  //   setOpenConfirm(false);
  // };

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        name: data.name,
        documentCode: data.documentCode,
        description: data.description,
        status: data.isActive ? 'active' : 'inactive'
      };

      if (editingId) {
        await updateDocumentType({ id: editingId, data: payload }).unwrap();
        toast.success('Document Type updated');
      } else {
        await createDocumentType(payload).unwrap();
        toast.success('Document Type created');
      }
      setOpenForm(false);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to save Document Type');
    }
  };

  const columns: GridColDef[] = [
    { field: 'documentCode', headerName: 'Code', width: 120 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <StatusBadge status={params.value} />
      )
    },
    {
      field: 'createdAt', headerName: 'Created At', width: 150, renderCell(params) {
        const date = new Date(params.value);
        return date.toLocaleDateString();
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box className="flex gap-2 h-full items-center">
          <Button size="small" onClick={() => handleEdit(params.row)} startIcon={<EditIcon />}>Edit</Button>
          {/* {/* <Button size="small" color="error" onClick={() => handleDeleteClick(params.row.id)} startIcon={<DeleteIcon />}>Del</Button> */}
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

      {isLoading ? (
        <Box className="flex justify-center p-8">
          <CircularProgress />
        </Box>
      ) : (
        <DataTable rows={rows} columns={columns} />
      )}

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
            name="documentCode"
            control={control}
            rules={{ required: 'Code is required' }}
            render={({ field }) => (
              <TextField {...field} label="Document Code (e.g. ORDER)" fullWidth error={!!errors.documentCode} helperText={errors.documentCode?.message} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
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

      {/* <ConfirmDialog
        open={openConfirm}
        title="Delete Document Type"
        message="Are you sure you want to delete this document type? This action cannot be undone."
        onClose={() => setOpenConfirm(false)}
        onConfirm={onConfirmDelete}
      /> */}
    </Box>
  );
}
