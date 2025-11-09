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
import Income1Service from "../../services/income1Service";
import Pay1Service from "../../services/pay1Service";
import {
  formatThaiDateShort,
  getCurrentDateForDB,
} from "../../utils/dateTimeUtils";
import SummaryPdfButton from "./SummaryPdfButton";

const convertDateCEToBE = (ceDate) => {
  if (!ceDate) return "";
  const [year, month, day] = ceDate.split("-");
  return `${parseInt(year, 10) + 543}-${month}-${day}`;
};

const convertDateBEToCE = (beDate) => {
  if (!beDate) return "";
  const [year, month, day] = beDate.split("-");
  return `${parseInt(year, 10) - 543}-${month}-${day}`;
};

const DateInputBE = ({ label, value, onChange, ...props }) => {
  const displayValue = value ? convertDateCEToBE(value) : "";

  const handleChange = (event) => {
    const beValue = event.target.value;
    const ceValue = beValue ? convertDateBEToCE(beValue) : "";
    onChange?.({ target: { value: ceValue } });
  };

  return (
    <TextField
      {...props}
      fullWidth
      label={label}
      type="date"
      value={displayValue}
      onChange={handleChange}
      InputLabelProps={{ shrink: true }}
      inputProps={{ max: convertDateCEToBE("9999-12-31") }}
    />
  );
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
  }).format(amount || 0);

const SummaryReport = () => {
  const [startDate, setStartDate] = useState(getCurrentDateForDB());
  const [endDate, setEndDate] = useState(getCurrentDateForDB());
  const [incomeRecords, setIncomeRecords] = useState([]);
  const [expenseRecords, setExpenseRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [incomeTypeFilter, setIncomeTypeFilter] = useState("");
  const [expenseTypeFilter, setExpenseTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [incomeDialog, setIncomeDialog] = useState({ open: false, refno: null, data: null });
  const [expenseDialog, setExpenseDialog] = useState({ open: false, refno: null, data: null });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [incomeResponse, expenseResponse] = await Promise.all([
        Income1Service.getAllIncome1(1, 500),
        Pay1Service.getAllPay1(1, 500),
      ]);
      if (incomeResponse.success) {
        setIncomeRecords(Array.isArray(incomeResponse.data) ? incomeResponse.data : []);
      } else {
        throw new Error(incomeResponse.message || "โหลดข้อมูลรายรับไม่สำเร็จ");
      }
      if (expenseResponse.success) {
        setExpenseRecords(Array.isArray(expenseResponse.data) ? expenseResponse.data : []);
      } else {
        throw new Error(expenseResponse.message || "โหลดข้อมูลรายจ่ายไม่สำเร็จ");
      }
    } catch (err) {
      console.error("Error loading summary data", err);
      setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const filterByDate = (records, start, end) => {
    const startObj = start ? new Date(start) : null;
    const endObj = end ? new Date(end) : null;

    return records.filter((item) => {
      if (!item.RDATE) return false;
      const recordDate = new Date(item.RDATE);
      if (startObj && recordDate < startObj) return false;
      if (endObj) {
        const endDay = new Date(endObj);
        endDay.setHours(23, 59, 59, 999);
        if (recordDate > endDay) return false;
      }
      return true;
    });
  };

  const filteredIncome = useMemo(() => {
    let result = filterByDate(incomeRecords, startDate, endDate);
    if (incomeTypeFilter) {
      result = result.filter((item) => item.TYPE_PAY === incomeTypeFilter);
    }
    if (statusFilter) {
      result = result.filter((item) => item.STATUS === statusFilter);
    }
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.REFNO?.toLowerCase().includes(search) ||
          item.NAME1?.toLowerCase().includes(search) ||
          item.BANK_NO?.toLowerCase().includes(search)
      );
    }
    return result;
  }, [incomeRecords, startDate, endDate, incomeTypeFilter, statusFilter, searchTerm]);

  const filteredExpense = useMemo(() => {
    let result = filterByDate(expenseRecords, startDate, endDate);
    if (expenseTypeFilter) {
      result = result.filter((item) => item.TYPE_PAY === expenseTypeFilter);
    }
    if (statusFilter) {
      result = result.filter((item) => item.STATUS === statusFilter);
    }
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.REFNO?.toLowerCase().includes(search) ||
          item.NAME1?.toLowerCase().includes(search) ||
          item.BANK_NO?.toLowerCase().includes(search)
      );
    }
    return result;
  }, [expenseRecords, startDate, endDate, expenseTypeFilter, statusFilter, searchTerm]);

  const summary = useMemo(() => {
    const incomeTotal = filteredIncome.reduce((sum, item) => sum + (parseFloat(item.TOTAL) || 0), 0);
    const incomeCash = filteredIncome
      .filter((item) => item.TYPE_PAY === "เงินสด")
      .reduce((sum, item) => sum + (parseFloat(item.TOTAL) || 0), 0);
    const incomeTransfer = filteredIncome
      .filter((item) => item.TYPE_PAY === "เงินโอน")
      .reduce((sum, item) => sum + (parseFloat(item.TOTAL) || 0), 0);

    const expenseTotal = filteredExpense.reduce((sum, item) => sum + (parseFloat(item.TOTAL) || 0), 0);
    const expenseCash = filteredExpense
      .filter((item) => item.TYPE_PAY === "เงินสด")
      .reduce((sum, item) => sum + (parseFloat(item.TOTAL) || 0), 0);
    const expenseTransfer = filteredExpense
      .filter((item) => item.TYPE_PAY === "เงินโอน")
      .reduce((sum, item) => sum + (parseFloat(item.TOTAL) || 0), 0);

    return {
      incomeCount: filteredIncome.length,
      expenseCount: filteredExpense.length,
      incomeTotal,
      incomeCash,
      incomeTransfer,
      expenseTotal,
      expenseCash,
      expenseTransfer,
      balance: incomeTotal - expenseTotal,
    };
  }, [filteredIncome, filteredExpense]);

  const combinedRows = useMemo(() => {
    const maxLength = Math.max(filteredIncome.length, filteredExpense.length);
    const incomeEntries = filteredIncome.map((item) => ({
      refno: item.REFNO,
      date: item.RDATE,
      name: item.NAME1,
      type: item.TYPE_PAY,
      amount: parseFloat(item.TOTAL) || 0,
      status: item.STATUS,
    }));
    const expenseEntries = filteredExpense.map((item) => ({
      refno: item.REFNO,
      date: item.RDATE,
      name: item.NAME1,
      type: item.TYPE_PAY,
      amount: parseFloat(item.TOTAL) || 0,
      status: item.STATUS,
    }));

    const rows = [];
    for (let i = 0; i < maxLength; i += 1) {
      rows.push({
        income: incomeEntries[i] || null,
        expense: expenseEntries[i] || null,
      });
    }
    return rows;
  }, [filteredIncome, filteredExpense]);

  const incomePdfRows = useMemo(
    () =>
      filteredIncome.map((item) => ({
        name: item.NAME1 || item.DESCM1 || "-",
        amount: parseFloat(item.TOTAL) || 0,
      })),
    [filteredIncome]
  );

  const expensePdfRows = useMemo(
    () =>
      filteredExpense.map((item) => ({
        name: item.NAME1 || item.DESCM1 || "-",
        amount: parseFloat(item.TOTAL) || 0,
      })),
    [filteredExpense]
  );

  const incomeTypeOptions = useMemo(() => {
    const set = new Set(incomeRecords.map((item) => item.TYPE_PAY).filter(Boolean));
    return Array.from(set);
  }, [incomeRecords]);

  const expenseTypeOptions = useMemo(() => {
    const set = new Set(expenseRecords.map((item) => item.TYPE_PAY).filter(Boolean));
    return Array.from(set);
  }, [expenseRecords]);

  const statusOptions = useMemo(() => {
    const set = new Set([
      ...incomeRecords.map((item) => item.STATUS).filter(Boolean),
      ...expenseRecords.map((item) => item.STATUS).filter(Boolean),
    ]);
    return Array.from(set);
  }, [incomeRecords, expenseRecords]);

  const handleExportIncome = () => {
    if (filteredIncome.length === 0) {
      alert("ไม่มีข้อมูลรายรับสำหรับการส่งออก");
      return;
    }
    Income1Service.downloadCSV(filteredIncome, "daily-income-report");
  };

  const handleExportExpense = () => {
    if (filteredExpense.length === 0) {
      alert("ไม่มีข้อมูลรายจ่ายสำหรับการส่งออก");
      return;
    }
    Pay1Service.downloadCSV(filteredExpense, "daily-expense-report");
  };

  const loadIncomeDetail = async (refno) => {
    try {
      setIncomeDialog({ open: true, refno, data: null });
      const response = await Income1Service.getIncome1ByRefno(refno);
      if (response.success) {
        setIncomeDialog({ open: true, refno, data: response.data });
      } else {
        setIncomeDialog((prev) => ({ ...prev, data: { error: "ไม่พบข้อมูลรายละเอียด" } }));
      }
    } catch (err) {
      console.error("Error loading income detail", err);
      setIncomeDialog((prev) => ({ ...prev, data: { error: err.message } }));
    }
  };

  const loadExpenseDetail = async (refno) => {
    try {
      setExpenseDialog({ open: true, refno, data: null });
      const response = await Pay1Service.getPay1ByRefno(refno);
      if (response.success) {
        setExpenseDialog({ open: true, refno, data: response.data });
      } else {
        setExpenseDialog((prev) => ({ ...prev, data: { error: "ไม่พบข้อมูลรายละเอียด" } }));
      }
    } catch (err) {
      console.error("Error loading expense detail", err);
      setExpenseDialog((prev) => ({ ...prev, data: { error: err.message } }));
    }
  };

  const renderDetailDialog = (dialogState, setDialogState, title) => {
    const details = dialogState.data?.details || [];
    const totalAmount = details.reduce((sum, detail) => sum + (parseFloat(detail.AMT) || 0), 0);
    const fallbackTotal = parseFloat(dialogState.data?.header?.TOTAL) || 0;

    return (
      <Dialog
        open={dialogState.open}
        onClose={() => setDialogState({ open: false, refno: null, data: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6">{title} {dialogState.refno}</Typography>
            <Button onClick={() => setDialogState({ open: false, refno: null, data: null })}>ปิด</Button>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {!dialogState.data && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          )}
          {dialogState.data?.error && <Alert severity="error">{dialogState.data.error}</Alert>}
          {dialogState.data?.header && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    วันที่
                  </Typography>
                  <Typography variant="body1">
                    {formatThaiDateShort(dialogState.data.header.RDATE)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    ชื่อคู่สัญญา
                  </Typography>
                  <Typography variant="body1">
                    {dialogState.data.header.NAME1 || "-"}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    วิธีชำระ
                  </Typography>
                  <Typography variant="body1">
                    {dialogState.data.header.TYPE_PAY || "-"}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ mb: 2 }} />
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
                    {details.map((detail, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {detail.TYPE_INCOME_NAME || detail.TYPE_PAY_NAME || detail.TYPE_INCOME_CODE || detail.TYPE_PAY_CODE || "-"}
                        </TableCell>
                        <TableCell>{detail.DESCM1 || "-"}</TableCell>
                        <TableCell align="right">{formatCurrency(parseFloat(detail.AMT) || 0)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2} align="right" sx={{ fontWeight: 600 }}>
                        รวม
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatCurrency(totalAmount || fallbackTotal)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogState({ open: false, refno: null, data: null })}>ปิด</Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          สรุปรายรับ รายจ่ายประจำวัน
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            disabled={loading}
          >
            รีเฟรช
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExportIncome}
            disabled={loading || filteredIncome.length === 0}
          >
            ส่งออกรายรับ
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExportExpense}
            disabled={loading || filteredExpense.length === 0}
            sx={{ backgroundColor: "#f97316", "&:hover": { backgroundColor: "#ea580c" } }}
          >
            ส่งออกรายจ่าย
          </Button>
          <SummaryPdfButton
            startDate={startDate}
            endDate={endDate}
            incomeRows={incomePdfRows}
            expenseRows={expensePdfRows}
            summary={summary}
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
              <DateInputBE
                label="วันที่เริ่มต้น"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <DateInputBE
                label="วันที่สิ้นสุด"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
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
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>วิธีรับเงิน</InputLabel>
                <Select
                  label="วิธีรับเงิน"
                  value={incomeTypeFilter}
                  onChange={(e) => setIncomeTypeFilter(e.target.value)}
                >
                  <MenuItem value="">ทั้งหมด</MenuItem>
                  {incomeTypeOptions.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>วิธีจ่ายเงิน</InputLabel>
                <Select
                  label="วิธีจ่ายเงิน"
                  value={expenseTypeFilter}
                  onChange={(e) => setExpenseTypeFilter(e.target.value)}
                >
                  <MenuItem value="">ทั้งหมด</MenuItem>
                  {expenseTypeOptions.map((type) => (
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
                label="ค้นหา (เลขที่, ชื่อ, เลขบัญชี)"
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

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary stat boxes removed to match PDF layout */}

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && combinedRows.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              ตารางสรุปรายรับ-รายจ่าย ({summary.incomeCount} รายรับ / {summary.expenseCount} รายจ่าย)
            </Typography>
            <TableContainer component={Paper} sx={{ minWidth: 960 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      align="center"
                      sx={{ backgroundColor: "#f3f4f6", fontWeight: 600, whiteSpace: "nowrap" }}
                    >
                      รายรับ
                    </TableCell>
                    <TableCell
                      colSpan={2}
                      align="center"
                      sx={{ backgroundColor: "#fef2f2", fontWeight: 600, whiteSpace: "nowrap" }}
                    >
                      รายจ่าย
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, width: "35%", whiteSpace: "nowrap" }}>รายการ</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, width: "15%", whiteSpace: "nowrap" }}>
                      จำนวนเงิน
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, width: "35%", whiteSpace: "nowrap" }}>รายการ</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, width: "15%", whiteSpace: "nowrap" }}>
                      จำนวนเงิน
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {combinedRows.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {row.income ? (
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                            <Box sx={{ maxWidth: "75%" }}>
                              <Typography variant="body2" fontWeight="medium" noWrap>
                                {row.income.name || "-"}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {row.income.refno || "-"} • {row.income.type || "-"}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {formatThaiDateShort(row.income.date)}
                              </Typography>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => loadIncomeDetail(row.income.refno)}
                              sx={{ border: "1px solid #2563eb", borderRadius: "7px", color: "#2563eb" }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {row.income ? (
                          <Typography variant="body2" fontWeight="bold" color="primary" sx={{ whiteSpace: "nowrap" }}>
                            {formatCurrency(row.income.amount)}
                          </Typography>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {row.expense ? (
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                            <Box sx={{ maxWidth: "75%" }}>
                              <Typography variant="body2" fontWeight="medium" noWrap>
                                {row.expense.name || "-"}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {row.expense.refno || "-"} • {row.expense.type || "-"}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {formatThaiDateShort(row.expense.date)}
                              </Typography>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => loadExpenseDetail(row.expense.refno)}
                              sx={{ border: "1px solid #f97316", borderRadius: "7px", color: "#f97316" }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {row.expense ? (
                          <Typography variant="body2" fontWeight="bold" color="error" sx={{ whiteSpace: "nowrap" }}>
                            {formatCurrency(row.expense.amount)}
                          </Typography>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                    <TableCell sx={{ fontWeight: 600 }}>รวมรายรับ</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatCurrency(summary.incomeTotal)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>รวมรายจ่าย</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatCurrency(summary.expenseTotal)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>คงเหลือ</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatCurrency(summary.balance)}
                    </TableCell>
                    <TableCell colSpan={2} />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {!loading && combinedRows.length === 0 && !error && (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              ไม่มีข้อมูลในช่วงวันที่ที่เลือก
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ลองปรับช่วงวันที่หรือเงื่อนไขการค้นหาอื่น ๆ
            </Typography>
          </CardContent>
        </Card>
      )}

      {renderDetailDialog(incomeDialog, setIncomeDialog, "รายละเอียดใบสำคัญรับ")}
      {renderDetailDialog(expenseDialog, setExpenseDialog, "รายละเอียดใบสำคัญจ่าย")}
    </Box>
  );
};

export default SummaryReport;
