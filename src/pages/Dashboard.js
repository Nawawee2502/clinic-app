// src/pages/Dashboard.jsx - Real Revenue Analytics Dashboard
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Container,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton
} from '@mui/material';
// Remove date-fns dependencies - use native HTML date input instead
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip
} from 'recharts';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  LocalHospital as HospitalIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

import DailyReportButton from '../components/Dashboard/DailyReportButton';

// Import Services
import TreatmentService from '../services/treatmentService';
import PatientService from '../services/patientService';

const Dashboard = () => {
  // States for date filters
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState(new Date());
  const [period, setPeriod] = useState('30days');

  // States for data
  const [revenueData, setRevenueData] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data when component mounts or dates change
  useEffect(() => {
    loadDashboardData();
  }, [startDate, endDate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const formatDate = (date) => {
        return date.toISOString().split('T')[0];
      };

      // Load revenue statistics using new endpoint
      const revenueResponse = await TreatmentService.getRevenueStats({
        date_from: formatDate(startDate),
        date_to: formatDate(endDate)
      });

      // Load patient data
      const patientsResponse = await PatientService.getTodayPatientsFromQueue();

      if (revenueResponse.success) {
        // Calculate revenue analytics from new API response
        const revenueAnalytics = calculateRevenueAnalytics(revenueResponse.data);
        setRevenueData(revenueAnalytics);

        // Generate chart data from daily revenue
        const chartData = revenueResponse.data.dailyRevenue.map(day => ({
          date: day.date,
          revenue: day.daily_revenue || 0,
          patients: day.treatments_count || 0
        }));
        setChartData(chartData);

        // Set pie data from payment methods
        const pieData = revenueResponse.data.paymentMethods.map(method => ({
          name: method.PAYMENT_METHOD,
          value: method.total_amount,
          color: method.PAYMENT_METHOD === 'เงินสด' ? '#4285F4' :
            method.PAYMENT_METHOD === 'เงินโอน' ? '#34A853' : '#FBBC04'
        }));
        setPieData(pieData);
      }

      if (patientsResponse.success) {
        setPatientData(patientsResponse.data || []);
      }

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateRevenueAnalytics = (revenueData) => {
    const summary = revenueData.summary;

    return {
      totalRevenue: summary.total_revenue || 0,
      totalPatients: summary.paid_treatments || 0,
      avgRevenuePerPatient: summary.avg_revenue_per_patient || 0,
      totalDiscounts: summary.total_discounts || 0,
      revenueGrowth: 15, // Mock growth for now
      categories: revenueData.paymentMethods.map(method => ({
        name: method.PAYMENT_METHOD,
        value: method.total_amount,
        color: method.PAYMENT_METHOD === 'เงินสด' ? '#4285F4' :
          method.PAYMENT_METHOD === 'เงินโอน' ? '#34A853' : '#FBBC04'
      }))
    };
  };

  // const calculateRevenueAnalytics = (treatments) => {
  //   let totalRevenue = 0;
  //   let totalPatients = 0;
  //   let labRevenue = 0;
  //   let drugRevenue = 0;
  //   let procedureRevenue = 0;
  //   let paidTreatments = [];

  //   treatments.forEach(treatment => {
  //     // ตรวจสอบว่าเป็นการรักษาที่ชำระเงินแล้วหรือไม่
  //     const isPaid = treatment.STATUS1 === 'ชำระเงินแล้ว';

  //     // Parse payment info if it exists
  //     let paymentInfo = null;
  //     if (treatment.PAYMENT_INFO && isPaid) {
  //       try {
  //         paymentInfo = JSON.parse(treatment.PAYMENT_INFO);
  //         totalRevenue += paymentInfo.TOTAL_AMOUNT || 0;
  //         totalPatients++;
  //         paidTreatments.push({
  //           ...treatment,
  //           parsedPaymentInfo: paymentInfo
  //         });
  //       } catch (e) {
  //         console.warn('Could not parse payment info for VNO:', treatment.VNO, e);

  //         // ถ้าไม่มี PAYMENT_INFO แต่มีสถานะชำระเงินแล้ว ให้คำนวณจากข้อมูลอื่น
  //         if (isPaid) {
  //           // ใช้ราคาประมาณจากข้อมูลที่มี (ถ้ามี)
  //           let estimatedAmount = 0;

  //           // ประมาณการจาก Investigation Notes
  //           if (treatment.INVESTIGATION_NOTES) {
  //             const notes = treatment.INVESTIGATION_NOTES;
  //             if (notes.includes('[Laboratory]')) estimatedAmount += 100;
  //             if (notes.includes('[Imaging]')) estimatedAmount += 200;
  //           }

  //           // ค่าการตรวจพื้นฐาน
  //           estimatedAmount += 100;

  //           totalRevenue += estimatedAmount;
  //           totalPatients++;
  //           paidTreatments.push({
  //             ...treatment,
  //             parsedPaymentInfo: { TOTAL_AMOUNT: estimatedAmount }
  //           });
  //         }
  //       }
  //     }
  //   });

  //   // คำนวณรายรับตามประเภท (ประมาณการจากข้อมูลที่มี)
  //   paidTreatments.forEach(treatment => {
  //     if (treatment.INVESTIGATION_NOTES) {
  //       const notes = treatment.INVESTIGATION_NOTES;
  //       if (notes.includes('[Laboratory]')) {
  //         const labCount = (notes.match(/\[Laboratory\]/g) || []).length;
  //         labRevenue += labCount * 100;
  //       }
  //       if (notes.includes('[Imaging]')) {
  //         const imagingCount = (notes.match(/\[Imaging\]/g) || []).length;
  //         procedureRevenue += imagingCount * 200;
  //       }
  //     }

  //     // ค่ารักษาพื้นฐาน
  //     const baseConsultation = 100;
  //     const remaining = (treatment.parsedPaymentInfo?.TOTAL_AMOUNT || 0) - labRevenue - procedureRevenue;
  //     if (remaining > 0) {
  //       drugRevenue += remaining;
  //     }
  //   });

  //   // Calculate averages and percentages
  //   const avgRevenuePerPatient = totalPatients > 0 ? totalRevenue / totalPatients : 0;

  //   // Compare with previous period (mock calculation - ในอนาคตอาจดึงข้อมูลจริง)
  //   const previousPeriodRevenue = totalRevenue * 0.85;
  //   const revenueGrowth = previousPeriodRevenue > 0 ? ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 : 0;

  //   return {
  //     totalRevenue,
  //     totalPatients,
  //     avgRevenuePerPatient,
  //     revenueGrowth,
  //     labRevenue,
  //     drugRevenue,
  //     procedureRevenue,
  //     paidTreatments,
  //     categories: [
  //       { name: 'การตรวจ/ห้องปฏิบัติการ', value: labRevenue, color: '#4285F4' },
  //       { name: 'ยาและการรักษา', value: drugRevenue, color: '#34A853' },
  //       { name: 'หัตถการ/เอ็กซเรย์', value: procedureRevenue, color: '#FBBC04' }
  //     ].filter(item => item.value > 0)
  //   };
  // };

  const generateChartData = (treatments) => {
    // This function is now replaced by API data
    return {
      dailyRevenue: [],
      categoryRevenue: []
    };
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    const today = new Date();

    switch (newPeriod) {
      case '7days':
        setStartDate(new Date(today.setDate(today.getDate() - 7)));
        setEndDate(new Date());
        break;
      case '30days':
        setStartDate(new Date(today.setDate(today.getDate() - 30)));
        setEndDate(new Date());
        break;
      case '90days':
        setStartDate(new Date(today.setDate(today.getDate() - 90)));
        setEndDate(new Date());
        break;
      default:
        break;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <Container maxWidth={false} sx={{ mt: 2, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          กำลังโหลดข้อมูลรายรับ...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth={false} sx={{ mt: 2 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={loadDashboardData}>
            ลองใหม่
          </Button>
        }>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ mt: 2, maxWidth: "1600px" }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          รายงานรายรับคลินิก
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <IconButton onClick={loadDashboardData} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Date Filter Controls */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>ช่วงเวลา</InputLabel>
              <Select
                value={period}
                label="ช่วงเวลา"
                onChange={(e) => handlePeriodChange(e.target.value)}
              >
                <MenuItem value="7days">7 วันที่แล้ว</MenuItem>
                <MenuItem value="30days">30 วันที่แล้ว</MenuItem>
                <MenuItem value="90days">90 วันที่แล้ว</MenuItem>
                <MenuItem value="custom">กำหนดเอง</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label="วันที่เริ่มต้น"
              type="date"
              value={startDate.toISOString().split('T')[0]}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              size="small"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label="วันที่สิ้นสุด"
              type="date"
              value={endDate.toISOString().split('T')[0]}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              size="small"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" fontWeight="bold">
                รายงานรายรับคลินิก
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {/* เพิ่มปุ่มรายงานประจำวัน */}
                <DailyReportButton
                  selectedDate={endDate ? endDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                  revenueData={revenueData}
                />
                <IconButton onClick={loadDashboardData} color="primary">
                  <RefreshIcon />
                </IconButton>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Revenue Summary Cards */}
      {revenueData && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <MoneyIcon sx={{ fontSize: 40, mr: 1, opacity: 0.8 }} />
                  <Typography variant="h6">รายรับรวม</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                  {formatCurrency(revenueData.totalRevenue)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {revenueData.revenueGrowth >= 0 ? (
                    <TrendingUpIcon sx={{ mr: 0.5, color: '#4ade80' }} />
                  ) : (
                    <TrendingDownIcon sx={{ mr: 0.5, color: '#f87171' }} />
                  )}
                  <Typography variant="body2">
                    {Math.abs(revenueData.revenueGrowth).toFixed(1)}% จากช่วงก่อนหน้า
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PeopleIcon sx={{ fontSize: 40, mr: 1, opacity: 0.8 }} />
                  <Typography variant="h6">ผู้ป่วยที่จ่ายเงิน</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                  {revenueData.totalPatients.toLocaleString()}
                </Typography>
                <Typography variant="body2">คน</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AssessmentIcon sx={{ fontSize: 40, mr: 1, opacity: 0.8 }} />
                  <Typography variant="h6">รายรับเฉลี่ย/คน</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                  {formatCurrency(revenueData.avgRevenuePerPatient)}
                </Typography>
                <Typography variant="body2">ต่อคน</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <HospitalIcon sx={{ fontSize: 40, mr: 1, opacity: 0.8 }} />
                  <Typography variant="h6">ผู้ป่วยวันนี้</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                  {patientData ? patientData.length.toLocaleString() : '0'}
                </Typography>
                <Typography variant="body2">คน</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Daily Revenue Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                รายรับรายวัน
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit' })}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `฿${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), 'รายรับ']}
                    labelFormatter={(date) => `วันที่ ${new Date(date).toLocaleDateString('th-TH')}`}
                  />
                  <Bar dataKey="revenue" fill="#4285F4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue by Category Pie Chart */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                รายรับแยกตามประเภท
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueData?.categories || []}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {(revenueData?.categories || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Patients Table */}
      {patientData && patientData.length > 0 && (
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0' }}>
              <Typography variant="h6">
                ผู้ป่วยวันนี้ ({patientData.length} คน)
              </Typography>
            </Box>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>ลำดับคิว</TableCell>
                    <TableCell>ชื่อผู้ป่วย</TableCell>
                    <TableCell>HN</TableCell>
                    <TableCell>อายุ</TableCell>
                    <TableCell>เพศ</TableCell>
                    <TableCell>สถานะ</TableCell>
                    <TableCell>เวลา</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {patientData.slice(0, 10).map((patient, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Chip
                          label={patient.queueNumber || index + 1}
                          color="primary"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            sx={{ width: 32, height: 32 }}
                            src={patient.avatar}
                          >
                            {patient.NAME1?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {`${patient.PRENAME || ''} ${patient.NAME1} ${patient.SURNAME || ''}`.trim()}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{patient.HNCODE}</TableCell>
                      <TableCell>{patient.AGE}</TableCell>
                      <TableCell>{patient.SEX}</TableCell>
                      <TableCell>
                        <Chip
                          label={patient.queueStatus || 'รอตรวจ'}
                          color={
                            patient.queueStatus === 'เสร็จแล้ว' ? 'success' :
                              patient.queueStatus === 'กำลังตรวจ' ? 'warning' : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {patient.queueTime ? new Date(patient.queueTime).toLocaleTimeString('th-TH', {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default Dashboard;