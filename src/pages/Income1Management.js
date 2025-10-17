import React, { useState, useEffect } from "react";
import {
    Container, Grid, TextField, Button, Card, CardContent, Typography,
    InputAdornment, IconButton, Stack, Pagination, Dialog,
    DialogTitle, DialogContent, DialogActions, Alert, Snackbar, Box,
    Select, MenuItem, FormControl, Divider, Chip
} from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import PrintIcon from '@mui/icons-material/Print';
import Income1Service from "../services/income1Service";
import TypeIncomeService from "../services/typeIncomeService";

const Income1Management = () => {
    const [currentView, setCurrentView] = useState("list");
    const [income1List, setIncome1List] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [typeIncomeList, setTypeIncomeList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, refno: null });
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

    // Form data for header
    const [headerData, setHeaderData] = useState({
        REFNO: '',
        RDATE: new Date().toISOString().slice(0, 10),
        TRDATE: new Date().toISOString().slice(0, 10),
        MYEAR: new Date().getFullYear().toString(),
        MONTHH: new Date().getMonth() + 1,
        NAME1: '',
        STATUS: 'ทำงานอยู่',
        TYPE_PAY: 'เงินสด',
        BANK_NO: ''
    });

    // Form data for details (array)
    const [details, setDetails] = useState([
        { TYPE_INCOME_CODE: '', DESCM1: '', AMT: '' }
    ]);

    const itemsPerPage = 10;

    useEffect(() => {
        loadData();
        loadTypeIncome();
    }, []);

    useEffect(() => {
        filterData();
    }, [income1List, searchTerm]);

    useEffect(() => {
        setTotalPages(Math.ceil(filteredList.length / itemsPerPage));
    }, [filteredList]);

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await Income1Service.getAllIncome1();

            if (response.success && response.data) {
                console.log(`✅ โหลดข้อมูลใบสำคัญรับ ${response.data.length} รายการ`);
                setIncome1List(response.data);
                setFilteredList(response.data);
                showAlert(`โหลดข้อมูลสำเร็จ ${response.data.length} รายการ`, 'success');
            }
        } catch (error) {
            console.error('❌ Error loading data:', error);
            showAlert('ไม่สามารถโหลดข้อมูลได้', 'error');
            setIncome1List([]);
            setFilteredList([]);
        }
        setLoading(false);
    };

    const loadTypeIncome = async () => {
        try {
            const response = await TypeIncomeService.getAllTypeIncome();
            if (response.success && response.data) {
                setTypeIncomeList(response.data);
            }
        } catch (error) {
            console.error('Error loading type income:', error);
        }
    };

    const filterData = () => {
        if (!searchTerm) {
            setFilteredList(income1List);
        } else {
            const filtered = income1List.filter(item =>
                item.REFNO?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.NAME1?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.BANK_NO?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredList(filtered);
        }
        setPage(1);
    };

    const getPaginatedData = () => {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredList.slice(startIndex, endIndex);
    };

    const handleHeaderChange = (field, value) => {
        setHeaderData(prev => {
            const newData = { ...prev, [field]: value };

            // ถ้าเปลี่ยนวันที่ ให้อัปเดตปีและเดือนอัตโนมัติ
            if (field === 'RDATE') {
                const date = new Date(value);
                newData.MYEAR = date.getFullYear().toString();
                newData.MONTHH = date.getMonth() + 1;
                newData.TRDATE = value; // อัปเดต TRDATE ด้วย
            }

            return newData;
        });
    };

    const handleDetailChange = (index, field, value) => {
        const newDetails = [...details];
        newDetails[index][field] = value;
        setDetails(newDetails);
    };

    const addDetailRow = () => {
        setDetails([...details, Income1Service.createEmptyDetail()]);
    };

    const removeDetailRow = (index) => {
        if (details.length > 1) {
            const newDetails = details.filter((_, i) => i !== index);
            setDetails(newDetails);
        }
    };

    const resetForm = () => {
        const today = new Date().toISOString().slice(0, 10);
        const todayDate = new Date();

        setHeaderData({
            REFNO: '',
            RDATE: today,
            TRDATE: today,
            MYEAR: todayDate.getFullYear().toString(),
            MONTHH: todayDate.getMonth() + 1,
            NAME1: '',
            STATUS: 'ทำงานอยู่',
            TYPE_PAY: 'เงินสด',
            BANK_NO: ''
        });
        setDetails([Income1Service.createEmptyDetail()]);
        setEditingItem(null);
    };

    const generateRefno = async () => {
        try {
            const response = await Income1Service.generateRefno(
                headerData.MYEAR,
                headerData.MONTHH.toString().padStart(2, '0')
            );
            if (response.success) {
                return response.data.refno;
            }
        } catch (error) {
            console.error('Error generating refno:', error);
            showAlert('ไม่สามารถสร้างเลขที่อัตโนมัติได้', 'error');
        }
        return null;
    };

    const handleSave = async () => {
        console.log('🔵 handleSave called');
        console.log('📦 Header data:', headerData);
        console.log('📦 Details:', details);

        // Validate
        const errors = Income1Service.validateIncome1Data(headerData, details, !!editingItem);
        console.log('🔍 Validation errors:', errors);

        if (errors.length > 0) {
            console.log('❌ Validation failed:', errors[0]);
            showAlert(errors[0], 'error');
            return;
        }

        setLoading(true);
        console.log('⏳ Loading started...');

        try {
            let dataToSave = headerData;

            if (!editingItem) {
                // สร้างใหม่ - Generate REFNO
                const newRefno = await generateRefno();
                if (!newRefno) {
                    throw new Error('ไม่สามารถสร้างเลขที่ได้');
                }
                dataToSave = { ...headerData, REFNO: newRefno };

                console.log('➕ CREATE mode - Generated REFNO:', newRefno);
            } else {
                console.log('✏️ UPDATE mode - REFNO:', editingItem.REFNO);
                dataToSave = { ...headerData, REFNO: editingItem.REFNO };
            }

            // Format data
            const formattedData = Income1Service.formatIncome1Data(dataToSave, details);
            console.log('📝 Formatted data:', formattedData);

            let result;
            if (!editingItem) {
                result = await Income1Service.createIncome1(formattedData);
                console.log('✅ CREATE response:', result);
                showAlert('สร้างใบสำคัญรับสำเร็จ', 'success');
            } else {
                result = await Income1Service.updateIncome1(editingItem.REFNO, formattedData);
                console.log('✅ UPDATE response:', result);
                showAlert('แก้ไขใบสำคัญรับสำเร็จ', 'success');
            }

            console.log('🔄 Reloading data...');
            await loadData();

            console.log('🧹 Resetting form...');
            resetForm();
            setCurrentView("list");

            console.log('✅ Save completed successfully');
        } catch (error) {
            console.error('❌ Error in handleSave:', error);
            console.error('❌ Error message:', error.message);
            showAlert(error.message || 'เกิดข้อผิดพลาดในการบันทึก', 'error');
        } finally {
            setLoading(false);
            console.log('⏹️ Loading ended');
        }
    };

    const handleEdit = async (item) => {
        try {
            setLoading(true);
            const response = await Income1Service.getIncome1ByRefno(item.REFNO);

            if (response.success && response.data) {
                const { header, details: detailsData } = response.data;

                setHeaderData({
                    REFNO: header.REFNO,
                    RDATE: Income1Service.formatDateForInput(header.RDATE),
                    TRDATE: Income1Service.formatDateForInput(header.TRDATE),
                    MYEAR: header.MYEAR,
                    MONTHH: header.MONTHH,
                    NAME1: header.NAME1,
                    STATUS: header.STATUS,
                    TYPE_PAY: header.TYPE_PAY,
                    BANK_NO: header.BANK_NO || ''
                });

                setDetails(detailsData.length > 0 ? detailsData : [Income1Service.createEmptyDetail()]);
                setEditingItem(header);
                setCurrentView("edit");
            }
        } catch (error) {
            console.error('Error loading income1 for edit:', error);
            showAlert('ไม่สามารถโหลดข้อมูลสำหรับแก้ไขได้', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (refno) => {
        setDeleteDialog({ open: true, refno });
    };

    const handleDeleteConfirm = async () => {
        const { refno } = deleteDialog;

        try {
            await Income1Service.deleteIncome1(refno);
            showAlert('ลบข้อมูลสำเร็จ', 'success');
            await loadData();
        } catch (error) {
            console.error('Error deleting:', error);
            showAlert(error.message || 'เกิดข้อผิดพลาดในการลบ', 'error');
        }

        setDeleteDialog({ open: false, refno: null });
    };

    const handlePrint = async (item) => {
        try {
            const response = await Income1Service.getIncome1ByRefno(item.REFNO);
            if (response.success && response.data) {
                Income1Service.printIncome1(response.data.header, response.data.details);
            }
        } catch (error) {
            console.error('Error printing:', error);
            showAlert('ไม่สามารถพิมพ์ได้', 'error');
        }
    };

    const showAlert = (message, severity) => {
        setAlert({ open: true, message, severity });
    };

    const calculateTotal = () => {
        return Income1Service.calculateTotal(details);
    };

    // Form View
    if (currentView === "add" || currentView === "edit") {
        return (
            <Container maxWidth="lg" sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold">
                        {currentView === "add" ? "สร้างใบสำคัญรับ" : "แก้ไขใบสำคัญรับ"}
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={<CloseIcon />}
                        onClick={() => {
                            resetForm();
                            setCurrentView("list");
                        }}
                    >
                        ปิด
                    </Button>
                </Box>

                {/* Header Form */}
                <Card sx={{ mb: 2 }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, color: '#5698E0' }}>
                            ข้อมูลหัวใบสำคัญรับ
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <Typography sx={{ fontWeight: 400, fontSize: 14, mb: 1 }}>
                                    เลขที่ {!editingItem && "(สร้างอัตโนมัติ)"}
                                </Typography>
                                <TextField
                                    size="small"
                                    value={editingItem ? headerData.REFNO : "สร้างอัตโนมัติ"}
                                    disabled
                                    fullWidth
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "10px",
                                            backgroundColor: "#f5f5f5"
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Typography sx={{ fontWeight: 400, fontSize: 14, mb: 1 }}>
                                    วันที่ *
                                </Typography>
                                <TextField
                                    type="date"
                                    size="small"
                                    value={headerData.RDATE}
                                    onChange={(e) => handleHeaderChange('RDATE', e.target.value)}
                                    fullWidth
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Typography sx={{ fontWeight: 400, fontSize: 14, mb: 1 }}>
                                    สถานะ
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={headerData.STATUS}
                                        onChange={(e) => handleHeaderChange('STATUS', e.target.value)}
                                        sx={{ borderRadius: "10px" }}
                                    >
                                        <MenuItem value="ทำงานอยู่">ทำงานอยู่</MenuItem>
                                        <MenuItem value="ยกเลิก">ยกเลิก</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography sx={{ fontWeight: 400, fontSize: 14, mb: 1 }}>
                                    รับจาก *
                                </Typography>
                                <TextField
                                    size="small"
                                    placeholder="ชื่อผู้จ่ายเงิน"
                                    value={headerData.NAME1}
                                    onChange={(e) => handleHeaderChange('NAME1', e.target.value)}
                                    fullWidth
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                />
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <Typography sx={{ fontWeight: 400, fontSize: 14, mb: 1 }}>
                                    วิธีจ่ายเงิน *
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={headerData.TYPE_PAY}
                                        onChange={(e) => handleHeaderChange('TYPE_PAY', e.target.value)}
                                        sx={{ borderRadius: "10px" }}
                                    >
                                        <MenuItem value="เงินสด">เงินสด</MenuItem>
                                        <MenuItem value="เงินโอน">เงินโอน</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <Typography sx={{ fontWeight: 400, fontSize: 14, mb: 1 }}>
                                    เลขที่บัญชี
                                </Typography>
                                <TextField
                                    size="small"
                                    placeholder="เลขที่บัญชีธนาคาร"
                                    value={headerData.BANK_NO}
                                    onChange={(e) => handleHeaderChange('BANK_NO', e.target.value)}
                                    fullWidth
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Details Form */}
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ color: '#5698E0' }}>
                                รายละเอียดการรับ
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={addDetailRow}
                                sx={{ backgroundColor: '#5698E0' }}
                                size="small"
                            >
                                เพิ่มรายการ
                            </Button>
                        </Box>

                        {details.map((detail, index) => (
                            <Card key={index} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            รายการที่ {index + 1}
                                        </Typography>
                                        {details.length > 1 && (
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => removeDetailRow(index)}
                                            >
                                                <RemoveCircleOutlineIcon />
                                            </IconButton>
                                        )}
                                    </Box>

                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={3}>
                                            <Typography sx={{ fontWeight: 400, fontSize: 14, mb: 1 }}>
                                                ประเภท *
                                            </Typography>
                                            <FormControl fullWidth size="small">
                                                <Select
                                                    value={detail.TYPE_INCOME_CODE}
                                                    onChange={(e) => handleDetailChange(index, 'TYPE_INCOME_CODE', e.target.value)}
                                                    sx={{ borderRadius: "10px" }}
                                                    displayEmpty
                                                >
                                                    <MenuItem value="">เลือกประเภท</MenuItem>
                                                    {typeIncomeList.map((type) => (
                                                        <MenuItem key={type.TYPE_INCOME_CODE} value={type.TYPE_INCOME_CODE}>
                                                            {type.TYPE_INCOME_NAME}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <Typography sx={{ fontWeight: 400, fontSize: 14, mb: 1 }}>
                                                รายการ *
                                            </Typography>
                                            <TextField
                                                size="small"
                                                placeholder="รายละเอียดการรับ"
                                                value={detail.DESCM1}
                                                onChange={(e) => handleDetailChange(index, 'DESCM1', e.target.value)}
                                                fullWidth
                                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                            />
                                        </Grid>

                                        <Grid item xs={12} md={3}>
                                            <Typography sx={{ fontWeight: 400, fontSize: 14, mb: 1 }}>
                                                จำนวนเงิน *
                                            </Typography>
                                            <TextField
                                                type="number"
                                                size="small"
                                                placeholder="0.00"
                                                value={detail.AMT}
                                                onChange={(e) => handleDetailChange(index, 'AMT', e.target.value)}
                                                fullWidth
                                                inputProps={{ step: "0.01", min: "0" }}
                                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                            />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        ))}

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">
                                รวมทั้งสิ้น: {Income1Service.formatCurrency(calculateTotal())} บาท
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    resetForm();
                                    setCurrentView("list");
                                }}
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                onClick={handleSave}
                                disabled={loading}
                                sx={{ backgroundColor: "#5698E0", minWidth: 150 }}
                            >
                                {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        );
    }

    // List View
    return (
        <Container maxWidth="lg" sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                    ใบสำคัญรับ ({filteredList.length} รายการ)
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCurrentView("add")}
                    sx={{ backgroundColor: '#5698E0' }}
                >
                    สร้างใบสำคัญรับ
                </Button>
            </Box>

            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <TextField
                        size="small"
                        placeholder="ค้นหา (เลขที่, รับจาก, เลขบัญชี)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    {filteredList.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="h6" color="text.secondary">
                                {searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีข้อมูล'}
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                                    <thead style={{ backgroundColor: "#F0F5FF" }}>
                                        <tr>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>ลำดับ</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>เลขที่</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>วันที่</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>รับจาก</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>ประเภทรายรับ</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'right', color: '#696969' }}>จำนวนเงิน</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'center', color: '#696969' }}>สถานะ</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'center', color: '#696969' }}>จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getPaginatedData().map((item, index) => (
                                            <tr key={item.REFNO} style={{ borderTop: '1px solid #e0e0e0' }}>
                                                <td style={{ padding: '12px 8px' }}>
                                                    {(page - 1) * itemsPerPage + index + 1}
                                                </td>
                                                <td style={{ padding: '12px 8px', fontWeight: 500 }}>
                                                    {item.REFNO}
                                                </td>
                                                <td style={{ padding: '12px 8px' }}>
                                                    {Income1Service.formatDate(item.RDATE)}
                                                </td>
                                                <td style={{ padding: '12px 8px' }}>
                                                    {item.NAME1}
                                                </td>
                                                <td style={{ padding: '12px 8px' }}>
                                                    {item.TYPE_INCOME_NAME || item.TYPE_PAY}
                                                </td>
                                                <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 500 }}>
                                                    {Income1Service.formatCurrency(item.TOTAL)}
                                                </td>
                                                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                                    <Chip
                                                        label={item.STATUS}
                                                        color={item.STATUS === 'ทำงานอยู่' ? 'success' : 'error'}
                                                        size="small"
                                                    />
                                                </td>
                                                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handlePrint(item)}
                                                            sx={{ border: '1px solid #9C27B0', borderRadius: '7px' }}
                                                        >
                                                            <PrintIcon sx={{ color: '#9C27B0' }} />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleEdit(item)}
                                                            sx={{ border: '1px solid #5698E0', borderRadius: '7px' }}
                                                        >
                                                            <EditIcon sx={{ color: '#5698E0' }} />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDeleteClick(item.REFNO)}
                                                            sx={{ border: '1px solid #F62626', borderRadius: '7px' }}
                                                        >
                                                            <DeleteIcon sx={{ color: '#F62626' }} />
                                                        </IconButton>
                                                    </Box>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Box>

                            <Stack spacing={2} direction="row" justifyContent="center" sx={{ mt: 3 }}>
                                <Pagination
                                    count={totalPages}
                                    page={page}
                                    onChange={(event, value) => setPage(value)}
                                    shape="rounded"
                                    color="primary"
                                />
                            </Stack>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Delete Dialog */}
            <Dialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, refno: null })}
            >
                <DialogTitle>ยืนยันการลบข้อมูล</DialogTitle>
                <DialogContent>
                    <Typography>
                        คุณแน่ใจหรือไม่ที่ต้องการลบใบสำคัญรับ "{deleteDialog.refno}"?
                    </Typography>
                    <Typography color="error" sx={{ mt: 1, fontSize: 14 }}>
                        การลบจะลบทั้งข้อมูลหัวและรายละเอียดทั้งหมด
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, refno: null })}>
                        ยกเลิก
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        variant="contained"
                        color="error"
                        startIcon={<DeleteIcon />}
                    >
                        ลบ
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Alert Snackbar */}
            <Snackbar
                open={alert.open}
                autoHideDuration={4000}
                onClose={() => setAlert({ ...alert, open: false })}
            >
                <Alert
                    onClose={() => setAlert({ ...alert, open: false })}
                    severity={alert.severity}
                    sx={{ width: '100%' }}
                >
                    {alert.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Income1Management;                            