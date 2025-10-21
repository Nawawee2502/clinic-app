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
import Receipt1Service from "../services/receipt1Service"; // ✅ แก้ไขแล้ว!

const Receipt1Management = () => {
    const [currentView, setCurrentView] = useState("list");
    const [receipt1List, setReceipt1List] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, refno: null });
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

    const [headerData, setHeaderData] = useState({
        REFNO: '',
        RDATE: new Date().toISOString().slice(0, 10),
        TRDATE: new Date().toISOString().slice(0, 10),
        MYEAR: new Date().getFullYear().toString(),
        MONTHH: new Date().getMonth() + 1,
        SUPPLIER_CODE: '',
        DUEDATE: new Date().toISOString().slice(0, 10),
        STATUS: 'ทำงานอยู่',
        VAT1: 7,
        TYPE_PAY: 'เงินสด',
        BANK_NO: ''
    });

    const [details, setDetails] = useState([
        { DRUG_CODE: '', QTY: '', UNIT_COST: '', UNIT_CODE1: '', AMT: '', LOT_NO: '', EXPIRE_DATE: '' }
    ]);

    const itemsPerPage = 10;

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        filterData();
    }, [receipt1List, searchTerm]);

    useEffect(() => {
        setTotalPages(Math.ceil(filteredList.length / itemsPerPage));
    }, [filteredList]);

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await Receipt1Service.getAllReceipt1();
            if (response.success && response.data) {
                console.log(`✅ โหลดข้อมูลใบรับสินค้า ${response.data.length} รายการ`);
                setReceipt1List(response.data);
                setFilteredList(response.data);
                showAlert(`โหลดข้อมูลสำเร็จ ${response.data.length} รายการ`, 'success');
            }
        } catch (error) {
            console.error('❌ Error loading data:', error);
            showAlert('ไม่สามารถโหลดข้อมูลได้', 'error');
            setReceipt1List([]);
            setFilteredList([]);
        }
        setLoading(false);
    };

    const filterData = () => {
        if (!searchTerm) {
            setFilteredList(receipt1List);
        } else {
            const filtered = receipt1List.filter(item =>
                item.REFNO?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.SUPPLIER_CODE?.toLowerCase().includes(searchTerm.toLowerCase())
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
            if (field === 'RDATE') {
                const date = new Date(value);
                newData.MYEAR = date.getFullYear().toString();
                newData.MONTHH = date.getMonth() + 1;
                newData.TRDATE = value;
            }
            return newData;
        });
    };

    const handleDetailChange = (index, field, value) => {
        const newDetails = [...details];
        newDetails[index][field] = value;

        if (field === 'QTY' || field === 'UNIT_COST') {
            const qty = field === 'QTY' ? value : newDetails[index].QTY;
            const unitCost = field === 'UNIT_COST' ? value : newDetails[index].UNIT_COST;
            newDetails[index].AMT = Receipt1Service.calculateLineAmount(qty, unitCost);
        }

        setDetails(newDetails);
    };

    const addDetailRow = () => {
        setDetails([...details, Receipt1Service.createEmptyDetail()]);
    };

    const removeDetailRow = (index) => {
        if (details.length > 1) {
            const newDetails = details.filter((_, i) => i !== index);
            setDetails(newDetails);
        }
    };

    const resetForm = () => {
        setHeaderData({
            REFNO: '',
            RDATE: new Date().toISOString().slice(0, 10),
            TRDATE: new Date().toISOString().slice(0, 10),
            MYEAR: new Date().getFullYear().toString(),
            MONTHH: new Date().getMonth() + 1,
            SUPPLIER_CODE: '',
            DUEDATE: new Date().toISOString().slice(0, 10),
            STATUS: 'ทำงานอยู่',
            VAT1: 7,
            TYPE_PAY: 'เงินสด',
            BANK_NO: ''
        });
        setDetails([Receipt1Service.createEmptyDetail()]);
        setEditingItem(null);
    };

    const generateRefno = async () => {
        try {
            const response = await Receipt1Service.generateRefno(
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

        const headerErrors = Receipt1Service.validateHeaderData(headerData, !!editingItem);
        const detailErrors = Receipt1Service.validateDetailData(details);
        const errors = [...headerErrors, ...detailErrors];

        if (errors.length > 0) {
            console.log('❌ Validation failed:', errors[0]);
            showAlert(errors[0], 'error');
            return;
        }

        setLoading(true);

        try {
            let dataToSave = headerData;

            if (!editingItem) {
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

            const formattedData = Receipt1Service.formatReceipt1Data(dataToSave, details);
            console.log('📝 Formatted data:', formattedData);

            let result;
            if (!editingItem) {
                result = await Receipt1Service.createReceipt1(formattedData);
                console.log('✅ CREATE response:', result);
                showAlert('สร้างใบรับสินค้าสำเร็จ', 'success');
            } else {
                result = await Receipt1Service.updateReceipt1(editingItem.REFNO, formattedData);
                console.log('✅ UPDATE response:', result);
                showAlert('แก้ไขใบรับสินค้าสำเร็จ', 'success');
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

    const handleEdit = async (item) => {
        try {
            setLoading(true);
            const response = await Receipt1Service.getReceipt1ByRefno(item.REFNO);

            if (response.success && response.data) {
                const { header, details: detailsData } = response.data;

                setHeaderData({
                    REFNO: header.REFNO,
                    RDATE: Receipt1Service.formatDateForInput(header.RDATE),
                    TRDATE: Receipt1Service.formatDateForInput(header.TRDATE),
                    MYEAR: header.MYEAR,
                    MONTHH: header.MONTHH,
                    SUPPLIER_CODE: header.SUPPLIER_CODE,
                    DUEDATE: Receipt1Service.formatDateForInput(header.DUEDATE),
                    STATUS: header.STATUS,
                    VAT1: header.VAT1 || 7,
                    TYPE_PAY: header.TYPE_PAY,
                    BANK_NO: header.BANK_NO || ''
                });

                setDetails(detailsData.length > 0 ? detailsData : [Receipt1Service.createEmptyDetail()]);
                setEditingItem(header);
                setCurrentView("edit");
            }
        } catch (error) {
            console.error('Error loading receipt1 for edit:', error);
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
            await Receipt1Service.deleteReceipt1(refno);
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
            const response = await Receipt1Service.getReceipt1ByRefno(item.REFNO);
            if (response.success && response.data) {
                Receipt1Service.printReceipt1(response.data.header, response.data.details);
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
        return Receipt1Service.calculateTotal(details);
    };

    if (currentView === "add" || currentView === "edit") {
        const totals = calculateTotal();
        return (
            <Container maxWidth="lg" sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold">
                        {currentView === "add" ? "สร้างใบรับสินค้า" : "แก้ไขใบรับสินค้า"}
                    </Typography>
                    <Button variant="outlined" startIcon={<CloseIcon />} onClick={() => { resetForm(); setCurrentView("list"); }}>
                        ปิด
                    </Button>
                </Box>

                <Card sx={{ mb: 2 }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, color: '#5698E0' }}>ข้อมูลหัวใบรับสินค้า</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={3}>
                                <Typography sx={{ fontWeight: 400, fontSize: 14, mb: 1 }}>
                                    เลขที่ {!editingItem && "(สร้างอัตโนมัติ)"}
                                </Typography>
                                <TextField size="small" value={editingItem ? headerData.REFNO : "สร้างอัตโนมัติ"} disabled fullWidth
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", backgroundColor: "#f5f5f5" } }} />
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <Typography sx={{ fontWeight: 400, fontSize: 14, mb: 1 }}>วันที่ *</Typography>
                                <TextField type="date" size="small" value={headerData.RDATE} onChange={(e) => handleHeaderChange('RDATE', e.target.value)}
                                    fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }} />
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <Typography sx={{ fontWeight: 400, fontSize: 14, mb: 1 }}>วันครบกำหนด *</Typography>
                                <TextField type="date" size="small" value={headerData.DUEDATE} onChange={(e) => handleHeaderChange('DUEDATE', e.target.value)}
                                    fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }} />
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <Typography sx={{ fontWeight: 400, fontSize: 14, mb: 1 }}>สถานะ</Typography>
                                <FormControl fullWidth size="small">
                                    <Select value={headerData.STATUS} onChange={(e) => handleHeaderChange('STATUS', e.target.value)} sx={{ borderRadius: "10px" }}>
                                        <MenuItem value="ทำงานอยู่">ทำงานอยู่</MenuItem>
                                        <MenuItem value="ยกเลิก">ยกเลิก</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Typography sx={{ fontWeight: 400, fontSize: 14, mb: 1 }}>รหัสผู้จำหน่าย *</Typography>
                                <TextField size="small" placeholder="กรอกรหัสผู้จำหน่าย" value={headerData.SUPPLIER_CODE}
                                    onChange={(e) => handleHeaderChange('SUPPLIER_CODE', e.target.value)} fullWidth
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }} />
                            </Grid>

                            <Grid item xs={12} md={2}>
                                <Typography sx={{ fontWeight: 400, fontSize: 14, mb: 1 }}>VAT (%)</Typography>
                                <TextField type="number" size="small" value={headerData.VAT1}
                                    onChange={(e) => handleHeaderChange('VAT1', e.target.value)} fullWidth
                                    inputProps={{ step: "0.01", min: "0", max: "100" }}
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }} />
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <Typography sx={{ fontWeight: 400, fontSize: 14, mb: 1 }}>วิธีจ่ายเงิน *</Typography>
                                <FormControl fullWidth size="small">
                                    <Select value={headerData.TYPE_PAY} onChange={(e) => handleHeaderChange('TYPE_PAY', e.target.value)} sx={{ borderRadius: "10px" }}>
                                        <MenuItem value="เงินสด">เงินสด</MenuItem>
                                        <MenuItem value="เงินโอน">เงินโอน</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <Typography sx={{ fontWeight: 400, fontSize: 14, mb: 1 }}>เลขที่บัญชี</Typography>
                                <TextField size="small" placeholder="เลขที่บัญชีธนาคาร" value={headerData.BANK_NO}
                                    onChange={(e) => handleHeaderChange('BANK_NO', e.target.value)} fullWidth
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }} />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ color: '#5698E0' }}>รายละเอียดการรับ</Typography>
                            <Button variant="contained" startIcon={<AddIcon />} onClick={addDetailRow} sx={{ backgroundColor: '#5698E0' }} size="small">
                                เพิ่มรายการ
                            </Button>
                        </Box>

                        {details.map((detail, index) => (
                            <Card key={index} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="subtitle2" fontWeight="bold">รายการที่ {index + 1}</Typography>
                                        {details.length > 1 && (
                                            <IconButton size="small" color="error" onClick={() => removeDetailRow(index)}>
                                                <RemoveCircleOutlineIcon />
                                            </IconButton>
                                        )}
                                    </Box>

                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={3}>
                                            <Typography sx={{ fontWeight: 400, fontSize: 14, mb: 1 }}>รหัสยา *</Typography>
                                            <TextField size="small" placeholder="รหัสยา" value={detail.DRUG_CODE}
                                                onChange={(e) => handleDetailChange(index, 'DRUG_CODE', e.target.value)} fullWidth
                                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }} />
                                        </Grid>

                                        <Grid item xs={12} md={2}>
                                            <Typography sx={{ fontWeight: 400, fontSize: 14, mb: 1 }}>จำนวน *</Typography>
                                            <TextField type="number" size="small" placeholder="0" value={detail.QTY}
                                                onChange={(e) => handleDetailChange(index, 'QTY', e.target.value)} fullWidth
                                                inputProps={{ step: "1", min: "0" }} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }} />
                                        </Grid>

                                        <Grid item xs={12} md={1}>
                                            <Typography sx={{ fontWeight: 400, fontSize: 14, mb: 1 }}>หน่วย</Typography>
                                            <TextField size="small" placeholder="หน่วย" value={detail.UNIT_CODE1}
                                                onChange={(e) => handleDetailChange(index, 'UNIT_CODE1', e.target.value)} fullWidth
                                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }} />
                                        </Grid>

                                        <Grid item xs={12} md={2}>
                                            <Typography sx={{ fontWeight: 400, fontSize: 14, mb: 1 }}>ราคา/หน่วย *</Typography>
                                            <TextField type="number" size="small" placeholder="0.00" value={detail.UNIT_COST}
                                                onChange={(e) => handleDetailChange(index, 'UNIT_COST', e.target.value)} fullWidth
                                                inputProps={{ step: "0.01", min: "0" }} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }} />
                                        </Grid>

                                        <Grid item xs={12} md={2}>
                                            <Typography sx={{ fontWeight: 400, fontSize: 14, mb: 1 }}>จำนวนเงิน</Typography>
                                            <TextField size="small" value={Receipt1Service.formatCurrency(detail.AMT)} disabled fullWidth
                                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", backgroundColor: "#f5f5f5" } }} />
                                        </Grid>

                                        <Grid item xs={12} md={2}>
                                            <Typography sx={{ fontWeight: 400, fontSize: 14, mb: 1 }}>Lot No</Typography>
                                            <TextField size="small" placeholder="เลข Lot" value={detail.LOT_NO}
                                                onChange={(e) => handleDetailChange(index, 'LOT_NO', e.target.value)} fullWidth
                                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }} />
                                        </Grid>

                                        <Grid item xs={12} md={4}>
                                            <Typography sx={{ fontWeight: 400, fontSize: 14, mb: 1 }}>วันหมดอายุ</Typography>
                                            <TextField type="date" size="small" value={detail.EXPIRE_DATE}
                                                onChange={(e) => handleDetailChange(index, 'EXPIRE_DATE', e.target.value)} fullWidth
                                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }} />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        ))}

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, mb: 2 }}>
                            <Typography variant="body1">
                                รวมเป็นเงิน: {Receipt1Service.formatCurrency(totals.total)} บาท
                            </Typography>
                            <Typography variant="body1">
                                VAT {headerData.VAT1}%: {Receipt1Service.formatCurrency(totals.vamt)} บาท
                            </Typography>
                            <Typography variant="h6" fontWeight="bold">
                                รวมทั้งสิ้น: {Receipt1Service.formatCurrency(totals.gtotal)} บาท
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                            <Button variant="outlined" onClick={() => { resetForm(); setCurrentView("list"); }}>ยกเลิก</Button>
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

    return (
        <Container maxWidth="lg" sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">ใบรับสินค้า ({filteredList.length} รายการ)</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCurrentView("add")} sx={{ backgroundColor: '#5698E0' }}>
                    สร้างใบรับสินค้า
                </Button>
            </Box>

            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <TextField size="small" placeholder="ค้นหา (เลขที่, รหัสผู้จำหน่าย)" value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)} fullWidth
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }} />
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
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                                    <thead style={{ backgroundColor: "#F0F5FF" }}>
                                        <tr>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>ลำดับ</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>เลขที่</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>วันที่</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>รหัสผู้จำหน่าย</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>วันครบกำหนด</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'right', color: '#696969' }}>จำนวนเงินรวม</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'center', color: '#696969' }}>สถานะ</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'center', color: '#696969' }}>จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getPaginatedData().map((item, index) => (
                                            <tr key={item.REFNO} style={{ borderTop: '1px solid #e0e0e0' }}>
                                                <td style={{ padding: '12px 8px' }}>{(page - 1) * itemsPerPage + index + 1}</td>
                                                <td style={{ padding: '12px 8px', fontWeight: 500 }}>{item.REFNO}</td>
                                                <td style={{ padding: '12px 8px' }}>{Receipt1Service.formatDate(item.RDATE)}</td>
                                                <td style={{ padding: '12px 8px' }}>{item.SUPPLIER_CODE}</td>
                                                <td style={{ padding: '12px 8px' }}>{Receipt1Service.formatDate(item.DUEDATE)}</td>
                                                <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 500 }}>
                                                    {Receipt1Service.formatCurrency(item.GTOTAL)}
                                                </td>
                                                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                                    <Chip label={item.STATUS} color={item.STATUS === 'ทำงานอยู่' ? 'success' : 'error'} size="small" />
                                                </td>
                                                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                        <IconButton size="small" onClick={() => handlePrint(item)}
                                                            sx={{ border: '1px solid #9C27B0', borderRadius: '7px' }}>
                                                            <PrintIcon sx={{ color: '#9C27B0' }} />
                                                        </IconButton>
                                                        <IconButton size="small" onClick={() => handleEdit(item)}
                                                            sx={{ border: '1px solid #5698E0', borderRadius: '7px' }}>
                                                            <EditIcon sx={{ color: '#5698E0' }} />
                                                        </IconButton>
                                                        <IconButton size="small" onClick={() => handleDeleteClick(item.REFNO)}
                                                            sx={{ border: '1px solid #F62626', borderRadius: '7px' }}>
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
                                <Pagination count={totalPages} page={page} onChange={(event, value) => setPage(value)} shape="rounded" color="primary" />
                            </Stack>
                        </>
                    )}
                </CardContent>
            </Card>

            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, refno: null })}>
                <DialogTitle>ยืนยันการลบข้อมูล</DialogTitle>
                <DialogContent>
                    <Typography>คุณแน่ใจหรือไม่ที่ต้องการลบใบรับสินค้า "{deleteDialog.refno}"?</Typography>
                    <Typography color="error" sx={{ mt: 1, fontSize: 14 }}>
                        การลบจะลบทั้งข้อมูลหัวและรายละเอียดทั้งหมด
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, refno: null })}>ยกเลิก</Button>
                    <Button onClick={handleDeleteConfirm} variant="contained" color="error" startIcon={<DeleteIcon />}>ลบ</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={alert.open} autoHideDuration={4000} onClose={() => setAlert({ ...alert, open: false })}>
                <Alert onClose={() => setAlert({ ...alert, open: false })} severity={alert.severity} sx={{ width: '100%' }}>
                    {alert.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Receipt1Management;