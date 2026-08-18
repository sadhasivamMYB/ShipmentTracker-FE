import { useState } from 'react';
import { Box, Button, TextField, FormControlLabel, Switch, Typography, CircularProgress, Select, MenuItem, Backdrop } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { type GridColDef } from '@mui/x-data-grid';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DocumentTypeFormSchema, type DocumentTypeFormData } from '../../schemas/documentType.schema';
import DataTable from '../common/DataTable';
import FormDialog from './FormDialog';
// import ConfirmDialog from '../common/ConfirmDialog';
import StatusBadge from '../common/StatusBadge';
import toast from 'react-hot-toast';
import {
  useGetDocumentTypesQuery,
  useCreateDocumentTypeMutation,
  useUpdateDocumentTypeMutation,
} from '../../services/appApi';


export default function DocumentTypesTab() {
  const { data: response, isLoading } = useGetDocumentTypesQuery();
  const [createDocumentType, { isLoading: isCreating }] = useCreateDocumentTypeMutation();
  const [updateDocumentType, { isLoading: isUpdating }] = useUpdateDocumentTypeMutation();
  // const [deleteDocumentType] = useDeleteDocumentTypeMutation();

  const rows = response?.data || [];

  const [openForm, setOpenForm] = useState(false);
  // const [openConfirm, setOpenConfirm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  // const [deletingId, setDeletingId] = useState<number | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<DocumentTypeFormData>({
    resolver: zodResolver(DocumentTypeFormSchema),
    defaultValues: { name: '', documentCode: 'PFI', description: '', status: 'active' }
  });

  const handleAdd = () => {
    reset({ name: '', documentCode: 'PFI', description: '', status: 'active' });
    setEditingId(null);
    setOpenForm(true);
  };

  const handleEdit = (row: any) => {
    reset({
      name: row.name,
      documentCode: row.documentCode,
      description: row.description || '',
      status: row.status === 'active' ? 'active' : 'inactive'
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

  const onSubmit = async (data: DocumentTypeFormData) => {
    // Check if the document code already exists
    const isDuplicate = rows.some((row: any) => {
      if (editingId) {
        return row.documentCode === data.documentCode && row.id !== editingId;
      }
      return row.documentCode === data.documentCode;
    });

    if (isDuplicate) {
      toast.error('Type Already created');
      return;
    }

    try {
      const payload = {
        name: data.name,
        documentCode: data.documentCode,
        description: data.description,
        status: data.status
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
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>Manage Document Types</Typography>
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
            render={({ field }) => (
              <TextField {...field} label="Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />
            )}
          />
          <Controller
            name="documentCode"
            control={control}
            render={({ field }) => (
              <Select {...field} label="Document Code (e.g. PFI)" fullWidth error={!!errors.documentCode} >
                <MenuItem value="PFI">PFI</MenuItem>
                <MenuItem value="IINS">Import Insurance</MenuItem>
                <MenuItem value="BL">BL</MenuItem>
                <MenuItem value="EINS">Export Insurance</MenuItem>
                <MenuItem value="EXPORT_PFI">Export PFI</MenuItem>
                <MenuItem value="PAAR">Paar</MenuItem>
                <MenuItem value="FI">Final Invoice</MenuItem>
              </Select>
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
            name="status"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch checked={field.value === 'active'} onChange={(e) => field.onChange(e.target.checked ? 'active' : 'inactive')} />}
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

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1000 }}
        open={isCreating || isUpdating}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
}
