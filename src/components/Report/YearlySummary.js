import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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
import TreatmentService from "../../services/treatmentService";
import {
  formatThaiDateShort,
} from "../../utils/dateTimeUtils";
import SummaryPdfButton from "./SummaryPdfButton";
import MonthYearFilter from "../common/MonthYearFilter";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
  }).format(amount || 0);

// รวมยอดรายจ่ายตาม TYPE_PAY_CODE และ BANK_NO (สำหรับ summary และ PDF)
const groupExpensesByTypeAndBank = (records) => {
  if (!Array.isArray(records) || records.length === 0) return [];

  const groups = new Map();

  records.forEach((item) => {
    const typePayCode = item.TYPE_PAY_CODE || item.type_pay_code || "";
    const bankNo = item.BANK_NO || item.bank_no || "";
    const key = `${typePayCode}||${bankNo}`;

    const amount =
      parseFloat(item.AMT) ||
      parseFloat(item.TOTAL) ||
      0;

    if (!groups.has(key)) {
      groups.set(key, {
        ...item,
        TYPE_PAY_CODE: typePayCode,
        BANK_NO: bankNo,
        TOTAL: amount,
      });
    } else {
      const existing = groups.get(key);
      groups.set(key, {
        ...existing,
        TOTAL: (parseFloat(existing.TOTAL) || 0) + amount,
      });
    }
  });

  return Array.from(groups.values());
};

// รวมยอดรายจ่ายตาม TYPE_PAY_CODE (ประเภทรายจ่าย) เท่านั้น (สำหรับแสดงในตาราง)
const groupExpensesByType = (records) => {
  if (!Array.isArray(records) || records.length === 0) return [];

  const groups = new Map();

  records.forEach((item) => {
    const typePayCode = item.TYPE_PAY_CODE || item.type_pay_code || "";
    const typePayName = item.TYPE_PAY_NAME || item.type_pay_name || typePayCode || "ไม่ระบุ";

    const amount =
      parseFloat(item.AMT) ||
      parseFloat(item.TOTAL) ||
      0;

    if (!groups.has(typePayCode)) {
      groups.set(typePayCode, {
        TYPE_PAY_CODE: typePayCode,
        TYPE_PAY_NAME: typePayName,
        TOTAL: amount,
        count: 1,
      });
    } else {
      const existing = groups.get(typePayCode);
      groups.set(typePayCode, {
        ...existing,
        TOTAL: (parseFloat(existing.TOTAL) || 0) + amount,
        count: existing.count + 1,
      });
    }
  });

  return Array.from(groups.values()).sort((a, b) => {
    // เรียงตาม TYPE_PAY_CODE
    return (a.TYPE_PAY_CODE || "").localeCompare(b.TYPE_PAY_CODE || "");
  });
};

const YearlySummary = () => {
  const currentYear = new Date().getFullYear();

  const [startYear, setStartYear] = useState(currentYear.toString());
  const [endYear, setEndYear] = useState(currentYear.toString());
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

  // โหลดข้อมูลอัตโนมัติเมื่อ component mount
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ ดึงข้อมูลรายรับจาก TREATMENT1 ที่ชำระเงินแล้ว พร้อมแยกตามประเภท
      const [treatmentIncomeResponse, expenseResponse] = await Promise.all([
        TreatmentService.getPaidTreatmentsWithDetails({ page: 1, limit: 100000 }),
        Pay1Service.getExpensesReport(null, null, 'ทำงานอยู่'),
      ]);

      // ✅ แปลงข้อมูลรายรับจาก TREATMENT1 เป็นรูปแบบที่ใช้ได้
      if (treatmentIncomeResponse.success && treatmentIncomeResponse.data) {
        const incomeFromTreatments = [];

        treatmentIncomeResponse.data.forEach(treatment => {
          const paymentDate = treatment.PAYMENT_DATE || treatment.RDATE;
          const paymentYear = new Date(paymentDate).getFullYear() + 543; // พ.ศ.

          // ✅ ค่าหัตถการ
          if (treatment.procedures && treatment.procedures.length > 0) {
            treatment.procedures.forEach(proc => {
              incomeFromTreatments.push({
                REFNO: `VN${treatment.VNO}`,
                RDATE: paymentDate,
                MYEAR: paymentYear,
                VNO: treatment.VNO,
                HNCODE: treatment.HNNO,
                TYPE_INCOME: 'หัตถการ',
                TYPE_INCOME_NAME: 'ค่าหัตถการ',
                AMT: parseFloat(proc.AMT || proc.UNIT_PRICE * proc.QTY || 0),
                TOTAL: parseFloat(proc.AMT || proc.UNIT_PRICE * proc.QTY || 0),
                DESCRIPTION: proc.MED_PRO_NAME_THAI || proc.MEDICAL_PROCEDURE_CODE,
                PAYMENT_METHOD: treatment.PAYMENT_METHOD || (treatment.UCS_CARD === 'Y' ? 'บัตรทอง' : 'เงินสด'),
                UCS_CARD: treatment.UCS_CARD || 'N'
              });
            });
          }

          // ✅ ค่า Lab
          if (treatment.labTests && treatment.labTests.length > 0) {
            treatment.labTests.forEach(lab => {
              incomeFromTreatments.push({
                REFNO: `VN${treatment.VNO}`,
                RDATE: paymentDate,
                MYEAR: paymentYear,
                VNO: treatment.VNO,
                HNCODE: treatment.HNNO,
                TYPE_INCOME: 'Lab',
                TYPE_INCOME_NAME: 'ค่า Lab',
                AMT: parseFloat(lab.PRICE || 0),
                TOTAL: parseFloat(lab.PRICE || 0),
                DESCRIPTION: lab.LABNAME || lab.LABCODE,
                PAYMENT_METHOD: treatment.PAYMENT_METHOD || (treatment.UCS_CARD === 'Y' ? 'บัตรทอง' : 'เงินสด'),
                UCS_CARD: treatment.UCS_CARD || 'N'
              });
            });
          }

          // ✅ ค่ายา
          if (treatment.drugs && treatment.drugs.length > 0) {
            treatment.drugs.forEach(drug => {
              // ✅ สำหรับบัตรทอง: คำนวณเฉพาะยาที่ UCS_CARD = 'N'
              const isGoldCard = treatment.UCS_CARD === 'Y';
              const drugUcsCard = drug.UCS_CARD || drug.DRUG_UCS_CARD || 'N';

              // ถ้าเป็นบัตรทองและยามี UCS_CARD = 'Y' ให้ข้าม
              if (isGoldCard && drugUcsCard === 'Y') {
                return;
              }

              incomeFromTreatments.push({
                REFNO: `VN${treatment.VNO}`,
                RDATE: paymentDate,
                MYEAR: paymentYear,
                VNO: treatment.VNO,
                HNCODE: treatment.HNNO,
                TYPE_INCOME: 'ยา',
                TYPE_INCOME_NAME: 'ค่ายา',
                AMT: parseFloat(drug.AMT || drug.UNIT_PRICE * drug.QTY || 0),
                TOTAL: parseFloat(drug.AMT || drug.UNIT_PRICE * drug.QTY || 0),
                DESCRIPTION: drug.GENERIC_NAME || drug.DRUG_CODE,
                PAYMENT_METHOD: treatment.PAYMENT_METHOD || (treatment.UCS_CARD === 'Y' ? 'บัตรทอง' : 'เงินสด'),
                UCS_CARD: treatment.UCS_CARD || 'N'
              });
            });
          }
        });

        // ✅ รวมกับข้อมูลรายรับเดิมจาก INCOME1 (ถ้ามี)
        let allIncomeRecords = incomeFromTreatments;
        try {
          const incomeResponse = await Income1Service.getAllIncome1(1, 100000);
          if (incomeResponse.success && Array.isArray(incomeResponse.data)) {
            // แปลงข้อมูล INCOME1 ให้เป็นรูปแบบเดียวกัน
            const income1Records = incomeResponse.data.map(item => ({
              REFNO: item.REFNO,
              RDATE: item.RDATE,
              MYEAR: item.MYEAR,
              TYPE_INCOME: item.TYPE_PAY,
              TYPE_INCOME_NAME: item.TYPE_INCOME_NAME || item.TYPE_PAY,
              AMT: parseFloat(item.TOTAL || 0),
              TOTAL: parseFloat(item.TOTAL || 0),
              DESCRIPTION: item.NAME1 || '',
              PAYMENT_METHOD: item.TYPE_PAY || 'เงินสด'
            }));
            allIncomeRecords = [...incomeFromTreatments, ...income1Records];
          }
        } catch (err) {
          console.warn('Could not load INCOME1 records:', err);
        }

        setIncomeRecords(allIncomeRecords);
      } else {
        // Fallback: ใช้ข้อมูลเดิมจาก INCOME1
        const incomeResponse = await Income1Service.getAllIncome1(1, 100000);
        if (incomeResponse.success) {
          setIncomeRecords(Array.isArray(incomeResponse.data) ? incomeResponse.data : []);
        } else {
          throw new Error(incomeResponse.message || "โหลดข้อมูลรายรับไม่สำเร็จ");
        }
      }

      if (expenseResponse.success) {
        // ข้อมูลที่ได้จาก API เป็น array ของ header ที่มี details ภายใน
        // ต้อง flatten details ออกมาเป็น flat array เพื่อให้มี TYPE_PAY_CODE และ TYPE_PAY_NAME
        const expenseData = Array.isArray(expenseResponse.data) ? expenseResponse.data : [];

        // Flatten details ออกมาเป็น flat array
        const flatExpenseData = [];
        expenseData.forEach(item => {
          if (item.details && Array.isArray(item.details)) {
            item.details.forEach(detail => {
              flatExpenseData.push({
                REFNO: item.REFNO,
                RDATE: item.RDATE,
                MYEAR: item.MYEAR,
                MONTHH: item.MONTHH,
                NAME1: item.NAME1,
                STATUS: item.STATUS,
                TYPE_PAY: item.TYPE_PAY,
                BANK_NO: item.BANK_NO,
                TYPE_PAY_CODE: detail.TYPE_PAY_CODE,
                TYPE_PAY_NAME: detail.TYPE_PAY_NAME || detail.type_pay_name,
                DESCM1: detail.DESCM1,
                AMT: parseFloat(detail.AMT) || 0,
                TOTAL: parseFloat(detail.AMT) || 0, // สำหรับแต่ละรายการ detail
              });
            });
          } else {
            // ถ้าไม่มี details ให้ใช้ข้อมูล header ตรงๆ
            flatExpenseData.push({
              ...item,
              TOTAL: item.TOTAL || 0
            });
          }
        });

        setExpenseRecords(flatExpenseData);
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

  const filterByYear = (records, startYear, endYear) => {
    const startYearNum = parseInt(startYear);
    const endYearNum = parseInt(endYear);

    return records.filter((item) => {
      const itemYear = parseInt(item.MYEAR) || 0;
      return itemYear >= startYearNum && itemYear <= endYearNum;
    });
  };

  const filteredIncome = useMemo(() => {
    let result = [...incomeRecords];

    // Filter ตามช่วงปี
    result = filterByYear(result, startYear, endYear);

    // ✅ Filter ตามวิธีรับเงิน (เงินสด, เงินโอน, บัตรทอง)
    if (incomeTypeFilter) {
      result = result.filter((item) => {
        const paymentMethod = item.PAYMENT_METHOD || item.TYPE_PAY || '';
        // ✅ สำหรับบัตรทอง: ตรวจสอบจาก UCS_CARD หรือ PAYMENT_METHOD
        if (incomeTypeFilter === 'บัตรทอง') {
          return item.UCS_CARD === 'Y' || paymentMethod === 'บัตรทอง' || (!paymentMethod && item.UCS_CARD === 'Y');
        }
        return paymentMethod === incomeTypeFilter;
      });
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
  }, [incomeRecords, startYear, endYear, incomeTypeFilter, searchTerm]);

  const filteredExpense = useMemo(() => {
    let result = [...expenseRecords];

    // Filter ตามช่วงปี
    result = filterByYear(result, startYear, endYear);

    // ✅ ลบการ filter ตาม expenseTypeFilter และ statusFilter
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
  }, [expenseRecords, startYear, endYear, searchTerm]);

  const summary = useMemo(() => {
    // ✅ คำนวณรายรับแยกตามประเภท
    const incomeByType = {
      หัตถการ: 0,
      Lab: 0,
      ยา: 0,
      อื่นๆ: 0
    };

    filteredIncome.forEach(item => {
      const type = item.TYPE_INCOME_NAME || item.TYPE_INCOME || '';
      const amount = parseFloat(item.TOTAL) || 0;

      if (type === 'หัตถการ' || type === 'ค่าหัตถการ') {
        incomeByType.หัตถการ += amount;
      } else if (type === 'Lab' || type === 'ค่า Lab') {
        incomeByType.Lab += amount;
      } else if (type === 'ยา' || type === 'ค่ายา') {
        incomeByType.ยา += amount;
      } else {
        incomeByType.อื่นๆ += amount;
      }
    });

    const incomeTotal = filteredIncome.reduce((sum, item) => sum + (parseFloat(item.TOTAL) || 0), 0);
    const incomeCash = filteredIncome
      .filter((item) => (item.PAYMENT_METHOD || item.TYPE_PAY) === "เงินสด")
      .reduce((sum, item) => sum + (parseFloat(item.TOTAL) || 0), 0);
    const incomeTransfer = filteredIncome
      .filter((item) => (item.PAYMENT_METHOD || item.TYPE_PAY) === "เงินโอน")
      .reduce((sum, item) => sum + (parseFloat(item.TOTAL) || 0), 0);

    // สำหรับการสรุปรายจ่าย ให้รวมยอดตาม TYPE_PAY_CODE + BANK_NO
    const groupedExpenseForSummary = groupExpensesByTypeAndBank(filteredExpense);

    const expenseTotal = groupedExpenseForSummary.reduce((sum, item) => sum + (parseFloat(item.TOTAL) || 0), 0);
    const expenseCash = groupedExpenseForSummary
      .filter((item) => item.TYPE_PAY === "เงินสด")
      .reduce((sum, item) => sum + (parseFloat(item.TOTAL) || 0), 0);
    const expenseTransfer = groupedExpenseForSummary
      .filter((item) => item.TYPE_PAY === "เงินโอน")
      .reduce((sum, item) => sum + (parseFloat(item.TOTAL) || 0), 0);

    return {
      incomeCount: filteredIncome.length,
      expenseCount: filteredExpense.length,
      incomeTotal,
      incomeCash,
      incomeTransfer,
      incomeByType, // ✅ เพิ่มรายรับแยกตามประเภท
      expenseTotal,
      expenseCash,
      expenseTransfer,
      balance: incomeTotal - expenseTotal,
    };
  }, [filteredIncome, filteredExpense]);

  const combinedRows = useMemo(() => {
    // ✅ รายรับ: แสดงแค่ 3 ประเภท (ค่าหัตถการ, ค่า Lab, ค่ายา) - รวมทั้งหมด
    const incomeByType = {
      'ค่าหัตถการ': 0,
      'ค่า Lab': 0,
      'ค่ายา': 0
    };

    filteredIncome.forEach(item => {
      const type = item.TYPE_INCOME_NAME || item.TYPE_INCOME || '';
      const amount = parseFloat(item.TOTAL) || 0;

      if (type === 'หัตถการ' || type === 'ค่าหัตถการ') {
        incomeByType['ค่าหัตถการ'] += amount;
      } else if (type === 'Lab' || type === 'ค่า Lab') {
        incomeByType['ค่า Lab'] += amount;
      } else if (type === 'ยา' || type === 'ค่ายา') {
        incomeByType['ค่ายา'] += amount;
      }
    });

    // สร้างรายการรายรับ 3 แถว
    const incomeEntries = [
      {
        type: 'ค่าหัตถการ',
        amount: incomeByType['ค่าหัตถการ'],
        isGrouped: true
      },
      {
        type: 'ค่า Lab',
        amount: incomeByType['ค่า Lab'],
        isGrouped: true
      },
      {
        type: 'ค่ายา',
        amount: incomeByType['ค่ายา'],
        isGrouped: true
      }
    ].filter(item => item.amount > 0); // แสดงเฉพาะที่มีจำนวนเงิน

    // รายจ่าย: รวมยอดตาม TYPE_PAY_CODE (ประเภทรายจ่าย)
    const groupedExpenses = groupExpensesByType(filteredExpense);
    const expenseEntries = groupedExpenses.map((item) => ({
      typeCode: item.TYPE_PAY_CODE || "",
      typeName: item.TYPE_PAY_NAME || item.TYPE_PAY_CODE || "ไม่ระบุ",
      amount: parseFloat(item.TOTAL) || 0,
      count: item.count || 0,
      isGrouped: true, // ระบุว่าเป็นข้อมูลที่ group แล้ว
    }));

    const maxLength = Math.max(incomeEntries.length, expenseEntries.length);
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

  const expensePdfRows = useMemo(() => {
    const grouped = groupExpensesByTypeAndBank(filteredExpense);
    return grouped.map((item) => ({
      // แสดงชื่อจากประเภทรายจ่าย + เลขบัญชี เพื่อให้ตรงกับการ group
      name:
        item.TYPE_PAY_NAME ||
        item.TYPE_PAY_CODE ||
        item.DESCM1 ||
        `${item.TYPE_PAY || "-"}${item.BANK_NO ? ` (${item.BANK_NO})` : ""}`,
      amount: parseFloat(item.TOTAL) || parseFloat(item.AMT) || 0,
    }));
  }, [filteredExpense]);

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
    Income1Service.downloadCSV(filteredIncome, "yearly-income-report");
  };

  const handleExportExpense = () => {
    if (filteredExpense.length === 0) {
      alert("ไม่มีข้อมูลรายจ่ายสำหรับการส่งออก");
      return;
    }
    // ส่งออกโดยใช้ข้อมูลที่รวมยอดแล้วตาม TYPE_PAY_CODE + BANK_NO
    const grouped = groupExpensesByTypeAndBank(filteredExpense);
    Pay1Service.downloadCSV(grouped, "yearly-expense-report");
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
                    {title.includes("รับ") ? "รับจาก" : "จ่ายให้"}
                  </Typography>
                  <Typography variant="body1">
                    {dialogState.data.header.NAME1 || "-"}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    {title.includes("รับ") ? "วิธีรับ" : "วิธีจ่าย"}
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
        <Box>
          <Typography variant="h5" fontWeight="bold" component="span">
            สรุปรายรับ รายจ่ายประจำปี
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
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
            startDate={null}
            endDate={null}
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
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <MonthYearFilter
                year={startYear}
                setYear={setStartYear}
                showMonth={false}
                yearLabel="ปีเริ่มต้น"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <MonthYearFilter
                year={endYear}
                setYear={setEndYear}
                showMonth={false}
                yearLabel="ปีสิ้นสุด"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>วิธีรับเงิน</InputLabel>
                <Select
                  label="วิธีรับเงิน"
                  value={incomeTypeFilter}
                  onChange={(e) => setIncomeTypeFilter(e.target.value)}
                  sx={{ borderRadius: "10px", bgcolor: 'white' }}
                >
                  <MenuItem value="">ทั้งหมด</MenuItem>
                  <MenuItem value="เงินสด">เงินสด</MenuItem>
                  <MenuItem value="เงินโอน">เงินโอน</MenuItem>
                  <MenuItem value="บัตรทอง">บัตรทอง</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    bgcolor: 'white'
                  }
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="contained"
                fullWidth
                onClick={loadData}
                disabled={loading}
                startIcon={<RefreshIcon />}
                sx={{ borderRadius: "10px", height: "40px" }} // Align height with inputs
              >
                โหลดข้อมูล
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ✅ Summary Cards - รายรับแยกตามประเภท */}
      {!loading && summary.incomeByType && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: "100%", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>ค่าหัตถการ</Typography>
                <Typography variant="h4" fontWeight="bold">
                  {formatCurrency(summary.incomeByType.หัตถการ || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: "100%", background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white" }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>ค่า Lab</Typography>
                <Typography variant="h4" fontWeight="bold">
                  {formatCurrency(summary.incomeByType.Lab || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: "100%", background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white" }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>ค่ายา</Typography>
                <Typography variant="h4" fontWeight="bold">
                  {formatCurrency(summary.incomeByType.ยา || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: "100%", background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", color: "white" }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>รายรับรวม</Typography>
                <Typography variant="h4" fontWeight="bold">
                  {formatCurrency(summary.incomeTotal)}
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
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 4 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2, color: "text.secondary" }}>
            ระบบมีข้อมูลจำนวนมาก กรุณารอโหลดสักครู่
          </Typography>
        </Box>
      )}

      {!loading && combinedRows.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              ตารางสรุปรายรับ-รายจ่าย ({summary.incomeCount} รายรับ / {groupExpensesByType(filteredExpense).length} ประเภทรายจ่าย)
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
                          row.income.isGrouped ? (
                            // ✅ แสดงประเภทที่รวมยอดแล้ว
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {row.income.type}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                รวมทั้งหมด
                              </Typography>
                            </Box>
                          ) : (
                            // แสดงรายละเอียดรายการ (กรณีไม่ได้ group)
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
                          )
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
                          row.expense.isGrouped ? (
                            // แสดงประเภทรายจ่ายที่รวมยอดแล้ว
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {row.expense.typeName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {row.expense.typeCode || "-"} • {row.expense.count} รายการ
                              </Typography>
                            </Box>
                          ) : (
                            // แสดงรายละเอียดรายการ (กรณีไม่ได้ group)
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
                          )
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
              ไม่มีข้อมูลในช่วงปีที่เลือก
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ลองปรับช่วงปีหรือเงื่อนไขการค้นหาอื่น ๆ
            </Typography>
          </CardContent>
        </Card>
      )}

      {renderDetailDialog(incomeDialog, setIncomeDialog, "รายละเอียดใบสำคัญรับ")}
      {renderDetailDialog(expenseDialog, setExpenseDialog, "รายละเอียดใบสำคัญจ่าย")}
    </Box>
  );
};

export default YearlySummary;

