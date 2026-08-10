import React, { useState } from 'react';
import { Box, Button, TextField, FormControlLabel, Switch, Typography, MenuItem } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { type GridColDef } from '@mui/x-data-grid';
import { useForm, Controller } from 'react-hook-form';
import DataTable from '../common/DataTable';
import FormDialog from './FormDialog';
import ConfirmDialog from '../common/ConfirmDialog';
import toast from 'react-hot-toast';

type FormData = {
  fieldName: string;
  dataType: string;
  documentType: string;
  isRequired: boolean;
};

const initialData = [
  { id: 1, fieldName: 'PO Number', dataType: 'Text', documentType: 'Purchase Order', isRequired: true },
  { id: 2, fieldName: 'Total Amount', dataType: 'Number', documentType: 'Purchase Order', isRequired: true },
  { id: 3, fieldName: 'Issue Date', dataType: 'Date', documentType: 'Purchase Order', isRequired: false },
];

export default function FieldDefinitionsTab() {
  const [rows, setRows] = useState(initialData);
  const [openForm, setOpenForm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: { fieldName: '', dataType: 'Text', documentType: '', isRequired: false }
  });

  const handleAdd = () => {
    reset({ fieldName: '', dataType: 'Text', documentType: '', isRequired: false });
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
    toast.success('Field Definition deleted');
    setOpenConfirm(false);
  };

  const onSubmit = (data: FormData) => {
    if (editingId) {
      setRows(rows.map(r => r.id === editingId ? { ...r, ...data } : r));
      toast.success('Field Definition updated');
    } else {
      setRows([...rows, { ...data, id: Date.now() }]);
      toast.success('Field Definition created');
    }
    setOpenForm(false);
  };

  const columns: GridColDef[] = [
    { field: 'fieldName', headerName: 'Field Name', flex: 1 },
    { field: 'dataType', headerName: 'Data Type', width: 130 },
    { field: 'documentType', headerName: 'Document Type', flex: 1 },
    {
      field: 'isRequired',
      headerName: 'Required',
      width: 100,
      type: 'boolean'
    },
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
    <>
      Dynamic OCR field definition
    </>
    // <Box className="flex flex-col gap-4">
    //   <Box className="flex justify-between items-center">
    //     <Typography variant="h6" fontWeight="bold">Manage Field Definitions</Typography>
    //     <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAdd}>
    //       Add Field
    //     </Button>
    //   </Box>

    //   <DataTable rows={rows} columns={columns} />

    //   <FormDialog
    //     open={openForm}
    //     title={editingId ? 'Edit Field' : 'Add Field'}
    //     onClose={() => setOpenForm(false)}
    //     onSubmit={handleSubmit(onSubmit)}
    //   >
    //     <Box className="flex flex-col gap-4 mt-2">
    //       <Controller
    //         name="fieldName"
    //         control={control}
    //         rules={{ required: 'Field name is required' }}
    //         render={({ field }) => (
    //           <TextField {...field} label="Field Name" fullWidth error={!!errors.fieldName} helperText={errors.fieldName?.message} />
    //         )}
    //       />
    //       <Controller
    //         name="dataType"
    //         control={control}
    //         rules={{ required: 'Data type is required' }}
    //         render={({ field }) => (
    //           <TextField {...field} select label="Data Type" fullWidth error={!!errors.dataType} helperText={errors.dataType?.message}>
    //             <MenuItem value="Text">Text</MenuItem>
    //             <MenuItem value="Number">Number</MenuItem>
    //             <MenuItem value="Date">Date</MenuItem>
    //           </TextField>
    //         )}
    //       />
    //       <Controller
    //         name="documentType"
    //         control={control}
    //         rules={{ required: 'Document type is required' }}
    //         render={({ field }) => (
    //           <TextField {...field} label="Document Type (e.g. Purchase Order)" fullWidth error={!!errors.documentType} helperText={errors.documentType?.message} />
    //         )}
    //       />
    //       <Controller
    //         name="isRequired"
    //         control={control}
    //         render={({ field }) => (
    //           <FormControlLabel
    //             control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
    //             label="Required Field"
    //           />
    //         )}
    //       />
    //     </Box>
    //   </FormDialog>

    //   <ConfirmDialog
    //     open={openConfirm}
    //     title="Delete Field"
    //     message="Are you sure you want to delete this field? Data extraction for this field will stop."
    //     onClose={() => setOpenConfirm(false)}
    //     onConfirm={onConfirmDelete}
    //   />
    // </Box>
  );
}
