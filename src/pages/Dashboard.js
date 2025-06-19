// src/pages/Dashboard.jsx
import React from 'react';
import { Box, Grid, Container, Typography } from '@mui/material';
import Sidebar from '../components/Dashboard/Sidebar';
import TopBar from '../components/Dashboard/TopBar';
import BillingCard from '../components/Dashboard/BillingCard';
import LineChart from '../components/Dashboard/LineChart';
import DoctorAppointmentChart from '../components/Dashboard/AppointmentChart';
import LabAppointmentChart from '../components/Dashboard/LabAppointmentChart';
import PatientsTable from '../components/Dashboard/PateintsTable';
import UpcomingAppointments from '../components/Dashboard/UpcomingAppointments';


const Dashboard = () => {
  return (
    <Box>
      {/* หัวข้อ Billing Overview อยู่ในหน้า Dashboard */}
      <Typography
        variant="h5"
        component="h1"
        fontWeight="bold"
        sx={{ mb: 3 }}
      >
        Billing Overview
      </Typography>

      {/* Billing Summary Cards */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <BillingCard
            title="Doctor Billings"
            amount={793.00}
            changePercent={7.2}
            trend="up"
            chartComponent={<LineChart color="#4285F4" />}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <BillingCard
            title="Clinic Billings"
            amount={1293.00}
            changePercent={3.7}
            trend="down"
            changeAmount={-1393.00}
            chartComponent={<LineChart color="#4285F4" />}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <BillingCard
            title="Lab Billings"
            amount={7893.00}
            chartComponent={<LineChart color="#4285F4" />}
          />
        </Grid>
      </Grid>

      {/* Appointment Charts */}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} md={8}>
          <DoctorAppointmentChart />
        </Grid>
        <Grid item xs={12} md={4}>
          <LabAppointmentChart />
        </Grid>
      </Grid>

      {/* Patients Table */}
      <PatientsTable />

      {/* Upcoming Appointments */}
      <UpcomingAppointments />
    </Box>
  );
};

export default Dashboard;