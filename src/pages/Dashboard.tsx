import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import StatusBadge from '../components/common/StatusBadge';

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

const months = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Dashboard() {
  const [year, setYear] = useState(2024);

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
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Total Workspaces" value={14} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Completed Months" value={8} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Pending OCR" value={3} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Uploaded Documents" value={1245} />
        </Grid>
      </Grid>

      <Box className="mt-4">
        <Typography variant="h6" fontWeight="bold" color="text.primary" className="mb-4">
          Monthly Progress
        </Typography>
        <Grid container spacing={2}>
          {months.map((month, index) => {
            let status: any = 'No Uploads';
            if (index < 4) status = 'Completed';
            else if (index === 4) status = 'In Progress';

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={month}>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="flex justify-between items-center">
                    <Typography fontWeight={600}>{month}</Typography>
                    <StatusBadge status={status} />
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
                {[
                  { loc: 'New York', month: 'May', status: 'In Progress' },
                  { loc: 'London', month: 'April', status: 'Waiting' },
                  { loc: 'New York', month: 'June', status: 'No Uploads' }
                ].map((ws, i) => (
                  <Box key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <Box>
                      <Typography fontWeight={600}>{ws.loc}</Typography>
                      <Typography variant="body2" color="text.secondary">{ws.month} 2024</Typography>
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
                {[
                  { doc: 'Insurance_Policy.pdf', ws: 'NY - May', ocr: 'Running', time: '10 mins ago' },
                  { doc: 'Export_PFI_v2.pdf', ws: 'LDN - April', ocr: 'Completed', time: '1 hour ago' },
                  { doc: 'Order_042.pdf', ws: 'NY - April', ocr: 'Failed', time: '2 hours ago' }
                ].map((up, i) => (
                  <Box key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <Box>
                      <Typography fontWeight={600} className="truncate max-w-[150px] sm:max-w-xs">{up.doc}</Typography>
                      <Typography variant="body2" color="text.secondary">{up.ws} • {up.time}</Typography>
                    </Box>
                    <StatusBadge status={up.ocr === 'Running' ? 'OCR Running' : up.ocr as any} />
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
