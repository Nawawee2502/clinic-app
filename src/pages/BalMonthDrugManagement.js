import React, { useState, useEffect } from "react";
import {
    Container, Grid, TextField, Button, Card, CardContent, Typography,
    InputAdornment, IconButton, Stack, Pagination, Dialog,
    DialogTitle, DialogContent, DialogActions, Alert, Snackbar, Box,
    Select, MenuItem, FormControl, FormHelperText, Autocomplete,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

import BalMonthDrugService from "../services/balMonthDrugService";
import DrugService from "../services/drugService";
import Swal from "sweetalert2";

// ✅ Import Reusable Components
import MonthYearFilter from "../components/common/MonthYearFilter";

const BalMonthDrugManagement = () => {
    // Helper functions สำหรับจัดการปี พ.ศ.
    const toBuddhistYear = (gregorianYear) => {
        return parseInt(gregorianYear) + 543;
    };

    const toGregorianYear = (buddhistYear) => {
        return parseInt(buddhistYear) - 543;
    };

    // ✅ Note: removed getYearOptionsBE/formatDateBE/DateInputBE as they are now handled by common components

    const [currentView, setCurrentView] = useState("list");
    const [balanceList, setBalanceList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

    const [drugList, setDrugList] = useState([]);
    const drugMap = React.useMemo(() => {
        const map = new Map();
        drugList.forEach(drug => {
            if (drug?.DRUG_CODE) {
                map.set(drug.DRUG_CODE, drug);
            }
        });
        return map;
    }, [drugList]);
    const [selectedDrug, setSelectedDrug] = useState(null);

    // Filters
    const [filterYear, setFilterYear] = useState((new Date().getFullYear() + 543).toString());
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);

    const [formData, setFormData] = useState({
        MYEAR: (new Date().getFullYear() + 543).toString(),
        MONTHH: new Date().getMonth() + 1,
        DRUG_CODE: '',
        UNIT_CODE1: '',
        QTY: 0,
        UNIT_PRICE: 0,
        AMT: 0,
        LOT_NO: '',
        EXPIRE_DATE: new Date().toISOString().slice(0, 10)
    });
    const [formErrors, setFormErrors] = useState({});

    const itemsPerPage = 10;

    useEffect(() => {
        loadData();
        loadDrugs();
    }, [filterYear, filterMonth]);

    useEffect(() => {
        filterData();
    }, [balanceList, searchTerm, drugMap]);

    useEffect(() => {
        setTotalPages(Math.ceil(filteredList.length / itemsPerPage));
    }, [filteredList]);

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await BalMonthDrugService.getAllBalances({
                year: toGregorianYear(filterYear), // แปลง พ.ศ. เป็น ค.ศ. ก่อนส่ง API
                month: filterMonth
            });

            if (response.success && response.data) {
                console.log(`✅ โหลดข้อมูลยอดยกมา ${response.data.length} รายการ`);
                setBalanceList(response.data);
                setFilteredList(response.data);
                showAlert(`โหลดข้อมูลสำเร็จ ${response.data.length} รายการ`, 'success');
            } else {
                console.warn('⚠️ ไม่มีข้อมูลยอดยกมา');
                setBalanceList([]);
                setFilteredList([]);
            }
        } catch (error) {
            console.error('❌ Error loading data:', error);
            showAlert(error.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadDrugs = async () => {
        try {
            const response = await DrugService.getAllDrugs();
            if (response.success && response.data) {
                console.log(`✅ โหลดข้อมูลยา ${response.data.length} รายการ`);
                setDrugList(response.data);
            }
        } catch (error) {
            console.error('❌ Error loading drugs:', error);
        }
    };

    const filterData = () => {
        if (!searchTerm.trim()) {
            setFilteredList(balanceList);
            setPage(1);
            return;
        }

        const term = searchTerm.toLowerCase();
        const filtered = balanceList.filter(item =>
            item.DRUG_CODE?.toLowerCase().includes(term) ||
            item.UNIT_CODE1?.toLowerCase().includes(term) ||
            ((drugMap.get(item.DRUG_CODE)?.GENERIC_NAME || '').toLowerCase().includes(term)) ||
            ((drugMap.get(item.DRUG_CODE)?.TRADE_NAME || '').toLowerCase().includes(term))
        );

        setFilteredList(filtered);
        setPage(1);
    };

    const normalizeText = (value) => (value ?? '').toString().trim().toLowerCase();

    const hasDuplicateDrugLot = (data, editingReference) => {
        const targetYear = toGregorianYear(data.MYEAR).toString();
        const targetMonth = Number(data.MONTHH);
        const targetDrug = normalizeText(data.DRUG_CODE);
        const targetLot = normalizeText(data.LOT_NO);

        return balanceList.some(item => {
            const itemYear = String(item.MYEAR);
            const itemMonth = Number(item.MONTHH);
            const itemDrug = normalizeText(item.DRUG_CODE);
            const itemLot = normalizeText(item.LOT_NO);

            const isEditingItem =
                editingReference &&
                itemYear === String(editingReference.MYEAR) &&
                itemMonth === Number(editingReference.MONTHH) &&
                itemDrug === normalizeText(editingReference.DRUG_CODE) &&
                itemLot === normalizeText(editingReference.LOT_NO);

            if (isEditingItem) {
                return false;
            }

            return (
                itemYear === targetYear &&
                itemMonth === targetMonth &&
                itemDrug === targetDrug &&
                itemLot === targetLot
            );
        });
    };

    const clearFieldError = (field) => {
        setFormErrors(prev => {
            if (!prev[field]) return prev;
            const updated = { ...prev };
            delete updated[field];
            return updated;
        });
    };

    const validateFormData = (data = formData) => {
        const errors = {};

        if (!data.MYEAR) {
            errors.MYEAR = 'กรุณาระบุปี';
        } else if (data.MYEAR.toString().length !== 4 || isNaN(data.MYEAR)) {
            errors.MYEAR = 'ปีต้องเป็นตัวเลข 4 หลัก';
        }

        if (!data.MONTHH) {
            errors.MONTHH = 'กรุณาระบุเดือน';
        } else if (data.MONTHH < 1 || data.MONTHH > 12) {
            errors.MONTHH = 'เดือนต้องอยู่ระหว่าง 1-12';
        }

        if (!data.DRUG_CODE?.trim()) {
            errors.DRUG_CODE = 'กรุณาเลือกรายการยา';
        }

        if (data.QTY === undefined || data.QTY === null || data.QTY === '') {
            errors.QTY = 'กรุณาระบุจำนวน';
        } else if (isNaN(data.QTY) || parseFloat(data.QTY) < 0) {
            errors.QTY = 'จำนวนต้องเป็นตัวเลขที่ไม่ติดลบ';
        }

        if (data.UNIT_PRICE === undefined || data.UNIT_PRICE === null || data.UNIT_PRICE === '') {
            errors.UNIT_PRICE = 'กรุณาระบุราคาต่อหน่วย';
        } else if (isNaN(data.UNIT_PRICE) || parseFloat(data.UNIT_PRICE) < 0) {
            errors.UNIT_PRICE = 'ราคาต่อหน่วยต้องเป็นตัวเลขที่ไม่ติดลบ';
        }

        return errors;
    };

    const handleFormChange = (field, value) => {
        clearFieldError(field);

        if (field === 'DRUG_CODE') {
            const drug = drugList.find(d => d.DRUG_CODE === value);
            setSelectedDrug(drug || null);

            setFormData(prev => {
                const unitPrice = parseFloat(drug?.UNIT_PRICE ?? 0);
                const qty = parseFloat(prev.QTY ?? 0);

                return {
                    ...prev,
                    DRUG_CODE: value,
                    UNIT_CODE1: drug?.UNIT_CODE1 || '',
                    UNIT_PRICE: unitPrice,
                    AMT: BalMonthDrugService.calculateAmount(qty, unitPrice)
                };
            });
            return;
        }

        setFormData(prev => {
            const updated = { ...prev, [field]: value };

            if (field === 'QTY' || field === 'UNIT_PRICE') {
                const qty = field === 'QTY' ? parseFloat(value || 0) : parseFloat(updated.QTY || 0);
                const price = field === 'UNIT_PRICE' ? parseFloat(value || 0) : parseFloat(updated.UNIT_PRICE || 0);
                updated.AMT = BalMonthDrugService.calculateAmount(qty, price);
            }

            return updated;
        });
    };

    const handleDrugSelect = (event, value) => {
        if (value) {
            clearFieldError('DRUG_CODE');
            handleFormChange('DRUG_CODE', value.DRUG_CODE);
        } else {
            setFormErrors(prev => ({ ...prev, DRUG_CODE: 'กรุณาเลือกรายการยา' }));
            setFormData(prev => ({
                ...prev,
                DRUG_CODE: '',
                UNIT_CODE1: '', // แก้จาก drug.UNIT_NAME1 เป็น ''
                UNIT_PRICE: 0,
                AMT: 0
            }));
            setSelectedDrug(null);
        }
    };

    // 🔥 แก้ไขตรงนี้ - ให้ใช้ค่าจาก filter แทนวันที่ปัจจุบัน
    const resetForm = () => {
        setFormData({
            MYEAR: filterYear, // ใช้ค่าจาก filter
            MONTHH: filterMonth, // ใช้ค่าจาก filter
            DRUG_CODE: '',
            UNIT_CODE1: '',
            QTY: 0,
            UNIT_PRICE: 0,
            AMT: 0,
            LOT_NO: '',
            EXPIRE_DATE: new Date().toISOString().slice(0, 10)
        });
        setSelectedDrug(null);
        setEditingItem(null);
        setFormErrors({});
    };

    const handleSave = async () => {
        console.log('🔵 handleSave called');

        const validationErrors = validateFormData(formData);

        if (Object.keys(validationErrors).length > 0) {
            setFormErrors(validationErrors);
            const firstError = Object.values(validationErrors)[0];
            Swal.fire({
                icon: 'error',
                title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
                text: firstError,
                confirmButtonText: 'ตกลง'
            });
            return;
        }

        const errors = BalMonthDrugService.validateBalanceData(formData, !!editingItem);

        if (errors.length > 0) {
            Swal.fire({
                icon: 'error',
                title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
                text: errors[0],
                confirmButtonText: 'ตกลง'
            });
            return;
        }

        if (hasDuplicateDrugLot(formData, editingItem)) {
            showAlert('พบข้อมูลซ้ำ: ยาและ LOT NO นี้มีอยู่แล้ว', 'warning');
            return;
        }

        setLoading(true);

        try {

            // แปลงปี พ.ศ. เป็น ค.ศ. ก่อนบันทึก
            const dataToSave = {
                ...formData,
                MYEAR: toGregorianYear(formData.MYEAR).toString()
            };

            const formattedData = BalMonthDrugService.formatBalanceData(dataToSave);
            console.log('📝 Formatted data:', formattedData);

            let result;
            if (!editingItem) {
                result = await BalMonthDrugService.createBalance(formattedData);
                console.log('✅ CREATE response:', result);
                // ✅ API จะทำ upsert แล้ว - ถ้ามีข้อมูลอยู่แล้วจะ update แทน
                const message = result.data?.isUpdate
                    ? 'อัปเดตยอดยกมาสำเร็จ'
                    : 'บันทึกยอดยกมาสำเร็จ';
                showAlert(message, 'success');
            } else {
                result = await BalMonthDrugService.updateBalance(
                    editingItem.MYEAR,
                    editingItem.MONTHH,
                    editingItem.DRUG_CODE,
                    formattedData
                );
                console.log('✅ UPDATE response:', result);
                showAlert('แก้ไขยอดยกมาสำเร็จ', 'success');
            }

            await loadData();
            resetForm();
            setCurrentView("list");
        } catch (error) {
            console.error('❌ Error in handleSave:', error);
            showAlert(error.message || 'เกิดข้อผิดพลาดในการบันทึก', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        setFormData({
            MYEAR: toBuddhistYear(item.MYEAR).toString(), // แปลง ค.ศ. เป็น พ.ศ.
            MONTHH: item.MONTHH,
            DRUG_CODE: item.DRUG_CODE,
            UNIT_CODE1: item.UNIT_CODE1 || '',
            QTY: item.QTY || 0,
            UNIT_PRICE: item.UNIT_PRICE || 0,
            AMT: item.AMT || 0,
            LOT_NO: item.LOT_NO || '',
            EXPIRE_DATE: item.EXPIRE_DATE ? new Date(item.EXPIRE_DATE).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
        });

        const drug = drugList.find(d => d.DRUG_CODE === item.DRUG_CODE);
        setSelectedDrug(drug || null);

        setEditingItem(item);
        setFormErrors({});
        setCurrentView("edit");
    };

    const handleDeleteClick = (item) => {
        setDeleteDialog({ open: true, item });
    };

    const handleDeleteConfirm = async () => {
        const { item } = deleteDialog;

        try {
            await BalMonthDrugService.deleteBalance(
                item.MYEAR,
                item.MONTHH,
                item.DRUG_CODE,
                item.LOT_NO
            );
            showAlert('ลบข้อมูลสำเร็จ', 'success');
            await loadData();
        } catch (error) {
            console.error('Error deleting:', error);
            showAlert(error.message || 'เกิดข้อผิดพลาดในการลบ', 'error');
        }

        setDeleteDialog({ open: false, item: null });
    };

    const showAlert = (message, severity) => {
        setAlert({ open: true, message, severity });
    };

    const calculateSummary = () => {
        return BalMonthDrugService.calculateSummary(filteredList);
    };

    // 🔥 แก้ไขตรงนี้ - เพิ่ม function สำหรับจัดการการกดปุ่ม Add
    const handleAddClick = () => {
        // Reset form ด้วยค่าจาก filter
        setFormData({
            MYEAR: filterYear,
            MONTHH: filterMonth,
            DRUG_CODE: '',
            UNIT_CODE1: '',
            QTY: 0,
            UNIT_PRICE: 0,
            AMT: 0,
            LOT_NO: '',
            EXPIRE_DATE: new Date().toISOString().slice(0, 10)
        });
        setSelectedDrug(null);
        setEditingItem(null);
        setFormErrors({});
        setCurrentView("add");
    };

    if (currentView === "add" || currentView === "edit") {
        return (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Container maxWidth="md" sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5" fontWeight="bold">
                            {currentView === "add" ? "เพิ่มยอดยกมา" : "แก้ไขยอดยกมา"}
                        </Typography>
                        <Button variant="outlined" startIcon={<CloseIcon />} onClick={() => { resetForm(); setCurrentView("list"); }}>
                            ปิด
                        </Button>
                    </Box>

                    <Card>
                        <CardContent>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={8}>
                                    <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>ปี / เดือน *</Typography>
                                    <MonthYearFilter
                                        year={formData.MYEAR}
                                        setYear={(val) => handleFormChange('MYEAR', val)}
                                        month={formData.MONTHH}
                                        setMonth={(val) => handleFormChange('MONTHH', val)}
                                    />
                                    {/* Show errors if any */}
                                    {(formErrors.MYEAR || formErrors.MONTHH) && (
                                        <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                                            {formErrors.MYEAR || formErrors.MONTHH}
                                        </Typography>
                                    )}
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>ยา *</Typography>
                                    <Autocomplete
                                        value={selectedDrug}
                                        onChange={handleDrugSelect}
                                        options={drugList}
                                        getOptionLabel={(option) => {
                                            const genericName = option.GENERIC_NAME || '';
                                            const tradeName = option.TRADE_NAME || '';
                                            const drugCode = option.DRUG_CODE || '';
                                            return `${genericName}-${tradeName}-${drugCode}`;
                                        }}
                                        // ✅ ใช้ DRUG_CODE เป็น key แทน GENERIC_NAME เพื่อหลีกเลี่ยง duplicate key
                                        isOptionEqualToValue={(option, value) => option?.DRUG_CODE === value?.DRUG_CODE}
                                        renderOption={(props, option) => {
                                            const genericName = option.GENERIC_NAME || '';
                                            const tradeName = option.TRADE_NAME || '';
                                            const drugCode = option.DRUG_CODE || '';
                                            return (
                                                <li {...props} key={option.DRUG_CODE}>
                                                    {`${genericName}-${tradeName}-${drugCode}`}
                                                </li>
                                            );
                                        }}
                                        filterOptions={(options, { inputValue }) => {
                                            const searchTerm = inputValue.toLowerCase();
                                            return options.filter(option =>
                                                (option.GENERIC_NAME || '').toLowerCase().includes(searchTerm) ||
                                                (option.TRADE_NAME || '').toLowerCase().includes(searchTerm) ||
                                                (option.DRUG_CODE || '').toLowerCase().includes(searchTerm)
                                            );
                                        }}
                                        disabled={!!editingItem}
                                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", backgroundColor: editingItem ? "#f5f5f5" : "white" } }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                placeholder="เลือกยา"
                                                size="small"
                                                error={!!formErrors.DRUG_CODE}
                                                helperText={formErrors.DRUG_CODE}
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>LOT NO</Typography>
                                    <TextField
                                        size="small"
                                        placeholder="LOT NO"
                                        value={formData.LOT_NO}
                                        onChange={(e) => handleFormChange('LOT_NO', e.target.value)}
                                        fullWidth
                                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>วันหมดอายุ</Typography>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            format="DD/MM/YYYY"
                                            value={formData.EXPIRE_DATE ? dayjs(formData.EXPIRE_DATE) : null}
                                            onChange={(newValue) => handleFormChange('EXPIRE_DATE', newValue ? newValue.format('YYYY-MM-DD') : '')}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    fullWidth
                                                    size="small"
                                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: "#fff" } }}
                                                />
                                            )}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    size: "small",
                                                    sx: { "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: "#fff" } }
                                                }
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>หน่วยนับ</Typography>
                                    <TextField
                                        size="small"
                                        value={
                                            selectedDrug
                                                ? `${selectedDrug.UNIT_NAME1 || ''}` // แสดงทั้งชื่อและรหัส
                                                : formData.UNIT_CODE1
                                        }
                                        disabled
                                        fullWidth
                                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", backgroundColor: "#f5f5f5" } }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>จำนวน *</Typography>
                                    <TextField
                                        size="small"
                                        type="number"
                                        placeholder="0"
                                        value={formData.QTY}
                                        onChange={(e) => handleFormChange('QTY', e.target.value)}
                                        fullWidth
                                        inputProps={{ step: "0.01", min: "0" }}
                                        error={!!formErrors.QTY}
                                        helperText={formErrors.QTY}
                                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>ราคาต่อหน่วย *</Typography>
                                    <TextField
                                        size="small"
                                        type="number"
                                        placeholder="0.00"
                                        value={formData.UNIT_PRICE}
                                        onChange={(e) => handleFormChange('UNIT_PRICE', e.target.value)}
                                        fullWidth
                                        inputProps={{ step: "0.01", min: "0" }}
                                        error={!!formErrors.UNIT_PRICE}
                                        helperText={formErrors.UNIT_PRICE}
                                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>จำนวนเงิน</Typography>
                                    <TextField
                                        size="small"
                                        value={BalMonthDrugService.formatCurrency(formData.AMT)}
                                        disabled
                                        fullWidth
                                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", backgroundColor: "#f5f5f5" } }}
                                    />
                                </Grid>
                            </Grid>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                                <Button variant="outlined" onClick={() => { resetForm(); setCurrentView("list"); }}>
                                    ยกเลิก
                                </Button>
                                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={loading}
                                    sx={{ backgroundColor: "#5698E0", minWidth: 150 }}>
                                    {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Container>
            </LocalizationProvider>
        );
    }

    const summary = calculateSummary();

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Container maxWidth="lg" sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">
                        ยอดยกมา ({filteredList.length} รายการ)
                    </Typography>
                    {/* 🔥 แก้ไขตรงนี้ - เปลี่ยนจาก setCurrentView เป็น handleAddClick */}
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick} sx={{ backgroundColor: '#5698E0' }}>
                        เพิ่มยอดยกมา
                    </Button>
                </Box>

                <Card sx={{ mb: 2 }}>
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <MonthYearFilter
                                    year={filterYear}
                                    setYear={setFilterYear}
                                    month={filterMonth}
                                    setMonth={setFilterMonth}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    size="small"
                                    placeholder="ค้นหา"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    fullWidth
                                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 2, backgroundColor: '#f0f7ff' }}>
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <Typography variant="body2" color="text.secondary">จำนวนรายการทั้งหมด</Typography>
                                <Typography variant="h6" fontWeight="bold">{summary.totalItems} รายการ</Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="body2" color="text.secondary">จำนวนทั้งหมด</Typography>
                                <Typography variant="h6" fontWeight="bold">{summary.totalQty.toFixed(2)}</Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="body2" color="text.secondary">มูลค่ารวม</Typography>
                                <Typography variant="h6" fontWeight="bold" color="primary">
                                    {BalMonthDrugService.formatCurrency(summary.totalAmount)}
                                </Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {loading ? (
                    <Card><CardContent><Typography align="center">กำลังโหลด...</Typography></CardContent></Card>
                ) : filteredList.length === 0 ? (
                    <Card>
                        <CardContent>
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography variant="h6" color="text.secondary">
                                    {searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีข้อมูล'}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent>
                            <TableContainer sx={{ maxHeight: 520 }}>
                                <Table stickyHeader size="small" sx={{ minWidth: 1000 }}>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: '#F0F5FF' }}>
                                            <TableCell sx={{ fontWeight: 600, color: '#696969' }}>ลำดับ</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#696969' }}>รหัสยา</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#696969' }}>ชื่อยา</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#696969' }}>LOT NO</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#696969' }}>วันหมดอายุ</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#696969' }}>หน่วยนับ</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600, color: '#696969' }}>จำนวน</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600, color: '#696969' }}>ราคา/หน่วย</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600, color: '#696969' }}>มูลค่า</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600, color: '#696969' }}>จัดการ</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredList.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((item, index) => {
                                            const drug = drugList.find(d => d.DRUG_CODE === item.DRUG_CODE);
                                            const genericName = drug?.GENERIC_NAME || '';
                                            const tradeName = drug?.TRADE_NAME || '';
                                            const drugCode = drug?.DRUG_CODE || item.DRUG_CODE || '';
                                            const drugName = drug ? `${genericName}-${tradeName}-${drugCode}` : '-';
                                            const unitName = drug && drug.UNIT_NAME1 ? drug.UNIT_NAME1 : (item.UNIT_CODE1 || '-');

                                            return (
                                                <TableRow key={`${item.DRUG_CODE}-${item.LOT_NO || 'default'}-${index}`} hover>
                                                    <TableCell>{(page - 1) * itemsPerPage + index + 1}</TableCell>
                                                    <TableCell>{item.DRUG_CODE}</TableCell>
                                                    <TableCell>{drugName}</TableCell>
                                                    <TableCell>{BalMonthDrugService.formatDate(item.EXPIRE_DATE)}</TableCell>
                                                    <TableCell>{unitName}</TableCell>
                                                    <TableCell align="right">{item.QTY ? item.QTY.toFixed(2) : '0.00'}</TableCell>
                                                    <TableCell align="right">{BalMonthDrugService.formatCurrency(item.UNIT_PRICE)}</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                                                        {BalMonthDrugService.formatCurrency(item.AMT)}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleEdit(item)}
                                                                sx={{ border: '1px solid #5698E0', borderRadius: '7px' }}
                                                            >
                                                                <EditIcon sx={{ color: '#5698E0' }} />
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleDeleteClick(item)}
                                                                sx={{ border: '1px solid #F62626', borderRadius: '7px' }}
                                                            >
                                                                <DeleteIcon sx={{ color: '#F62626' }} />
                                                            </IconButton>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Stack spacing={2} direction="row" justifyContent="center" sx={{ mt: 3 }}>
                                <Pagination count={totalPages} page={page} onChange={(event, value) => setPage(value)} shape="rounded" color="primary" />
                            </Stack>
                        </CardContent>
                    </Card>
                )}

                <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, item: null })}>
                    <DialogTitle>ยืนยันการลบ</DialogTitle>
                    <DialogContent>
                        <Typography>คุณต้องการลบยอดยกมารายการนี้หรือไม่?</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialog({ open: false, item: null })}>ยกเลิก</Button>
                        <Button onClick={handleDeleteConfirm} variant="contained" color="error">ลบ</Button>
                    </DialogActions>
                </Dialog>

                <Snackbar open={alert.open} autoHideDuration={3000} onClose={() => setAlert({ ...alert, open: false })}>
                    <Alert severity={alert.severity} onClose={() => setAlert({ ...alert, open: false })}>
                        {alert.message}
                    </Alert>
                </Snackbar>
            </Container>
        </LocalizationProvider >
    );
};

export default BalMonthDrugManagement;