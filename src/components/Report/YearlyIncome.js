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
  Search as SearchIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import TreatmentService from "../../services/treatmentService";
import {
  formatThaiDateShort,
} from "../../utils/dateTimeUtils";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
  }).format(amount || 0);

const YearlyIncome = () => {
  const currentYear = new Date().getFullYear();

  const [startYear, setStartYear] = useState(currentYear.toString());
  const [endYear, setEndYear] = useState(currentYear.toString());
  const [incomeRecords, setIncomeRecords] = useState([]);
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

  // State for history dialog (View detail)
  const [historyDialog, setHistoryDialog] = useState({
    open: false,
    vno: null,
    treatmentData: null
  });

  useEffect(() => {
    loadIncomeRecords();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [incomeRecords, startYear, endYear, statusFilter, typeFilter, searchTerm]);

  const loadIncomeRecords = async () => {
    try {
      setLoading(true);
      setError(null);

      const startYearNum = parseInt(startYear);
      const endYearNum = parseInt(endYear);

      const startDateStr = `${startYearNum}-01-01`;
      const endDateStr = `${endYearNum}-12-31`;

      console.log(`Fetching yearly report from ${startDateStr} to ${endDateStr}`);

      const response = await TreatmentService.getPaidTreatmentsWithDetails({
        date_from: startDateStr,
        date_to: endDateStr,
        limit: 2000 // Increase limit for yearly report
      });

      if (response.success) {
        setIncomeRecords(response.data);
      } else {
        setError("ไม่สามารถโหลดข้อมูลรายรับได้");
      }
    } catch (err) {
      console.error("Error loading income records", err);
      setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูลรายรับ");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...incomeRecords];

    if (statusFilter) {
      filtered = filtered.filter(item =>
        (item.PAYMENT_STATUS === statusFilter) || (item.STATUS1 === statusFilter)
      );
    }

    if (typeFilter) {
      filtered = filtered.filter(item => item.PAYMENT_METHOD === typeFilter);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((item) =>
        item.VNO?.toLowerCase().includes(search) ||
        item.HNNO?.toLowerCase().includes(search) ||
        item.NAME1?.toLowerCase().includes(search) ||
        (item.PRENAME + item.NAME1 + " " + item.SURNAME).toLowerCase().includes(search)
      );
    }

    setFilteredRecords(filtered);
  };

  const summary = useMemo(() => {
    const totals = filteredRecords.reduce(
      (acc, item) => {
        const total = parseFloat(item.NET_AMOUNT) || 0;
        acc.totalAmount += total;

        const method = item.PAYMENT_METHOD || 'เงินสด';
        let amountToAdd = total;

        if (method === 'เงินสด') {
          acc.cash += amountToAdd;
        } else if (method === 'เงินโอน') {
          acc.transfer += amountToAdd;
        } else if (method === 'บัตรทอง') {
          if (amountToAdd > 0) acc.other += amountToAdd;
        } else {
          acc.other += amountToAdd;
        }

        const status = item.PAYMENT_STATUS || item.STATUS1 || 'สำเร็จ';
        acc.status[status] = (acc.status[status] || 0) + 1;

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
    const set = new Set(incomeRecords.map((item) => item.STATUS).filter(Boolean));
    return Array.from(set);
  }, [incomeRecords]);

  const uniqueTypePays = useMemo(() => {
    const set = new Set(incomeRecords.map((item) => item.TYPE_PAY).filter(Boolean));
    return Array.from(set);
  }, [incomeRecords]);

  const handleExportCSV = () => {
    // Placeholder
    alert("Export CSV not yet implemented for new format");
  };

  const loadRecordDetail = async (refno) => {
    // Placeholder
  };

  const detailTotal = useMemo(() => {
    const details = detailDialog.data?.details || [];
    if (details.length === 0) {
      return parseFloat(detailDialog.data?.header?.TOTAL) || 0;
    }
    const total = details.reduce((sum, detail) => sum + (parseFloat(detail.AMT) || 0), 0);
    return total || parseFloat(detailDialog.data?.header?.TOTAL) || 0;
  }, [detailDialog.data]);

  const yearOptions = Array.from({ length: 10 }, (_, i) => {
    const year = currentYear - i;
    return year.toString();
  });

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          รายรับประจำปี
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadIncomeRecords}
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
                <InputLabel>วิธีรับ</InputLabel>
                <Select
                  label="วิธีรับ"
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
                label="ค้นหา (เลขที่, รับจาก, เลขบัญชี)"
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
                <Typography variant="body2">ใบสำคัญรับ</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: "100%", background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6">ยอดรับรวม</Typography>
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
              รายละเอียดใบสำคัญรับ ({filteredRecords.length} รายการ)
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
                    <TableCell>ลำดับ</TableCell>
                    <TableCell>VN</TableCell>
                    <TableCell>HN</TableCell>
                    <TableCell>ชื่อคนไข้</TableCell>
                    <TableCell align="right">ค่ารักษา</TableCell>
                    <TableCell align="right">ค่าหัตถการ</TableCell>
                    <TableCell align="right">ค่า LAB</TableCell>
                    <TableCell align="right">ค่ายา</TableCell>
                    <TableCell align="right">รวม</TableCell>
                    <TableCell align="right">เงินสด</TableCell>
                    <TableCell align="right">เงินโอน</TableCell>
                    <TableCell align="right">บัตรทอง</TableCell>
                    <TableCell align="center">จัดการ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRecords.map((row, index) => {
                    const drugFee = row.drugs?.reduce((sum, d) => sum + (parseFloat(d.AMT) || 0), 0) || 0;
                    const procFee = row.procedures?.reduce((sum, p) => sum + (parseFloat(p.AMT) || 0), 0) || 0;
                    const labFee = (row.labTests?.reduce((sum, l) => sum + (parseFloat(l.PRICE) || 0), 0) || 0) +
                      (row.radiologicalTests?.reduce((sum, r) => sum + (parseFloat(r.PRICE) || 0), 0) || 0);
                    const treatmentFee = parseFloat(row.TREATMENT_FEE) || 0;

                    const total = parseFloat(row.TOTAL_AMOUNT) || 0;
                    const net = parseFloat(row.NET_AMOUNT) || 0;
                    const method = row.PAYMENT_METHOD || 'เงินสด';

                    let cash = 0;
                    let transfer = 0;
                    let goldCard = 0;

                    const isGoldCardCase = row.UCS_CARD === 'Y' || method === 'บัตรทอง';

                    if (method === 'เงินโอน') {
                      transfer = net;
                    } else if (method === 'บัตรทอง') {
                      goldCard = net;
                    } else {
                      cash = net;
                    }

                    return (
                      <TableRow key={row.VNO || index} hover>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {row.VNO}
                          </Typography>
                        </TableCell>
                        <TableCell>{row.HNNO}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {`${row.PRENAME || ''}${row.NAME1} ${row.SURNAME || ''}`.trim()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{formatCurrency(treatmentFee)}</TableCell>
                        <TableCell align="right">{formatCurrency(procFee)}</TableCell>
                        <TableCell align="right">{formatCurrency(labFee)}</TableCell>
                        <TableCell align="right">{formatCurrency(drugFee)}</TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold">
                            {formatCurrency(total)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'success.main' }}>
                          {cash > 0 ? formatCurrency(cash) : '-'}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'info.main' }}>
                          {transfer > 0 ? formatCurrency(transfer) : '-'}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'warning.main' }}>
                          {goldCard > 0 ? formatCurrency(goldCard) : (isGoldCardCase && net === 0 ? '0' : '-')}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setHistoryDialog({ open: true, vno: row.VNO, treatmentData: row });
                            }}
                            sx={{ border: "1px solid #5698E0", borderRadius: "7px", color: "#5698E0" }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
              ไม่มีข้อมูลรายรับในช่วงปีที่เลือก
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ลองปรับช่วงปีหรือเงื่อนไขการค้นหาอื่น ๆ
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Dialog removed as it depended on Income1Service data structure */}
      <Dialog
        open={false}
        onClose={() => { /* setDetailDialog({ open: false, refno: null, data: null }) */ }}
      >
      </Dialog>

      {/* History/Detail Dialog */}
      <Dialog
        open={historyDialog.open}
        onClose={() => setHistoryDialog({ open: false, vno: null, treatmentData: null })}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">ประวัติการรักษา - VN: {historyDialog.vno}</Typography>
            <IconButton onClick={() => setHistoryDialog({ open: false, vno: null, treatmentData: null })} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {historyDialog.treatmentData ? (
            <Box>
              {/* ข้อมูลการรักษา */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>ข้อมูลการรักษา</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">วันที่:</Typography>
                      <Typography variant="body1">{formatThaiDateShort(historyDialog.treatmentData.RDATE)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">อาการ:</Typography>
                      <Typography variant="body1">{historyDialog.treatmentData.SYMPTOM || '-'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">การวินิจฉัย:</Typography>
                      <Typography variant="body1" color="primary">
                        {historyDialog.treatmentData.DXCODE || '-'}{' '}
                        {historyDialog.treatmentData.ICD10CODE ? `(${historyDialog.treatmentData.ICD10CODE})` : ''}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">ชื่อการวินิจฉัย:</Typography>
                      <Typography variant="body1">
                        {historyDialog.treatmentData.DXNAME_THAI || historyDialog.treatmentData.ICD10NAME_THAI || '-'}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* รายการยา */}
              {historyDialog.treatmentData.drugs && historyDialog.treatmentData.drugs.length > 0 && (
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>รายการยา ({historyDialog.treatmentData.drugs.length} รายการ)</Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>ชื่อยา</TableCell>
                            <TableCell align="right">จำนวน</TableCell>
                            <TableCell>หน่วย</TableCell>
                            <TableCell align="right">ราคา</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {historyDialog.treatmentData.drugs.map((drug, index) => (
                            <TableRow key={index}>
                              <TableCell>{drug.GENERIC_NAME || drug.DRUG_CODE}</TableCell>
                              <TableCell align="right">{drug.QTY}</TableCell>
                              <TableCell>{drug.UNIT_CODE}</TableCell>
                              <TableCell align="right">{formatCurrency(drug.AMT)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              )}

              {/* หัตถการ */}
              {historyDialog.treatmentData.procedures && historyDialog.treatmentData.procedures.length > 0 && (
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>หัตถการ ({historyDialog.treatmentData.procedures.length} รายการ)</Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>ชื่อหัตถการ</TableCell>
                            <TableCell align="right">ราคา</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {historyDialog.treatmentData.procedures.map((proc, index) => (
                            <TableRow key={index}>
                              <TableCell>{proc.MED_PRO_NAME_THAI || proc.PROCEDURE_NAME}</TableCell>
                              <TableCell align="right">{formatCurrency(proc.AMT)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              )}

              {/* ค่าแล็บ/เอกซเรย์ */}
              {(
                (historyDialog.treatmentData.labTests && historyDialog.treatmentData.labTests.length > 0) ||
                (historyDialog.treatmentData.radiologicalTests && historyDialog.treatmentData.radiologicalTests.length > 0)
              ) && (
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>Lab & X-ray</Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>รายการ</TableCell>
                              <TableCell align="right">ราคา</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {/* Labs */}
                            {historyDialog.treatmentData.labTests?.map((lab, index) => (
                              <TableRow key={`lab-${index}`}>
                                <TableCell>{lab.LAB_NAME_THAI || lab.LAB_NAME}</TableCell>
                                <TableCell align="right">{formatCurrency(lab.PRICE)}</TableCell>
                              </TableRow>
                            ))}
                            {/* Radio */}
                            {historyDialog.treatmentData.radiologicalTests?.map((rad, index) => (
                              <TableRow key={`rad-${index}`}>
                                <TableCell>{rad.RADIOLOGICAL_NAME_THAI || rad.RADIOLOGICAL_NAME}</TableCell>
                                <TableCell align="right">{formatCurrency(rad.PRICE)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                )}

            </Box>
          ) : (
            <CircularProgress />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialog({ open: false, vno: null, treatmentData: null })}>ปิด</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default YearlyIncome;

