import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Select, MenuItem, FormControl, InputLabel, CircularProgress } from '@mui/material';
import StatusBadge from '../components/common/StatusBadge';
import { useGetDashboardQuery } from '../services/appApi';

const KpiCard = ({ title, value }: { title: string, value: string | number }) => (
  <Card className="h-full">
    <CardContent>
      <Typography color="text.secondary" variant="body2" fontWeight={500} gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" color="text.primary" fontWeight={700}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const allMonths = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Dashboard() {
  const [year, setYear] = useState(2024);
  const { data: res, isLoading: loading, isError } = useGetDashboardQuery(year);
  const metrics = res?.data;

  if (loading || !metrics) {
      return <Box className="flex justify-center p-8"><CircularProgress /></Box>;
  }

  return (
    <Box className="flex flex-col gap-6">
      <Box className="flex justify-between items-center">
        <Typography variant="h5" fontWeight="bold" color="text.primary">
          Dashboard
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
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Total Workspaces" value={metrics.totalWorkspaces} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Completed Months" value={metrics.completedMonths} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Pending OCR" value={metrics.pendingOcr} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Uploaded Documents" value={metrics.totalUploads} />
        </Grid>
      </Grid>

      <Box className="mt-4">
        <Typography variant="h6" fontWeight="bold" color="text.primary" className="mb-4">
          Monthly Progress
        </Typography>
        <Grid container spacing={2}>
          {allMonths.map((month) => {
            // Find if this workspace exists
            const ws = metrics.pendingWorkspaces?.find((w: any) => w.month === month && w.year === year);
            const status = ws ? ws.status : 'No Uploads';

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={month}>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="flex justify-between items-center">
                    <Typography fontWeight={600}>{month}</Typography>
                    <StatusBadge status={status as any} />
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      </Box>

      <Grid container spacing={3} className="mt-2">
        <Grid item xs={12} md={6}>
          <Card className="h-full">
            <CardContent>
              <Typography variant="h6" fontWeight="bold" className="mb-4">Pending Workspaces</Typography>
              <Box className="flex flex-col gap-3">
                {metrics.pendingWorkspaces?.map((ws: any, i: number) => (
                  <Box key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <Box>
                      <Typography fontWeight={600}>Global Hub</Typography>
                      <Typography variant="body2" color="text.secondary">{ws.month} {ws.year}</Typography>
                    </Box>
                    <StatusBadge status={ws.status as any} />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card className="h-full">
            <CardContent>
              <Typography variant="h6" fontWeight="bold" className="mb-4">Recent Uploads & OCR</Typography>
              <Box className="flex flex-col gap-3">
                {metrics.recentUploads?.map((up: any, i: number) => (
                  <Box key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <Box>
                      <Typography fontWeight={600} className="truncate max-w-[150px] sm:max-w-xs">{up.fileName}</Typography>
                      <Typography variant="body2" color="text.secondary">Workspace {up.workspaceId} • Just now</Typography>
                    </Box>
                    <StatusBadge status={up.status === 'Processing' ? 'OCR Running' : (up.status as any)} />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
