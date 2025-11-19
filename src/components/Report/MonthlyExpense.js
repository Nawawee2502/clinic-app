import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import Pay1Service from "../../services/pay1Service";
import {
  formatThaiDateShort,
} from "../../utils/dateTimeUtils";
import ExpensePdfButton from "./ExpensePdfButton";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
  }).format(amount || 0);

const MonthlyExpense = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const [startYear, setStartYear] = useState(currentYear.toString());
  const [startMonth, setStartMonth] = useState(currentMonth.toString());
  const [endYear, setEndYear] = useState(currentYear.toString());
  const [endMonth, setEndMonth] = useState(currentMonth.toString());
  const [payRecords, setPayRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [detailDialog, setDetailDialog] = useState({
    open: false,
    refno: null,
    data: null,
  });

  useEffect(() => {
    loadPayRecords();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [payRecords, startYear, startMonth, endYear, endMonth, statusFilter, typeFilter, searchTerm]);

  const loadPayRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await Pay1Service.getAllPay1(1, 500);
      if (response.success) {
        const records = Array.isArray(response.data) ? response.data : [];
        setPayRecords(records);
      } else {
        setError(response.message || "ไม่สามารถโหลดข้อมูลรายจ่ายได้");
      }
    } catch (err) {
      console.error("Error loading pay records", err);
      setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูลรายจ่าย");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const startYearNum = parseInt(startYear);
    const startMonthNum = parseInt(startMonth);
    const endYearNum = parseInt(endYear);
    const endMonthNum = parseInt(endMonth);

    const filtered = payRecords.filter((item) => {
      const itemYear = parseInt(item.MYEAR) || 0;
      const itemMonth = parseInt(item.MONTHH) || 0;

      // ตรวจสอบว่าอยู่ในช่วงเดือนที่เลือกหรือไม่
      const startDate = new Date(startYearNum, startMonthNum - 1, 1);
      const endDate = new Date(endYearNum, endMonthNum, 0); // วันสุดท้ายของเดือน
      const itemDate = new Date(itemYear, itemMonth - 1, 1);

      if (itemDate < startDate || itemDate > endDate) return false;

      if (statusFilter && item.STATUS !== statusFilter) return false;
      if (typeFilter && item.TYPE_PAY !== typeFilter) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const match =
          item.REFNO?.toLowerCase().includes(search) ||
          item.NAME1?.toLowerCase().includes(search) ||
          item.BANK_NO?.toLowerCase().includes(search);
        if (!match) return false;
      }
      return true;
    });

    setFilteredRecords(filtered);
  };

  const summary = useMemo(() => {
    const totals = filteredRecords.reduce(
      (acc, item) => {
        const total = parseFloat(item.TOTAL) || 0;
        acc.totalAmount += total;
        if (item.TYPE_PAY === "เงินสด") {
          acc.cash += total;
        } else if (item.TYPE_PAY === "เงินโอน") {
          acc.transfer += total;
        } else {
          acc.other += total;
        }
        acc.status[item.STATUS] = (acc.status[item.STATUS] || 0) + 1;
        return acc;
      },
      { totalAmount: 0, cash: 0, transfer: 0, other: 0, status: {} }
    );

    return {
      count: filteredRecords.length,
      ...totals,
    };
  }, [filteredRecords]);

  const uniqueStatuses = useMemo(() => {
    const set = new Set(payRecords.map((item) => item.STATUS).filter(Boolean));
    return Array.from(set);
  }, [payRecords]);

  const uniqueTypePays = useMemo(() => {
    const set = new Set(payRecords.map((item) => item.TYPE_PAY).filter(Boolean));
    return Array.from(set);
  }, [payRecords]);

  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      alert("ไม่มีข้อมูลสำหรับการส่งออก");
      return;
    }
    Pay1Service.downloadCSV(filteredRecords, "monthly-expense-report");
  };

  const loadRecordDetail = async (refno) => {
    try {
      setDetailDialog({ open: true, refno, data: null });
      const response = await Pay1Service.getPay1ByRefno(refno);
      if (response.success) {
        setDetailDialog({ open: true, refno, data: response.data });
      } else {
        setDetailDialog((prev) => ({ ...prev, data: { error: "ไม่พบข้อมูลรายละเอียด" } }));
      }
    } catch (err) {
      console.error("Error fetching pay detail", err);
      setDetailDialog((prev) => ({ ...prev, data: { error: err.message } }));
    }
  };

  const detailTotal = useMemo(() => {
    const details = detailDialog.data?.details || [];
    if (details.length === 0) {
      return parseFloat(detailDialog.data?.header?.TOTAL) || 0;
    }
    const total = details.reduce((sum, detail) => sum + (parseFloat(detail.AMT) || 0), 0);
    return total || parseFloat(detailDialog.data?.header?.TOTAL) || 0;
  }, [detailDialog.data]);

  const monthOptions = [
    { value: '1', label: 'มกราคม' },
    { value: '2', label: 'กุมภาพันธ์' },
    { value: '3', label: 'มีนาคม' },
    { value: '4', label: 'เมษายน' },
    { value: '5', label: 'พฤษภาคม' },
    { value: '6', label: 'มิถุนายน' },
    { value: '7', label: 'กรกฎาคม' },
    { value: '8', label: 'สิงหาคม' },
    { value: '9', label: 'กันยายน' },
    { value: '10', label: 'ตุลาคม' },
    { value: '11', label: 'พฤศจิกายน' },
    { value: '12', label: 'ธันวาคม' },
  ];

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - i;
    return year.toString();
  });

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          รายจ่ายประจำเดือน
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadPayRecords}
            disabled={loading}
          >
            รีเฟรช
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExportCSV}
            disabled={loading || filteredRecords.length === 0}
          >
            ส่งออก CSV
          </Button>
          <ExpensePdfButton
            startDate={null}
            endDate={null}
            records={filteredRecords}
            summary={{
              totalAmount: summary.totalAmount,
              cash: summary.cash,
              transfer: summary.transfer,
            }}
          />
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            ตัวกรองข้อมูล
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>ปีเริ่มต้น</InputLabel>
                <Select
                  label="ปีเริ่มต้น"
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                >
                  {yearOptions.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>เดือนเริ่มต้น</InputLabel>
                <Select
                  label="เดือนเริ่มต้น"
                  value={startMonth}
                  onChange={(e) => setStartMonth(e.target.value)}
                >
                  {monthOptions.map((month) => (
                    <MenuItem key={month.value} value={month.value}>
                      {month.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>ปีสิ้นสุด</InputLabel>
                <Select
                  label="ปีสิ้นสุด"
                  value={endYear}
                  onChange={(e) => setEndYear(e.target.value)}
                >
                  {yearOptions.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>เดือนสิ้นสุด</InputLabel>
                <Select
                  label="เดือนสิ้นสุด"
                  value={endMonth}
                  onChange={(e) => setEndMonth(e.target.value)}
                >
                  {monthOptions.map((month) => (
                    <MenuItem key={month.value} value={month.value}>
                      {month.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>สถานะ</InputLabel>
                <Select
                  label="สถานะ"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">ทั้งหมด</MenuItem>
                  {uniqueStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>วิธีจ่าย</InputLabel>
                <Select
                  label="วิธีจ่าย"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="">ทั้งหมด</MenuItem>
                  {uniqueTypePays.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="ค้นหา (เลขที่, จ่ายให้, เลขบัญชี)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {summary.count > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: "100%", background: "linear-gradient(135deg, #4fb0ff 0%, #4478ff 100%)", color: "white" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6">รายการทั้งหมด</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold">
                  {summary.count}
                </Typography>
                <Typography variant="body2">ใบสำคัญจ่าย</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: "100%", background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6">ยอดจ่ายรวม</Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {formatCurrency(summary.totalAmount)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: "100%", background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", color: "white" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6">เงินสด</Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {formatCurrency(summary.cash)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: "100%", background: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)", color: "white" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6">เงินโอน</Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {formatCurrency(summary.transfer)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && filteredRecords.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              รายละเอียดใบสำคัญจ่าย ({filteredRecords.length} รายการ)
            </Typography>
            {Object.keys(summary.status).length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                {Object.entries(summary.status).map(([status, count]) => (
                  <Chip key={status} label={`${status}: ${count} รายการ`} color="primary" variant="outlined" />
                ))}
              </Box>
            )}
            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 110, whiteSpace: "nowrap" }}>วันที่</TableCell>
                    <TableCell sx={{ width: 120, whiteSpace: "nowrap" }}>เลขที่</TableCell>
                    <TableCell sx={{ width: 240, whiteSpace: "nowrap" }}>จ่ายให้</TableCell>
                    <TableCell sx={{ width: 130, whiteSpace: "nowrap" }}>วิธีจ่าย</TableCell>
                    <TableCell align="right" sx={{ width: 150, whiteSpace: "nowrap" }}>จำนวนเงิน</TableCell>
                    <TableCell sx={{ width: 150, whiteSpace: "nowrap" }}>สถานะ</TableCell>
                    <TableCell align="center" sx={{ width: 120, whiteSpace: "nowrap" }}>จัดการ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRecords.map((item) => (
                    <TableRow key={item.REFNO} hover>
                      <TableCell sx={{ width: 110, whiteSpace: "nowrap" }}>
                        {formatThaiDateShort(item.RDATE)}
                      </TableCell>
                      <TableCell sx={{ width: 120, whiteSpace: "nowrap" }}>
                        <Typography variant="body2" fontWeight="bold">
                          {item.REFNO}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.BANK_NO || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ width: 240 }}>
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          noWrap
                          sx={{ maxWidth: 220 }}
                        >
                          {item.NAME1 || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ width: 130, whiteSpace: "nowrap" }}>
                        {item.TYPE_PAY || "-"}
                      </TableCell>
                      <TableCell align="right" sx={{ width: 150, whiteSpace: "nowrap" }}>
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {formatCurrency(item.TOTAL)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ width: 150, whiteSpace: "nowrap" }}>
                        <Chip
                          label={item.STATUS || "-"}
                          color={item.STATUS === "ทำงานอยู่" ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ width: 120, whiteSpace: "nowrap" }}>
                        <IconButton
                          size="small"
                          onClick={() => loadRecordDetail(item.REFNO)}
                          sx={{ border: "1px solid #5698E0", borderRadius: "7px", color: "#5698E0" }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {!loading && filteredRecords.length === 0 && !error && (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              ไม่มีข้อมูลรายจ่ายในช่วงเดือนที่เลือก
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ลองปรับช่วงเดือนหรือเงื่อนไขการค้นหาอื่น ๆ
            </Typography>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, refno: null, data: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6">รายละเอียดใบสำคัญจ่าย {detailDialog.refno}</Typography>
            <Button onClick={() => setDetailDialog({ open: false, refno: null, data: null })}>
              ปิด
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {!detailDialog.data && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          )}
          {detailDialog.data?.error && (
            <Alert severity="error">{detailDialog.data.error}</Alert>
          )}
          {detailDialog.data?.header && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    วันที่
                  </Typography>
                  <Typography variant="body1">
                    {formatThaiDateShort(detailDialog.data.header.RDATE)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    จ่ายให้
                  </Typography>
                  <Typography variant="body1">
                    {detailDialog.data.header.NAME1 || "-"}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    วิธีจ่าย
                  </Typography>
                  <Typography variant="body1">
                    {detailDialog.data.header.TYPE_PAY || "-"}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                รายการจ่าย
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ประเภท</TableCell>
                      <TableCell>รายละเอียด</TableCell>
                      <TableCell align="right">จำนวนเงิน</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(detailDialog.data.details || []).map((detail, index) => (
                      <TableRow key={index}>
                        <TableCell>{detail.TYPE_PAY_NAME || detail.TYPE_PAY_CODE || "-"}</TableCell>
                        <TableCell>{detail.DESCM1 || "-"}</TableCell>
                        <TableCell align="right">{formatCurrency(parseFloat(detail.AMT) || 0)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2} align="right" sx={{ fontWeight: 600 }}>
                        รวม
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatCurrency(detailTotal)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog({ open: false, refno: null, data: null })}>
            ปิด
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MonthlyExpense;

