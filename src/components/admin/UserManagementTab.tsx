import { useState } from 'react';
import { Box, Button, TextField, Typography, MenuItem, FormControlLabel, Switch, Backdrop, CircularProgress } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { type GridColDef } from '@mui/x-data-grid';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserFormSchema, type UserFormData } from '../../schemas/user.schema';
import DataTable from '../common/DataTable';
import FormDialog from './FormDialog';
import ConfirmDialog from '../common/ConfirmDialog';
import StatusBadge from '../common/StatusBadge';
import toast from 'react-hot-toast';
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation
} from '../../services/appApi';


export default function UserManagementTab() {
  const { data: users = [], isLoading } = useGetUsersQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const [openForm, setOpenForm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(UserFormSchema),
    defaultValues: { name: '', email: '', role: 'user', status: 'INVITED' }
  });

  const handleAdd = () => {
    reset({ name: '', email: '', role: 'user', status: 'INVITED' });
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

  const onConfirmDelete = async () => {
    if (deletingId) {
      try {
        await deleteUser(deletingId).unwrap();
        toast.success('User deleted');
      } catch (err) {
        toast.error('Failed to delete user');
      }
    }
    setOpenConfirm(false);
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      if (editingId) {
        await updateUser({ id: editingId, data }).unwrap();
        toast.success('User updated');
      } else {
        await createUser(data).unwrap();
        if (data.sendInvitation) {
          toast.success('User created and invitation sent');
        } else {
          toast.success('User created successfully');
        }
      }
      setOpenForm(false);
    } catch (err) {
      toast.error(editingId ? 'Failed to update user' : 'Failed to create user');
    }
  };

  // const handleResetPassword = () => {
  //   toast.success('Password reset email sent');
  // };

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
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const isInvited = params.value === 'INVITED';
        return <StatusBadge status={isInvited ? 'Invited' : params.value === 'ACTIVE' ? 'Active' : 'Inactive'} />;
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 280,
      renderCell: (params) => (
        <Box className="flex  h-full items-center">
          <Button size="small" onClick={() => handleEdit(params.row)} startIcon={<EditIcon />}></Button>
          <Button size="small" color="error" onClick={() => handleDeleteClick(params.row.id)} startIcon={<DeleteIcon />}></Button>
        </Box>
      )
    }
  ];

  return (
    <Box className="flex flex-col gap-4">
      <Box className="flex justify-between items-center">
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>Manage Users</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAdd}>
          Add User
        </Button>
      </Box>

      <DataTable rows={users} columns={columns} loading={isLoading} />

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
            render={({ field }) => (
              <TextField {...field} label="Full Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Email Address" type="email" fullWidth error={!!errors.email} helperText={errors.email?.message} />
            )}
          />
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="Role" fullWidth error={!!errors.role} helperText={errors.role?.message}>
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>
            )}
          />
          {editingId && (
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value === 'ACTIVE'} onChange={(e) => field.onChange(e.target.checked ? 'ACTIVE' : 'INACTIVE')} />}
                  label="Active Account"
                />
              )}
            />
          )}
        </Box>
      </FormDialog>

      <ConfirmDialog
        open={openConfirm}
        title="Delete User"
        message="Are you sure you want to delete this user? They will immediately lose access to the system."
        onClose={() => setOpenConfirm(false)}
        onConfirm={onConfirmDelete}
      />

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1000 }}
        open={isCreating || isUpdating || isDeleting}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
}
