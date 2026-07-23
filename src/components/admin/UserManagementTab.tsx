import React, { useState } from 'react';
import { Box, Button, TextField, Typography, MenuItem, FormControlLabel, Switch } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, LockReset as LockResetIcon } from '@mui/icons-material';
import { type GridColDef } from '@mui/x-data-grid';
import { useForm, Controller } from 'react-hook-form';
import DataTable from '../common/DataTable';
import FormDialog from './FormDialog';
import ConfirmDialog from '../common/ConfirmDialog';
import StatusBadge from '../common/StatusBadge';
import toast from 'react-hot-toast';

type FormData = {
  name: string;
  email: string;
  role: string;
  isActive: boolean;
};

const initialData = [
  { id: 1, name: 'Admin User', email: 'admin@company.com', role: 'admin', isActive: true },
  { id: 2, name: 'Standard User', email: 'user@company.com', role: 'user', isActive: true },
  { id: 3, name: 'Jane Doe', email: 'jane@company.com', role: 'user', isActive: false },
];

export default function UserManagementTab() {
  const [rows, setRows] = useState(initialData);
  const [openForm, setOpenForm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: { name: '', email: '', role: 'user', isActive: true }
  });

  const handleAdd = () => {
    reset({ name: '', email: '', role: 'user', isActive: true });
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
    toast.success('User deleted');
    setOpenConfirm(false);
  };

  const onSubmit = (data: FormData) => {
    if (editingId) {
      setRows(rows.map(r => r.id === editingId ? { ...r, ...data } : r));
      toast.success('User updated');
    } else {
      setRows([...rows, { ...data, id: Date.now() }]);
      toast.success('User created and invitation sent');
    }
    setOpenForm(false);
  };

  const handleResetPassword = () => {
    toast.success('Password reset email sent');
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { 
      field: 'role', 
      headerName: 'Role', 
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'isActive', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => <StatusBadge status={params.value ? 'Completed' : 'Failed'} />
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 280,
      renderCell: (params) => (
        <Box className="flex gap-2 h-full items-center">
          <Button size="small" onClick={() => handleEdit(params.row)} startIcon={<EditIcon />}>Edit</Button>
          <Button size="small" onClick={handleResetPassword} startIcon={<LockResetIcon />}>Reset</Button>
          <Button size="small" color="error" onClick={() => handleDeleteClick(params.row.id)} startIcon={<DeleteIcon />}>Del</Button>
        </Box>
      )
    }
  ];

  return (
    <Box className="flex flex-col gap-4">
      <Box className="flex justify-between items-center">
        <Typography variant="h6" fontWeight="bold">Manage Users</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAdd}>
          Add User
        </Button>
      </Box>

      <DataTable rows={rows} columns={columns} />

      <FormDialog
        open={openForm}
        title={editingId ? 'Edit User' : 'Add User'}
        onClose={() => setOpenForm(false)}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Box className="flex flex-col gap-4 mt-2">
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Name is required' }}
            render={({ field }) => (
              <TextField {...field} label="Full Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />
            )}
          />
          <Controller
            name="email"
            control={control}
            rules={{ 
              required: 'Email is required',
              pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
            }}
            render={({ field }) => (
              <TextField {...field} label="Email Address" type="email" fullWidth error={!!errors.email} helperText={errors.email?.message} />
            )}
          />
          <Controller
            name="role"
            control={control}
            rules={{ required: 'Role is required' }}
            render={({ field }) => (
              <TextField {...field} select label="Role" fullWidth error={!!errors.role} helperText={errors.role?.message}>
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>
            )}
          />
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                label="Active Account"
              />
            )}
          />
        </Box>
      </FormDialog>

      <ConfirmDialog
        open={openConfirm}
        title="Delete User"
        message="Are you sure you want to delete this user? They will immediately lose access to the system."
        onClose={() => setOpenConfirm(false)}
        onConfirm={onConfirmDelete}
      />
    </Box>
  );
}
