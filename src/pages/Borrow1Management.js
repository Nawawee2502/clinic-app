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
import Borrow1Service from "../services/borrow1Service";

const Borrow1Management = () => {
    const [currentView, setCurrentView] = useState("list");
    const [borrow1List, setBorrow1List] = useState([]);
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
        EMP_CODE: '',
        STATUS: 'ทำงานอยู่'
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
    }, [borrow1List, searchTerm]);

    useEffect(() => {
        setTotalPages(Math.ceil(filteredList.length / itemsPerPage));
    }, [filteredList]);

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await Borrow1Service.getAllBorrow1();
            if (response.success && response.data) {
                console.log(`✅ โหลดข้อมูลใบเบิกสินค้า ${response.data.length} รายการ`);
                setBorrow1List(response.data);
                setFilteredList(response.data);
                showAlert(`โหลดข้อมูลสำเร็จ ${response.data.length} รายการ`, 'success');
            }
        } catch (error) {
            console.error('❌ Error loading data:', error);
            showAlert('ไม่สามารถโหลดข้อมูลได้', 'error');
            setBorrow1List([]);
            setFilteredList([]);
        }
        setLoading(false);
    };

    const filterData = () => {
        if (!searchTerm) {
            setFilteredList(borrow1List);
        } else {
            const filtered = borrow1List.filter(item =>
                item.REFNO?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.EMP_CODE?.toLowerCase().includes(searchTerm.toLowerCase())
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
            newDetails[index].AMT = Borrow1Service.calculateLineAmount(qty, unitCost);
        }

        setDetails(newDetails);
    };

    const addDetailRow = () => {
        setDetails([...details, Borrow1Service.createEmptyDetail()]);
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
            EMP_CODE: '',
            STATUS: 'ทำงานอยู่'
        });
        setDetails([Borrow1Service.createEmptyDetail()]);
        setEditingItem(null);
    };

    const generateRefno = async () => {
        try {
            const response = await Borrow1Service.generateRefno(
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

        const headerErrors = Borrow1Service.validateHeaderData(headerData, !!editingItem);
        const detailErrors = Borrow1Service.validateDetailData(details);
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

            const formattedData = Borrow1Service.formatBorrow1Data(dataToSave, details);
            console.log('📝 Formatted data:', formattedData);

            let result;
            if (!editingItem) {
                result = await Borrow1Service.createBorrow1(formattedData);
                console.log('✅ CREATE response:', result);
                showAlert('สร้างใบเบิกสินค้าสำเร็จ', 'success');
            } else {
                result = await Borrow1Service.updateBorrow1(editingItem.REFNO, formattedData);
                console.log('✅ UPDATE response:', result);
                showAlert('แก้ไขใบเบิกสินค้าสำเร็จ', 'success');
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
            const response = await Borrow1Service.getBorrow1ByRefno(item.REFNO);

            if (response.success && response.data) {
                const { header, details: detailsData } = response.data;

                setHeaderData({
                    REFNO: header.REFNO,
                    RDATE: Borrow1Service.formatDateForInput(header.RDATE),
                    TRDATE: Borrow1Service.formatDateForInput(header.TRDATE),
                    MYEAR: header.MYEAR,
                    MONTHH: header.MONTHH,
                    EMP_CODE: header.EMP_CODE,
                    STATUS: header.STATUS
                });

                setDetails(detailsData.length > 0 ? detailsData : [Borrow1Service.createEmptyDetail()]);
                setEditingItem(header);
                setCurrentView("edit");
            }
        } catch (error) {
            console.error('Error loading borrow1 for edit:', error);
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
            await Borrow1Service.deleteBorrow1(refno);
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
            const response = await Borrow1Service.getBorrow1ByRefno(item.REFNO);
            if (response.success && response.data) {
                Borrow1Service.printBorrow1(response.data.header, response.data.details);
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
        return Borrow1Service.calculateTotal(details);
    };

    if (currentView === "add" || currentView === "edit") {
        return (
            <Container maxWidth="lg" sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold">
                        {currentView === "add" ? "สร้างใบเบิกสินค้า" : "แก้ไขใบเบิกสินค้า"}
                    </Typography>
                    <Button variant="outlined" startIcon={<CloseIcon />} onClick={() => { resetForm(); setCurrentView("list"); }}>
                        ปิด
                    </Button>
                </Box>

                <Card sx={{ mb: 2 }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, color: '#5698E0' }}>ข้อมูลหัวใบเบิกสินค้า</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <Typography sx={{ fontWeight: 400, fontSize: 14, mb: 1 }}>
                                    เลขที่ {!editingItem && "(สร้างอัตโนมัติ)"}
                                </Typography>
                                <TextField size="small" value={editingItem ? headerData.REFNO : "สร้างอัตโนมัติ"} disabled fullWidth
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", backgroundColor: "#f5f5f5" } }} />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Typography sx={{ fontWeight: 400, fontSize: 14, mb: 1 }}>วันที่ *</Typography>
                                <TextField type="date" size="small" value={headerData.RDATE} onChange={(e) => handleHeaderChange('RDATE', e.target.value)}
                                    fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }} />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Typography sx={{ fontWeight: 400, fontSize: 14, mb: 1 }}>สถานะ</Typography>
                                <FormControl fullWidth size="small">
                                    <Select value={headerData.STATUS} onChange={(e) => handleHeaderChange('STATUS', e.target.value)} sx={{ borderRadius: "10px" }}>
                                        <MenuItem value="ทำงานอยู่">ทำงานอยู่</MenuItem>
                                        <MenuItem value="ยกเลิก">ยกเลิก</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography sx={{ fontWeight: 400, fontSize: 14, mb: 1 }}>รหัสพนักงาน *</Typography>
                                <TextField size="small" placeholder="กรอกรหัสพนักงาน" value={headerData.EMP_CODE}
                                    onChange={(e) => handleHeaderChange('EMP_CODE', e.target.value)} fullWidth
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }} />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ color: '#5698E0' }}>รายละเอียดการเบิก</Typography>
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

                                        <Grid item xs={12} md={2}>
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

                                        <Grid item xs={12} md={3}>
                                            <Typography sx={{ fontWeight: 400, fontSize: 14, mb: 1 }}>จำนวนเงิน</Typography>
                                            <TextField size="small" value={Borrow1Service.formatCurrency(detail.AMT)} disabled fullWidth
                                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", backgroundColor: "#f5f5f5" } }} />
                                        </Grid>

                                        <Grid item xs={12} md={4}>
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

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">
                                รวมทั้งสิ้น: {Borrow1Service.formatCurrency(calculateTotal())} บาท
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
                <Typography variant="h6" fontWeight="bold">ใบเบิกสินค้า ({filteredList.length} รายการ)</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCurrentView("add")} sx={{ backgroundColor: '#5698E0' }}>
                    สร้างใบเบิกสินค้า
                </Button>
            </Box>

            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <TextField size="small" placeholder="ค้นหา (เลขที่, รหัสพนักงาน)" value={searchTerm}
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
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                                    <thead style={{ backgroundColor: "#F0F5FF" }}>
                                        <tr>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>ลำดับ</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>เลขที่</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>วันที่</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>รหัสพนักงาน</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'right', color: '#696969' }}>จำนวนเงิน</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'center', color: '#696969' }}>สถานะ</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'center', color: '#696969' }}>จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getPaginatedData().map((item, index) => (
                                            <tr key={item.REFNO} style={{ borderTop: '1px solid #e0e0e0' }}>
                                                <td style={{ padding: '12px 8px' }}>{(page - 1) * itemsPerPage + index + 1}</td>
                                                <td style={{ padding: '12px 8px', fontWeight: 500 }}>{item.REFNO}</td>
                                                <td style={{ padding: '12px 8px' }}>{Borrow1Service.formatDate(item.RDATE)}</td>
                                                <td style={{ padding: '12px 8px' }}>{item.EMP_CODE}</td>
                                                <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 500 }}>
                                                    {Borrow1Service.formatCurrency(item.TOTAL)}
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
                    <Typography>คุณแน่ใจหรือไม่ที่ต้องการลบใบเบิกสินค้า "{deleteDialog.refno}"?</Typography>
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

export default Borrow1Management;