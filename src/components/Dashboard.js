import React from "react";
import { AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,Box } from "@mui/material";
import { Dashboard, People, Event, Assignment,BarChart } from "@mui/icons-material";
// import { BarChart } from '@mui/x-charts/BarChart';


const drawerWidth = 240;

const DashboardPage = () => {
  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar */}

      {/* Main Content */}
      <div style={{ flexGrow: 1, padding: "20px" }}>
        {/* <AppBar position="static"> */}
          {/* <Toolbar> */}
            <Typography variant="h6" sx={{ flexGrow: 1,fontWeight:'800px' }}>
              Billing Overview
            </Typography>
          {/* </Toolbar> */}
        {/* </AppBar> */}

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Billing Overview */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Doctor Billings</Typography>
                <Typography variant="h4">$793.00</Typography>
                <Typography color="green">+7.2% up</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Clinic Billings</Typography>
                <Typography variant="h4">$1,293.00</Typography>
                <Typography color="red">-3.7% down</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Lab Billings</Typography>
                <Typography variant="h4">$7,893.00</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid container spacing={3} sx={{ mt: 2,ml:1 }}>
          {/* Billing Overview */}
          <Grid item xs={12} md={6}>
            <Card sx={{height:'300px'}}>
              <CardContent>
                <Typography variant="h6" sx={{mr:20}}>Doctor Appointment</Typography>
                <Box component="select"
              sx={{
                  mt: '',
                  ml:70,
                  textAlign:'left',
                  width: '20%',
                  height: '45px',
                  borderRadius: '10px',
                  padding: '0 14px',
                  border: '1px solid rgba(0, 0, 0, 0.23)',
                  fontSize: '16px',
                  '&:focus': {
                      outline: 'none',
                      borderColor: '#754C27',
                  },
                  '& option': {
                      fontSize: '16px',
                  },
              }}
            >
              <option value="sickLeave">Month</option>
            </Box>

                {/* <Typography variant="h4">$793.00</Typography>
                <Typography color="green">+7.2% up</Typography> */}
                {/* <BarChart 
                sx={{width:'100%',fontSize:'800%'}}
                  xAxis={[{
                  scaleType: 'band',
                  data: ['Page 1', 'Page 2', 'Page 3'],
                  categoryGapRatio: 0.3,
                  barGapRatio: 0.1
                }]}
            /> */}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{height:'300px'}}>
              <CardContent>
                <Typography variant="h6">Lab Appointment</Typography>
                <Box component="select"
              sx={{
                  mt: '',
                  ml:40,
                  textAlign:'left',
                  width: '30%',
                  height: '45px',
                  borderRadius: '10px',
                  padding: '0 14px',
                  border: '1px solid rgba(0, 0, 0, 0.23)',
                  fontSize: '16px',
                  '&:focus': {
                      outline: 'none',
                      borderColor: '#754C27',
                  },
                  '& option': {
                      fontSize: '16px',
                  },
              }}
            >
              <option value="sickLeave">Month</option>
            </Box>
              </CardContent>
            </Card>
          </Grid>
          </Grid>

          {/* Patients List */}
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Patient Name</TableCell>
                    <TableCell>Patient ID</TableCell>
                    <TableCell>Age</TableCell>
                    <TableCell>Sex</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Olivia Blye</TableCell>
                    <TableCell>#8573793</TableCell>
                    <TableCell>70</TableCell>
                    <TableCell>Male</TableCell>
                    <TableCell style={{ color: "green" }}>Active</TableCell>
                    <TableCell>$644.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Phoenix Baker</TableCell>
                    <TableCell>#8573793</TableCell>
                    <TableCell>13</TableCell>
                    <TableCell>Female</TableCell>
                    <TableCell style={{ color: "orange" }}>Pending</TableCell>
                    <TableCell>$644.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Lara Stoker</TableCell>
                    <TableCell>#8573793</TableCell>
                    <TableCell>39</TableCell>
                    <TableCell>Male</TableCell>
                    <TableCell style={{ color: "orange" }}>Pending</TableCell>
                    <TableCell>$644.00</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </div>
     </div>
  );
};

export default DashboardPage;
