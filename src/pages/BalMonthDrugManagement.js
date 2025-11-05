import React, { useState, useEffect } from "react";
import {
    Container, Grid, TextField, Button, Card, CardContent, Typography,
    InputAdornment, IconButton, Stack, Pagination, Dialog,
    DialogTitle, DialogContent, DialogActions, Alert, Snackbar, Box,
    Select, MenuItem, FormControl, Autocomplete
} from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';

import BalMonthDrugService from "../services/balMonthDrugService";
import DrugService from "../services/drugService";

const BalMonthDrugManagement = () => {
    // Helper functions สำหรับจัดการปี พ.ศ.
    const toBuddhistYear = (gregorianYear) => {
        return parseInt(gregorianYear) + 543;
    };

    const toGregorianYear = (buddhistYear) => {
        return parseInt(buddhistYear) - 543;
    };

    const getYearOptionsBE = (yearsBack = 5) => {
        const currentYear = new Date().getFullYear() + 543; // พ.ศ. ปัจจุบัน
        const options = [];
        for (let i = 0; i <= yearsBack; i++) {
            const year = currentYear - i;
            options.push({ value: year.toString(), label: year.toString() });
        }
        return options;
    };

    const formatPeriodBE = (year, month) => {
        const buddhistYear = toBuddhistYear(year);
        const monthStr = month.toString().padStart(2, '0');
        return `${buddhistYear}/${monthStr}`;
    };

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
        AMT: 0
    });

    const itemsPerPage = 10;

    useEffect(() => {
        loadData();
        loadDrugs();
    }, [filterYear, filterMonth]);

    useEffect(() => {
        filterData();
    }, [balanceList, searchTerm]);

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
            item.UNIT_CODE1?.toLowerCase().includes(term)
        );

        setFilteredList(filtered);
        setPage(1);
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };

            if (field === 'DRUG_CODE') {
                const drug = drugList.find(d => d.DRUG_CODE === value);
                if (drug) {
                    updated.UNIT_CODE1 = drug.UNIT_CODE1 || ''; // ✅ แก้เป็น UNIT_CODE1
                    updated.UNIT_PRICE = parseFloat(drug.UNIT_PRICE || 0);
                }
            }

            if (field === 'QTY' || field === 'UNIT_PRICE') {
                const qty = field === 'QTY' ? parseFloat(value || 0) : parseFloat(updated.QTY || 0);
                const price = field === 'UNIT_PRICE' ? parseFloat(value || 0) : parseFloat(updated.UNIT_PRICE || 0);
                updated.AMT = qty * price;
            }

            return updated;
        });

        if (field === 'DRUG_CODE') {
            const drug = drugList.find(d => d.DRUG_CODE === value);
            setSelectedDrug(drug || null);
        }
    };

    const handleDrugSelect = (event, value) => {
        if (value) {
            handleFormChange('DRUG_CODE', value.DRUG_CODE);
        } else {
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
            AMT: 0
        });
        setSelectedDrug(null);
        setEditingItem(null);
    };

    const handleSave = async () => {
        console.log('🔵 handleSave called');

        const errors = BalMonthDrugService.validateBalanceData(formData, !!editingItem);

        if (errors.length > 0) {
            console.log('❌ Validation failed:', errors[0]);
            showAlert(errors[0], 'error');
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
                showAlert('บันทึกยอดยกมาสำเร็จ', 'success');
            } else {
                result = await BalMonthDrugService.updateBalance(
                    toGregorianYear(editingItem.MYEAR),
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
            AMT: item.AMT || 0
        });

        const drug = drugList.find(d => d.DRUG_CODE === item.DRUG_CODE);
        setSelectedDrug(drug || null);

        setEditingItem(item);
        setCurrentView("edit");
    };

    const handleDeleteClick = (item) => {
        setDeleteDialog({ open: true, item });
    };

    const handleDeleteConfirm = async () => {
        const { item } = deleteDialog;

        try {
            await BalMonthDrugService.deleteBalance(item.MYEAR, item.MONTHH, item.DRUG_CODE);
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
            AMT: 0
        });
        setSelectedDrug(null);
        setEditingItem(null);
        setCurrentView("add");
    };

    if (currentView === "add" || currentView === "edit") {
        return (
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
                            <Grid item xs={12} md={4}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>ปี *</Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={formData.MYEAR}
                                        onChange={(e) => handleFormChange('MYEAR', e.target.value)}
                                        disabled={!!editingItem}
                                        sx={{ borderRadius: "10px", backgroundColor: editingItem ? "#f5f5f5" : "white" }}
                                    >
                                        {getYearOptionsBE(5).map(opt => (
                                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>เดือน *</Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={formData.MONTHH}
                                        onChange={(e) => handleFormChange('MONTHH', e.target.value)}
                                        disabled={!!editingItem}
                                        sx={{ borderRadius: "10px", backgroundColor: editingItem ? "#f5f5f5" : "white" }}
                                    >
                                        {BalMonthDrugService.getMonthOptions().map(opt => (
                                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>ยา *</Typography>
                                <Autocomplete
                                    value={selectedDrug}
                                    onChange={handleDrugSelect}
                                    options={drugList}
                                    getOptionLabel={(option) => {
                                        return option.GENERIC_NAME || '';
                                    }}
                                    filterOptions={(options, { inputValue }) => {
                                        const searchTerm = inputValue.toLowerCase();
                                        return options.filter(option => 
                                            (option.GENERIC_NAME || '').toLowerCase().includes(searchTerm) ||
                                            (option.TRADE_NAME || '').toLowerCase().includes(searchTerm) ||
                                            (option.DRUG_CODE || '').toLowerCase().includes(searchTerm)
                                        );
                                    }}
                                    renderInput={(params) => <TextField {...params} placeholder="เลือกยา" size="small" />}
                                    disabled={!!editingItem}
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", backgroundColor: editingItem ? "#f5f5f5" : "white" } }}
                                />
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
        );
    }

    const summary = calculateSummary();

    return (
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
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth size="small">
                                <Select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} sx={{ borderRadius: "10px" }}>
                                    {getYearOptionsBE(5).map(opt => (
                                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth size="small">
                                <Select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} sx={{ borderRadius: "10px" }}>
                                    {BalMonthDrugService.getMonthOptions().map(opt => (
                                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                size="small"
                                placeholder="ค้นหา (รหัสยา, หน่วยนับ)"
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
                        <Box sx={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                                <thead style={{ backgroundColor: "#F0F5FF" }}>
                                    <tr>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>ลำดับ</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>ช่วงเวลา</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>รหัสยา</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>ชื่อยา</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>หน่วยนับ</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'right', color: '#696969' }}>จำนวน</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'right', color: '#696969' }}>ราคา/หน่วย</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'right', color: '#696969' }}>มูลค่า</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'center', color: '#696969' }}>จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredList.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((item, index) => {
                                        // หาชื่อยาจาก drugList
                                        const drug = drugList.find(d => d.DRUG_CODE === item.DRUG_CODE);
                                        const drugName = drug ? drug.GENERIC_NAME : '-';

                                        // ⭐ เพิ่มส่วนนี้ - หาชื่อหน่วยจาก UNIT_CODE1
                                        const unitName = drug && drug.UNIT_NAME1 ? drug.UNIT_NAME1 : (item.UNIT_CODE1 || '-');

                                        return (
                                            <tr key={index} style={{ borderTop: '1px solid #e0e0e0' }}>
                                                <td style={{ padding: '12px 8px' }}>
                                                    {(page - 1) * itemsPerPage + index + 1}
                                                </td>
                                                <td style={{ padding: '12px 8px', fontWeight: 500 }}>
                                                    {formatPeriodBE(item.MYEAR, item.MONTHH)}
                                                </td>
                                                <td style={{ padding: '12px 8px' }}>
                                                    {item.DRUG_CODE}
                                                </td>
                                                <td style={{ padding: '12px 8px' }}>
                                                    {drugName}
                                                </td>
                                                <td style={{ padding: '12px 8px' }}>
                                                    {unitName} {/* ⭐ เปลี่ยนตรงนี้ - จาก item.UNIT_CODE1 เป็น unitName */}
                                                </td>
                                                <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                                    {item.QTY ? item.QTY.toFixed(2) : '0.00'}
                                                </td>
                                                <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                                    {BalMonthDrugService.formatCurrency(item.UNIT_PRICE)}
                                                </td>
                                                <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 500 }}>
                                                    {BalMonthDrugService.formatCurrency(item.AMT)}
                                                </td>
                                                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                        <IconButton size="small" onClick={() => handleEdit(item)}
                                                            sx={{ border: '1px solid #5698E0', borderRadius: '7px' }}>
                                                            <EditIcon sx={{ color: '#5698E0' }} />
                                                        </IconButton>
                                                        <IconButton size="small" onClick={() => handleDeleteClick(item)}
                                                            sx={{ border: '1px solid #F62626', borderRadius: '7px' }}>
                                                            <DeleteIcon sx={{ color: '#F62626' }} />
                                                        </IconButton>
                                                    </Box>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </Box>

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
    );
};

export default BalMonthDrugManagement;