import { useState, useMemo } from 'react';
import { Box, Typography, Breadcrumbs, Link, Select, MenuItem, FormControl, InputLabel, Button, TextField, InputAdornment, CircularProgress, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TableContainer, Table, TableRow, TableCell, TableHead, TableBody } from '@mui/material';
import { type GridColDef } from '@mui/x-data-grid';
import {
  NavigateNext as NavigateNextIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Visibility
} from '@mui/icons-material';
import DataTable from '../components/common/DataTable';
import UploadCard from '../components/workspace/UploadCard';
import StatusBadge from '../components/common/StatusBadge';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import {
  useGetWorkspaceQuery,
  useGetSummaryQuery,
  useCreateWorkspaceMutation,
  useUploadDocumentMutation,
  useLazyExportSummaryQuery,
  useGetDocumentTypesQuery,
  useGetProductValuesQuery
} from '../services/appApi';
import toast from 'react-hot-toast';

export default function Workspace() {
  const { data: documentTypesResponse } = useGetDocumentTypesQuery();
  const documentTypes = documentTypesResponse?.data?.filter((dt: any) => dt.status === 'active') || [];
  const [year, setYear] = useState(2024);
  const [month, setMonth] = useState('January');
  const [search, setSearch] = useState('');
  const [openDialogTable, setOpenDialogTable] = useState(false);
  const [openDialogDataID, setOpenDialogDataID] = useState<string | null>(null);

  const user = useSelector((state: RootState) => state.auth.user);
  const canUpload = user?.role?.toLowerCase() === 'admin';

  // 1. Fetch Workspace
  const { currentData: wsRes, isLoading: isWsLoading, isFetching: isWsFetching, refetch: refetchWorkspace } = useGetWorkspaceQuery({ year, month });
  const workspace = wsRes?.data;

  // 2. Fetch Summary
  const { currentData: sumRes, isLoading: isSumLoading, isFetching: isSumFetching, refetch: refetchSummary } = useGetSummaryQuery({
    workspaceId: workspace?.id as number,
    search: search
  }, {
    skip: !workspace?.id && !search,
  });

  const { currentData: productValuesRes, isLoading: productValuesLoading } = useGetProductValuesQuery(openDialogDataID as string, {
    skip: !openDialogDataID,
  });

  const rows = sumRes?.data || [];

  const loading = isWsLoading || isWsFetching || isSumLoading || isSumFetching;

  const [uploadDocument] = useUploadDocumentMutation();
  const [createWorkspace] = useCreateWorkspaceMutation();
  const [exportSummary] = useLazyExportSummaryQuery();

  const handleRefresh = () => {
    refetchWorkspace();
    if (workspace?.id) {
      refetchSummary();
    }
  };

  const handleUpload = async (file: File, documentTypeCode: string) => {
    if (!workspace) {
      toast.error("Workspace not found for this month.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('workspaceId', workspace.id.toString());
    formData.append('documentTypeCode', documentTypeCode);

    const toastId = toast.loading(`Uploading ${file.name}...`);
    try {
      await uploadDocument(formData).unwrap();
      toast.success("Upload successful and OCR processing started", { id: toastId });
    } catch (error: any) {
      console.error("Upload error", error);
      toast.error(error?.data?.message || "Upload failed", { id: toastId });
    }
  };

  const handleExport = async () => {
    if (!workspace) return;
    try {
      const blob = await exportSummary(workspace.id).unwrap();
      const url = window.URL.createObjectURL(blob);
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

  const handleView = async (id) => {
    setOpenDialogTable(true)
    setOpenDialogDataID(id)
  }


  const dynamicColumns: GridColDef[] = useMemo(() => {
    if (rows.length === 0) return [];
    const allKeys = new Set<string>();
    rows.forEach((row: any) => Object.keys(row).forEach(k => k !== 'id' && allKeys.add(k)));

    const cols = Array.from(allKeys).map(key => {
      let renderCell = undefined;

      if (key === 'status') {
        renderCell = (params: any) => <StatusBadge status={params.value} />;
      }


      // if (["productName", "qty", "netPrice"].includes(key)) {
      //   renderCell = (params: any) => {
      //     const val = params.value;
      //     if (val === null || val === undefined || String(val).trim() === '') {
      //       return <span className="text-gray-400">-</span>;
      //     }

      //     // Safely split the value by comma. We use a recombine logic to ensure
      //     // numbers with thousands separators (e.g. "2,000") are not incorrectly split.
      //     const rawParts = String(val).split(",");
      //     const items: string[] = [];

      //     rawParts.forEach((part) => {
      //       // If the part is exactly 3 digits (no leading space) and the previous item ends with a digit,
      //       // it is a thousands separator and belongs to the previous item.
      //       if (items.length > 0 && /^\d{3}$/.test(part) && /\d$/.test(items[items.length - 1])) {
      //         items[items.length - 1] += "," + part;
      //       } else {
      //         items.push(part);
      //       }
      //     });

      //     return (
      //       <Box>
      //         {items.map((item: string, index: number) => (
      //           <Box
      //             key={index}
      //             sx={{
      //               py: 0.5,
      //               lineHeight: 1.5,
      //             }}
      //           >
      //             {item.trim()}
      //           </Box>
      //         ))}
      //       </Box>
      //     );
      //   };
      // }

      else {
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
    const pfiIndex = cols.findIndex(c => c.field === "pfiNumber");

    if (pfiIndex > -1) {
      const pfiCol = cols.splice(pfiIndex, 1)[0];

      pfiCol.renderCell = (params: any) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            width: "100%",
          }}
        >
          <span>{params.value}</span>

          <IconButton
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              handleView(params.row.pfiNumber);
            }}
          >
            <Visibility fontSize="small" />
          </IconButton>
        </Box>
      );

      cols.unshift(pfiCol);
    }

    return cols;
  }, [rows]);

  // removed local filtering since search is now handled by the API

  return (
    <Box className="flex flex-col gap-6">
      {
        openDialogTable &&
        <ProductViewDialog open={openDialogTable} data={productValuesRes?.data} loading={productValuesLoading} handleClose={() => setOpenDialogTable(false)} />
      }
      <Box className="flex flex-col gap-4">
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/">
            Workspaces
          </Link>
          <Typography color="text.primary">Monthly Review</Typography>
        </Breadcrumbs>

        <Box className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Typography variant="h5" sx={{ fontWeight: 'bold' }} color="text.primary">
            Workspace: {month} {year}
          </Typography>
          <Box className="flex gap-4 items-center">
            <TextField
              size="small"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }
              }} />
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Year</InputLabel>
              <Select value={year} label="Year" onChange={(e) => setYear(Number(e.target.value))}>
                <MenuItem value={2023}>2023</MenuItem>
                <MenuItem value={2024}>2024</MenuItem>
                <MenuItem value={2025}>2025</MenuItem>
                <MenuItem value={2026}>2026</MenuItem>
                <MenuItem value={2027}>2027</MenuItem>
                <MenuItem value={2028}>2028</MenuItem>
                <MenuItem value={2029}>2029</MenuItem>
                <MenuItem value={2030}>2030</MenuItem>
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
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Summary Data</Typography>
          <Box className="flex gap-2">
            <Button variant="outlined" startIcon={<RefreshIcon />} size="small" onClick={handleRefresh}>
              Refresh
            </Button>
            <Button variant="contained" startIcon={<DownloadIcon />} size="small" onClick={handleExport} disabled={!workspace || rows.length === 0}>
              Export Excel
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box className="flex justify-center p-8"><CircularProgress /></Box>
        ) : (!workspace?.id && !search) ? (
          <Box className="flex flex-col items-center justify-center p-8 gap-4 text-gray-500">
            <Typography>Workspace not created for this month yet.</Typography>
            {canUpload && (
              <Button variant="contained" onClick={async () => {
                try {
                  const toastId = toast.loading("Creating workspace...");
                  await createWorkspace({ year, month }).unwrap();
                  toast.success("Workspace created!", { id: toastId });
                  refetchWorkspace();
                } catch (e) {
                  toast.error("Failed to create workspace");
                }
              }}>Initialize Workspace</Button>
            )}
          </Box>
        ) : (
          <DataTable rows={rows} columns={dynamicColumns} />
        )}
      </Box>

      {canUpload && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }} className="my-4">
            Required Documents *
          </Typography>
          <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {documentTypes?.length > 0 ? documentTypes?.map((doc: any) => {
              const upload = workspace?.documentUploads?.find((u: any) => u.documentTypeId === doc.id);
              return (
                <UploadCard
                  key={doc.id}
                  documentName={doc.name}
                  status={upload ? 'Uploaded' : 'Waiting'}
                  fileUrl={upload ? upload.filePath : undefined}
                  onUpload={(file) => handleUpload(file, doc.documentCode)}
                />
              );
            })
              : <p className='p-6 max-w-6xl mx-auto text-gray-500 text-center'>No document types are available.</p>}
          </Box>
        </Box>
      )}
    </Box>
  );
}


export const ProductViewDialog = ({ open, handleClose, data, loading }: { open: boolean; handleClose: () => void, data: any, loading: boolean }) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2.5,
            overflow: "hidden",
          }
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          py: 2,
          fontSize: "1.1rem",
          fontWeight: 600,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        Product Details
      </DialogTitle>

      <DialogContent
        sx={{
          p: 0,
        }}
      >
        <TableContainer>
          <Table
            sx={{
              minWidth: 600,
              "& .MuiTableCell-root": {
                borderBottom: "1px solid #E5E7EB",
              },
            }}
          >
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: "#F8FAFC",
                }}
              >
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: "#475569",
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                  }}
                >
                  Product Code
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: "#475569",
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                  }}
                >
                  Product Name
                </TableCell>

                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 600,
                    color: "#475569",
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                    width: 120,
                  }}
                >
                  PFI Qty
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 600,
                    color: "#475569",
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                    width: 140,
                  }}
                >
                  PFI Net Price
                </TableCell>

                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 600,
                    color: "#475569",
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                    width: 120,
                  }}
                >
                  FI Qty
                </TableCell>


                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 600,
                    color: "#475569",
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                    width: 140,
                  }}
                >
                  FI Net Price
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Box
                      sx={{
                        minHeight: 240,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      <CircularProgress size={28} thickness={4} />

                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                        }}
                      >
                        Loading products...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : data?.length ? (
                data.map((item: any, index: number) => (
                  <TableRow
                    key={item?.id ?? index}
                    sx={{
                      padding: "0 40px",
                      "&:last-child td": {
                        borderBottom: 0,
                      },
                      "&:hover": {
                        backgroundColor: "#F8FAFC",
                      },
                      transition: "background-color 0.15s ease",
                    }}
                  >
                    <TableCell
                      sx={{
                        py: 1.75,
                        color: "#111827",
                        fontWeight: 500,
                      }}
                    >
                      {item?.productCode}
                    </TableCell>
                    <TableCell
                      sx={{
                        py: 1.75,
                        color: "#111827",
                        fontWeight: 500,
                      }}
                    >
                      {item?.productName}
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{
                        py: 1.75,
                        color: "#475569",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {item?.pfi_qty || '-'}
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{
                        py: 1.75,
                        color: "#111827",
                        fontWeight: 500,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {item?.fi_netPrice || '-'}
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{
                        py: 1.75,
                        color: "#111827",
                        fontWeight: 500,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {item?.pfi_qty || '-'}
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{
                        py: 1.75,
                        color: "#111827",
                        fontWeight: 500,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {item?.fi_netPrice || '-'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Box
                      sx={{
                        minHeight: 180,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        No products found
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 1.5,
          borderTop: "1px solid",
          borderColor: "divider",
          backgroundColor: "#FAFAFA",
        }}
      >
        <Button
          onClick={handleClose}
          variant="outlined"
          size="small"
          sx={{
            textTransform: "none",
            borderRadius: 1.5,
            px: 2.5,
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
